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
import { PageFrame } from "@/components/page-templates";
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
                  Moderation
                </p>
                <h1 className="mt-4 max-w-4xl text-balance text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
                  {tr(locale, "Review the queue, protect catalog quality, and keep security signal visible.", "Review the queue, protect catalog quality, and keep security signal visible.")}
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {tr(locale, "This workspace brings moderation, analytics, events, and policy controls into one operating surface for the DemumuMind catalog.", "This workspace brings moderation, analytics, events, and policy controls into one operating surface for the DemumuMind catalog.")}
                </p>
              </div>

              <div className="border border-border/60 bg-background/72 p-6 backdrop-blur-sm sm:p-7">
                <p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
                  {tr(locale, "Queue state", "Queue state")}
                </p>
                <p className="mt-3 text-5xl font-semibold tracking-[-0.05em] text-foreground">{pendingCount}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {tr(locale, "Pending submissions currently waiting for a moderation decision.", "Pending submissions currently waiting for a moderation decision.")}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild variant="outline" className="h-11 rounded-none border-border/80 bg-transparent px-6">
                    <Link href={`/admin/blog?from=${encodeURIComponent(stickyAdminHref)}`}>
                      <FileText className="size-4" />
                      {tr(locale, "Blog studio", "Blog studio")}
                    </Link>
                  </Button>
                  <form action={logoutAdminAction}>
                    <Button type="submit" variant="outline" className="h-11 rounded-none border-border/80 bg-transparent px-6">
                      {tr(locale, "Logout", "Logout")}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="section-shell py-8 sm:py-10">
          {feedback ? (
            <div
              className={`border px-3 py-2 text-sm ${
                feedback.tone === "success"
                  ? "border-accent bg-accent/20 text-foreground"
                  : "border-border bg-muted/60 text-foreground"
              }`}
            >
              {feedback.text}
            </div>
          ) : null}

          <div className="mt-5">
            <AdminAutoRefresh
              intervalSec={dashboardSnapshot.settings.statusUpdateIntervalSec}
              labels={{
                autoRefresh: tr(locale, "Auto refresh", "Auto refresh"),
                refreshNow: tr(locale, "Refresh now", "Refresh now"),
                lastUpdated: tr(locale, "Last updated", "Last updated"),
              }}
            />
          </div>

          <div className="mt-6">
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
            />
          </div>
        </div>
      </main>
    </PageFrame>
  );
}
