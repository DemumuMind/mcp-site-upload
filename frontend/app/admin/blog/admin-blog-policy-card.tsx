import { Bot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tr, type Locale } from "@/lib/i18n";

type AdminBlogPolicyCardProps = { locale: Locale; };

export function AdminBlogPolicyCard({ locale }: AdminBlogPolicyCardProps) {
  return (
    <Card>
      <CardHeader className="border-b border-border/60 pb-4"><CardTitle className="text-foreground">{tr(locale, "Verification policy", "Verification policy")}</CardTitle></CardHeader>
      <CardContent className="space-y-4 pt-5 text-sm text-foreground">
        <p className="inline-flex items-center gap-2 font-medium text-foreground"><Bot className="size-4" />{tr(locale, "Admin-only deep research pipeline", "Admin-only deep research pipeline")}</p>
        <ul className="editorial-list border border-border/60 text-sm text-muted-foreground">
          <li className="px-4 py-3">{tr(locale, "Relevance gate: only high-scoring sources are selected.", "Relevance gate: only high-scoring sources are selected.")}</li>
          <li className="px-4 py-3">{tr(locale, "Freshness gate: only recent sources inside the configured window.", "Freshness gate: only recent sources inside the configured window.")}</li>
          <li className="px-4 py-3">{tr(locale, "Diversity + corroboration gates: several domains and repeated signals are required.", "Diversity + corroboration gates: several domains and repeated signals are required.")}</li>
        </ul>
        <p className="border border-border bg-muted/30 px-3 py-2 text-xs text-foreground">{tr(locale, "Set EXA_API_KEY in environment variables. Draft generation is blocked without this key.", "Set EXA_API_KEY in environment variables. Draft generation is blocked without this key.")}</p>
      </CardContent>
    </Card>
  );
}
