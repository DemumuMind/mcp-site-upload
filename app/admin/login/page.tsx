import type { Metadata } from "next";

import { loginAdminAction } from "@/app/admin/actions";
import { PageFrame, PageHero, PageSection } from "@/components/page-templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Restricted admin access for moderation actions.",
};

type AdminLoginPageProps = {
  searchParams: Promise<{
    redirect?: string;
    error?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const locale = await getLocale();
  const { redirect, error } = await searchParams;

  const errorMessage =
    error === "invalid"
      ? tr(locale, "Invalid admin token.", "Неверный админ-токен.")
      : error === "session"
        ? tr(locale, "Session expired. Sign in again.", "Сессия истекла. Войдите снова.")
        : error === "config"
          ? tr(locale, "Admin access token is not configured.", "Токен админ-доступа не настроен.")
          : undefined;

  const devHint =
    process.env.NODE_ENV !== "production" && process.env.ADMIN_ACCESS_TOKEN === undefined
      ? tr(
          locale,
          "Dev mode: set ADMIN_ACCESS_TOKEN in .env to disable fallback token.",
          "Режим разработки: добавьте ADMIN_ACCESS_TOKEN в .env, чтобы отключить fallback-токен.",
        )
      : null;

  return (
    <PageFrame variant="ops">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
        <PageHero
          badgeTone="emerald"
          eyebrow={tr(locale, "Operations", "Операции")}
          title={tr(locale, "Admin access", "Доступ администратора")}
          description={tr(
            locale,
            "Use a privileged token to enter the moderation dashboard and manage pending submissions.",
            "Используйте привилегированный токен для входа в панель модерации и управления ожидающими заявками.",
          )}
        />
        <PageSection className="mx-auto w-full max-w-md">
          <h2 className="text-xl font-semibold text-slate-100">
            {tr(locale, "Token sign-in", "Вход по токену")}
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            {tr(locale, "Enter admin token to open moderation dashboard.", "Введите админ-токен, чтобы открыть панель модерации.")}
          </p>

          {errorMessage ? (
            <p className="mt-3 rounded-md border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {errorMessage}
            </p>
          ) : null}

          {devHint ? (
            <p className="mt-3 rounded-md border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              {devHint}
            </p>
          ) : null}

          <form action={loginAdminAction} className="mt-5 space-y-3">
            <input type="hidden" name="redirect" value={redirect || "/admin"} />
            <input
              type="text"
              name="username"
              autoComplete="username"
              defaultValue="admin"
              tabIndex={-1}
              readOnly
              aria-hidden="true"
              className="sr-only"
            />

            <div className="space-y-1.5">
              <Label htmlFor="token">{tr(locale, "Admin token", "Токен администратора")}</Label>
              <Input
                id="token"
                name="token"
                type="password"
                autoComplete="current-password"
                required
                className="border-white/10 bg-slate-950/80"
              />
            </div>

            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-400">
              {tr(locale, "Sign in", "Войти")}
            </Button>
          </form>
        </PageSection>
      </div>
    </PageFrame>
  );
}
