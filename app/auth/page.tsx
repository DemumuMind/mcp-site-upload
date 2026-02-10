import type { Metadata } from "next";

import { PageFrame, PageHero } from "@/components/page-templates";
import { AuthSignInPanel } from "@/components/auth-sign-in-panel";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: tr(locale, "Login", "Вход"),
    description: tr(
      locale,
      "Sign in to submit MCP servers to the catalog.",
      "Войдите, чтобы отправлять MCP-серверы в каталог.",
    ),
  };
}

type AuthPageProps = {
  searchParams: Promise<{
    next?: string;
    error?: string;
  }>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const locale = await getLocale();
  const { next, error } = await searchParams;
  const nextPath = typeof next === "string" ? next : "/";
  const errorCode = typeof error === "string" ? error : undefined;

  return (
    <PageFrame variant="form">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
        <PageHero
          badgeTone="violet"
          eyebrow={tr(locale, "Account access", "Доступ к аккаунту")}
          title={tr(locale, "Sign in to DemumuMind", "Войдите в DemumuMind")}
          description={tr(
            locale,
            "Authenticate to submit MCP servers, track moderation status, and manage your personal workspace.",
            "Авторизуйтесь, чтобы отправлять MCP-серверы, отслеживать модерацию и управлять личным workspace.",
          )}
        />
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 sm:p-6">
          <AuthSignInPanel nextPath={nextPath} errorCode={errorCode} />
        </div>
      </div>
    </PageFrame>
  );
}
