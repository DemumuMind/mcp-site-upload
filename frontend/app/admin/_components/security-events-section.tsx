import Link from "next/link";
import { AdminSecurityPresets } from "@/components/admin-security-presets";
import { PageSection } from "@/components/page-templates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getSecurityEventBadgeClass, getSecurityEventLabel } from "@/lib/auth/security-event-ui";
import { tr } from "@/lib/i18n";
import type { AdminPageSectionsProps } from "@/app/admin/_components/types";

type Props = Pick<
  AdminPageSectionsProps,
  | "locale"
  | "dashboardSnapshot"
  | "selectedSecurityEvent"
  | "securityEventOptions"
  | "securityFilterEmail"
  | "securityFilterFrom"
  | "securityFilterTo"
  | "securityFilterFromTs"
  | "securityFilterToTs"
  | "securityPageSize"
  | "securitySortBy"
  | "securitySortOrder"
  | "filteredSecurityEvents"
>;

export function SecurityEventsSection({
  locale,
  dashboardSnapshot,
  selectedSecurityEvent,
  securityEventOptions,
  securityFilterEmail,
  securityFilterFrom,
  securityFilterTo,
  securityFilterFromTs,
  securityFilterToTs,
  securityPageSize,
  securitySortBy,
  securitySortOrder,
  filteredSecurityEvents,
}: Props) {
  return (
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
  );
}
