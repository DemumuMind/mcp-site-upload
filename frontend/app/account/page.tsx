import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Clock3, FileCheck2, FolderGit2, MailCheck, ShieldAlert, ShieldCheck, UserCircle2, } from "lucide-react";
import {
  buildAccountViewModel,
  formatDate,
  getAuthLabel,
  getShortUserId,
  getStatusClass,
  getStatusLabel,
  type AccountAuthEventRow,
  type AccountSubmissionRow,
} from "@/app/account/account-view-model";
import { AccountProfileForms } from "@/components/account-profile-forms";
import { AccountSignOutButton } from "@/components/account-sign-out-button";
import { PageFrame, PageShell } from "@/components/page-templates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSecurityEventBadgeClass, getSecurityEventLabel } from "@/lib/auth/security-event-ui";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { createSupabaseServerAuthClient } from "@/lib/supabase/auth-server";
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
    const { pendingCount, rejectedCount, activeCount, initialProfile, displayName, initials, avatarUrl, isEmailVerified, } = buildAccountViewModel(locale, userData.user, submissions, authEvents);
    return (<PageFrame variant="content">
      <PageShell className="max-w-6xl px-4 sm:px-6">
      <section className="rounded-2xl border border-border bg-card/90 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
        <Image src={avatarUrl} alt={displayName} width={64} height={64} sizes="64px" className="size-16 rounded-2xl border border-border object-cover" referrerPolicy="no-referrer"/>) : (<div className="inline-flex size-16 items-center justify-center rounded-2xl border border-border bg-muted text-xl font-semibold text-foreground">
                {initials}
              </div>)}
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {tr(locale, "Personal cabinet", "Personal cabinet")}
              </p>
              <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">{displayName}</h1>
              <p className="text-sm text-muted-foreground">
                {userData.user.email ?? tr(locale, "authenticated user", "authenticated user")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/submit-server">{tr(locale, "Submit server", "Submit server")}</Link>
            </Button>
            <AccountSignOutButton locale={locale}/>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border bg-card/90">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {tr(locale, "Total submissions", "Total submissions")}
              </p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{submissions.length}</p>
            </div>
            <FolderGit2 className="size-5 text-primary"/>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/90">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {tr(locale, "Active", "Active")}
              </p>
              <p className="mt-1 text-2xl font-semibold text-emerald-200">{activeCount}</p>
            </div>
            <ShieldCheck className="size-5 text-emerald-300"/>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/90">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {tr(locale, "Pending", "Pending")}
              </p>
              <p className="mt-1 text-2xl font-semibold text-amber-200">{pendingCount}</p>
            </div>
            <Clock3 className="size-5 text-amber-300"/>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/90">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
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
          <Card className="border-border bg-card/90">
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <UserCircle2 className="size-5 text-primary"/>
                {tr(locale, "Account overview", "Account overview")}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
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

              <dl className="grid gap-3 text-muted-foreground">
                <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                    {tr(locale, "User ID", "User ID")}
                  </dt>
                  <dd className="mt-1 font-mono text-xs text-foreground" title={userData.user.id}>
                    {getShortUserId(userData.user.id)}
                  </dd>
                </div>

                <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                    {tr(locale, "Created", "Created")}
                  </dt>
                  <dd className="mt-1 text-foreground">{formatDate(userData.user.created_at, locale)}</dd>
                </div>

                <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                    {tr(locale, "Last sign in", "Last sign in")}
                  </dt>
                  <dd className="mt-1 text-foreground">{formatDate(userData.user.last_sign_in_at ?? null, locale)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <AccountProfileForms locale={locale} initialProfile={initialProfile}/>

          <Card className="border-border bg-card/90">
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <ShieldCheck className="size-5 text-primary"/>
                {tr(locale, "Security activity", "Security activity")}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {tr(locale, "Recent login/security events for your account.", "Recent login/security events for your account.")}
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {authEvents.length === 0 ? (<div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                  {tr(locale, "No security events yet.", "No security events yet.")}
                </div>) : (authEvents.map((event) => (<div key={event.id} className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={getSecurityEventBadgeClass(event.event_type)}>{getSecurityEventLabel(locale, event.event_type)}</Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(event.created_at, locale)}</span>
                    </div>
                    {event.ip_address ? (<p className="mt-1 text-xs text-muted-foreground">
                        IP: {event.ip_address}
                      </p>) : null}
                  </div>)))}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card/90">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-xl text-foreground">
              <FolderGit2 className="size-5 text-primary"/>
              {tr(locale, "My submissions", "My submissions")}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {tr(locale, "Track your MCP servers and moderation status.", "Track your MCP servers and moderation status.")}
            </p>
          </CardHeader>

          <CardContent className="space-y-3">
            {submissionError ? (<div className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                {tr(locale, "Could not load your submissions right now.", "Could not load your submissions right now.")}
              </div>) : null}

            {!submissionError && submissions.length === 0 ? (<div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                {tr(locale, "No submissions yet. Use “Submit Your Server” to send your first MCP server for moderation.", "No submissions yet. Use “Submit Your Server” to send your first MCP server for moderation.")}
              </div>) : null}

            {submissions.map((submission) => {
            const hasPublicPage = Boolean(submission.slug) &&
                submission.status !== "pending" &&
                submission.status !== "rejected";
            return (<article key={submission.id} className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      {submission.name ?? tr(locale, "Untitled server", "Untitled server")}
                    </h3>
                    <Badge className={getStatusClass(submission.status)}>
                      <FileCheck2 className="size-3"/>
                      {getStatusLabel(locale, submission.status)}
                    </Badge>
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">
                      {getAuthLabel(locale, submission.auth_type)}
                    </Badge>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>{submission.category ?? tr(locale, "Other", "Other")}</span>
                    <span className="text-muted-foreground">-</span>
                    {hasPublicPage && submission.slug ? (<Link href={`/server/${submission.slug}`} className="font-medium text-primary transition hover:text-primary/80">
                        /server/{submission.slug}
                      </Link>) : (<span>{submission.slug ?? "-"}</span>)}
                    <span className="text-muted-foreground">-</span>
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
      </PageShell>
    </PageFrame>);
}

