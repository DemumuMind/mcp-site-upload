import Link from "next/link";
import { PageSection } from "@/components/page-templates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tr } from "@/lib/i18n";
import type { AdminPageSectionsProps } from "@/app/admin/_components/types";
import { formatCompactNumber } from "@/app/admin/_components/utils";

type Props = Pick<AdminPageSectionsProps, "locale" | "dashboardSnapshot">;

export function OverviewMultiAgentSections({ locale, dashboardSnapshot }: Props) {
  return (
    <>
      <PageSection surface="mesh">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            {tr(locale, "System overview", "System overview")}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="border-border bg-card">
              <CardContent className="space-y-1 p-4">
                <p className="text-xs tracking-wide text-muted-foreground uppercase">
                  {tr(locale, "Active servers", "Active servers")}
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {dashboardSnapshot.overview.activeServers}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="space-y-1 p-4">
                <p className="text-xs tracking-wide text-muted-foreground uppercase">
                  {tr(locale, "Total requests", "Total requests")}
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {formatCompactNumber(dashboardSnapshot.overview.totalRequests)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="space-y-1 p-4">
                <p className="text-xs tracking-wide text-muted-foreground uppercase">
                  {tr(locale, "Average latency", "Average latency")}
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {dashboardSnapshot.overview.averageLatencyMs}ms
                </p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="space-y-1 p-4">
                <p className="text-xs tracking-wide text-muted-foreground uppercase">Uptime</p>
                <p className="text-2xl font-semibold text-foreground">
                  {dashboardSnapshot.overview.uptimePercent.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageSection>

      <PageSection surface="mesh">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground">
                {tr(locale, "Multi-agent performance (24h)", "Multi-agent performance (24h)")}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-border bg-background px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{tr(locale, "Runs", "Runs")}</p>
                <p className="text-lg font-semibold text-foreground">{dashboardSnapshot.multiAgent.totalRuns24h}</p>
              </div>
              <div className="rounded-md border border-border bg-background px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">p95</p>
                <p className="text-lg font-semibold text-foreground">{dashboardSnapshot.multiAgent.p95DurationMs24h}ms</p>
              </div>
              <div className="rounded-md border border-border bg-background px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{tr(locale, "Budget misses", "Budget misses")}</p>
                <p className="text-lg font-semibold text-foreground">{dashboardSnapshot.multiAgent.budgetMisses24h}</p>
              </div>
              <div className="rounded-md border border-border bg-background px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{tr(locale, "Mode split", "Mode split")}</p>
                <p className="text-sm font-medium text-foreground">
                  full-mesh: {dashboardSnapshot.multiAgent.modeSplit24h.fullMesh} · ring: {dashboardSnapshot.multiAgent.modeSplit24h.ring}
                </p>
              </div>
              <div className="rounded-md border border-border bg-background px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{tr(locale, "Weekly runs", "Weekly runs")}</p>
                <p className="text-lg font-semibold text-foreground">{dashboardSnapshot.multiAgent.weeklyRunCount}</p>
              </div>
              <div className="rounded-md border border-border bg-background px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{tr(locale, "Weekly avg latency", "Weekly avg latency")}</p>
                <p className="text-lg font-semibold text-foreground">{dashboardSnapshot.multiAgent.weeklyAvgDurationMs}ms</p>
              </div>
              <div className="rounded-md border border-border bg-background px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{tr(locale, "Weekly budget misses", "Weekly budget misses")}</p>
                <p className="text-lg font-semibold text-foreground">{dashboardSnapshot.multiAgent.weeklyBudgetMisses}</p>
              </div>
              <div className="rounded-md border border-border bg-background px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{tr(locale, "Report", "Report")}</p>
                <Button asChild variant="outline" className="mt-1 h-8 border-border bg-card text-xs hover:bg-muted/60">
                  <Link href="/api/admin/multi-agent/weekly-export">
                    {tr(locale, "Export weekly CSV", "Export weekly CSV")}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground">
                {tr(locale, "Recent multi-agent runs", "Recent multi-agent runs")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {dashboardSnapshot.multiAgent.recentRuns.length === 0 ? (
                <p className="text-sm text-muted-foreground">{tr(locale, "No recent runs yet.", "No recent runs yet.")}</p>
              ) : (
                dashboardSnapshot.multiAgent.recentRuns.map((run) => (
                  <div key={run.id} className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2 text-xs">
                    <span className="font-mono text-muted-foreground">{run.timeLabel}</span>
                    <span className="text-foreground">{run.coordinationMode}</span>
                    <span className="text-foreground">{run.durationMs}ms</span>
                    <span className="text-foreground">{run.estimatedTokens} tok</span>
                    <span className="text-foreground">
                      {run.withinBudget ? tr(locale, "within budget", "within budget") : tr(locale, "over budget", "over budget")}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </PageSection>
    </>
  );
}
