import type { Metadata } from "next";

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
  const { flow, email, next } = await searchParams;
  const parsedFlow = parseFlow(flow);
  const safeNextPath = normalizeInternalPath(next);
  const normalizedEmail = typeof email === "string" ? email.trim().slice(0, 254) : "";

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-5xl flex-col justify-center px-4 py-12 sm:px-6">
      <AuthCheckEmailPanel flow={parsedFlow} email={normalizedEmail} nextPath={safeNextPath} />
    </div>
  );
}
