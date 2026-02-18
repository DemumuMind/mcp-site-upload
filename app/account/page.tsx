import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Clock3, FileCheck2, FolderGit2, MailCheck, ShieldAlert, ShieldCheck, UserCircle2, } from "lucide-react";
import { AccountProfileForms } from "@/components/account-profile-forms";
import { AccountSignOutButton } from "@/components/account-sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AccountProfileInput } from "@/lib/account-profile-schema";
import { getSecurityEventBadgeClass, getSecurityEventLabel } from "@/lib/auth/security-event-ui";
import { tr, type Locale } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { createSupabaseServerAuthClient } from "@/lib/supabase/auth-server";
type AccountSubmissionRow = {
    id: string;
    created_at: string | null;
    name: string | null;
    slug: string | null;
    category: string | null;
    auth_type: string | null;
    status: string | null;
};
type AccountAuthEventRow = {
    id: string;
    created_at: string | null;
    event_type: string;
    ip_address: string | null;
};
const ACCOUNT_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
});
function getStatusLabel(locale: Locale, status: string | null): string {
    if (status === "pending") {
        return tr(locale, "Pending", "Pending");
    }
    if (status === "rejected") {
        return tr(locale, "Rejected", "Rejected");
    }
    return tr(locale, "Active", "Active");
}
function getStatusClass(status: string | null): string {
    if (status === "pending") {
        return "border-amber-400/35 bg-amber-500/10 text-amber-200";
    }
    if (status === "rejected") {
        return "border-rose-400/35 bg-rose-500/10 text-rose-200";
    }
    return "border-emerald-400/35 bg-emerald-500/10 text-emerald-200";
}
function getAuthLabel(locale: Locale, authType: string | null): string {
    if (authType === "oauth") {
        return "OAuth";
    }
    if (authType === "api_key") {
        return "API Key";
    }
    return tr(locale, "Open / No Auth", "Open / No Auth");
}
function formatDate(dateValue: string | null, locale: Locale): string {
    if (!dateValue) {
        return tr(locale, "Unknown date", "Unknown date");
    }
    return ACCOUNT_DATE_FORMATTER.format(new Date(dateValue));
}
function getMetadataString(metadata: unknown, key: string): string {
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
        return "";
    }
    const value = (metadata as Record<string, unknown>)[key];
    return typeof value === "string" ? value : "";
}
function normalizeAvatarUrl(value: string): string | null {
    if (!value) {
        return null;
    }
    try {
        const url = new URL(value);
        if (url.protocol !== "https:") {
            return null;
        }
        return url.toString();
    }
    catch {
        return null;
    }
}
function getDisplayName(locale: Locale, profile: AccountProfileInput, email: string | null): string {
    if (profile.fullName) {
        return profile.fullName;
    }
    if (profile.username) {
        return profile.username;
    }
    if (email) {
        return email.split("@")[0] || email;
    }
    return tr(locale, "User", "User");
}
function getInitials(displayName: string): string {
    const words = displayName
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    if (words.length === 0) {
        return "U";
    }
    if (words.length === 1) {
        return words[0].slice(0, 2).toUpperCase();
    }
    return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}
