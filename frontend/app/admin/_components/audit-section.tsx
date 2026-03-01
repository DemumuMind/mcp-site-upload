import { PageSection } from "@/components/page-templates";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tr } from "@/lib/i18n";
import type { AdminPageSectionsProps } from "@/app/admin/_components/types";

type Props = Pick<AdminPageSectionsProps, "locale" | "dashboardSnapshot">;

export function AuditSection({ locale, dashboardSnapshot }: Props) {
  return (
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
  );
}
