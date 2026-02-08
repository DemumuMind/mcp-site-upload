"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useSupabaseUser } from "@/hooks/use-supabase-user";
import { tr, type Locale } from "@/lib/i18n";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthNavActionsProps = {
  locale: Locale;
};

const submitHref = "/#submit";
const authRedirectHref = "/auth?next=%2F%23submit";

export function AuthNavActions({ locale }: AuthNavActionsProps) {
  const { isConfigured, user } = useSupabaseUser();

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
      <Button asChild className="h-9 rounded-full bg-blue-500 px-3 text-xs font-semibold hover:bg-blue-400 sm:h-10 sm:px-4 sm:text-sm">
        <Link href={submitHref}>
          <span className="sm:hidden">{tr(locale, "Submit", "Отправить")}</span>
          <span className="hidden sm:inline">{tr(locale, "Submit Server", "Отправить сервер")}</span>
        </Link>
      </Button>
    );
  }

  if (!user) {
    return (
      <Button asChild className="h-9 rounded-full bg-blue-500 px-3 text-xs font-semibold hover:bg-blue-400 sm:h-10 sm:px-4 sm:text-sm">
        <Link href={authRedirectHref}>
          <span className="sm:hidden">{tr(locale, "Login", "Войти")}</span>
          <span className="hidden sm:inline">{tr(locale, "Login / Sign in", "Войти / Регистрация")}</span>
        </Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild className="h-9 rounded-full bg-blue-500 px-3 text-xs font-semibold hover:bg-blue-400 sm:h-10 sm:px-4 sm:text-sm">
        <Link href={submitHref}>
          <span className="sm:hidden">{tr(locale, "Submit", "Отправить")}</span>
          <span className="hidden sm:inline">{tr(locale, "Submit Server", "Отправить сервер")}</span>
        </Link>
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          void signOut();
        }}
        className="h-9 border-white/15 bg-white/[0.02] px-2.5 text-xs hover:bg-white/[0.06] sm:h-10 sm:px-3 sm:text-sm"
        aria-label={tr(locale, "Sign out", "Выйти")}
      >
        <LogOut className="size-4" />
        <span className="hidden sm:inline">{tr(locale, "Sign out", "Выйти")}</span>
      </Button>
    </div>
  );
}
