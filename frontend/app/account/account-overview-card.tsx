import { MailCheck, UserCircle2 } from "lucide-react";
import { formatDate, getShortUserId } from "@/app/account/account-view-model";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tr, type Locale } from "@/lib/i18n";

type AccountOverviewCardProps = { locale: Locale; isEmailVerified: boolean; userId: string; createdAt: string | null; lastSignInAt: string | null; };

export function AccountOverviewCard({ locale, isEmailVerified, userId, createdAt, lastSignInAt }: AccountOverviewCardProps) {
  return (
    <Card>
      <CardHeader className="space-y-2 border-b border-border/60 pb-4">
        <CardTitle className="flex items-center gap-2 text-xl text-foreground"><UserCircle2 className="size-5 text-primary" />{tr(locale, "Account overview", "Account overview")}</CardTitle>
        <p className="text-sm leading-7 text-muted-foreground">{tr(locale, "Core account information and verification status.", "Core account information and verification status.")}</p>
      </CardHeader>
      <CardContent className="space-y-4 text-sm pt-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={isEmailVerified ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-200" : "border-amber-400/35 bg-amber-500/10 text-amber-200"}><MailCheck className="size-3.5" />{isEmailVerified ? tr(locale, "Email verified", "Email verified") : tr(locale, "Email not verified", "Email not verified")}</Badge>
        </div>
        <dl className="editorial-list border border-border/60">
          <div className="px-4 py-3">
            <dt className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">{tr(locale, "User ID", "User ID")}</dt>
            <dd className="mt-1 font-mono text-xs text-foreground" title={userId}>{getShortUserId(userId)}</dd>
          </div>
          <div className="px-4 py-3">
            <dt className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">{tr(locale, "Created", "Created")}</dt>
            <dd className="mt-1 text-foreground">{formatDate(createdAt, locale)}</dd>
          </div>
          <div className="px-4 py-3">
            <dt className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">{tr(locale, "Last sign in", "Last sign in")}</dt>
            <dd className="mt-1 text-foreground">{formatDate(lastSignInAt, locale)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
