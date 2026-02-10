import type { Metadata } from "next";

import { PageFrame, PageHero } from "@/components/page-templates";
import { AuthResetPasswordPanel } from "@/components/auth-reset-password-panel";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: tr(locale, "Reset password", "Сброс пароля"),
    description: tr(
      locale,
      "Set a new password for your account after opening the recovery email link.",
      "Задайте новый пароль после перехода по ссылке из письма восстановления.",
    ),
  };
}

export default async function AuthResetPasswordPage() {
  const locale = await getLocale();

  return (
    <PageFrame variant="form">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
        <PageHero
          badgeTone="violet"
          eyebrow={tr(locale, "Security", "Безопасность")}
          title={tr(locale, "Reset password", "Сброс пароля")}
          description={tr(
            locale,
            "Create a new password with strong complexity rules to secure your account.",
            "Создайте новый пароль с усиленными правилами сложности для защиты аккаунта.",
          )}
        />
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 sm:p-6">
          <AuthResetPasswordPanel />
        </div>
      </div>
    </PageFrame>
  );
}
