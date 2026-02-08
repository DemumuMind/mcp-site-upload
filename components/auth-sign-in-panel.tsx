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
  errorCode?: string;
};

function normalizeNextPath(nextPath: string): string {
  const candidate = nextPath.trim();

  if (!candidate.startsWith("/")) {
    return "/";
  }

  if (candidate.startsWith("//") || candidate.startsWith("/\\")) {
    return "/";
  }

  if (/[\u0000-\u001F\u007F]/.test(candidate)) {
    return "/";
  }

  try {
    const parsed = new URL(candidate, "http://localhost");

    if (parsed.origin !== "http://localhost") {
      return "/";
    }

    const normalizedPath = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    if (!normalizedPath.startsWith("/") || normalizedPath.startsWith("//")) {
      return "/";
    }

    return normalizedPath;
  } catch {
    return "/";
  }
}

function getAuthErrorMessage(locale: "en" | "ru", errorCode?: string): string | null {
  if (!errorCode) {
    return null;
  }

  if (errorCode === "missing_code") {
    return tr(
      locale,
      "Authentication code is missing. Please try signing in again.",
      "Код авторизации не найден. Попробуйте войти снова.",
    );
  }

  if (errorCode === "callback_error") {
    return tr(
      locale,
      "Sign-in callback failed or link has expired. Start a new sign-in attempt.",
      "Ошибка callback при входе или ссылка устарела. Начните вход заново.",
    );
  }

  if (errorCode === "config_error") {
    return tr(
      locale,
      "Auth callback is not configured. Check Supabase environment variables.",
      "Auth callback не настроен. Проверьте переменные окружения Supabase.",
    );
  }

  return tr(
    locale,
    "Authentication failed. Please try again.",
    "Авторизация не выполнена. Попробуйте снова.",
  );
}

