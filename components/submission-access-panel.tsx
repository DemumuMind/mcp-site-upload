"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { useLocale } from "@/components/locale-provider";
import { SubmissionForm } from "@/components/submission-form";
import { Button } from "@/components/ui/button";
import { useSupabaseUser } from "@/hooks/use-supabase-user";
import { tr } from "@/lib/i18n";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const authRedirectHref = "/auth?next=%2Fsubmit-server%23submit";

export function SubmissionAccessPanel() {
  const locale = useLocale();
  const { isConfigured, isLoading, user } = useSupabaseUser();

  async function signOut() {
    const supabaseClient = createSupabaseBrowserClient();

    if (!supabaseClient) {
      return;
    }

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(tr(locale, "Signed out", "Вы вышли из аккаунта"));
  }

  if (!isConfigured) {
    return (
      <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-6">
        <h4 className="text-base font-semibold text-amber-200">
          {tr(locale, "Auth is not configured", "Авторизация не настроена")}
        </h4>
        <p className="mt-2 text-sm text-amber-100/90">
          {tr(
            locale,
            "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable server submissions.",
            "Укажите NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY, чтобы включить отправку серверов.",
          )}
        </p>
        <Button asChild className="mt-4 bg-blue-500 hover:bg-blue-400">
          <Link href="/auth">{tr(locale, "Open sign in page", "Открыть страницу входа")}</Link>
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/40 p-6">
        <h4 className="text-base font-semibold text-slate-100">
          {tr(locale, "Registration required", "Требуется регистрация")}
        </h4>
        <p className="mt-2 max-w-xl text-sm text-slate-300">
          {isLoading
            ? tr(
                locale,
                "Checking your session. If you are not signed in, use Login / Sign in to continue.",
                "Проверяем сессию. Если вы не авторизованы, войдите, чтобы продолжить.",
              )
            : tr(
                locale,
                "Sign in first, then you can submit your MCP server for moderation.",
                "Сначала войдите, после этого вы сможете отправить MCP-сервер на модерацию.",
              )}
        </p>
        <Button asChild className="mt-4 bg-blue-500 hover:bg-blue-400">
          <Link href={authRedirectHref}>{tr(locale, "Login / Sign in", "Войти / Регистрация")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/45 px-4 py-3 text-xs text-slate-300">
        <span>
          {tr(locale, "Signed in as", "Вы вошли как")}{" "}
          <strong className="font-medium text-slate-100">
            {user.email || tr(locale, "authenticated user", "авторизованный пользователь")}
          </strong>
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            void signOut();
          }}
          className="border-white/15 bg-white/[0.02] hover:bg-white/[0.06]"
        >
          <LogOut className="size-4" />
          {tr(locale, "Sign out", "Выйти")}
        </Button>
      </div>
      <SubmissionForm />
    </div>
  );
}
