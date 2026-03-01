import type { Metadata } from "next";
import { AdminBlogAlerts } from "./admin-blog-alerts";
import { AdminBlogCreateCard } from "./admin-blog-create-card";
import { AdminBlogHeroActions } from "./admin-blog-hero-actions";
import { AdminBlogPolicyCard } from "./admin-blog-policy-card";
import { AdminBlogRunsCard } from "./admin-blog-runs-card";
import { formatError, toStatusFilter, type AdminBlogPageSearchParams } from "./blog-page-utils";
import { PageFrame, PageHero, PageShell } from "@/components/page-templates";
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
          actions={<AdminBlogHeroActions backHref={backHref} locale={locale} />}
        />

        <AdminBlogAlerts successMessage={successMessage} errorMessage={errorMessage} />

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <AdminBlogCreateCard locale={locale} />
          <AdminBlogPolicyCard locale={locale} />
        </div>

        <AdminBlogRunsCard locale={locale} selectedStatus={selectedStatus} recentRuns={recentRuns} />
      </PageShell>
    </PageFrame>
  );
}