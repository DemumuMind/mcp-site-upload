import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Bot, Sparkles } from "lucide-react";
import { createBlogPostFromDeepResearchAction, logoutAdminAction } from "@/app/admin/actions";
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
    const successMessage = success === "created"
        ? tr(locale, `Post created: ${slug}. Deep research packet: ${research}. Sources used: ${sources}.`, `Post created: ${slug}. Deep research packet: ${research}. Sources used: ${sources}.`)
        : null;
    const errorMessage = error ? tr(locale, formatError(error) ?? error, formatError(error) ?? error) : null;
    return (<div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-violet-50">
            {tr(locale, "Blog automation studio", "Blog automation studio")}
          </h1>
          <p className="text-sm text-violet-200">
            {tr(locale, "Every article is generated only after deep research and multi-step verification.", "Every article is generated only after deep research and multi-step verification.")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" className="border-white/15 bg-white/[0.02] hover:bg-white/[0.06]">
            <Link href={backHref}>
              <ArrowLeft className="size-4"/>
              {tr(locale, "Back to moderation", "Back to moderation")}
            </Link>
          </Button>

          <form action={logoutAdminAction}>
            <Button type="submit" variant="outline" className="border-white/15 bg-white/[0.02] hover:bg-white/[0.06]">
              {tr(locale, "Logout", "Logout")}
            </Button>
          </form>
        </div>
      </div>

      {successMessage ? (<div className="mb-4 rounded-md border border-emerald-400/35 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          {successMessage}
        </div>) : null}

      {errorMessage ? (<div className="mb-4 rounded-md border border-rose-400/35 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {errorMessage}
        </div>) : null}

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="border-white/10 bg-indigo-900/70">
          <CardHeader>
            <CardTitle className="text-violet-50">
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
                  <Input id="topic" name="topic" required placeholder={tr(locale, "Example: MCP observability rollout", "Example: MCP observability rollout")} className="border-white/10 bg-indigo-950/80"/>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="angle">{tr(locale, "Angle (optional)", "Angle (optional)")}</Label>
                  <Textarea id="angle" name="angle" rows={2} placeholder={tr(locale, "Example: focus on production controls, rollback safety, and KPIs.", "Example: focus on production controls, rollback safety, and KPIs.")} className="border-white/10 bg-indigo-950/80"/>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="slug">{tr(locale, "Slug *", "Slug *")}</Label>
                  <Input id="slug" name="slug" required placeholder="mcp-observability-rollout" className="border-white/10 bg-indigo-950/80"/>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tags">{tr(locale, "Tags (comma-separated) *", "Tags (comma-separated) *")}</Label>
                  <Input id="tags" name="tags" required defaultValue="playbook,operations,quality" className="border-white/10 bg-indigo-950/80"/>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="titleEn">{tr(locale, "Title (EN) *", "Title (EN) *")}</Label>
                  <Input id="titleEn" name="titleEn" required placeholder="MCP Observability Rollout in Production" className="border-white/10 bg-indigo-950/80"/>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="recencyDays">{tr(locale, "Recency window (days)", "Recency window (days)")}</Label>
                  <Input id="recencyDays" name="recencyDays" type="number" min={1} max={180} defaultValue={30} className="border-white/10 bg-indigo-950/80"/>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="maxSources">{tr(locale, "Max curated sources", "Max curated sources")}</Label>
                  <Input id="maxSources" name="maxSources" type="number" min={3} max={12} defaultValue={6} className="border-white/10 bg-indigo-950/80"/>
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-500 text-white hover:bg-blue-400">
                <Sparkles className="size-4"/>
                {tr(
                  locale,
                  "Run deep research, generate draft, and publish",
                  "Run deep research, generate draft, and publish",
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-indigo-900/70">
          <CardHeader>
            <CardTitle className="text-violet-50">{tr(locale, "Verification policy", "Verification policy")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-violet-200">
            <p className="inline-flex items-center gap-2 font-medium text-violet-50">
              <Bot className="size-4"/>
              {tr(locale, "Admin-only deep research pipeline", "Admin-only deep research pipeline")}
            </p>
            <ul className="list-disc space-y-2 pl-5 marker:text-cyan-300">
              <li>
                {tr(locale, "Relevance gate: only high-scoring sources are selected.", "Relevance gate: only high-scoring sources are selected.")}
              </li>
              <li>
                {tr(locale, "Freshness gate: only recent sources inside the configured window.", "Freshness gate: only recent sources inside the configured window.")}
              </li>
              <li>
                {tr(locale, "Diversity + corroboration gates: several domains and repeated signals are required.", "Diversity + corroboration gates: several domains and repeated signals are required.")}
              </li>
            </ul>
            <p className="rounded-md border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              {tr(
                locale,
                "Set EXA_API_KEY in environment variables. Draft generation is blocked without this key.",
                "Set EXA_API_KEY in environment variables. Draft generation is blocked without this key.",
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4 border-white/10 bg-indigo-900/70">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-violet-50">
            {tr(locale, "Recent automation runs", "Recent automation runs")}
          </CardTitle>
          <div className="flex flex-wrap gap-2 text-xs">
            <Button asChild variant={selectedStatus ? "outline" : "default"} className={!selectedStatus ? "bg-cyan-500 text-indigo-950 hover:bg-cyan-400" : ""}>
              <Link href="/admin/blog">{tr(locale, "All", "All")}</Link>
            </Button>
            <Button asChild variant={selectedStatus === "success" ? "default" : "outline"} className={selectedStatus === "success" ? "bg-emerald-500 text-white hover:bg-emerald-400" : ""}>
              <Link href="/admin/blog?status=success">success</Link>
            </Button>
            <Button asChild variant={selectedStatus === "failed" ? "default" : "outline"} className={selectedStatus === "failed" ? "bg-rose-500 text-white hover:bg-rose-400" : ""}>
              <Link href="/admin/blog?status=failed">failed</Link>
            </Button>
            <Button asChild variant={selectedStatus === "started" ? "default" : "outline"} className={selectedStatus === "started" ? "bg-amber-500 text-white hover:bg-amber-400" : ""}>
              <Link href="/admin/blog?status=started">started</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentRuns.length > 0 ? (recentRuns.map((run) => (<div key={run.id} className="grid gap-1 rounded-md border border-white/10 bg-indigo-950/60 px-3 py-2 text-xs text-violet-200 md:grid-cols-[140px_100px_1fr_1fr]">
                <div className="font-mono text-violet-300">{new Date(run.createdAt).toLocaleString("en-US")}</div>
                <div>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${run.status === "success"
                ? "bg-emerald-500/20 text-emerald-300"
                : run.status === "failed"
                    ? "bg-rose-500/20 text-rose-300"
                    : "bg-amber-500/20 text-amber-300"}`}>
                    {run.status}
                  </span>
                </div>
                <div className="min-w-0 truncate">
                  <p className="truncate">{run.topic}</p>
                  <p className="truncate text-violet-300">
                    {run.slug ? `slug: ${run.slug}` : "slug: -"} • {run.actorSource}
                  </p>
                </div>
                <div className="min-w-0 truncate text-violet-300">
                  {run.errorMessage
                ? run.errorMessage
                : `packet: ${run.researchPacketId ?? "-"} • sources: ${run.sourceCount ?? "-"}`}
                </div>
              </div>))) : (<p className="text-sm text-violet-300">
              {tr(locale, "No automation runs yet.", "No automation runs yet.")}
            </p>)}
        </CardContent>
      </Card>
    </div>);
}
