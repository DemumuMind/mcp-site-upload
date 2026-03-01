import { ShieldCheck } from "lucide-react";

import { formatDate, type AccountAuthEventRow } from "@/app/account/account-view-model";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSecurityEventBadgeClass, getSecurityEventLabel } from "@/lib/auth/security-event-ui";
import { tr, type Locale } from "@/lib/i18n";

type AccountSecurityActivityCardProps = {
  locale: Locale;
  authEvents: AccountAuthEventRow[];
};

export function AccountSecurityActivityCard({
  locale,
  authEvents,
}: AccountSecurityActivityCardProps) {
  return (
    <Card className="border-border bg-card/90">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2 text-xl text-foreground">
          <ShieldCheck className="size-5 text-primary" />
          {tr(locale, "Security activity", "Security activity")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {tr(
            locale,
            "Recent login/security events for your account.",
            "Recent login/security events for your account.",
          )}
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {authEvents.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            {tr(locale, "No security events yet.", "No security events yet.")}
          </div>
        ) : (
          authEvents.map((event) => (
            <div key={event.id} className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getSecurityEventBadgeClass(event.event_type)}>
                  {getSecurityEventLabel(locale, event.event_type)}
                </Badge>
                <span className="text-xs text-muted-foreground">{formatDate(event.created_at, locale)}</span>
              </div>
              {event.ip_address ? <p className="mt-1 text-xs text-muted-foreground">IP: {event.ip_address}</p> : null}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}


