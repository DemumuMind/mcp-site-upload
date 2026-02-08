"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useSupabaseUser } from "@/hooks/use-supabase-user";
import { useLocale } from "@/components/locale-provider";
import { tr } from "@/lib/i18n";

const authRedirectHref = "/auth?next=%2F%23submit";

export function SubmitServerCta() {
  const { isConfigured, user } = useSupabaseUser();
  const locale = useLocale();

  const href = !isConfigured || user ? "/#submit" : authRedirectHref;
  const label = !isConfigured || user
    ? tr(locale, "Submit Server", "Отправить сервер")
    : tr(locale, "Login / Sign in", "Войти / Регистрация");

  return (
    <Button
      asChild
      variant="outline"
      className="border-white/15 bg-white/[0.02] hover:bg-white/[0.06]"
    >
      <Link href={href}>{label}</Link>
    </Button>
  );
}
