import { Badge } from "@/components/ui/badge";
import { tr, type Locale } from "@/lib/i18n";
import type { SubmissionInput } from "@/lib/submission-schema";

type SubmitStepReviewProps = {
  locale: Locale;
  values: SubmissionInput;
  isAuthenticated: boolean;
};

export function SubmitStepReview({ locale, values, isAuthenticated }: SubmitStepReviewProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-blacksmith bg-card p-4">
        <p className="text-sm text-muted-foreground">
          {isAuthenticated
            ? tr(
                locale,
                "Everything looks ready. Submit your server for moderation and you will see it in your account history.",
                "Everything looks ready. Submit your server for moderation and you will see it in your account history.",
              )
            : tr(
                locale,
                "You can review everything now. Sign in is required only when you click final submit.",
                "You can review everything now. Sign in is required only when you click final submit.",
              )}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <SummaryItem label={tr(locale, "Server name", "Server name")} value={values.name || "-"} />
        <SummaryItem label={tr(locale, "Category", "Category")} value={values.category || "-"} />
        <SummaryItem label={tr(locale, "Auth type", "Auth type")} value={values.authType || "-"} />
        <SummaryItem label={tr(locale, "Maintainer", "Maintainer")} value={values.maintainerName || "-"} />
        <SummaryItem label={tr(locale, "Maintainer email", "Maintainer email")} value={values.maintainerEmail || "-"} />
        <SummaryItem label={tr(locale, "Repository", "Repository")} value={values.repoUrl || "-"} />
        <SummaryItem
          className="sm:col-span-2"
          label={tr(locale, "Server URL", "Server URL")}
          value={values.serverUrl || "-"}
        />
      </div>

      <div className="rounded-2xl border border-blacksmith bg-card p-4">
        <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
          {tr(locale, "Description", "Description")}
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-foreground">{values.description || "-"}</p>
      </div>
    </div>
  );
}

function SummaryItem({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={["rounded-xl border border-blacksmith bg-card p-3", className].filter(Boolean).join(" ")}>
      <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <Badge className="border-primary/30 bg-primary/10 text-primary">{value}</Badge>
      </div>
    </div>
  );
}