function getShortUserId(userId: string): string {
    if (userId.length <= 12) {
        return userId;
    }
    return `${userId.slice(0, 8)}...${userId.slice(-4)}`;
}
export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    return {
        title: tr(locale, "My Profile", "My Profile"),
        description: tr(locale, "Manage your profile, security settings, and submitted MCP servers.", "Manage your profile, security settings, and submitted MCP servers."),
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
    const pendingCount = submissions.filter((submission) => submission.status === "pending").length;
    const rejectedCount = submissions.filter((submission) => submission.status === "rejected").length;
    const activeCount = submissions.length - pendingCount - rejectedCount;
    const initialProfile: AccountProfileInput = {
        fullName: getMetadataString(userData.user.user_metadata, "full_name"),
        username: getMetadataString(userData.user.user_metadata, "username"),
        avatarUrl: getMetadataString(userData.user.user_metadata, "avatar_url"),
        website: getMetadataString(userData.user.user_metadata, "website"),
        bio: getMetadataString(userData.user.user_metadata, "bio"),
    };
    const displayName = getDisplayName(locale, initialProfile, userData.user.email ?? null);
    const initials = getInitials(displayName);
    const avatarUrl = normalizeAvatarUrl(initialProfile.avatarUrl);
    const isEmailVerified = Boolean(userData.user.email_confirmed_at);
    return (<div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <section className="rounded-2xl border border-white/10 bg-indigo-900/72 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
        <Image src={avatarUrl} alt={displayName} width={64} height={64} sizes="64px" className="size-16 rounded-2xl border border-blue-300/30 object-cover" referrerPolicy="no-referrer"/>) : (<div className="inline-flex size-16 items-center justify-center rounded-2xl border border-blue-300/30 bg-blue-500/10 text-xl font-semibold text-blue-200">
                {initials}
              </div>)}
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
                {tr(locale, "Personal cabinet", "Personal cabinet")}
              </p>
              <h1 className="text-2xl font-semibold text-violet-50 sm:text-3xl">{displayName}</h1>
              <p className="text-sm text-violet-200">
                {userData.user.email ?? tr(locale, "authenticated user", "authenticated user")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild className="bg-blue-500 hover:bg-blue-400">
              <Link href="/submit-server">{tr(locale, "Submit server", "Submit server")}</Link>
            </Button>
            <AccountSignOutButton locale={locale}/>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-white/10 bg-indigo-900/72">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-violet-300">
                {tr(locale, "Total submissions", "Total submissions")}
              </p>
              <p className="mt-1 text-2xl font-semibold text-violet-50">{submissions.length}</p>
            </div>
            <FolderGit2 className="size-5 text-blue-300"/>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-indigo-900/72">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-violet-300">
                {tr(locale, "Active", "Active")}
              </p>
              <p className="mt-1 text-2xl font-semibold text-emerald-200">{activeCount}</p>
            </div>
            <ShieldCheck className="size-5 text-emerald-300"/>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-indigo-900/72">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-violet-300">
                {tr(locale, "Pending", "Pending")}
              </p>
              <p className="mt-1 text-2xl font-semibold text-amber-200">{pendingCount}</p>
            </div>
            <Clock3 className="size-5 text-amber-300"/>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-indigo-900/72">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-violet-300">
                {tr(locale, "Rejected", "Rejected")}
              </p>
              <p className="mt-1 text-2xl font-semibold text-rose-200">{rejectedCount}</p>
            </div>
            <ShieldAlert className="size-5 text-rose-300"/>
          </CardContent>
        </Card>
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_1.45fr]">
        <div className="space-y-5">
          <Card className="border-white/10 bg-indigo-900/72">
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-xl text-violet-50">
                <UserCircle2 className="size-5 text-blue-300"/>
                {tr(locale, "Account overview", "Account overview")}
              </CardTitle>
              <p className="text-sm text-violet-200">
                {tr(locale, "Core account information and verification status.", "Core account information and verification status.")}
              </p>
            </CardHeader>

            <CardContent className="space-y-4 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={isEmailVerified
            ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-200"
            : "border-amber-400/35 bg-amber-500/10 text-amber-200"}>
                  <MailCheck className="size-3.5"/>
                  {isEmailVerified
            ? tr(locale, "Email verified", "Email verified")
            : tr(locale, "Email not verified", "Email not verified")}
                </Badge>
              </div>

              <dl className="grid gap-3 text-violet-200">
                <div className="rounded-lg border border-white/10 bg-indigo-950/50 px-3 py-2.5">
                  <dt className="text-xs uppercase tracking-wide text-violet-300">
                    {tr(locale, "User ID", "User ID")}
                  </dt>
                  <dd className="mt-1 font-mono text-xs text-violet-100" title={userData.user.id}>
                    {getShortUserId(userData.user.id)}
                  </dd>
                </div>

                <div className="rounded-lg border border-white/10 bg-indigo-950/50 px-3 py-2.5">
                  <dt className="text-xs uppercase tracking-wide text-violet-300">
                    {tr(locale, "Created", "Created")}
                  </dt>
                  <dd className="mt-1 text-violet-100">{formatDate(userData.user.created_at, locale)}</dd>
                </div>

                <div className="rounded-lg border border-white/10 bg-indigo-950/50 px-3 py-2.5">
                  <dt className="text-xs uppercase tracking-wide text-violet-300">
                    {tr(locale, "Last sign in", "Last sign in")}
                  </dt>
                  <dd className="mt-1 text-violet-100">{formatDate(userData.user.last_sign_in_at ?? null, locale)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <AccountProfileForms locale={locale} initialProfile={initialProfile}/>

          <Card className="border-white/10 bg-indigo-900/72">
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-xl text-violet-50">
                <ShieldCheck className="size-5 text-blue-300"/>
                {tr(locale, "Security activity", "Security activity")}
              </CardTitle>
              <p className="text-sm text-violet-200">
                {tr(locale, "Recent login/security events for your account.", "Recent login/security events for your account.")}
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {authEvents.length === 0 ? (<div className="rounded-lg border border-dashed border-white/15 bg-indigo-950/45 px-4 py-3 text-sm text-violet-200">
                  {tr(locale, "No security events yet.", "No security events yet.")}
                </div>) : (authEvents.map((event) => (<div key={event.id} className="rounded-lg border border-white/10 bg-indigo-950/60 px-3 py-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={getSecurityEventBadgeClass(event.event_type)}>{getSecurityEventLabel(locale, event.event_type)}</Badge>
                      <span className="text-xs text-violet-300">{formatDate(event.created_at, locale)}</span>
                    </div>
                    {event.ip_address ? (<p className="mt-1 text-xs text-violet-300">
                        IP: {event.ip_address}
                      </p>) : null}
                  </div>)))}
            </CardContent>
          </Card>
        </div>

        <Card className="border-white/10 bg-indigo-900/72">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-xl text-violet-50">
              <FolderGit2 className="size-5 text-blue-300"/>
              {tr(locale, "My submissions", "My submissions")}
            </CardTitle>
            <p className="text-sm text-violet-200">
              {tr(locale, "Track your MCP servers and moderation status.", "Track your MCP servers and moderation status.")}
            </p>
          </CardHeader>

          <CardContent className="space-y-3">
            {submissionError ? (<div className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                {tr(locale, "Could not load your submissions right now.", "Could not load your submissions right now.")}
              </div>) : null}

            {!submissionError && submissions.length === 0 ? (<div className="rounded-lg border border-dashed border-white/15 bg-indigo-950/45 px-4 py-3 text-sm text-violet-200">
                {tr(locale, "No submissions yet. Use “Submit Your Server” to send your first MCP server for moderation.", "No submissions yet. Use “Submit Your Server” to send your first MCP server for moderation.")}
              </div>) : null}

            {submissions.map((submission) => {
            const hasPublicPage = Boolean(submission.slug) &&
                submission.status !== "pending" &&
                submission.status !== "rejected";
            return (<article key={submission.id} className="rounded-lg border border-white/10 bg-indigo-950/60 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-violet-50">
                      {submission.name ?? tr(locale, "Untitled server", "Untitled server")}
                    </h3>
                    <Badge className={getStatusClass(submission.status)}>
                      <FileCheck2 className="size-3"/>
                      {getStatusLabel(locale, submission.status)}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/8 text-violet-200">
                      {getAuthLabel(locale, submission.auth_type)}
                    </Badge>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-violet-300">
                    <span>{submission.category ?? tr(locale, "Other", "Other")}</span>
                    <span className="text-violet-400">вЂў</span>
                    {hasPublicPage && submission.slug ? (<Link href={`/server/${submission.slug}`} className="font-medium text-blue-300 transition hover:text-blue-200">
                        /server/{submission.slug}
                      </Link>) : (<span>{submission.slug ?? "-"}</span>)}
                    <span className="text-violet-400">вЂў</span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="size-3.5"/>
                      {formatDate(submission.created_at, locale)}
                    </span>
                  </div>
                </article>);
        })}
          </CardContent>
        </Card>
      </div>
    </div>);
}

