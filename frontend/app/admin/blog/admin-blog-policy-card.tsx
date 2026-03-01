import { Bot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tr, type Locale } from "@/lib/i18n";

type AdminBlogPolicyCardProps = {
  locale: Locale;
};

export function AdminBlogPolicyCard({ locale }: AdminBlogPolicyCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">{tr(locale, "Verification policy", "Verification policy")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-foreground">
        <p className="inline-flex items-center gap-2 font-medium text-foreground">
          <Bot className="size-4" />
          {tr(locale, "Admin-only deep research pipeline", "Admin-only deep research pipeline")}
        </p>
        <ul className="list-disc space-y-2 pl-5 marker:text-accent">
          <li>
            {tr(
              locale,
              "Relevance gate: only high-scoring sources are selected.",
              "Relevance gate: only high-scoring sources are selected.",
            )}
          </li>
          <li>
            {tr(
              locale,
              "Freshness gate: only recent sources inside the configured window.",
              "Freshness gate: only recent sources inside the configured window.",
            )}
          </li>
          <li>
            {tr(
              locale,
              "Diversity + corroboration gates: several domains and repeated signals are required.",
              "Diversity + corroboration gates: several domains and repeated signals are required.",
            )}
          </li>
        </ul>
        <p className="rounded-md border border-border bg-muted/60 px-3 py-2 text-xs text-foreground">
          {tr(
            locale,
            "Set EXA_API_KEY in environment variables. Draft generation is blocked without this key.",
            "Set EXA_API_KEY in environment variables. Draft generation is blocked without this key.",
          )}
        </p>
      </CardContent>
    </Card>
  );
}

