import Link from "next/link";
import { PageSection } from "@/components/page-templates";
import { Button } from "@/components/ui/button";
import { tr } from "@/lib/i18n";
import type { AdminPageSectionsProps } from "@/app/admin/_components/types";
import { formatCompactNumber } from "@/app/admin/_components/utils";

type Props = Pick<AdminPageSectionsProps, "locale" | "dashboardSnapshot">;

export function OverviewMultiAgentSections({ locale, dashboardSnapshot }: Props) {
  return (
    <>
      <PageSection>
        <div className="space-y-4"><h2 className="text-xl font-semibold text-foreground">{tr(locale, "System overview", "System overview")}</h2><div className="grid gap-px border border-border/60 bg-border/60 sm:grid-cols-2 xl:grid-cols-4">{[{ label: tr(locale, "Active servers", "Active servers"), value: dashboardSnapshot.overview.activeServers }, { label: tr(locale, "Total requests", "Total requests"), value: formatCompactNumber(dashboardSnapshot.overview.totalRequests) }, { label: tr(locale, "Average latency", "Average latency"), value: `${dashboardSnapshot.overview.averageLatencyMs}ms` }, { label: "Uptime", value: `${dashboardSnapshot.overview.uptimePercent.toFixed(1)}%` }].map((item) => <div key={item.label} className="bg-background px-5 py-5"><p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">{item.label}</p><p className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-foreground">{item.value}</p></div>)}</div></div>
      </PageSection>
      <PageSection>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="border border-border/60 bg-background/72 p-5 backdrop-blur-sm"><h3 className="text-base font-semibold text-foreground">{tr(locale, "Multi-agent performance (24h)", "Multi-agent performance (24h)")}</h3><div className="mt-4 grid gap-px border border-border/60 bg-border/60 sm:grid-cols-2">{[{ label: tr(locale, "Runs", "Runs"), value: dashboardSnapshot.multiAgent.totalRuns24h }, { label: "p95", value: `${dashboardSnapshot.multiAgent.p95DurationMs24h}ms` }, { label: tr(locale, "Budget misses", "Budget misses"), value: dashboardSnapshot.multiAgent.budgetMisses24h }, { label: tr(locale, "Mode split", "Mode split"), value: `full-mesh: ${dashboardSnapshot.multiAgent.modeSplit24h.fullMesh} | ring: ${dashboardSnapshot.multiAgent.modeSplit24h.ring}` }, { label: tr(locale, "Weekly runs", "Weekly runs"), value: dashboardSnapshot.multiAgent.weeklyRunCount }, { label: tr(locale, "Weekly avg latency", "Weekly avg latency"), value: `${dashboardSnapshot.multiAgent.weeklyAvgDurationMs}ms` }, { label: tr(locale, "Weekly budget misses", "Weekly budget misses"), value: dashboardSnapshot.multiAgent.weeklyBudgetMisses }].map((item) => <div key={item.label} className="bg-background px-4 py-3"><p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">{item.label}</p><p className="mt-2 text-lg font-semibold text-foreground">{item.value}</p></div>)}<div className="bg-background px-4 py-3"><p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">{tr(locale, "Report", "Report")}</p><Button asChild variant="outline" className="mt-3 h-9 text-xs"><Link href="/api/admin/multi-agent/weekly-export">{tr(locale, "Export weekly CSV", "Export weekly CSV")}</Link></Button></div></div></div>
          <div className="border border-border/60 bg-background/72 p-5 backdrop-blur-sm"><h3 className="text-base font-semibold text-foreground">{tr(locale, "Recent multi-agent runs", "Recent multi-agent runs")}</h3><div className="mt-4 editorial-list border border-border/60">{dashboardSnapshot.multiAgent.recentRuns.length === 0 ? <p className="px-4 py-4 text-sm text-muted-foreground">{tr(locale, "No recent runs yet.", "No recent runs yet.")}</p> : dashboardSnapshot.multiAgent.recentRuns.map((run) => <div key={run.id} className="grid gap-2 px-4 py-3 text-xs md:grid-cols-[120px_1fr_100px_100px_120px]"><span className="font-mono text-muted-foreground">{run.timeLabel}</span><span className="text-foreground">{run.coordinationMode}</span><span className="text-foreground">{run.durationMs}ms</span><span className="text-foreground">{run.estimatedTokens} tok</span><span className="text-foreground">{run.withinBudget ? tr(locale, "within budget", "within budget") : tr(locale, "over budget", "over budget")}</span></div>)}</div></div>
        </div>
      </PageSection>
    </>
  );
}
