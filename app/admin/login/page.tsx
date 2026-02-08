import type { Metadata } from "next";

import { loginAdminAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAdminAccessToken } from "@/lib/admin-auth";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export const metadata: Metadata = {
  title: "Admin Login | DemumuMind MCP",
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
        : undefined;

  const devHint =
    process.env.ADMIN_ACCESS_TOKEN === undefined
      ? tr(locale, "Dev token (fallback):", "Dev token (fallback):") + ` ${getAdminAccessToken()}`
      : null;

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
        <h1 className="text-xl font-semibold text-slate-100">{tr(locale, "Admin access", "Доступ администратора")}</h1>
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

          <div className="space-y-1.5">
            <Label htmlFor="token">{tr(locale, "Admin token", "Токен администратора")}</Label>
            <Input
              id="token"
              name="token"
              type="password"
              required
              className="border-white/10 bg-slate-950/80"
            />
          </div>

          <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-400">
            {tr(locale, "Sign in", "Войти")}
          </Button>
        </form>
      </div>
    </div>
  );
}
