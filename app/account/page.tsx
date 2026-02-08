import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock3, FileCheck2, FolderGit2 } from "lucide-react";

import { AccountSignOutButton } from "@/components/account-sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const formatter = new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return formatter.format(new Date(dateValue));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: tr(locale, "My Account", "My Account"),
    description: tr(
      locale,
      "Review your profile and submitted MCP servers.",
      "Review your profile and submitted MCP servers.",
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

  const submissions = (submissionRows ?? []) as AccountSubmissionRow[];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <div className="grid gap-5 lg:grid-cols-[1.05fr_1.45fr]">
        <Card className="border-white/10 bg-slate-900/72">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl text-slate-100">
              {tr(locale, "Account", "Account")}
            </CardTitle>
            <p className="text-sm text-slate-300">
              {tr(locale, "Signed in as", "Signed in as")}{" "}
              <span className="font-medium text-slate-100">
                {userData.user.email ?? tr(locale, "authenticated user", "authenticated user")}
              </span>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full bg-blue-500 hover:bg-blue-400">
              <Link href="/submit-server">
                {tr(locale, "Submit another server", "Submit another server")}
              </Link>
            </Button>
            <AccountSignOutButton locale={locale} />
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-900/72">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-xl text-slate-100">
              <FolderGit2 className="size-5 text-blue-300" />
              {tr(locale, "My submissions", "My submissions")}
            </CardTitle>
            <p className="text-sm text-slate-300">
              {tr(
                locale,
                "Read-only list of MCP servers submitted from your account.",
                "Read-only list of MCP servers submitted from your account.",
              )}
            </p>
          </CardHeader>

          <CardContent className="space-y-3">
            {submissionError ? (
              <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                {tr(
                  locale,
                  "Could not load your submissions right now.",
                  "Could not load your submissions right now.",
                )}
              </div>
            ) : null}

            {!submissionError && submissions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-white/15 bg-slate-950/45 px-4 py-3 text-sm text-slate-300">
                {tr(
                  locale,
                  "No submissions yet. Open Submit Server to send your first MCP server for moderation.",
                  "No submissions yet. Open Submit Server to send your first MCP server for moderation.",
                )}
              </div>
            ) : null}

            {submissions.map((submission) => (
              <article
                key={submission.id}
                className="rounded-lg border border-white/10 bg-slate-950/60 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-100">
                    {submission.name ?? tr(locale, "Untitled server", "Untitled server")}
                  </h3>
                  <Badge className={getStatusClass(submission.status)}>
                    <FileCheck2 className="size-3" />
                    {getStatusLabel(locale, submission.status)}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/8 text-slate-300">
                    {getAuthLabel(locale, submission.auth_type)}
                  </Badge>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span>{submission.category ?? tr(locale, "Other", "Other")}</span>
                  <span className="text-slate-500">-</span>
                  <span>{submission.slug ?? "-"}</span>
                  <span className="text-slate-500">-</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="size-3.5" />
                    {formatDate(submission.created_at, locale)}
                  </span>
                </div>
              </article>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
