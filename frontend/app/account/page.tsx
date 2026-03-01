import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  buildAccountViewModel,
  type AccountAuthEventRow,
  type AccountSubmissionRow,
} from "@/app/account/account-view-model";
import { AccountHeroSection } from "@/app/account/account-hero-section";
import { AccountOverviewCard } from "@/app/account/account-overview-card";
import { AccountSecurityActivityCard } from "@/app/account/account-security-activity-card";
import { AccountStatsSection } from "@/app/account/account-stats-section";
import { AccountSubmissionsCard } from "@/app/account/account-submissions-card";
import { AccountProfileForms } from "@/components/account-profile-forms";
import { PageFrame, PageShell } from "@/components/page-templates";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { createSupabaseServerAuthClient } from "@/lib/supabase/auth-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: tr(locale, "My Profile", "My Profile"),
    description: tr(
      locale,
      "Manage your profile, security settings, and submitted MCP servers.",
      "Manage your profile, security settings, and submitted MCP servers.",
    ),
  };
}

export default async function AccountPage() {
  const locale = await getLocale();
  const authRedirectHref = `/auth?next=${encodeURIComponent("/account")}`;
  const supabaseClient = await createSupabaseServerAuthClient();

  if (!supabaseClient) {
    redirect(authRedirectHref);
  }

  const { data: userData, error: userError } = await supabaseClient.auth.getUser();

  if (userError || !userData.user) {
    redirect(authRedirectHref);
  }

  const { data: submissionRows, error: submissionError } = await supabaseClient
    .from("servers")
    .select("id, created_at, name, slug, category, auth_type, status")
    .eq("owner_user_id", userData.user.id)
    .order("created_at", { ascending: false });

  const { data: authEventRows } = await supabaseClient
    .from("auth_security_events")
    .select("id, created_at, event_type, ip_address")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false })
    .limit(8);

  const submissions = (submissionRows ?? []) as AccountSubmissionRow[];
  const authEvents = (authEventRows ?? []) as AccountAuthEventRow[];

  const {
    pendingCount,
    rejectedCount,
    activeCount,
    initialProfile,
    displayName,
    initials,
    avatarUrl,
    isEmailVerified,
  } = buildAccountViewModel(locale, userData.user, submissions, authEvents);

  return (
    <PageFrame variant="content">
      <PageShell className="max-w-6xl px-4 sm:px-6">
        <AccountHeroSection
          locale={locale}
          avatarUrl={avatarUrl}
          displayName={displayName}
          initials={initials}
          email={userData.user.email ?? null}
        />

        <AccountStatsSection
          locale={locale}
          totalSubmissions={submissions.length}
          activeCount={activeCount}
          pendingCount={pendingCount}
          rejectedCount={rejectedCount}
        />

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_1.45fr]">
          <div className="space-y-5">
            <AccountOverviewCard
              locale={locale}
              isEmailVerified={isEmailVerified}
              userId={userData.user.id}
              createdAt={userData.user.created_at ?? null}
              lastSignInAt={userData.user.last_sign_in_at ?? null}
            />

            <AccountProfileForms locale={locale} initialProfile={initialProfile} />

            <AccountSecurityActivityCard locale={locale} authEvents={authEvents} />
          </div>

          <AccountSubmissionsCard
            locale={locale}
            submissions={submissions}
            hasSubmissionError={Boolean(submissionError)}
          />
        </div>
      </PageShell>
    </PageFrame>
  );
}
