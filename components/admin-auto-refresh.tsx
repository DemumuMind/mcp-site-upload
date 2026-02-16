"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type AdminAutoRefreshProps = {
  intervalSec: number;
  labels: {
    autoRefresh: string;
    refreshNow: string;
    lastUpdated: string;
  };
};

function formatTime(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(value);
}

export function AdminAutoRefresh({ intervalSec, labels }: AdminAutoRefreshProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [enabled, setEnabled] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date>(() => new Date());
  const safeIntervalSec = useMemo(() => Math.max(intervalSec, 30), [intervalSec]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const timerId = window.setInterval(() => {
      if (document.visibilityState !== "visible") {
        return;
      }
      router.refresh();
      setLastUpdatedAt(new Date());
    }, safeIntervalSec * 1000);
    return () => window.clearInterval(timerId);
  }, [enabled, router, safeIntervalSec]);

  function refreshNow() {
    router.refresh();
    setLastUpdatedAt(new Date());
  }

  const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-violet-200">
      <span className="rounded-full border border-white/15 bg-white/[0.04] px-2 py-1">
        {labels.autoRefresh}: {enabled ? `${safeIntervalSec}s` : "off"}
      </span>
      <Button
        type="button"
        variant="outline"
        className="h-7 border-white/15 bg-white/[0.02] px-2.5 text-xs hover:bg-white/[0.06]"
        onClick={() => setEnabled((prev) => !prev)}
      >
        {enabled ? "Pause" : "Resume"}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-7 border-cyan-300/35 bg-cyan-500/10 px-2.5 text-xs text-cyan-100 hover:bg-cyan-500/20"
        onClick={refreshNow}
      >
        {labels.refreshNow}
      </Button>
      <span className="text-violet-300">
        {labels.lastUpdated}: {formatTime(lastUpdatedAt)}
      </span>
      <span className="max-w-[360px] truncate text-violet-400" title={currentUrl}>
        {currentUrl}
      </span>
    </div>
  );
}
