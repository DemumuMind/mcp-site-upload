"use client";

import { useState } from "react";
import { Loader2, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";

type ProbeResult = {
  ok: boolean;
  status?: number;
  latencyMs?: number;
  error?: string;
};

export function ConnectionTestButton({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProbeResult | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        className="border-white/15 bg-card/40 text-violet-100"
        onClick={async () => {
          setLoading(true);
          try {
            const response = await fetch(`/api/server/${slug}/probe`, { method: "POST" });
            const responseContentType = response.headers.get("content-type") ?? "";
            if (responseContentType.includes("application/json")) {
              const payload = (await response.json()) as ProbeResult;
              setResult(payload);
              return;
            }

            if (response.ok) {
              setResult({ ok: true, status: response.status });
              return;
            }

            setResult({
              ok: false,
              status: response.status,
              error: `Unexpected response format (${response.status})`,
            });
          } catch {
            setResult({
              ok: false,
              error: "Connection test failed. Please retry.",
            });
          } finally {
            setLoading(false);
          }
        }}
        disabled={loading}
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Wifi className="size-4" />}
        Run connection test
      </Button>
      {result ? (
        <span role="status" aria-live="polite" className={`text-xs ${result.ok ? "text-emerald-300" : "text-rose-200"}`}>
          {result.ok
            ? `Reachable (${result.status ?? "ok"}, ${result.latencyMs ?? 0}ms)`
            : `Unreachable${result.error ? `: ${result.error}` : ""}`}
        </span>
      ) : null}
    </div>
  );
}
