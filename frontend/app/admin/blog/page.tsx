import type { Metadata } from "next";
import { AdminBlogAlerts } from "./admin-blog-alerts";
import { AdminBlogCreateCard } from "./admin-blog-create-card";
import { AdminBlogHeroActions } from "./admin-blog-hero-actions";
import { AdminBlogPolicyCard } from "./admin-blog-policy-card";
import { AdminBlogRunsCard } from "./admin-blog-runs-card";
import { formatError, toStatusFilter, type AdminBlogPageSearchParams } from "./blog-page-utils";
import { PageFrame } from "@/components/page-templates";
import { requireAdminAccess } from "@/lib/admin-access";
import { getRecentAdminBlogRuns } from "@/lib/admin-blog-runs";
import { normalizeInternalPath } from "@/lib/auth-redirects";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export const metadata: Metadata = {
  title: "Blog automation",
  description: "Admin deep-research workflow for generating blog drafts.",
};

type AdminBlogPageProps = {
  searchParams: Promise<AdminBlogPageSearchParams>;
};

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
      <main className="bg-background text-foreground">
        <section className="relative isolate overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.16),transparent_24%),radial-gradient(circle_at_84%_16%,hsl(var(--accent)/0.14),transparent_18%),linear-gradient(180deg,hsl(var(--surface-1)),hsl(var(--background))_68%)]" />
          <div className="section-shell py-12 sm:py-16 lg:py-20">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
                  {tr(locale, "DemumuMind Operations", "DemumuMind Operations")}
                </p>
                <p className="mt-5 font-serif text-[clamp(3rem,9vw,6.2rem)] leading-none tracking-[-0.06em] text-foreground">
                  Blog Studio
                </p>
                <h1 className="mt-4 max-w-4xl text-balance text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
                  {tr(locale, "Run deep research, generate a draft, and publish with evidence intact.", "Run deep research, generate a draft, and publish with evidence intact.")}
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {tr(locale, "This studio is the editorial control room for DemumuMind. Each run should leave a traceable research packet, source trail, and publishable MDX output.", "This studio is the editorial control room for DemumuMind. Each run should leave a traceable research packet, source trail, and publishable MDX output.")}
                </p>
              </div>

              <div className="border border-border/60 bg-background/72 p-6 backdrop-blur-sm sm:p-7">
                <p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
                  {tr(locale, "Editorial controls", "Editorial controls")}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {tr(locale, "Use the actions here to return to moderation or end the current admin session before handing the workspace off to another operator.", "Use the actions here to return to moderation or end the current admin session before handing the workspace off to another operator.")}
                </p>
                <div className="mt-6">
                  <AdminBlogHeroActions backHref={backHref} locale={locale} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="section-shell py-8 sm:py-10">
          <AdminBlogAlerts successMessage={successMessage} errorMessage={errorMessage} />

          <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
            <AdminBlogCreateCard locale={locale} />
            <AdminBlogPolicyCard locale={locale} />
          </div>

          <div className="mt-6">
            <AdminBlogRunsCard locale={locale} selectedStatus={selectedStatus} recentRuns={recentRuns} />
          </div>
        </div>
      </main>
    </PageFrame>
  );
}
