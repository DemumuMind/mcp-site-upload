import { createAdminSystemEventAction, deleteAdminSystemEventAction, saveAdminDashboardMetricsAction, saveAdminDashboardSettingsAction, } from "@/app/admin/actions";
import { PageSection } from "@/components/page-templates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { tr } from "@/lib/i18n";
import type { AdminPageSectionsProps } from "@/app/admin/_components/types";

type Props = Pick<AdminPageSectionsProps, "locale" | "dashboardSnapshot" | "stickyAdminHref">;

export function SettingsEventsSections({ locale, dashboardSnapshot, stickyAdminHref }: Props) {
  return (
    <>
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
