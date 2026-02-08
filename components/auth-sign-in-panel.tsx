"use client";

import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabaseUser } from "@/hooks/use-supabase-user";
import { tr } from "@/lib/i18n";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthSignInPanelProps = {
  nextPath: string;
};

function normalizeNextPath(nextPath: string): string {
  if (!nextPath.startsWith("/")) {
    return "/";
  }

  return nextPath;
}

export function AuthSignInPanel({ nextPath }: AuthSignInPanelProps) {
  const locale = useLocale();
  const safeNextPath = useMemo(() => normalizeNextPath(nextPath), [nextPath]);
  const { isConfigured, isLoading, user } = useSupabaseUser();
  const [email, setEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [pendingOAuthProvider, setPendingOAuthProvider] = useState<
    "google" | "github" | null
  >(null);
  const [isEmailPending, setIsEmailPending] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);

  function getRedirectTo(): string | undefined {
    if (typeof window === "undefined") {
      return undefined;
    }

    return `${window.location.origin}/auth?next=${encodeURIComponent(safeNextPath)}`;
  }

  async function signInWithProvider(provider: "google" | "github") {
    const supabaseClient = createSupabaseBrowserClient();

    if (!supabaseClient) {
      return;
    }

    setPendingOAuthProvider(provider);
    setEmailMessage(null);

    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: getRedirectTo(),
      },
    });

    if (error) {
      toast.error(error.message);
      setPendingOAuthProvider(null);
    }
  }

  async function signInWithEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabaseClient = createSupabaseBrowserClient();

    if (!supabaseClient) {
      return;
    }

    setIsEmailPending(true);
    setEmailMessage(null);

    const { error } = await supabaseClient.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getRedirectTo(),
      },
    });

    setIsEmailPending(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setEmailMessage(
      tr(
        locale,
        "Check your email for the sign-in link.",
        "Проверьте почту: ссылка для входа уже отправлена.",
      ),
    );
    toast.success(tr(locale, "Magic link sent", "Magic link отправлен"));
  }

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
        <h1 className="text-xl font-semibold text-amber-200">
          {tr(locale, "Auth is not configured", "Авторизация не настроена")}
        </h1>
        <p className="mt-2 text-sm text-amber-100/90">
          {tr(
            locale,
            "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable Login/Sign.",
            "Укажите NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY, чтобы включить вход.",
          )}
        </p>
        <Button asChild className="mt-4 bg-blue-500 hover:bg-blue-400">
          <Link href="/">{tr(locale, "Back to catalog", "Назад в каталог")}</Link>
        </Button>
      </div>
    );
  }

  if (user) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
        <h1 className="text-xl font-semibold text-slate-100">
          {tr(locale, "You are signed in", "Вы уже вошли")}
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          {tr(locale, "Account:", "Аккаунт:")} {" "}
          <span className="text-slate-100">
            {user.email || tr(locale, "authenticated user", "авторизованный пользователь")}
          </span>
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild className="bg-blue-500 hover:bg-blue-400">
            <Link href={safeNextPath}>{tr(locale, "Continue", "Продолжить")}</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void signOut();
            }}
            className="border-white/15 bg-white/[0.02] hover:bg-white/[0.06]"
          >
            {tr(locale, "Sign out", "Выйти")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
      <h1 className="text-2xl font-semibold text-slate-100">
        {tr(locale, "Welcome to DemumuMind MCP", "Добро пожаловать в DemumuMind MCP")}
      </h1>
      <p className="mt-2 text-sm text-slate-300">
        {tr(
          locale,
          "Sign in to submit MCP servers and manage your integrations.",
          "Войдите, чтобы отправлять MCP-серверы и управлять интеграциями.",
        )}
      </p>
      {isLoading ? (
        <p className="mt-2 text-xs text-slate-400">
          {tr(locale, "Checking your session...", "Проверяем вашу сессию...")}
        </p>
      ) : null}
      <p className="mt-5 text-xs uppercase tracking-wide text-slate-400">
        {tr(locale, "Login/Sign in with", "Войти через")}
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            void signInWithProvider("google");
          }}
          disabled={pendingOAuthProvider !== null || isEmailPending}
          className="border-white/15 bg-white/[0.02] hover:bg-white/[0.06]"
        >
          {pendingOAuthProvider === "google" ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : null}
          {tr(locale, "Continue with Google", "Продолжить с Google")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowEmailInput((prev) => !prev)}
          disabled={pendingOAuthProvider !== null || isEmailPending}
          className="border-white/15 bg-white/[0.02] hover:bg-white/[0.06]"
        >
          {tr(locale, "Continue with email", "Продолжить по email")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            void signInWithProvider("github");
          }}
          disabled={pendingOAuthProvider !== null || isEmailPending}
          className="border-white/15 bg-white/[0.02] hover:bg-white/[0.06]"
        >
          {pendingOAuthProvider === "github" ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : null}
          {tr(locale, "Continue with GitHub", "Продолжить с GitHub")}
        </Button>
      </div>

      {showEmailInput ? (
        <form className="mt-6 space-y-3" onSubmit={signInWithEmail}>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="border-white/10 bg-slate-950/80"
            />
          </div>

          <Button
            type="submit"
            disabled={isEmailPending || pendingOAuthProvider !== null}
            className="w-full bg-blue-500 hover:bg-blue-400"
          >
            {isEmailPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {tr(locale, "Send magic link", "Отправить magic link")}
          </Button>
        </form>
      ) : null}

      {emailMessage ? (
        <p className="mt-3 rounded-md border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          {emailMessage}
        </p>
      ) : null}

      <p className="mt-4 text-xs text-slate-400">
        {tr(locale, "By signing in, you agree to our", "Входя в систему, вы соглашаетесь с")}{" "}
        <Link href="/terms" className="text-slate-200 hover:text-white">
          {tr(locale, "Terms", "Условиями")}
        </Link>{" "}
        {tr(locale, "and", "и")}{" "}
        <Link href="/privacy" className="text-slate-200 hover:text-white">
          {tr(locale, "Privacy Policy", "Политикой конфиденциальности")}
        </Link>
        .
      </p>
    </div>
  );
}
