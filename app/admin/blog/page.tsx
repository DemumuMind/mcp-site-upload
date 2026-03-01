import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Bot, Sparkles } from "lucide-react";
import { createBlogPostFromDeepResearchAction, logoutAdminAction } from "@/app/admin/actions";
import { PageFrame, PageHero, PageShell } from "@/components/page-templates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireAdminAccess } from "@/lib/admin-access";
import { getRecentAdminBlogRuns, type AdminBlogRunStatus } from "@/lib/admin-blog-runs";
import { normalizeInternalPath } from "@/lib/auth-redirects";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export const metadata: Metadata = {
  title: "Blog automation",
  description: "Admin deep-research workflow for generating blog drafts.",
};

type AdminBlogPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
    slug?: string;
    research?: string;
    sources?: string;
    status?: string;
    from?: string;
  }>;
};

function formatError(error?: string) {
  if (!error) {
    return null;
  }
  if (error === "missing_required_fields") {
    return "Please fill all required fields before running automation.";
  }
  return error;
}

function toStatusFilter(value: string | undefined): AdminBlogRunStatus | undefined {
  if (value === "started" || value === "success" || value === "failed") {
    return value;
  }
  return undefined;
}

export default async function AdminBlogPage({ searchParams }: AdminBlogPageProps) {
  await requireAdminAccess("/admin/blog");
  const locale = await getLocale();
  const { success, error, slug, research, sources, status, from } = await searchParams;
  const backHref = normalizeInternalPath(from || "/admin");
  const selectedStatus = toStatusFilter(status);
  const recentRuns = await getRecentAdminBlogRuns({
    limit: 20,
    status: selectedStatus,
  });

  const successMessage =
    success === "created"
      ? tr(
          locale,
          `Post created: ${slug}. Deep research packet: ${research}. Sources used: ${sources}.`,
          `Post created: ${slug}. Deep research packet: ${research}. Sources used: ${sources}.`,
        )
      : null;
  const errorMessage = error ? tr(locale, formatError(error) ?? error, formatError(error) ?? error) : null;

  return (
    <PageFrame variant="ops">
      <PageShell className="max-w-6xl px-4 sm:px-6">
        <PageHero
          surface="plain"
          animated={false}
          badgeTone="emerald"
          eyebrow={tr(locale, "Operations", "Operations")}
          title={tr(locale, "Blog automation studio", "Blog automation studio")}
          description={tr(
            locale,
            "Every article is generated only after deep research and multi-step verification.",
            "Every article is generated only after deep research and multi-step verification.",
          )}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="outline" className="border-border bg-card hover:bg-muted/60">
                <Link href={backHref}>
                  <ArrowLeft className="size-4" />
                  {tr(locale, "Back to moderation", "Back to moderation")}
                </Link>
              </Button>

              <form action={logoutAdminAction}>
                <Button type="submit" variant="outline" className="border-border bg-card hover:bg-muted/60">
                  {tr(locale, "Logout", "Logout")}
                </Button>
              </form>
            </div>
          }
        />

        {successMessage ? (
          <div className="mb-4 rounded-md border border-accent bg-accent/20 px-3 py-2 text-sm text-foreground">
            {successMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mb-4 rounded-md border border-border bg-muted/60 px-3 py-2 text-sm text-foreground">
            {errorMessage}
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
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
                    <Input id="topic" name="topic" required placeholder={tr(locale, "Example: MCP observability rollout", "Example: MCP observability rollout")} className="border-border bg-background" />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="angle">{tr(locale, "Angle (optional)", "Angle (optional)")}</Label>
                    <Textarea id="angle" name="angle" rows={2} placeholder={tr(locale, "Example: focus on production controls, rollback safety, and KPIs.", "Example: focus on production controls, rollback safety, and KPIs.")} className="border-border bg-background" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="slug">{tr(locale, "Slug *", "Slug *")}</Label>
                    <Input id="slug" name="slug" required placeholder="mcp-observability-rollout" className="border-border bg-background" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="tags">{tr(locale, "Tags (comma-separated) *", "Tags (comma-separated) *")}</Label>
                    <Input id="tags" name="tags" required defaultValue="playbook,operations,quality" className="border-border bg-background" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="titleEn">{tr(locale, "Title (EN) *", "Title (EN) *")}</Label>
                    <Input id="titleEn" name="titleEn" required placeholder="MCP Observability Rollout in Production" className="border-border bg-background" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="recencyDays">{tr(locale, "Recency window (days)", "Recency window (days)")}</Label>
                    <Input id="recencyDays" name="recencyDays" type="number" min={1} max={180} defaultValue={30} className="border-border bg-background" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="maxSources">{tr(locale, "Max curated sources", "Max curated sources")}</Label>
                    <Input id="maxSources" name="maxSources" type="number" min={3} max={12} defaultValue={6} className="border-border bg-background" />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Sparkles className="size-4" />
                  {tr(locale, "Run deep research, generate draft, and publish", "Run deep research, generate draft, and publish")}
                </Button>
              </form>
            </CardContent>
          </Card>

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
                <li>{tr(locale, "Relevance gate: only high-scoring sources are selected.", "Relevance gate: only high-scoring sources are selected.")}</li>
                <li>{tr(locale, "Freshness gate: only recent sources inside the configured window.", "Freshness gate: only recent sources inside the configured window.")}</li>
                <li>{tr(locale, "Diversity + corroboration gates: several domains and repeated signals are required.", "Diversity + corroboration gates: several domains and repeated signals are required.")}</li>
              </ul>
              <p className="rounded-md border border-border bg-muted/60 px-3 py-2 text-xs text-foreground">
                {tr(locale, "Set EXA_API_KEY in environment variables. Draft generation is blocked without this key.", "Set EXA_API_KEY in environment variables. Draft generation is blocked without this key.")}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4 border-border bg-card">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-foreground">{tr(locale, "Recent automation runs", "Recent automation runs")}</CardTitle>
            <div className="flex flex-wrap gap-2 text-xs">
              <Button asChild variant={selectedStatus ? "outline" : "default"} className={!selectedStatus ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}>
                <Link href="/admin/blog">{tr(locale, "All", "All")}</Link>
              </Button>
              <Button asChild variant={selectedStatus === "success" ? "default" : "outline"} className={selectedStatus === "success" ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}>
                <Link href="/admin/blog?status=success">success</Link>
              </Button>
              <Button asChild variant={selectedStatus === "failed" ? "default" : "outline"} className={selectedStatus === "failed" ? "bg-muted text-primary-foreground hover:bg-muted/90" : ""}>
                <Link href="/admin/blog?status=failed">failed</Link>
              </Button>
              <Button asChild variant={selectedStatus === "started" ? "default" : "outline"} className={selectedStatus === "started" ? "bg-muted text-primary-foreground hover:bg-muted/90" : ""}>
                <Link href="/admin/blog?status=started">started</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentRuns.length > 0 ? (
              recentRuns.map((run) => (
                <div key={run.id} className="grid gap-1 rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground md:grid-cols-[140px_100px_1fr_1fr]">
                  <div className="font-mono text-muted-foreground">{new Date(run.createdAt).toLocaleString("en-US")}</div>
                  <div>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        run.status === "success"
                          ? "bg-accent/30 text-accent-foreground"
                          : run.status === "failed"
                            ? "bg-muted/70 text-muted-foreground"
                            : "bg-muted/70 text-muted-foreground"
                      }`}
                    >
                      {run.status}
                    </span>
                  </div>
                  <div className="min-w-0 truncate">
                    <p className="truncate">{run.topic}</p>
                    <p className="truncate text-muted-foreground">{run.slug ? `slug: ${run.slug}` : "slug: -"} - {run.actorSource}</p>
                  </div>
                  <div className="min-w-0 truncate text-muted-foreground">
                    {run.errorMessage ? run.errorMessage : `packet: ${run.researchPacketId ?? "-"} - sources: ${run.sourceCount ?? "-"}`}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">{tr(locale, "No automation runs yet.", "No automation runs yet.")}</p>
            )}
          </CardContent>
        </Card>
      </PageShell>
    </PageFrame>
  );
}
