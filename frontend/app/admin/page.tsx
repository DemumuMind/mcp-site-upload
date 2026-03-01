import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { logoutAdminAction } from "@/app/admin/actions";
import { AdminPageSections } from "@/app/admin/_components/admin-page-sections";
import {
  buildAdminPageViewModel,
  buildRawSearchParams,
  buildSecurityQuery,
  type AdminPageQueryState,
} from "@/app/admin/page-view-model";
import { AdminAutoRefresh } from "@/components/admin-auto-refresh";
import { PageFrame, PageHero, PageMetric } from "@/components/page-templates";
import { Button } from "@/components/ui/button";
import { requireAdminAccess } from "@/lib/admin-access";
import { getAdminDashboardSnapshot } from "@/lib/admin-dashboard";
import { tr, type Locale } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { writeAdminRequestLog } from "@/lib/admin-request-log";
import { getPendingServers } from "@/lib/servers";

export const metadata: Metadata = {
  title: "Moderation",
  description: "Admin moderation dashboard for pending server submissions.",
};

type AdminPageProps = {
  searchParams: Promise<AdminPageQueryState>;
};

function getFeedbackMessage({
  locale,
  success,
  error,
}: {
  locale: Locale;
  success?: string;
  error?: string;
}) {
  if (success === "active") {
    return {
      tone: "success" as const,
      text: tr(locale, "Server approved and moved to active.", "Server approved and moved to active."),
    };
  }
  if (success === "rejected") {
    return {
      tone: "success" as const,
      text: tr(locale, "Server rejected successfully.", "Server rejected successfully."),
    };
  }
  if (success === "settings") {
    return {
      tone: "success" as const,
      text: tr(locale, "Dashboard settings saved.", "Dashboard settings saved."),
    };
  }
  if (success === "metrics") {
    return {
      tone: "success" as const,
      text: tr(locale, "Dashboard metrics saved.", "Dashboard metrics saved."),
    };
  }
  if (success === "event_created") {
    return {
      tone: "success" as const,
      text: tr(locale, "System event created.", "System event created."),
    };
  }
  if (success === "event_deleted") {
    return {
      tone: "success" as const,
      text: tr(locale, "System event deleted.", "System event deleted."),
    };
  }
  if (error) {
    return {
      tone: "error" as const,
      text:
        error === "supabase"
          ? tr(locale, "Supabase admin mode is not configured.", "Supabase admin mode is not configured.")
          : error,
    };
  }
  return null;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await requireAdminAccess("/admin");
  const locale = await getLocale();
  const queryState = await searchParams;

  const rawSearchParams = buildRawSearchParams(queryState);
  await writeAdminRequestLog({
    path: "/admin",
    query: rawSearchParams.toString(),
    source: "admin_page",
  });

  const security = buildSecurityQuery(queryState);
  const [pendingServers, dashboardSnapshot] = await Promise.all([
    getPendingServers(),
    getAdminDashboardSnapshot({
      eventType: security.eventType,
      emailQuery: security.emailQuery,
      fromDate: security.fromDate,
      toDate: security.toDate,
      fromTs: security.fromTs || undefined,
      toTs: security.toTs || undefined,
      page: security.page,
      pageSize: security.pageSize,
      sortBy: security.sortBy,
      sortOrder: security.sortOrder,
    }),
  ]);

  const {
    pendingCount,
    filteredCount,
    query,
    selectedCategory,
    selectedAuth,
    selectedSecurityEvent,
    categoryOptions,
    authOptions,
    filteredPendingServers,
    securityEventOptions,
    filteredSecurityEvents,
    stickyAdminHref,
  } = buildAdminPageViewModel({
    pendingServers,
    dashboardSnapshot,
    security,
    queryState,
  });

  const feedback = getFeedbackMessage({
    locale,
    success: queryState.success,
    error: queryState.error,
  });

  return (
    <PageFrame variant="ops">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
        <PageHero
          surface="mesh"
          badgeTone="emerald"
          eyebrow={tr(locale, "Operations", "Operations")}
          title={tr(locale, "Moderation Dashboard", "Moderation Dashboard")}
          description={tr(
            locale,
            "Review pending MCP submissions, manage analytics, and keep catalog quality high.",
            "Review pending MCP submissions, manage analytics, and keep catalog quality high.",
          )}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="outline" className="border-border bg-card hover:bg-muted/60">
                <Link href={`/admin/blog?from=${encodeURIComponent(stickyAdminHref)}`}>
                  <FileText className="size-4" />
                  {tr(locale, "Blog studio", "Blog studio")}
                </Link>
              </Button>
              <form action={logoutAdminAction}>
                <Button type="submit" variant="outline" className="border-border bg-card hover:bg-muted/60">
                  {tr(locale, "Logout", "Logout")}
                </Button>
              </form>
            </div>
          }
          metrics={
            <PageMetric
              surface="mesh"
              label={tr(locale, "Pending queue", "Pending queue")}
              value={pendingCount}
              valueClassName="text-foreground"
            />
          }
        />

        {feedback ? (
          <div
            className={`rounded-md border px-3 py-2 text-sm ${
              feedback.tone === "success"
                ? "border-accent bg-accent/20 text-foreground"
                : "border-border bg-muted/60 text-foreground"
            }`}
          >
            {feedback.text}
          </div>
        ) : null}

        <AdminAutoRefresh
          intervalSec={dashboardSnapshot.settings.statusUpdateIntervalSec}
          labels={{
            autoRefresh: tr(locale, "Auto refresh", "Auto refresh"),
            refreshNow: tr(locale, "Refresh now", "Refresh now"),
            lastUpdated: tr(locale, "Last updated", "Last updated"),
          }}
        />

        <AdminPageSections
          locale={locale}
          dashboardSnapshot={dashboardSnapshot}
          pendingCount={pendingCount}
          filteredCount={filteredCount}
          query={query}
          selectedCategory={selectedCategory}
          selectedAuth={selectedAuth}
          selectedSecurityEvent={selectedSecurityEvent}
          categoryOptions={categoryOptions}
          authOptions={authOptions}
          filteredPendingServers={filteredPendingServers}
          securityEventOptions={securityEventOptions}
          filteredSecurityEvents={filteredSecurityEvents}
          stickyAdminHref={stickyAdminHref}
          securityFilterEmail={security.emailQuery}
          securityFilterFrom={security.fromDate}
          securityFilterTo={security.toDate}
          securityFilterFromTs={security.fromTs}
          securityFilterToTs={security.toTs}
          securityPageSize={security.pageSize}
          securitySortBy={security.sortBy}
          securitySortOrder={security.sortOrder}
          queryState={queryState}
        />
      </div>
    </PageFrame>
  );
}
