"use client";

import { Button } from "@/components/ui/button";

type AdminSecurityPresetsProps = {
  labels: {
    title: string;
    failed24h: string;
    rateLimited: string;
    successfulLogins: string;
    latest100: string;
    last7days: string;
  };
};

function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildDayBounds(dateKey: string): { fromTs: string; toTs: string } {
  const [year, month, day] = dateKey.split("-").map((item) => Number.parseInt(item, 10));
  const from = new Date(year, (month || 1) - 1, day || 1, 0, 0, 0, 0);
  const to = new Date(year, (month || 1) - 1, day || 1, 23, 59, 59, 999);
  return {
    fromTs: from.toISOString(),
    toTs: to.toISOString(),
  };
}

function goToPreset(params: URLSearchParams) {
  window.location.assign(`/admin?${params.toString()}`);
}

export function AdminSecurityPresets({ labels }: AdminSecurityPresetsProps) {
  const now = new Date();
  const today = toLocalDateKey(now);
  const oneDayAgoDate = new Date(now);
  oneDayAgoDate.setDate(now.getDate() - 1);
  const oneDayAgo = toLocalDateKey(oneDayAgoDate);
  const sevenDaysAgoDate = new Date(now);
  sevenDaysAgoDate.setDate(now.getDate() - 6);
  const sevenDaysAgo = toLocalDateKey(sevenDaysAgoDate);

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="text-violet-300">{labels.title}</span>

      <Button
        type="button"
        variant="outline"
        className="h-7 border-rose-300/30 bg-rose-500/10 px-2.5 text-rose-100 hover:bg-rose-500/20"
        onClick={() => {
          const fromTs = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          const toTs = new Date().toISOString();
          const params = new URLSearchParams({
            securityEvent: "login_failure",
            securityFrom: oneDayAgo,
            securityTo: today,
            securitySortBy: "created_at",
            securitySortOrder: "desc",
            securityPageSize: "50",
            securityPage: "1",
            securityFromTs: fromTs,
            securityToTs: toTs,
          });
          goToPreset(params);
        }}
      >
        {labels.failed24h}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="h-7 border-amber-300/30 bg-amber-500/10 px-2.5 text-amber-100 hover:bg-amber-500/20"
        onClick={() => {
          const fromBounds = buildDayBounds(sevenDaysAgo);
          const toBounds = buildDayBounds(today);
          const params = new URLSearchParams({
            securityEvent: "login_rate_limited",
            securitySortBy: "created_at",
            securitySortOrder: "desc",
            securityPageSize: "50",
            securityPage: "1",
            securityFrom: sevenDaysAgo,
            securityTo: today,
            securityFromTs: fromBounds.fromTs,
            securityToTs: toBounds.toTs,
          });
          goToPreset(params);
        }}
      >
        {labels.rateLimited}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="h-7 border-emerald-300/30 bg-emerald-500/10 px-2.5 text-emerald-100 hover:bg-emerald-500/20"
        onClick={() => {
          const fromBounds = buildDayBounds(sevenDaysAgo);
          const toBounds = buildDayBounds(today);
          const params = new URLSearchParams({
            securityEvent: "login_success",
            securitySortBy: "created_at",
            securitySortOrder: "desc",
            securityPageSize: "50",
            securityPage: "1",
            securityFrom: sevenDaysAgo,
            securityTo: today,
            securityFromTs: fromBounds.fromTs,
            securityToTs: toBounds.toTs,
          });
          goToPreset(params);
        }}
      >
        {labels.successfulLogins}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="h-7 border-cyan-300/30 bg-cyan-500/10 px-2.5 text-cyan-100 hover:bg-cyan-500/20"
        onClick={() => {
          const params = new URLSearchParams({
            securitySortBy: "created_at",
            securitySortOrder: "desc",
            securityPageSize: "100",
            securityPage: "1",
          });
          goToPreset(params);
        }}
      >
        {labels.latest100}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="h-7 border-violet-300/30 bg-violet-500/10 px-2.5 text-violet-100 hover:bg-violet-500/20"
        onClick={() => {
          const fromBounds = buildDayBounds(sevenDaysAgo);
          const toBounds = buildDayBounds(today);
          const params = new URLSearchParams({
            securityFrom: sevenDaysAgo,
            securityTo: today,
            securitySortBy: "created_at",
            securitySortOrder: "desc",
            securityPageSize: "100",
            securityPage: "1",
            securityFromTs: fromBounds.fromTs,
            securityToTs: toBounds.toTs,
          });
          goToPreset(params);
        }}
      >
        {labels.last7days}
      </Button>
    </div>
  );
}