export function AuthSignInPanel({ nextPath, errorCode }: AuthSignInPanelProps) {
  const locale = useLocale();
  const safeNextPath = useMemo(() => normalizeNextPath(nextPath), [nextPath]);
  const callbackErrorMessage = useMemo(
    () => getAuthErrorMessage(locale, errorCode),
    [errorCode, locale],
  );
  const { isConfigured, isLoading, user } = useSupabaseUser();
  const [email, setEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [pendingOAuthProvider, setPendingOAuthProvider] = useState<
    "google" | "github" | null
  >(null);
  const [isEmailPending, setIsEmailPending] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);

  const oauthButtonClass =
    "h-12 w-full justify-start rounded-xl border border-slate-600/65 bg-slate-900/75 px-4 text-left text-sm font-semibold text-slate-100 transition hover:border-slate-400/70 hover:bg-slate-900 focus-visible:ring-slate-300/40";
  const primaryActionButtonClass =
    "h-11 w-full rounded-xl bg-slate-100 text-slate-950 transition hover:bg-white";

  function getRedirectTo(): string | undefined {
    if (typeof window === "undefined") {
      return undefined;
    }

    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNextPath)}`;
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
      <div className="relative overflow-hidden rounded-[1.75rem] border border-amber-300/35 bg-slate-950 p-6 shadow-[0_20px_45px_-30px_rgba(251,191,36,0.7)] sm:p-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
        <div className="relative">
          <h1 className="text-2xl font-semibold text-amber-100">
            {tr(locale, "Auth is not configured", "Авторизация не настроена")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-amber-50/85">
            {tr(
              locale,
              "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable Login/Sign.",
              "Укажите NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY, чтобы включить вход.",
            )}
          </p>
          <Button
            asChild
            className="mt-6 h-10 rounded-xl bg-amber-300 text-slate-950 hover:bg-amber-200"
          >
            <Link href="/">{tr(locale, "Back to catalog", "Назад в каталог")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-700/80 bg-slate-950 p-6 shadow-[0_24px_56px_-36px_rgba(2,6,23,0.9)] sm:p-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-400/30 to-transparent" />
        <div className="relative">
          <h1 className="text-2xl font-semibold text-slate-100">
            {tr(locale, "You are signed in", "Вы уже вошли")}
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            {tr(locale, "Account:", "Аккаунт:")}{" "}
            <span className="font-medium text-slate-100">
              {user.email || tr(locale, "authenticated user", "авторизованный пользователь")}
            </span>
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="h-10 rounded-xl bg-slate-100 text-slate-950 hover:bg-white">
              <Link href={safeNextPath}>{tr(locale, "Continue", "Продолжить")}</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void signOut();
              }}
              className="h-10 rounded-xl border-slate-600/70 bg-slate-900/70 hover:bg-slate-900"
            >
              {tr(locale, "Sign out", "Выйти")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-700/80 bg-[linear-gradient(180deg,rgba(15,23,42,0.96)_0%,rgba(2,6,23,0.98)_100%)] shadow-[0_30px_72px_-50px_rgba(2,6,23,0.95)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/35 to-transparent" />
      <div className="relative p-6 sm:p-10">
        <span className="inline-flex rounded-full border border-slate-500/65 bg-slate-900/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-200">
          {tr(locale, "Secure access", "Безопасный вход")}
        </span>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
          {tr(locale, "Welcome to DemumuMind MCP", "Добро пожаловать в DemumuMind MCP")}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200/85 sm:text-base">
          {tr(
            locale,
            "Sign in to submit MCP servers and manage your integrations.",
            "Войдите, чтобы отправлять MCP-серверы и управлять интеграциями.",
          )}
        </p>

        {callbackErrorMessage ? (
          <p className="mt-5 rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-100">
            {callbackErrorMessage}
          </p>
        ) : null}

        {isLoading ? (
          <p className="mt-3 text-xs text-slate-300/70">
            {tr(locale, "Checking your session...", "Проверяем вашу сессию...")}
          </p>
        ) : null}

        <div className="mt-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
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
              className={oauthButtonClass}
            >
              {pendingOAuthProvider === "google" ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <span className="inline-flex size-6 items-center justify-center rounded-full border border-slate-500/70 bg-slate-800 text-xs font-bold text-slate-200">
                  G
                </span>
              )}
              <span>{tr(locale, "Continue with Google", "Продолжить с Google")}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEmailInput((prev) => !prev)}
              disabled={pendingOAuthProvider !== null || isEmailPending}
              className={oauthButtonClass}
            >
              <span className="inline-flex size-6 items-center justify-center rounded-full border border-slate-500/70 bg-slate-800 text-xs font-bold text-slate-200">
                @
              </span>
              <span>{tr(locale, "Continue with email", "Продолжить по email")}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void signInWithProvider("github");
              }}
              disabled={pendingOAuthProvider !== null || isEmailPending}
              className={oauthButtonClass}
            >
              {pendingOAuthProvider === "github" ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <span className="inline-flex size-6 items-center justify-center rounded-full border border-slate-500/70 bg-slate-800 text-[10px] font-bold text-slate-200">
                  GH
                </span>
              )}
              <span>{tr(locale, "Continue with GitHub", "Продолжить с GitHub")}</span>
            </Button>
          </div>
        </div>

        {showEmailInput ? (
          <form
            className="mt-5 rounded-2xl border border-slate-700/80 bg-slate-950/70 p-4 sm:p-5"
            onSubmit={signInWithEmail}
          >
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm text-slate-200">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-11 rounded-xl border-slate-600 bg-slate-900/90 text-slate-100 placeholder:text-slate-500 focus-visible:ring-slate-300/35"
              />
            </div>

            <Button
              type="submit"
              disabled={isEmailPending || pendingOAuthProvider !== null}
              className={`mt-4 ${primaryActionButtonClass}`}
            >
              {isEmailPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
              {tr(locale, "Send magic link", "Отправить magic link")}
            </Button>
          </form>
        ) : null}

        {emailMessage ? (
          <p className="mt-4 rounded-xl border border-emerald-300/35 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-100">
            {emailMessage}
          </p>
        ) : null}

        <p className="mt-6 border-t border-slate-700/80 pt-4 text-xs leading-6 text-slate-400">
          {tr(locale, "By signing in, you agree to our", "Входя в систему, вы соглашаетесь с")}{" "}
          <Link
            href="/terms"
            className="font-semibold text-slate-200 underline underline-offset-4 transition hover:text-white"
          >
            {tr(locale, "Terms", "Условиями")}
          </Link>{" "}
          {tr(locale, "and", "и")}{" "}
          <Link
            href="/privacy"
            className="font-semibold text-slate-200 underline underline-offset-4 transition hover:text-white"
          >
            {tr(locale, "Privacy Policy", "Политикой конфиденциальности")}
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
