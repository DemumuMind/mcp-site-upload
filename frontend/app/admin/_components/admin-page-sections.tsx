import Link from "next/link";
import { createAdminSystemEventAction, deleteAdminSystemEventAction, moderateServerStatusAction, saveAdminDashboardMetricsAction, saveAdminDashboardSettingsAction, } from "@/app/admin/actions";
import type { AdminPageQueryState } from "@/app/admin/page-view-model";
import { AdminSecurityPresets } from "@/components/admin-security-presets";
import { PageSection } from "@/components/page-templates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AdminDashboardSnapshot } from "@/lib/admin-dashboard";
import { getSecurityEventBadgeClass, getSecurityEventLabel } from "@/lib/auth/security-event-ui";
import { tr, type Locale } from "@/lib/i18n";
import type { McpServer } from "@/lib/types";

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function getAuthTypeLabel(locale: Locale, authType: string): string {
  if (authType === "oauth") return tr(locale, "OAuth", "OAuth");
  if (authType === "api_key") return tr(locale, "API key", "API key");
  return tr(locale, "No auth", "No auth");
}

function formatQueuedAt(locale: Locale, value?: string): string {
  if (!value) return tr(locale, "Unknown", "Unknown");
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return tr(locale, "Unknown", "Unknown");
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

type AdminPageSectionsProps = {
  locale: Locale;
  dashboardSnapshot: AdminDashboardSnapshot;
  pendingCount: number;
  filteredCount: number;
  query: string;
  selectedCategory: string;
  selectedAuth: string;
  selectedSecurityEvent: string;
  categoryOptions: string[];
  authOptions: string[];
  filteredPendingServers: McpServer[];
  securityEventOptions: string[];
  filteredSecurityEvents: AdminDashboardSnapshot["security"]["recentEvents"];
  stickyAdminHref: string;
  securityFilterEmail: string;
  securityFilterFrom: string;
  securityFilterTo: string;
  securityFilterFromTs: string;
  securityFilterToTs: string;
  securityPageSize: number;
  securitySortBy: "created_at" | "event_type" | "email" | "ip_address";
  securitySortOrder: "asc" | "desc";
  queryState: AdminPageQueryState;
};

export function AdminPageSections({
  locale,
  dashboardSnapshot,
  pendingCount,
  filteredCount,
  query,
  selectedCategory,
  selectedAuth,
  selectedSecurityEvent,
  categoryOptions,
  authOptions,
  filteredPendingServers,
  securityEventOptions,
  filteredSecurityEvents,
  stickyAdminHref,
  securityFilterEmail,
  securityFilterFrom,
  securityFilterTo,
  securityFilterFromTs,
  securityFilterToTs,
  securityPageSize,
  securitySortBy,
  securitySortOrder,
}: AdminPageSectionsProps) {
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

      <PageSection surface="mesh">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-foreground">
              {tr(locale, "Moderation queue", "Moderation queue")}
            </h2>
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="secondary" className="bg-muted/60 text-foreground">
                {tr(locale, "Total", "Total")}: {pendingCount}
              </Badge>
              <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">
                {tr(locale, "Showing", "Showing")}: {filteredCount}
              </Badge>
            </div>
          </div>
          <form method="get" className="grid gap-3 rounded-lg border border-border bg-card p-3 lg:grid-cols-[minmax(0,1fr)_220px_200px_auto]">
            <Input name="q" defaultValue={query} placeholder={tr(locale, "Search by name, slug, description, or URL", "Search by name, slug, description, or URL")} className="border-border bg-background text-foreground" />
            <select name="category" defaultValue={selectedCategory} className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground">
              <option value="all">{tr(locale, "All categories", "All categories")}</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select name="auth" defaultValue={selectedAuth} className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground">
              <option value="all">{tr(locale, "All auth types", "All auth types")}</option>
              {authOptions.map((authType) => (
                <option key={authType} value={authType}>{getAuthTypeLabel(locale, authType)}</option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <Button type="submit" variant="outline" className="border-border bg-card hover:bg-muted/60">
                {tr(locale, "Apply", "Apply")}
              </Button>
              <Button asChild variant="ghost" className="text-foreground hover:bg-muted">
                <Link href="/admin">{tr(locale, "Reset", "Reset")}</Link>
              </Button>
            </div>
          </form>
          {filteredPendingServers.length === 0 ? (
            <Card className="border-border bg-card">
              <CardHeader><CardTitle className="text-foreground">{tr(locale, "No results", "No results")}</CardTitle></CardHeader>
              <CardContent className="text-sm text-foreground">{tr(locale, "Try changing search text or filters.", "Try changing search text or filters.")}</CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredPendingServers.map((mcpServer) => (
                <Card key={mcpServer.id} className="border-border bg-card">
                  <CardHeader className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base text-foreground">{mcpServer.name}</CardTitle>
                      <p className="shrink-0 text-xs text-muted-foreground">{tr(locale, "Queued", "Queued")}: {formatQueuedAt(locale, mcpServer.createdAt)}</p>
                    </div>
                    <p className="font-mono text-xs text-muted-foreground">/{mcpServer.slug}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-accent/20 text-accent-foreground">{mcpServer.category}</Badge>
                      <Badge variant="secondary" className="bg-muted/60 text-foreground">{getAuthTypeLabel(locale, mcpServer.authType)}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-foreground">{mcpServer.description}</p>
                    <p className="truncate text-xs text-muted-foreground">{mcpServer.serverUrl}</p>
                    <div className="flex gap-2">
                      <form action={moderateServerStatusAction} className="w-full">
                        <input type="hidden" name="returnTo" value={stickyAdminHref} />
                        <input type="hidden" name="serverId" value={mcpServer.id} />
                        <input type="hidden" name="status" value="active" />
                        <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-accent">{tr(locale, "Approve", "Approve")}</Button>
                      </form>
                      <form action={moderateServerStatusAction} className="w-full">
                        <input type="hidden" name="returnTo" value={stickyAdminHref} />
                        <input type="hidden" name="serverId" value={mcpServer.id} />
                        <input type="hidden" name="status" value="rejected" />
                        <Button type="submit" variant="outline" className="w-full border-border bg-muted/60 text-foreground hover:bg-muted/70">{tr(locale, "Reject", "Reject")}</Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </PageSection>

      <PageSection surface="mesh">
        <Card className="border-border bg-card">
          <CardHeader className="space-y-2">
            <CardTitle className="text-base text-foreground">{tr(locale, "Auth security events", "Auth security events")}</CardTitle>
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="secondary" className="bg-muted/15 text-foreground">{tr(locale, "Failed logins (24h)", "Failed logins (24h)")}: {dashboardSnapshot.security.failedLast24h}</Badge>
              <Badge variant="secondary" className="bg-muted/15 text-foreground">{tr(locale, "Rate-limited (24h)", "Rate-limited (24h)")}: {dashboardSnapshot.security.rateLimitedLast24h}</Badge>
              <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">{tr(locale, "Total", "Total")}: {dashboardSnapshot.security.totalEvents}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <AdminSecurityPresets labels={{
              title: tr(locale, "Presets:", "Presets:"),
              failed24h: tr(locale, "Failed 24h", "Failed 24h"),
              rateLimited: tr(locale, "Rate-limited", "Rate-limited"),
              successfulLogins: tr(locale, "Successful logins", "Successful logins"),
              latest100: tr(locale, "Latest 100", "Latest 100"),
              last7days: tr(locale, "Last 7 days", "Last 7 days"),
            }} />
            {securityFilterFromTs || securityFilterToTs ? (
              <p className="text-xs text-muted-foreground">{tr(locale, "Local browser time-range is active for this filter.", "Local browser time-range is active for this filter.")}</p>
            ) : null}
            <form method="get" className="grid gap-2 rounded-md border border-border bg-background/80 p-3 md:grid-cols-[160px_minmax(0,1fr)_160px_160px_160px_140px_160px_auto]">
              <select name="securityEvent" defaultValue={selectedSecurityEvent} className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground">
                <option value="all">{tr(locale, "All event types", "All event types")}</option>
                {securityEventOptions.map((eventType) => <option key={eventType} value={eventType}>{eventType}</option>)}
              </select>
              <Input name="securityEmail" defaultValue={securityFilterEmail} placeholder={tr(locale, "Filter by email", "Filter by email")} className="border-border bg-background text-foreground" />
              <Input name="securityFrom" type="date" defaultValue={securityFilterFrom} className="border-border bg-background text-foreground" />
              <Input name="securityTo" type="date" defaultValue={securityFilterTo} className="border-border bg-background text-foreground" />
              <input type="hidden" name="securityFromTs" value={securityFilterFromTs} />
              <input type="hidden" name="securityToTs" value={securityFilterToTs} />
              <select name="securitySortBy" defaultValue={securitySortBy} className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground">
                <option value="created_at">created_at</option><option value="event_type">event_type</option><option value="email">email</option><option value="ip_address">ip_address</option>
              </select>
              <select name="securitySortOrder" defaultValue={securitySortOrder} className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground">
                <option value="desc">desc</option><option value="asc">asc</option>
              </select>
              <Input name="securityPageSize" type="number" min={10} max={200} defaultValue={securityPageSize} className="border-border bg-background text-foreground" />
              <input type="hidden" name="securityPage" value="1" />
              <div className="flex gap-2">
                <Button type="submit" variant="outline" className="border-border bg-card hover:bg-muted/60">{tr(locale, "Apply", "Apply")}</Button>
                <Button asChild variant="outline" className="border-accent bg-primary/10 text-accent-foreground hover:bg-primary/20">
                  <Link href={`/api/admin/security-events/export?eventType=${encodeURIComponent(selectedSecurityEvent)}&email=${encodeURIComponent(securityFilterEmail)}&from=${encodeURIComponent(securityFilterFrom)}&to=${encodeURIComponent(securityFilterTo)}&fromTs=${encodeURIComponent(securityFilterFromTs)}&toTs=${encodeURIComponent(securityFilterToTs)}`}>{tr(locale, "Export CSV", "Export CSV")}</Link>
                </Button>
                <Button asChild variant="ghost" className="text-foreground hover:bg-muted"><Link href="/admin">{tr(locale, "Reset", "Reset")}</Link></Button>
              </div>
            </form>
            {filteredSecurityEvents.map((event) => (
              <div key={event.id} className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground">
                <span className="font-mono text-muted-foreground">{event.timeLabel}</span>
                <Badge className={getSecurityEventBadgeClass(event.eventType)}>{getSecurityEventLabel(locale, event.eventType)}</Badge>
                <span className="text-foreground">{event.email}</span>
                {event.ipAddress ? <span className="text-muted-foreground">IP: {event.ipAddress}</span> : null}
                {event.userId ? <span className="text-muted-foreground">uid:{event.userId.slice(0, 8)}</span> : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </PageSection>

      <PageSection surface="mesh">
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground">{tr(locale, "Admin audit timeline", "Admin audit timeline")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {dashboardSnapshot.audit.recentActions.length > 0 ? dashboardSnapshot.audit.recentActions.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground">
                <span className="font-mono text-muted-foreground">{item.timeLabel}</span>
                <Badge variant="secondary" className="bg-muted/60 text-foreground">{item.action}</Badge>
                <span className="text-foreground">{item.actorLabel}</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-foreground">{item.targetLabel}</span>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground">{tr(locale, "No audit records yet.", "No audit records yet.")}</p>
            )}
          </CardContent>
        </Card>
      </PageSection>

      <PageSection surface="mesh">
        <form action={saveAdminDashboardMetricsAction} className="grid gap-4 lg:grid-cols-3">
          <input type="hidden" name="returnTo" value={stickyAdminHref} />
          <label className="grid gap-1.5 text-sm text-foreground"><span>{tr(locale, "Total requests", "Total requests")}</span><Input name="totalRequests" type="number" min={0} defaultValue={dashboardSnapshot.overview.totalRequests} className="border-border bg-background text-foreground" /></label>
          <label className="grid gap-1.5 text-sm text-foreground"><span>{tr(locale, "Average latency (ms)", "Average latency (ms)")}</span><Input name="averageLatencyMs" type="number" min={0} defaultValue={dashboardSnapshot.overview.averageLatencyMs} className="border-border bg-background text-foreground" /></label>
          <label className="grid gap-1.5 text-sm text-foreground"><span>{tr(locale, "Uptime percent", "Uptime percent")}</span><Input name="uptimePercent" type="number" min={0} max={100} step={0.1} defaultValue={dashboardSnapshot.overview.uptimePercent} className="border-border bg-background text-foreground" /></label>
        </form>
      </PageSection>

      <PageSection surface="mesh">
        <form action={saveAdminDashboardSettingsAction} className="grid gap-4 lg:grid-cols-2">
          <input type="hidden" name="returnTo" value={stickyAdminHref} />
          <Card className="border-border bg-card">
            <CardHeader className="pb-3"><CardTitle className="text-base text-foreground">{tr(locale, "General settings", "General settings")}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <label className="grid gap-1.5 text-sm text-foreground"><span>{tr(locale, "Status update interval (sec)", "Status update interval (sec)")}</span><Input name="statusUpdateIntervalSec" type="number" min={1} max={300} defaultValue={dashboardSnapshot.settings.statusUpdateIntervalSec} className="border-border bg-background text-foreground" /></label>
              <label className="grid gap-1.5 text-sm text-foreground"><span>{tr(locale, "Request limit per minute", "Request limit per minute")}</span><Input name="requestLimitPerMinute" type="number" min={1} max={100000} defaultValue={dashboardSnapshot.settings.requestLimitPerMinute} className="border-border bg-background text-foreground" /></label>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardHeader className="pb-3"><CardTitle className="text-base text-foreground">{tr(locale, "Notifications", "Notifications")}</CardTitle></CardHeader>
            <CardContent className="space-y-2.5">
              <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"><input type="checkbox" name="notifyEmailOnErrors" defaultChecked={dashboardSnapshot.settings.notifyEmailOnErrors} className="size-4 rounded border-border bg-card accent-primary" /><span>{tr(locale, "Email alerts on errors", "Email alerts on errors")}</span></label>
              <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"><input type="checkbox" name="notifyPushNotifications" defaultChecked={dashboardSnapshot.settings.notifyPushNotifications} className="size-4 rounded border-border bg-card accent-primary" /><span>{tr(locale, "Push notifications", "Push notifications")}</span></label>
              <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"><input type="checkbox" name="notifyWebhookIntegrations" defaultChecked={dashboardSnapshot.settings.notifyWebhookIntegrations} className="size-4 rounded border-border bg-card accent-primary" /><span>{tr(locale, "Webhook integrations", "Webhook integrations")}</span></label>
            </CardContent>
          </Card>
        </form>
      </PageSection>

      <PageSection surface="mesh">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3"><CardTitle className="text-base text-foreground">{tr(locale, "Create system event", "Create system event")}</CardTitle></CardHeader>
            <CardContent>
              <form action={createAdminSystemEventAction} className="space-y-3">
                <input type="hidden" name="returnTo" value={stickyAdminHref} />
                <label className="grid gap-1.5 text-sm text-foreground"><span>{tr(locale, "Level", "Level")}</span><select name="level" defaultValue="info" className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground"><option value="info">info</option><option value="success">success</option><option value="warning">warning</option><option value="error">error</option></select></label>
                <label className="grid gap-1.5 text-sm text-foreground"><span>Message</span><Input name="messageEn" required className="border-border bg-background text-foreground" /></label>
                <label className="grid gap-1.5 text-sm text-foreground"><span>{tr(locale, "Occurred at (optional)", "Occurred at (optional)")}</span><Input name="occurredAt" type="datetime-local" className="border-border bg-background text-foreground" /></label>
              </form>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardHeader className="pb-3"><CardTitle className="text-base text-foreground">{tr(locale, "Manage events", "Manage events")}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {dashboardSnapshot.analytics.latestEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs text-muted-foreground">{event.timeLabel}</p>
                    <p className="truncate text-sm text-foreground">{tr(locale, event.messageEn, event.messageEn)}</p>
                  </div>
                  <form action={deleteAdminSystemEventAction}>
                    <input type="hidden" name="returnTo" value={stickyAdminHref} />
                    <input type="hidden" name="eventId" value={event.id} />
                    <Button type="submit" variant="outline" className="border-border bg-muted/60 text-foreground hover:bg-muted/70">{tr(locale, "Delete", "Delete")}</Button>
                  </form>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </PageSection>
    </>
  );
}
