import { Clock3, FolderGit2, ShieldAlert, ShieldCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { tr, type Locale } from "@/lib/i18n";

type AccountStatsSectionProps = {
  locale: Locale;
  totalSubmissions: number;
  activeCount: number;
  pendingCount: number;
  rejectedCount: number;
};

export function AccountStatsSection({
  locale,
  totalSubmissions,
  activeCount,
  pendingCount,
  rejectedCount,
}: AccountStatsSectionProps) {
  return (
    <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="border-border bg-card/90">
        <CardContent className="flex items-center justify-between gap-3 p-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {tr(locale, "Total submissions", "Total submissions")}
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{totalSubmissions}</p>
          </div>
          <FolderGit2 className="size-5 text-primary" />
        </CardContent>
      </Card>

      <Card className="border-border bg-card/90">
        <CardContent className="flex items-center justify-between gap-3 p-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {tr(locale, "Active", "Active")}
            </p>
            <p className="mt-1 text-2xl font-semibold text-emerald-200">{activeCount}</p>
          </div>
          <ShieldCheck className="size-5 text-emerald-300" />
        </CardContent>
      </Card>

      <Card className="border-border bg-card/90">
        <CardContent className="flex items-center justify-between gap-3 p-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {tr(locale, "Pending", "Pending")}
            </p>
            <p className="mt-1 text-2xl font-semibold text-amber-200">{pendingCount}</p>
          </div>
          <Clock3 className="size-5 text-amber-300" />
        </CardContent>
      </Card>

      <Card className="border-border bg-card/90">
        <CardContent className="flex items-center justify-between gap-3 p-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {tr(locale, "Rejected", "Rejected")}
            </p>
            <p className="mt-1 text-2xl font-semibold text-rose-200">{rejectedCount}</p>
          </div>
          <ShieldAlert className="size-5 text-rose-300" />
        </CardContent>
      </Card>
    </section>
  );
}


