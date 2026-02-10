import type { Metadata } from "next";

import { PageFrame, PageHero } from "@/components/page-templates";
import { AuthCheckEmailPanel } from "@/components/auth-check-email-panel";
import { normalizeInternalPath, type AuthCheckEmailFlow } from "@/lib/auth-redirects";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

type AuthCheckEmailPageProps = {
  searchParams: Promise<{
    flow?: string;
    email?: string;
    next?: string;
  }>;
};

function parseFlow(value?: string): AuthCheckEmailFlow {
  return value === "reset" ? "reset" : "signup";
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: tr(locale, "Check your email", "Проверьте почту"),
    description: tr(
      locale,
      "Open the email from DemumuMind MCP to continue authentication.",
      "Откройте письмо от DemumuMind MCP, чтобы продолжить авторизацию.",
    ),
  };
}

export default async function AuthCheckEmailPage({ searchParams }: AuthCheckEmailPageProps) {
  const locale = await getLocale();
  const { flow, email, next } = await searchParams;
  const parsedFlow = parseFlow(flow);
  const safeNextPath = normalizeInternalPath(next);
  const normalizedEmail = typeof email === "string" ? email.trim().slice(0, 254) : "";

  return (
    <PageFrame variant="form">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
        <PageHero
          badgeTone="violet"
          eyebrow={tr(locale, "Auth flow", "Auth-процесс")}
          title={tr(locale, "Check your inbox", "Проверьте почту")}
          description={tr(
            locale,
            "Use the verification link from your email to continue sign-in or password recovery.",
            "Используйте ссылку подтверждения из письма, чтобы продолжить вход или восстановление пароля.",
          )}
        />
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 sm:p-6">
          <AuthCheckEmailPanel flow={parsedFlow} email={normalizedEmail} nextPath={safeNextPath} />
        </div>
      </div>
    </PageFrame>
  );
}
