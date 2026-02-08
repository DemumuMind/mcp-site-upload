import type { Metadata } from "next";

import { AuthSignInPanel } from "@/components/auth-sign-in-panel";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: tr(locale, "Login / Sign | DemumuMind MCP", "Вход / Регистрация | DemumuMind MCP"),
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
  const { next, error } = await searchParams;
  const nextPath = typeof next === "string" ? next : "/";
  const errorCode = typeof error === "string" ? error : undefined;

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-5xl flex-col justify-center px-4 py-12 sm:px-6">
      <AuthSignInPanel nextPath={nextPath} errorCode={errorCode} />
    </div>
  );
}
