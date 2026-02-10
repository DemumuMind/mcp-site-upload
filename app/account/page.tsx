import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  Clock3,
  FileCheck2,
  FolderGit2,
  MailCheck,
  ShieldAlert,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";

import { AccountProfileForms } from "@/components/account-profile-forms";
import { AccountSignOutButton } from "@/components/account-sign-out-button";
import { PageFrame } from "@/components/page-templates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AccountProfileInput } from "@/lib/account-profile-schema";
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
    return tr(locale, "Pending", "На проверке");
  }

  if (status === "rejected") {
    return tr(locale, "Rejected", "Отклонён");
  }

  return tr(locale, "Active", "Активен");
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
    return tr(locale, "Unknown date", "Дата неизвестна");
  }

  const formatter = new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return formatter.format(new Date(dateValue));
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
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function getDisplayName(
  locale: Locale,
  profile: AccountProfileInput,
  email: string | null,
): string {
  if (profile.fullName) {
    return profile.fullName;
  }

  if (profile.username) {
    return profile.username;
  }

  if (email) {
    return email.split("@")[0] || email;
  }

  return tr(locale, "User", "Пользователь");
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
    title: tr(locale, "My Profile", "Мой профиль"),
    description: tr(
      locale,
      "Manage your profile, security settings, and submitted MCP servers.",
      "Управляйте профилем, безопасностью и отправленными MCP-серверами.",
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

  return (
    <PageFrame variant="ops">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <section className="rounded-2xl border border-white/10 bg-slate-900/72 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={displayName}
                className="size-16 rounded-2xl border border-blue-300/30 object-cover"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="inline-flex size-16 items-center justify-center rounded-2xl border border-blue-300/30 bg-blue-500/10 text-xl font-semibold text-blue-200">
                {initials}
              </div>
            )}
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {tr(locale, "Personal cabinet", "Личный кабинет")}
              </p>
              <h1 className="text-2xl font-semibold text-slate-100 sm:text-3xl">{displayName}</h1>
              <p className="text-sm text-slate-300">
                {userData.user.email ?? tr(locale, "authenticated user", "авторизованный пользователь")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild className="bg-blue-500 hover:bg-blue-400">
              <Link href="/submit-server">{tr(locale, "Submit server", "Добавить сервер")}</Link>
            </Button>
            <AccountSignOutButton locale={locale} />
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-white/10 bg-slate-900/72">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {tr(locale, "Total submissions", "Всего отправок")}
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-100">{submissions.length}</p>
            </div>
            <FolderGit2 className="size-5 text-blue-300" />
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-900/72">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {tr(locale, "Active", "Активные")}
              </p>
              <p className="mt-1 text-2xl font-semibold text-emerald-200">{activeCount}</p>
            </div>
            <ShieldCheck className="size-5 text-emerald-300" />
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-900/72">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {tr(locale, "Pending", "На модерации")}
              </p>
              <p className="mt-1 text-2xl font-semibold text-amber-200">{pendingCount}</p>
            </div>
            <Clock3 className="size-5 text-amber-300" />
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-900/72">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {tr(locale, "Rejected", "Отклонённые")}
              </p>
              <p className="mt-1 text-2xl font-semibold text-rose-200">{rejectedCount}</p>
            </div>
            <ShieldAlert className="size-5 text-rose-300" />
          </CardContent>
        </Card>
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_1.45fr]">
        <div className="space-y-5">
          <Card className="border-white/10 bg-slate-900/72">
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-xl text-slate-100">
                <UserCircle2 className="size-5 text-blue-300" />
                {tr(locale, "Account overview", "Обзор аккаунта")}
              </CardTitle>
              <p className="text-sm text-slate-300">
                {tr(
                  locale,
                  "Core account information and verification status.",
                  "Основные данные аккаунта и статус верификации.",
                )}
              </p>
            </CardHeader>

            <CardContent className="space-y-4 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  className={
                    isEmailVerified
                      ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-200"
                      : "border-amber-400/35 bg-amber-500/10 text-amber-200"
                  }
                >
                  <MailCheck className="size-3.5" />
                  {isEmailVerified
                    ? tr(locale, "Email verified", "Email подтверждён")
                    : tr(locale, "Email not verified", "Email не подтверждён")}
                </Badge>
              </div>

              <dl className="grid gap-3 text-slate-300">
                <div className="rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2.5">
                  <dt className="text-xs uppercase tracking-wide text-slate-400">
                    {tr(locale, "User ID", "User ID")}
                  </dt>
                  <dd className="mt-1 font-mono text-xs text-slate-200" title={userData.user.id}>
                    {getShortUserId(userData.user.id)}
                  </dd>
                </div>

                <div className="rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2.5">
                  <dt className="text-xs uppercase tracking-wide text-slate-400">
                    {tr(locale, "Created", "Создан")}
                  </dt>
                  <dd className="mt-1 text-slate-200">{formatDate(userData.user.created_at, locale)}</dd>
                </div>

                <div className="rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2.5">
                  <dt className="text-xs uppercase tracking-wide text-slate-400">
                    {tr(locale, "Last sign in", "Последний вход")}
                  </dt>
                  <dd className="mt-1 text-slate-200">{formatDate(userData.user.last_sign_in_at ?? null, locale)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <AccountProfileForms locale={locale} initialProfile={initialProfile} />
        </div>

        <Card className="border-white/10 bg-slate-900/72">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-xl text-slate-100">
              <FolderGit2 className="size-5 text-blue-300" />
              {tr(locale, "My submissions", "Мои отправки")}
            </CardTitle>
            <p className="text-sm text-slate-300">
              {tr(
                locale,
                "Track your MCP servers and moderation status.",
                "Отслеживайте свои MCP-серверы и статус модерации.",
              )}
            </p>
          </CardHeader>

          <CardContent className="space-y-3">
            {submissionError ? (
              <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                {tr(
                  locale,
                  "Could not load your submissions right now.",
                  "Сейчас не удалось загрузить ваши отправки.",
                )}
              </div>
            ) : null}

            {!submissionError && submissions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-white/15 bg-slate-950/45 px-4 py-3 text-sm text-slate-300">
                {tr(
                  locale,
                  "No submissions yet. Open Submit Server to send your first MCP server for moderation.",
                  "Пока нет отправок. Откройте форму и отправьте первый MCP-сервер на модерацию.",
                )}
              </div>
            ) : null}

            {submissions.map((submission) => {
              const hasPublicPage =
                Boolean(submission.slug) &&
                submission.status !== "pending" &&
                submission.status !== "rejected";

              return (
                <article
                  key={submission.id}
                  className="rounded-lg border border-white/10 bg-slate-950/60 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-100">
                      {submission.name ?? tr(locale, "Untitled server", "Сервер без названия")}
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
                    <span>{submission.category ?? tr(locale, "Other", "Другое")}</span>
                    <span className="text-slate-500">•</span>
                    {hasPublicPage && submission.slug ? (
                      <Link
                        href={`/server/${submission.slug}`}
                        className="font-medium text-blue-300 transition hover:text-blue-200"
                      >
                        /server/{submission.slug}
                      </Link>
                    ) : (
                      <span>{submission.slug ?? "-"}</span>
                    )}
                    <span className="text-slate-500">•</span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="size-3.5" />
                      {formatDate(submission.created_at, locale)}
                    </span>
                  </div>
                </article>
              );
            })}
          </CardContent>
        </Card>
      </div>
      </div>
    </PageFrame>
  );
}
