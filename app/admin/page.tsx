import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { createAdminSystemEventAction, deleteAdminSystemEventAction, logoutAdminAction, moderateServerStatusAction, saveAdminDashboardMetricsAction, saveAdminDashboardSettingsAction, } from "@/app/admin/actions";
import { PageFrame, PageHero, PageMetric, PageSection } from "@/components/page-templates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireAdminAccess } from "@/lib/admin-access";
import { getAdminDashboardSnapshot } from "@/lib/admin-dashboard";
import { tr, type Locale } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
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
    const [pendingServers, dashboardSnapshot, queryState] = await Promise.all([
        getPendingServers(),
        getAdminDashboardSnapshot(),
        searchParams,
    ]);
    const pendingCount = pendingServers.length;
    const query = (queryState.q ?? "").trim();
    const selectedCategory = queryState.category ?? "all";
    const selectedAuth = queryState.auth ?? "all";
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
    const feedback = getFeedbackMessage({
        locale,
        success: queryState.success,
        error: queryState.error,
    });
    return (<PageFrame variant="ops">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
        <PageHero badgeTone="emerald" eyebrow={tr(locale, "Operations", "Operations")} title={tr(locale, "Moderation Dashboard", "Moderation Dashboard")} description={tr(locale, "Review pending MCP submissions, manage analytics, and keep catalog quality high.", "Review pending MCP submissions, manage analytics, and keep catalog quality high.")} actions={<div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="outline" className="border-white/15 bg-white/[0.02] hover:bg-white/[0.06]">
                <Link href="/admin/blog">
                  <FileText className="size-4"/>
                  {tr(locale, "Blog studio", "Blog studio")}
                </Link>
              </Button>

              <form action={logoutAdminAction}>
                <Button type="submit" variant="outline" className="border-white/15 bg-white/[0.02] hover:bg-white/[0.06]">
                  {tr(locale, "Logout", "Logout")}
                </Button>
              </form>
            </div>} metrics={<PageMetric label={tr(locale, "Pending queue", "Pending queue")} value={pendingCount} valueClassName={pendingCount > 0 ? "text-amber-200" : "text-emerald-200"}/>}/>

        {feedback ? (<div className={`rounded-md border px-3 py-2 text-sm ${feedback.tone === "success"
                ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-200"
                : "border-rose-400/35 bg-rose-500/10 text-rose-200"}`}>
            {feedback.text}
          </div>) : null}

        <PageSection>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-violet-50">
              {tr(locale, "System overview", "System overview")}
            </h2>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Card className="border-white/10 bg-indigo-900/70">
                <CardContent className="space-y-1 p-4">
                  <p className="text-xs tracking-wide text-violet-300 uppercase">
                    {tr(locale, "Active servers", "Active servers")}
                  </p>
                  <p className="text-2xl font-semibold text-emerald-200">
                    {dashboardSnapshot.overview.activeServers}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-indigo-900/70">
                <CardContent className="space-y-1 p-4">
                  <p className="text-xs tracking-wide text-violet-300 uppercase">
                    {tr(locale, "Total requests", "Total requests")}
                  </p>
                  <p className="text-2xl font-semibold text-violet-50">
                    {formatCompactNumber(locale, dashboardSnapshot.overview.totalRequests)}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-indigo-900/70">
                <CardContent className="space-y-1 p-4">
                  <p className="text-xs tracking-wide text-violet-300 uppercase">
                    {tr(locale, "Average latency", "Average latency")}
                  </p>
                  <p className="text-2xl font-semibold text-cyan-200">
                    {dashboardSnapshot.overview.averageLatencyMs}ms
                  </p>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-indigo-900/70">
                <CardContent className="space-y-1 p-4">
                  <p className="text-xs tracking-wide text-violet-300 uppercase">Uptime</p>
                  <p className="text-2xl font-semibold text-emerald-200">
                    {dashboardSnapshot.overview.uptimePercent.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </PageSection>

        <PageSection>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-white/10 bg-indigo-900/70">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-violet-50">
                  {tr(locale, "Request distribution by servers", "Request distribution by servers")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardSnapshot.analytics.requestDistribution.map((item) => (<div key={item.serverSlug} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-violet-200">
                      <span className="font-mono">{item.serverName}</span>
                      <span>{formatCompactNumber(locale, item.requestCount)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-indigo-800">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${Math.max(item.sharePercent, 2)}%` }}/>
                    </div>
                  </div>))}
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-indigo-900/70">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-violet-50">
                  {tr(locale, "Latest events", "Latest events")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dashboardSnapshot.analytics.latestEvents.map((event) => (<div key={event.id} className="flex items-center gap-3 rounded-md border border-white/10 bg-indigo-950/60 px-3 py-2">
                    <span className="text-xs font-mono text-violet-300">{event.timeLabel}</span>
                    <span className={`inline-flex size-2 rounded-full ${event.level === "success"
                ? "bg-emerald-400"
                : event.level === "warning"
                    ? "bg-amber-400"
                    : event.level === "error"
                        ? "bg-rose-400"
                        : "bg-violet-300"}`}/>
                    <p className="text-sm text-violet-100">{tr(locale, event.messageEn, event.messageEn)}</p>
                  </div>))}
              </CardContent>
            </Card>
          </div>
        </PageSection>

        <PageSection>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-violet-50">
              {tr(locale, "Dashboard settings", "Dashboard settings")}
            </h2>

            <form action={saveAdminDashboardSettingsAction} className="grid gap-4 lg:grid-cols-2">
              <Card className="border-white/10 bg-indigo-900/70">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-violet-50">
                    {tr(locale, "General settings", "General settings")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <label className="grid gap-1.5 text-sm text-violet-200">
                    <span>{tr(locale, "Status update interval (sec)", "Status update interval (sec)")}</span>
                    <Input name="statusUpdateIntervalSec" type="number" min={1} max={300} defaultValue={dashboardSnapshot.settings.statusUpdateIntervalSec} className="border-white/15 bg-indigo-950/80 text-violet-50"/>
                  </label>

                  <label className="grid gap-1.5 text-sm text-violet-200">
                    <span>{tr(locale, "Request limit per minute", "Request limit per minute")}</span>
                    <Input name="requestLimitPerMinute" type="number" min={1} max={100000} defaultValue={dashboardSnapshot.settings.requestLimitPerMinute} className="border-white/15 bg-indigo-950/80 text-violet-50"/>
                  </label>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-indigo-900/70">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-violet-50">
                    {tr(locale, "Notifications", "Notifications")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  <label className="flex items-center gap-2 rounded-md border border-white/10 bg-indigo-950/60 px-3 py-2 text-sm text-violet-100">
                    <input type="checkbox" name="notifyEmailOnErrors" defaultChecked={dashboardSnapshot.settings.notifyEmailOnErrors} className="size-4 rounded border-white/20 bg-indigo-900 accent-cyan-400"/>
                    <span>{tr(locale, "Email alerts on errors", "Email alerts on errors")}</span>
                  </label>

                  <label className="flex items-center gap-2 rounded-md border border-white/10 bg-indigo-950/60 px-3 py-2 text-sm text-violet-100">
                    <input type="checkbox" name="notifyPushNotifications" defaultChecked={dashboardSnapshot.settings.notifyPushNotifications} className="size-4 rounded border-white/20 bg-indigo-900 accent-cyan-400"/>
                    <span>{tr(locale, "Push notifications", "Push notifications")}</span>
                  </label>

                  <label className="flex items-center gap-2 rounded-md border border-white/10 bg-indigo-950/60 px-3 py-2 text-sm text-violet-100">
                    <input type="checkbox" name="notifyWebhookIntegrations" defaultChecked={dashboardSnapshot.settings.notifyWebhookIntegrations} className="size-4 rounded border-white/20 bg-indigo-900 accent-cyan-400"/>
                    <span>{tr(locale, "Webhook integrations", "Webhook integrations")}</span>
                  </label>
                </CardContent>
              </Card>

              <div className="flex justify-end lg:col-span-2">
                <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-400">
                  {tr(locale, "Save settings", "Save settings")}
                </Button>
              </div>
            </form>
          </div>
        </PageSection>

        <PageSection>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-violet-50">
              {tr(locale, "Metrics editor", "Metrics editor")}
            </h2>

            <form action={saveAdminDashboardMetricsAction} className="grid gap-4 lg:grid-cols-3">
              <label className="grid gap-1.5 text-sm text-violet-200">
                <span>{tr(locale, "Total requests", "Total requests")}</span>
                <Input name="totalRequests" type="number" min={0} defaultValue={dashboardSnapshot.overview.totalRequests} className="border-white/15 bg-indigo-950/80 text-violet-50"/>
              </label>

              <label className="grid gap-1.5 text-sm text-violet-200">
                <span>{tr(locale, "Average latency (ms)", "Average latency (ms)")}</span>
                <Input name="averageLatencyMs" type="number" min={0} defaultValue={dashboardSnapshot.overview.averageLatencyMs} className="border-white/15 bg-indigo-950/80 text-violet-50"/>
              </label>

              <label className="grid gap-1.5 text-sm text-violet-200">
                <span>{tr(locale, "Uptime percent", "Uptime percent")}</span>
                <Input name="uptimePercent" type="number" min={0} max={100} step={0.1} defaultValue={dashboardSnapshot.overview.uptimePercent} className="border-white/15 bg-indigo-950/80 text-violet-50"/>
              </label>

              <div className="flex justify-end lg:col-span-3">
                <Button type="submit" className="bg-cyan-500 text-indigo-950 hover:bg-cyan-400">
                  {tr(locale, "Save metrics", "Save metrics")}
                </Button>
              </div>
            </form>
          </div>
        </PageSection>

        <PageSection>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-white/10 bg-indigo-900/70">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-violet-50">
                  {tr(locale, "Create system event", "Create system event")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form action={createAdminSystemEventAction} className="space-y-3">
                  <label className="grid gap-1.5 text-sm text-violet-200">
                    <span>{tr(locale, "Level", "Level")}</span>
                    <select name="level" defaultValue="info" className="h-10 rounded-md border border-white/15 bg-indigo-950/80 px-3 text-sm text-violet-50">
                      <option value="info">info</option>
                      <option value="success">success</option>
                      <option value="warning">warning</option>
                      <option value="error">error</option>
                    </select>
                  </label>

                  <label className="grid gap-1.5 text-sm text-violet-200">
                    <span>Message</span>
                    <Input name="messageEn" required className="border-white/15 bg-indigo-950/80 text-violet-50"/>
                  </label>

                  <label className="grid gap-1.5 text-sm text-violet-200">
                    <span>{tr(locale, "Occurred at (optional)", "Occurred at (optional)")}</span>
                    <Input name="occurredAt" type="datetime-local" className="border-white/15 bg-indigo-950/80 text-violet-50"/>
                  </label>

                  <Button type="submit" className="w-full bg-emerald-500 text-white hover:bg-emerald-400">
                    {tr(locale, "Add event", "Add event")}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-indigo-900/70">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-violet-50">
                  {tr(locale, "Manage events", "Manage events")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dashboardSnapshot.analytics.latestEvents.map((event) => (<div key={event.id} className="flex items-center justify-between gap-2 rounded-md border border-white/10 bg-indigo-950/70 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs text-violet-300">{event.timeLabel}</p>
                      <p className="truncate text-sm text-violet-100">
                        {tr(locale, event.messageEn, event.messageEn)}
                      </p>
                    </div>
                    <form action={deleteAdminSystemEventAction}>
                      <input type="hidden" name="eventId" value={event.id}/>
                      <Button type="submit" variant="outline" className="border-rose-400/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20">
                        {tr(locale, "Delete", "Delete")}
                      </Button>
                    </form>
                  </div>))}
              </CardContent>
            </Card>
          </div>
        </PageSection>

        <PageSection>
          <Card className="border-white/10 bg-indigo-900/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-violet-50">
                {tr(locale, "Admin audit timeline", "Admin audit timeline")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {dashboardSnapshot.audit.recentActions.length > 0 ? (dashboardSnapshot.audit.recentActions.map((item) => (<div key={item.id} className="flex flex-wrap items-center gap-2 rounded-md border border-white/10 bg-indigo-950/70 px-3 py-2 text-xs text-violet-200">
                    <span className="font-mono text-violet-300">{item.timeLabel}</span>
                    <Badge variant="secondary" className="bg-white/10 text-violet-100">
                      {item.action}
                    </Badge>
                    <span className="text-violet-200">{item.actorLabel}</span>
                    <span className="text-violet-400">→</span>
                    <span className="text-violet-100">{item.targetLabel}</span>
                  </div>))) : (<p className="text-sm text-violet-300">
                  {tr(locale, "No audit records yet.", "No audit records yet.")}
                </p>)}
            </CardContent>
          </Card>
        </PageSection>

        <PageSection>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-violet-50">
                {tr(locale, "Moderation queue", "Moderation queue")}
              </h2>
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="secondary" className="bg-white/10 text-violet-100">
                  {tr(locale, "Total", "Total")}: {pendingCount}
                </Badge>
                <Badge variant="secondary" className="bg-blue-500/15 text-blue-200">
                  {tr(locale, "Showing", "Showing")}: {filteredCount}
                </Badge>
              </div>
            </div>

            <form method="get" className="grid gap-3 rounded-lg border border-white/10 bg-indigo-900/50 p-3 lg:grid-cols-[minmax(0,1fr)_220px_200px_auto]">
              <Input name="q" defaultValue={query} placeholder={tr(locale, "Search by name, slug, description, or URL", "Search by name, slug, description, or URL")} className="border-white/15 bg-indigo-950/80 text-violet-50"/>
              <select name="category" defaultValue={selectedCategory} className="h-10 rounded-md border border-white/15 bg-indigo-950/80 px-3 text-sm text-violet-50">
                <option value="all">{tr(locale, "All categories", "All categories")}</option>
                {categoryOptions.map((category) => (<option key={category} value={category}>
                    {category}
                  </option>))}
              </select>
              <select name="auth" defaultValue={selectedAuth} className="h-10 rounded-md border border-white/15 bg-indigo-950/80 px-3 text-sm text-violet-50">
                <option value="all">{tr(locale, "All auth types", "All auth types")}</option>
                {authOptions.map((authType) => (<option key={authType} value={authType}>
                    {getAuthTypeLabel(locale, authType)}
                  </option>))}
              </select>
              <div className="flex items-center gap-2">
                <Button type="submit" variant="outline" className="border-white/15 bg-white/[0.02] hover:bg-white/[0.06]">
                  {tr(locale, "Apply", "Apply")}
                </Button>
                <Button asChild variant="ghost" className="text-violet-200 hover:bg-white/5">
                  <Link href="/admin">{tr(locale, "Reset", "Reset")}</Link>
                </Button>
              </div>
            </form>

            {pendingServers.length === 0 ? (<Card className="border-white/10 bg-indigo-900/55">
              <CardHeader>
                <CardTitle className="text-violet-50">
                  {tr(locale, "No pending submissions", "No pending submissions")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-violet-200">
                {tr(locale, "New servers submitted through the public form will appear here.", "New servers submitted through the public form will appear here.")}
              </CardContent>
            </Card>) : filteredPendingServers.length === 0 ? (<Card className="border-white/10 bg-indigo-900/55">
              <CardHeader>
                <CardTitle className="text-violet-50">
                  {tr(locale, "No results", "No results")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-violet-200">
                {tr(locale, "Try changing search text or filters.", "Try changing search text or filters.")}
              </CardContent>
            </Card>) : (<div className="grid gap-4 lg:grid-cols-2">
              {filteredPendingServers.map((mcpServer) => (<Card key={mcpServer.id} className="border-white/10 bg-indigo-900/70">
                  <CardHeader className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base text-violet-50">{mcpServer.name}</CardTitle>
                      <p className="shrink-0 text-xs text-violet-300">
                        {tr(locale, "Queued", "Queued")}: {formatQueuedAt(locale, mcpServer.createdAt)}
                      </p>
                    </div>
                    <p className="font-mono text-xs text-violet-300">/{mcpServer.slug}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-blue-500/15 text-blue-300">{mcpServer.category}</Badge>
                      <Badge variant="secondary" className="bg-white/8 text-violet-200">
                        {getAuthTypeLabel(locale, mcpServer.authType)}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-violet-200">{mcpServer.description}</p>
                    <p className="truncate text-xs text-violet-300">{mcpServer.serverUrl}</p>

                    <div className="flex gap-2">
                      <form action={moderateServerStatusAction} className="w-full">
                        <input type="hidden" name="serverId" value={mcpServer.id}/>
                        <input type="hidden" name="status" value="active"/>
                        <Button type="submit" className="w-full bg-emerald-500/80 text-white hover:bg-emerald-400">
                          {tr(locale, "Approve", "Approve")}
                        </Button>
                      </form>

                      <form action={moderateServerStatusAction} className="w-full">
                        <input type="hidden" name="serverId" value={mcpServer.id}/>
                        <input type="hidden" name="status" value="rejected"/>
                        <Button type="submit" variant="outline" className="w-full border-rose-400/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20">
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

