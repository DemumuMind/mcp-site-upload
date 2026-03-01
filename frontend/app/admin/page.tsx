import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { createAdminSystemEventAction, deleteAdminSystemEventAction, logoutAdminAction, moderateServerStatusAction, saveAdminDashboardMetricsAction, saveAdminDashboardSettingsAction, } from "@/app/admin/actions";
import { AdminAutoRefresh } from "@/components/admin-auto-refresh";
import { AdminSecurityPresets } from "@/components/admin-security-presets";
import { PageFrame, PageHero, PageMetric, PageSection } from "@/components/page-templates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireAdminAccess } from "@/lib/admin-access";
import { getAdminDashboardSnapshot } from "@/lib/admin-dashboard";
import { getSecurityEventBadgeClass, getSecurityEventLabel } from "@/lib/auth/security-event-ui";
import { tr, type Locale } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { writeAdminRequestLog } from "@/lib/admin-request-log";
import { getPendingServers } from "@/lib/servers";
export const metadata: Metadata = {
    title: "Moderation",
    description: "Admin moderation dashboard for pending server submissions.",
};
type AdminPageProps = {
    searchParams: Promise<{
        success?: string;
        error?: string;
        q?: string;
        category?: string;
        auth?: string;
        securityEvent?: string;
        securityEmail?: string;
        securityFrom?: string;
        securityTo?: string;
        securityFromTs?: string;
        securityToTs?: string;
        securityPage?: string;
        securityPageSize?: string;
        securitySortBy?: "created_at" | "event_type" | "email" | "ip_address";
        securitySortOrder?: "asc" | "desc";
    }>;
};
function formatCompactNumber(locale: Locale, value: number): string {
    return new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value);
}
function getFeedbackMessage({ locale, success, error, }: {
    locale: Locale;
    success?: string;
    error?: string;
}) {
    if (success === "active") {
        return {
            tone: "success" as const,
            text: tr(locale, "Server approved and moved to active.", "Server approved and moved to active."),
        };
    }
    if (success === "rejected") {
        return {
            tone: "success" as const,
            text: tr(locale, "Server rejected successfully.", "Server rejected successfully."),
        };
    }
    if (success === "settings") {
        return {
            tone: "success" as const,
            text: tr(locale, "Dashboard settings saved.", "Dashboard settings saved."),
        };
    }
    if (success === "metrics") {
        return {
            tone: "success" as const,
            text: tr(locale, "Dashboard metrics saved.", "Dashboard metrics saved."),
        };
    }
    if (success === "event_created") {
        return {
            tone: "success" as const,
            text: tr(locale, "System event created.", "System event created."),
        };
    }
    if (success === "event_deleted") {
        return {
            tone: "success" as const,
            text: tr(locale, "System event deleted.", "System event deleted."),
        };
    }
    if (error) {
        return {
            tone: "error" as const,
            text: error === "supabase"
                ? tr(locale, "Supabase admin mode is not configured.", "Supabase admin mode is not configured.")
                : error,
        };
    }
    return null;
}
function getAuthTypeLabel(locale: Locale, authType: string): string {
    if (authType === "oauth") {
        return tr(locale, "OAuth", "OAuth");
    }
    if (authType === "api_key") {
        return tr(locale, "API key", "API key");
    }
    return tr(locale, "No auth", "No auth");
}
function formatQueuedAt(locale: Locale, value?: string): string {
    if (!value) {
        return tr(locale, "Unknown", "Unknown");
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return tr(locale, "Unknown", "Unknown");
    }
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(parsed);
}
export default async function AdminPage({ searchParams }: AdminPageProps) {
    await requireAdminAccess("/admin");
    const locale = await getLocale();
    const queryState = await searchParams;
    const rawSearchParams = new URLSearchParams();
    Object.entries(queryState).forEach(([key, value]) => {
        if (typeof value === "string" && value.length > 0) {
            rawSearchParams.set(key, value);
        }
    });
    await writeAdminRequestLog({
        path: "/admin",
        query: rawSearchParams.toString(),
        source: "admin_page",
    });
    const securityFilterEvent = queryState.securityEvent || "all";
    const securityFilterEmail = (queryState.securityEmail || "").trim();
    const securityFilterFrom = (queryState.securityFrom || "").trim();
    const securityFilterTo = (queryState.securityTo || "").trim();
    const securityFilterFromTs = (queryState.securityFromTs || "").trim();
    const securityFilterToTs = (queryState.securityToTs || "").trim();
    const securityPage = Math.max(Number(queryState.securityPage || "1") || 1, 1);
    const securityPageSize = Math.max(Number(queryState.securityPageSize || "50") || 50, 10);
    const securitySortBy = queryState.securitySortBy || "created_at";
    const securitySortOrder = queryState.securitySortOrder || "desc";
    const [pendingServers, dashboardSnapshot] = await Promise.all([
        getPendingServers(),
        getAdminDashboardSnapshot({
            eventType: securityFilterEvent,
            emailQuery: securityFilterEmail,
            fromDate: securityFilterFrom,
            toDate: securityFilterTo,
            fromTs: securityFilterFromTs || undefined,
            toTs: securityFilterToTs || undefined,
            page: securityPage,
            pageSize: securityPageSize,
            sortBy: securitySortBy,
            sortOrder: securitySortOrder,
        }),
    ]);
    const pendingCount = pendingServers.length;
    const query = (queryState.q || "").trim();
    const selectedCategory = queryState.category || "all";
    const selectedAuth = queryState.auth || "all";
    const selectedSecurityEvent = securityFilterEvent;
    const normalizedQuery = query.toLowerCase();
    const categoryOptions = Array.from(new Set(pendingServers.map((item) => item.category))).sort((left, right) => left.localeCompare(right));
    const authOptions = Array.from(new Set(pendingServers.map((item) => item.authType))).sort((left, right) => left.localeCompare(right));
    const filteredPendingServers = pendingServers.filter((server) => {
        const queryMatches = normalizedQuery.length === 0 ||
            server.name.toLowerCase().includes(normalizedQuery) ||
            server.slug.toLowerCase().includes(normalizedQuery) ||
            server.description.toLowerCase().includes(normalizedQuery) ||
            server.serverUrl.toLowerCase().includes(normalizedQuery);
        const categoryMatches = selectedCategory === "all" || server.category === selectedCategory;
        const authMatches = selectedAuth === "all" || server.authType === selectedAuth;
        return queryMatches && categoryMatches && authMatches;
    });
    const filteredCount = filteredPendingServers.length;
    const securityEventOptions = Array.from(new Set(dashboardSnapshot.security.recentEvents.map((item) => item.eventType))).sort((left, right) => left.localeCompare(right));
    const filteredSecurityEvents = dashboardSnapshot.security.recentEvents;
    const feedback = getFeedbackMessage({
        locale,
        success: queryState.success,
        error: queryState.error,
    });
    const stickyParams = new URLSearchParams();
    if (query) {
        stickyParams.set("q", query);
    }
    if (selectedCategory !== "all") {
        stickyParams.set("category", selectedCategory);
    }
    if (selectedAuth !== "all") {
        stickyParams.set("auth", selectedAuth);
    }
    if (selectedSecurityEvent !== "all") {
        stickyParams.set("securityEvent", selectedSecurityEvent);
    }
    if (securityFilterEmail) {
        stickyParams.set("securityEmail", securityFilterEmail);
    }
    if (securityFilterFrom) {
        stickyParams.set("securityFrom", securityFilterFrom);
    }
    if (securityFilterTo) {
        stickyParams.set("securityTo", securityFilterTo);
    }
    if (securityFilterFromTs) {
        stickyParams.set("securityFromTs", securityFilterFromTs);
    }
    if (securityFilterToTs) {
        stickyParams.set("securityToTs", securityFilterToTs);
    }
    if (securitySortBy !== "created_at") {
        stickyParams.set("securitySortBy", securitySortBy);
    }
    if (securitySortOrder !== "desc") {
        stickyParams.set("securitySortOrder", securitySortOrder);
    }
    if (securityPageSize !== 50) {
        stickyParams.set("securityPageSize", String(securityPageSize));
    }
    if (securityPage !== 1) {
        stickyParams.set("securityPage", String(securityPage));
    }
    const stickyQueryString = stickyParams.toString();
    const stickyAdminHref = `/admin${stickyQueryString ? `?${stickyQueryString}` : ""}`;
    return (<PageFrame variant="ops">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
        <PageHero surface="mesh" badgeTone="emerald" eyebrow={tr(locale, "Operations", "Operations")} title={tr(locale, "Moderation Dashboard", "Moderation Dashboard")} description={tr(locale, "Review pending MCP submissions, manage analytics, and keep catalog quality high.", "Review pending MCP submissions, manage analytics, and keep catalog quality high.")} actions={<div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="outline" className="border-border bg-card hover:bg-muted/60">
                <Link href={`/admin/blog?from=${encodeURIComponent(stickyAdminHref)}`}>
                  <FileText className="size-4"/>
                  {tr(locale, "Blog studio", "Blog studio")}
                </Link>
              </Button>

              <form action={logoutAdminAction}>
                <Button type="submit" variant="outline" className="border-border bg-card hover:bg-muted/60">
                  {tr(locale, "Logout", "Logout")}
                </Button>
              </form>
            </div>} metrics={<PageMetric surface="mesh" label={tr(locale, "Pending queue", "Pending queue")} value={pendingCount} valueClassName={pendingCount > 0 ? "text-foreground" : "text-foreground"}/>}/>

        {feedback ? (<div className={`rounded-md border px-3 py-2 text-sm ${feedback.tone === "success"
                ? "border-accent bg-accent/20 text-foreground"
                : "border-border bg-muted/60 text-foreground"}`}>
            {feedback.text}
          </div>) : null}

        <AdminAutoRefresh intervalSec={dashboardSnapshot.settings.statusUpdateIntervalSec} labels={{
            autoRefresh: tr(locale, "Auto refresh", "Auto refresh"),
            refreshNow: tr(locale, "Refresh now", "Refresh now"),
            lastUpdated: tr(locale, "Last updated", "Last updated"),
        }}/>

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
                    {formatCompactNumber(locale, dashboardSnapshot.overview.totalRequests)}
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
                      <span className={run.withinBudget ? "text-foreground" : "text-foreground"}>
                        {run.withinBudget ? tr(locale, "within budget", "within budget") : tr(locale, "over budget", "over budget")}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
          <Card className="mt-4 border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground">
                {tr(locale, "Auto alerts", "Auto alerts")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {dashboardSnapshot.multiAgent.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-md border px-3 py-2 text-sm ${
                    alert.level === "error"
                      ? "border-border bg-muted/60 text-foreground"
                      : alert.level === "warning"
                        ? "border-border bg-muted/60 text-foreground"
                        : "border-accent bg-accent/20 text-foreground"
                  }`}
                >
                  {tr(locale, alert.message, alert.message)}
                </div>
              ))}
            </CardContent>
          </Card>
        </PageSection>

        <PageSection surface="mesh">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-foreground">
                  {tr(locale, "Request distribution by servers", "Request distribution by servers")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardSnapshot.analytics.requestDistribution.map((item) => (<div key={item.serverSlug} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-foreground">
                      <span className="font-mono">{item.serverName}</span>
                      <span>{formatCompactNumber(locale, item.requestCount)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${Math.max(item.sharePercent, 2)}%` }}/>
                    </div>
                  </div>))}
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-foreground">
                  {tr(locale, "Latest events", "Latest events")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dashboardSnapshot.analytics.latestEvents.map((event) => (<div key={event.id} className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2">
                    <span className="text-xs font-mono text-muted-foreground">{event.timeLabel}</span>
                    <span className={`inline-flex size-2 rounded-full ${event.level === "success"
                ? "bg-accent"
                : event.level === "warning"
                    ? "bg-muted"
                    : event.level === "error"
                        ? "bg-muted"
                        : "bg-accent"}`}/>
                    <p className="text-sm text-foreground">{tr(locale, event.messageEn, event.messageEn)}</p>
                  </div>))}
              </CardContent>
            </Card>
          </div>
        </PageSection>

        <PageSection surface="mesh">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              {tr(locale, "Dashboard settings", "Dashboard settings")}
            </h2>

            <form action={saveAdminDashboardSettingsAction} className="grid gap-4 lg:grid-cols-2">
              <input type="hidden" name="returnTo" value={stickyAdminHref}/>
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-foreground">
                    {tr(locale, "General settings", "General settings")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <label className="grid gap-1.5 text-sm text-foreground">
                    <span>{tr(locale, "Status update interval (sec)", "Status update interval (sec)")}</span>
                    <Input name="statusUpdateIntervalSec" type="number" min={1} max={300} defaultValue={dashboardSnapshot.settings.statusUpdateIntervalSec} className="border-border bg-background text-foreground"/>
                  </label>

                  <label className="grid gap-1.5 text-sm text-foreground">
                    <span>{tr(locale, "Request limit per minute", "Request limit per minute")}</span>
                    <Input name="requestLimitPerMinute" type="number" min={1} max={100000} defaultValue={dashboardSnapshot.settings.requestLimitPerMinute} className="border-border bg-background text-foreground"/>
                  </label>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-foreground">
                    {tr(locale, "Notifications", "Notifications")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
                    <input type="checkbox" name="notifyEmailOnErrors" defaultChecked={dashboardSnapshot.settings.notifyEmailOnErrors} className="size-4 rounded border-border bg-card accent-primary"/>
                    <span>{tr(locale, "Email alerts on errors", "Email alerts on errors")}</span>
                  </label>

                  <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
                    <input type="checkbox" name="notifyPushNotifications" defaultChecked={dashboardSnapshot.settings.notifyPushNotifications} className="size-4 rounded border-border bg-card accent-primary"/>
                    <span>{tr(locale, "Push notifications", "Push notifications")}</span>
                  </label>

                  <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
                    <input type="checkbox" name="notifyWebhookIntegrations" defaultChecked={dashboardSnapshot.settings.notifyWebhookIntegrations} className="size-4 rounded border-border bg-card accent-primary"/>
                    <span>{tr(locale, "Webhook integrations", "Webhook integrations")}</span>
                  </label>
                </CardContent>
              </Card>

              <div className="flex justify-end lg:col-span-2">
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {tr(locale, "Save settings", "Save settings")}
                </Button>
              </div>
            </form>
          </div>
        </PageSection>

        <PageSection surface="mesh">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              {tr(locale, "Metrics editor", "Metrics editor")}
            </h2>

            <form action={saveAdminDashboardMetricsAction} className="grid gap-4 lg:grid-cols-3">
              <input type="hidden" name="returnTo" value={stickyAdminHref}/>
              <label className="grid gap-1.5 text-sm text-foreground">
                <span>{tr(locale, "Total requests", "Total requests")}</span>
                <Input name="totalRequests" type="number" min={0} defaultValue={dashboardSnapshot.overview.totalRequests} className="border-border bg-background text-foreground"/>
              </label>

              <label className="grid gap-1.5 text-sm text-foreground">
                <span>{tr(locale, "Average latency (ms)", "Average latency (ms)")}</span>
                <Input name="averageLatencyMs" type="number" min={0} defaultValue={dashboardSnapshot.overview.averageLatencyMs} className="border-border bg-background text-foreground"/>
              </label>

              <label className="grid gap-1.5 text-sm text-foreground">
                <span>{tr(locale, "Uptime percent", "Uptime percent")}</span>
                <Input name="uptimePercent" type="number" min={0} max={100} step={0.1} defaultValue={dashboardSnapshot.overview.uptimePercent} className="border-border bg-background text-foreground"/>
              </label>

              <div className="flex justify-end lg:col-span-3">
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {tr(locale, "Save metrics", "Save metrics")}
                </Button>
              </div>
            </form>
          </div>
        </PageSection>

        <PageSection surface="mesh">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-foreground">
                  {tr(locale, "Create system event", "Create system event")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form action={createAdminSystemEventAction} className="space-y-3">
                  <input type="hidden" name="returnTo" value={stickyAdminHref}/>
                  <label className="grid gap-1.5 text-sm text-foreground">
                    <span>{tr(locale, "Level", "Level")}</span>
                    <select name="level" defaultValue="info" className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground">
                      <option value="info">info</option>
                      <option value="success">success</option>
                      <option value="warning">warning</option>
                      <option value="error">error</option>
                    </select>
                  </label>

                  <label className="grid gap-1.5 text-sm text-foreground">
                    <span>Message</span>
                    <Input name="messageEn" required className="border-border bg-background text-foreground"/>
                  </label>

                  <label className="grid gap-1.5 text-sm text-foreground">
                    <span>{tr(locale, "Occurred at (optional)", "Occurred at (optional)")}</span>
                    <Input name="occurredAt" type="datetime-local" className="border-border bg-background text-foreground"/>
                  </label>

                  <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-accent">
                    {tr(locale, "Add event", "Add event")}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-foreground">
                  {tr(locale, "Manage events", "Manage events")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dashboardSnapshot.analytics.latestEvents.map((event) => (<div key={event.id} className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs text-muted-foreground">{event.timeLabel}</p>
                      <p className="truncate text-sm text-foreground">
                        {tr(locale, event.messageEn, event.messageEn)}
                      </p>
                    </div>
                    <form action={deleteAdminSystemEventAction}>
                      <input type="hidden" name="returnTo" value={stickyAdminHref}/>
                      <input type="hidden" name="eventId" value={event.id}/>
                      <Button type="submit" variant="outline" className="border-border bg-muted/60 text-foreground hover:bg-muted/70">
                        {tr(locale, "Delete", "Delete")}
                      </Button>
                    </form>
                  </div>))}
              </CardContent>
            </Card>
          </div>
        </PageSection>

        <PageSection surface="mesh">
          <Card className="border-border bg-card">
            <CardHeader className="space-y-2">
              <CardTitle className="text-base text-foreground">
                {tr(locale, "Auth security events", "Auth security events")}
              </CardTitle>
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="secondary" className="bg-muted/15 text-foreground">
                  {tr(locale, "Failed logins (24h)", "Failed logins (24h)")}: {dashboardSnapshot.security.failedLast24h}
                </Badge>
                <Badge variant="secondary" className="bg-muted/15 text-foreground">
                  {tr(locale, "Rate-limited (24h)", "Rate-limited (24h)")}: {dashboardSnapshot.security.rateLimitedLast24h}
                </Badge>
                <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">
                  {tr(locale, "Total", "Total")}: {dashboardSnapshot.security.totalEvents}
                </Badge>
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
        }}/>
              {securityFilterFromTs || securityFilterToTs ? (<p className="text-xs text-muted-foreground">
                  {tr(locale, "Local browser time-range is active for this filter.", "Local browser time-range is active for this filter.")}
                </p>) : null}

              <form method="get" className="grid gap-2 rounded-md border border-border bg-background/80 p-3 md:grid-cols-[160px_minmax(0,1fr)_160px_160px_160px_140px_160px_auto]">
                <select name="securityEvent" defaultValue={selectedSecurityEvent} className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground">
                  <option value="all">{tr(locale, "All event types", "All event types")}</option>
                  {securityEventOptions.map((eventType) => (<option key={eventType} value={eventType}>
                      {eventType}
                    </option>))}
                </select>
                <Input name="securityEmail" defaultValue={queryState.securityEmail || ""} placeholder={tr(locale, "Filter by email", "Filter by email")} className="border-border bg-background text-foreground"/>
                <Input name="securityFrom" type="date" defaultValue={securityFilterFrom} className="border-border bg-background text-foreground"/>
                <Input name="securityTo" type="date" defaultValue={securityFilterTo} className="border-border bg-background text-foreground"/>
                <input type="hidden" name="securityFromTs" value={securityFilterFromTs}/>
                <input type="hidden" name="securityToTs" value={securityFilterToTs}/>
                <select name="securitySortBy" defaultValue={securitySortBy} className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground">
                  <option value="created_at">created_at</option>
                  <option value="event_type">event_type</option>
                  <option value="email">email</option>
                  <option value="ip_address">ip_address</option>
                </select>
                <select name="securitySortOrder" defaultValue={securitySortOrder} className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground">
                  <option value="desc">desc</option>
                  <option value="asc">asc</option>
                </select>
                <Input name="securityPageSize" type="number" min={10} max={200} defaultValue={securityPageSize} className="border-border bg-background text-foreground"/>
                <input type="hidden" name="securityPage" value="1"/>
                <div className="flex gap-2">
                  <Button type="submit" variant="outline" className="border-border bg-card hover:bg-muted/60">
                    {tr(locale, "Apply", "Apply")}
                  </Button>
                  <Button asChild variant="outline" className="border-accent bg-primary/10 text-accent-foreground hover:bg-primary/20">
                    <Link href={`/api/admin/security-events/export?eventType=${encodeURIComponent(selectedSecurityEvent)}&email=${encodeURIComponent(queryState.securityEmail || "")}&from=${encodeURIComponent(securityFilterFrom)}&to=${encodeURIComponent(securityFilterTo)}&fromTs=${encodeURIComponent(securityFilterFromTs)}&toTs=${encodeURIComponent(securityFilterToTs)}`}>
                      {tr(locale, "Export CSV", "Export CSV")}
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="text-foreground hover:bg-muted">
                    <Link href="/admin">{tr(locale, "Reset", "Reset")}</Link>
                  </Button>
                </div>
              </form>

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{tr(locale, "Quick sort:", "Quick sort:")}</span>
                {(["created_at", "event_type", "email", "ip_address"] as const).map((sortKey) => {
                const nextOrder = securitySortBy === sortKey && securitySortOrder === "desc" ? "asc" : "desc";
                return (<Button key={sortKey} asChild variant="outline" className="h-7 border-border bg-card px-2.5 text-xs hover:bg-muted/60">
                      <Link href={`/admin?securityEvent=${encodeURIComponent(selectedSecurityEvent)}&securityEmail=${encodeURIComponent(queryState.securityEmail || "")}&securityFrom=${encodeURIComponent(securityFilterFrom)}&securityTo=${encodeURIComponent(securityFilterTo)}&securityFromTs=${encodeURIComponent(securityFilterFromTs)}&securityToTs=${encodeURIComponent(securityFilterToTs)}&securitySortBy=${encodeURIComponent(sortKey)}&securitySortOrder=${encodeURIComponent(nextOrder)}&securityPageSize=${dashboardSnapshot.security.pageSize}&securityPage=1`}>
                        {sortKey}
                        {securitySortBy === sortKey ? ` (${securitySortOrder})` : ""}
                      </Link>
                    </Button>);
            })}
              </div>

              {filteredSecurityEvents.length === 0 ? (<p className="text-sm text-muted-foreground">
                  {tr(locale, "No security events found for selected filters.", "No security events found for selected filters.")}
                </p>) : (filteredSecurityEvents.map((event) => (<div key={event.id} className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground">
                    <span className="font-mono text-muted-foreground">{event.timeLabel}</span>
                    <Badge className={getSecurityEventBadgeClass(event.eventType)}>
                      {getSecurityEventLabel(locale, event.eventType)}
                    </Badge>
                    <span className="text-foreground">{event.email}</span>
                    {event.ipAddress ? (<span className="text-muted-foreground">IP: {event.ipAddress}</span>) : null}
                    {event.userId ? (<span className="text-muted-foreground">uid:{event.userId.slice(0, 8)}</span>) : null}
                  </div>)))}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {tr(locale, "Page", "Page")} {dashboardSnapshot.security.page} / {dashboardSnapshot.security.totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <form method="get" className="flex items-center gap-2">
                    <input type="hidden" name="securityEvent" value={selectedSecurityEvent}/>
                    <input type="hidden" name="securityEmail" value={queryState.securityEmail || ""}/>
                    <input type="hidden" name="securityFrom" value={securityFilterFrom}/>
                    <input type="hidden" name="securityTo" value={securityFilterTo}/>
                    <input type="hidden" name="securitySortBy" value={securitySortBy}/>
                    <input type="hidden" name="securitySortOrder" value={securitySortOrder}/>
                    <input type="hidden" name="securityPageSize" value={dashboardSnapshot.security.pageSize}/>
                    <Input name="securityPage" type="number" min={1} max={dashboardSnapshot.security.totalPages} defaultValue={dashboardSnapshot.security.page} className="h-8 w-20 border-border bg-background text-foreground"/>
                    <Button type="submit" variant="outline" className="h-8 border-border bg-card hover:bg-muted/60">
                      {tr(locale, "Go", "Go")}
                    </Button>
                  </form>
                  <Button asChild variant="outline" className="border-border bg-card hover:bg-muted/60" disabled={dashboardSnapshot.security.page <= 1}>
                    <Link href={`/admin?securityEvent=${encodeURIComponent(selectedSecurityEvent)}&securityEmail=${encodeURIComponent(queryState.securityEmail || "")}&securityFrom=${encodeURIComponent(securityFilterFrom)}&securityTo=${encodeURIComponent(securityFilterTo)}&securityFromTs=${encodeURIComponent(securityFilterFromTs)}&securityToTs=${encodeURIComponent(securityFilterToTs)}&securitySortBy=${encodeURIComponent(securitySortBy)}&securitySortOrder=${encodeURIComponent(securitySortOrder)}&securityPageSize=${dashboardSnapshot.security.pageSize}&securityPage=${Math.max(1, dashboardSnapshot.security.page - 1)}`}>
                      {tr(locale, "Prev", "Prev")}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-border bg-card hover:bg-muted/60" disabled={dashboardSnapshot.security.page >= dashboardSnapshot.security.totalPages}>
                    <Link href={`/admin?securityEvent=${encodeURIComponent(selectedSecurityEvent)}&securityEmail=${encodeURIComponent(queryState.securityEmail || "")}&securityFrom=${encodeURIComponent(securityFilterFrom)}&securityTo=${encodeURIComponent(securityFilterTo)}&securityFromTs=${encodeURIComponent(securityFilterFromTs)}&securityToTs=${encodeURIComponent(securityFilterToTs)}&securitySortBy=${encodeURIComponent(securitySortBy)}&securitySortOrder=${encodeURIComponent(securitySortOrder)}&securityPageSize=${dashboardSnapshot.security.pageSize}&securityPage=${Math.min(dashboardSnapshot.security.totalPages, dashboardSnapshot.security.page + 1)}`}>
                      {tr(locale, "Next", "Next")}
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </PageSection>

        <PageSection surface="mesh">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground">
                {tr(locale, "Admin audit timeline", "Admin audit timeline")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {dashboardSnapshot.audit.recentActions.length > 0 ? (dashboardSnapshot.audit.recentActions.map((item) => (<div key={item.id} className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground">
                    <span className="font-mono text-muted-foreground">{item.timeLabel}</span>
                    <Badge variant="secondary" className="bg-muted/60 text-foreground">
                      {item.action}
                    </Badge>
                    <span className="text-foreground">{item.actorLabel}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-foreground">{item.targetLabel}</span>
                  </div>))) : (<p className="text-sm text-muted-foreground">
                  {tr(locale, "No audit records yet.", "No audit records yet.")}
                </p>)}
            </CardContent>
          </Card>
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
              <Input name="q" defaultValue={query} placeholder={tr(locale, "Search by name, slug, description, or URL", "Search by name, slug, description, or URL")} className="border-border bg-background text-foreground"/>
              <select name="category" defaultValue={selectedCategory} className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground">
                <option value="all">{tr(locale, "All categories", "All categories")}</option>
                {categoryOptions.map((category) => (<option key={category} value={category}>
                    {category}
                  </option>))}
              </select>
              <select name="auth" defaultValue={selectedAuth} className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground">
                <option value="all">{tr(locale, "All auth types", "All auth types")}</option>
                {authOptions.map((authType) => (<option key={authType} value={authType}>
                    {getAuthTypeLabel(locale, authType)}
                  </option>))}
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

            {pendingServers.length === 0 ? (<Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">
                  {tr(locale, "No pending submissions", "No pending submissions")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-foreground">
                {tr(locale, "New servers submitted through the public form will appear here.", "New servers submitted through the public form will appear here.")}
              </CardContent>
            </Card>) : filteredPendingServers.length === 0 ? (<Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">
                  {tr(locale, "No results", "No results")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-foreground">
                {tr(locale, "Try changing search text or filters.", "Try changing search text or filters.")}
              </CardContent>
            </Card>) : (<div className="grid gap-4 lg:grid-cols-2">
              {filteredPendingServers.map((mcpServer) => (<Card key={mcpServer.id} className="border-border bg-card">
                  <CardHeader className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base text-foreground">{mcpServer.name}</CardTitle>
                      <p className="shrink-0 text-xs text-muted-foreground">
                        {tr(locale, "Queued", "Queued")}: {formatQueuedAt(locale, mcpServer.createdAt)}
                      </p>
                    </div>
                    <p className="font-mono text-xs text-muted-foreground">/{mcpServer.slug}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-accent/20 text-accent-foreground">{mcpServer.category}</Badge>
                      <Badge variant="secondary" className="bg-muted/60 text-foreground">
                        {getAuthTypeLabel(locale, mcpServer.authType)}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-foreground">{mcpServer.description}</p>
                    <p className="truncate text-xs text-muted-foreground">{mcpServer.serverUrl}</p>

                    <div className="flex gap-2">
                      <form action={moderateServerStatusAction} className="w-full">
                        <input type="hidden" name="returnTo" value={stickyAdminHref}/>
                        <input type="hidden" name="serverId" value={mcpServer.id}/>
                        <input type="hidden" name="status" value="active"/>
                        <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-accent">
                          {tr(locale, "Approve", "Approve")}
                        </Button>
                      </form>

                      <form action={moderateServerStatusAction} className="w-full">
                        <input type="hidden" name="returnTo" value={stickyAdminHref}/>
                        <input type="hidden" name="serverId" value={mcpServer.id}/>
                        <input type="hidden" name="status" value="rejected"/>
                        <Button type="submit" variant="outline" className="w-full border-border bg-muted/60 text-foreground hover:bg-muted/70">
                          {tr(locale, "Reject", "Reject")}
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>))}
            </div>)}
          </div>
        </PageSection>
      </div>
    </PageFrame>);
}
