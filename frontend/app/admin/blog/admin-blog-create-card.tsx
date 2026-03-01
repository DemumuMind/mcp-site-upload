import { Sparkles } from "lucide-react";
import { createBlogPostFromDeepResearchAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { tr, type Locale } from "@/lib/i18n";

type AdminBlogCreateCardProps = {
  locale: Locale;
};

export function AdminBlogCreateCard({ locale }: AdminBlogCreateCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">
          {tr(
            locale,
            "Create and publish MDX article with deep research",
            "Create and publish MDX article with deep research",
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form action={createBlogPostFromDeepResearchAction} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="topic">{tr(locale, "Topic *", "Topic *")}</Label>
              <Input
                id="topic"
                name="topic"
                required
                placeholder={tr(locale, "Example: MCP observability rollout", "Example: MCP observability rollout")}
                className="border-border bg-background"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="angle">{tr(locale, "Angle (optional)", "Angle (optional)")}</Label>
              <Textarea
                id="angle"
                name="angle"
                rows={2}
                placeholder={tr(
                  locale,
                  "Example: focus on production controls, rollback safety, and KPIs.",
                  "Example: focus on production controls, rollback safety, and KPIs.",
                )}
                className="border-border bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slug">{tr(locale, "Slug *", "Slug *")}</Label>
              <Input
                id="slug"
                name="slug"
                required
                placeholder="mcp-observability-rollout"
                className="border-border bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tags">{tr(locale, "Tags (comma-separated) *", "Tags (comma-separated) *")}</Label>
              <Input
                id="tags"
                name="tags"
                required
                defaultValue="playbook,operations,quality"
                className="border-border bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="titleEn">{tr(locale, "Title (EN) *", "Title (EN) *")}</Label>
              <Input
                id="titleEn"
                name="titleEn"
                required
                placeholder="MCP Observability Rollout in Production"
                className="border-border bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="recencyDays">{tr(locale, "Recency window (days)", "Recency window (days)")}</Label>
              <Input
                id="recencyDays"
                name="recencyDays"
                type="number"
                min={1}
                max={180}
                defaultValue={30}
                className="border-border bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="maxSources">{tr(locale, "Max curated sources", "Max curated sources")}</Label>
              <Input
                id="maxSources"
                name="maxSources"
                type="number"
                min={3}
                max={12}
                defaultValue={6}
                className="border-border bg-background"
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            <Sparkles className="size-4" />
            {tr(
              locale,
              "Run deep research, generate draft, and publish",
              "Run deep research, generate draft, and publish",
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

