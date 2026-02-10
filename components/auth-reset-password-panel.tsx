"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabaseUser } from "@/hooks/use-supabase-user";
import { tr } from "@/lib/i18n";
import { getPasswordStrengthScore, type PasswordStrengthScore } from "@/lib/password-strength";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const PASSWORD_MIN_LENGTH = 8;
const REDIRECT_DELAY_SECONDS = 5;

type ResetValues = {
  newPassword: string;
  confirmPassword: string;
};

type ResetErrors = Partial<Record<keyof ResetValues, string>>;

function validateResetValues(locale: "en" | "ru", values: ResetValues): ResetErrors {
  const errors: ResetErrors = {};

  if (!values.newPassword) {
    errors.newPassword = tr(locale, "Password is required.", "Укажите пароль.");
  } else if (values.newPassword.length < PASSWORD_MIN_LENGTH) {
    errors.newPassword = tr(
      locale,
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
      `Пароль должен быть не короче ${PASSWORD_MIN_LENGTH} символов.`,
    );
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = tr(locale, "Please confirm your password.", "Подтвердите пароль.");
  } else if (values.confirmPassword !== values.newPassword) {
    errors.confirmPassword = tr(locale, "Passwords do not match.", "Пароли не совпадают.");
  }

  return errors;
}

function hasValidationErrors(errors: ResetErrors): boolean {
  return Object.values(errors).some(Boolean);
}

function getStrengthLabel(locale: "en" | "ru", score: PasswordStrengthScore): string {
  if (score <= 1) {
    return tr(locale, "Weak password", "Слабый пароль");
  }

  if (score === 2) {
    return tr(locale, "Medium password", "Средний пароль");
  }

  if (score === 3) {
    return tr(locale, "Good password", "Хороший пароль");
  }

  return tr(locale, "Strong password", "Сильный пароль");
}

function getStrengthColorClass(score: PasswordStrengthScore): string {
  if (score <= 1) {
    return "bg-rose-400/90";
  }

  if (score === 2) {
    return "bg-amber-400/90";
  }

  if (score === 3) {
    return "bg-sky-400/90";
  }

  return "bg-emerald-400/90";
}

function getStrengthTextClass(score: PasswordStrengthScore): string {
  if (score <= 1) {
    return "text-rose-300";
  }

  if (score === 2) {
    return "text-amber-300";
  }

  if (score === 3) {
    return "text-sky-300";
  }

  return "text-emerald-300";
}

export function AuthResetPasswordPanel() {
  const router = useRouter();
  const locale = useLocale();
  const { isConfigured, isLoading, user } = useSupabaseUser();
  const [values, setValues] = useState<ResetValues>({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<ResetErrors>({});
  const [isPending, setIsPending] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_DELAY_SECONDS);
  const passwordStrengthScore = useMemo(
    () => getPasswordStrengthScore(values.newPassword),
    [values.newPassword],
  );

  useEffect(() => {
    if (!isCompleted) {
      return;
    }

    const countdownInterval = window.setInterval(() => {
      setSecondsLeft((previousValue) => (previousValue > 0 ? previousValue - 1 : 0));
    }, 1000);

    const redirectTimer = window.setTimeout(() => {
      router.replace("/auth");
    }, REDIRECT_DELAY_SECONDS * 1000);

    return () => {
      window.clearInterval(countdownInterval);
      window.clearTimeout(redirectTimer);
    };
  }, [isCompleted, router]);

  function updateField(field: keyof ResetValues, value: string) {
    setValues((previousState) => ({
      ...previousState,
      [field]: value,
    }));

    setErrors((previousState) => {
      if (!previousState[field]) {
        return previousState;
      }

      const nextState = { ...previousState };
      delete nextState[field];
      return nextState;
    });
  }

  async function submitPasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabaseClient = createSupabaseBrowserClient();

    if (!supabaseClient) {
      return;
    }

    const validationErrors = validateResetValues(locale, values);
    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setIsPending(true);
    setErrors({});
    setIsCompleted(false);

    const { error } = await supabaseClient.auth.updateUser({
      password: values.newPassword,
    });

    setIsPending(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setValues({
      newPassword: "",
      confirmPassword: "",
    });
    setSecondsLeft(REDIRECT_DELAY_SECONDS);
    setIsCompleted(true);
    toast.success(tr(locale, "Password updated.", "Пароль обновлен."));
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
              "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to reset passwords.",
              "Задайте NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY, чтобы включить сброс пароля.",
            )}
          </p>
          <Button
            asChild
            className="mt-6 h-10 rounded-xl bg-amber-300 text-slate-950 hover:bg-amber-200"
          >
            <Link href="/auth">{tr(locale, "Open login page", "Открыть страницу входа")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-700/80 bg-slate-950 p-6 shadow-[0_24px_56px_-36px_rgba(2,6,23,0.9)] sm:p-8">
        <p className="text-sm text-slate-300">
          {tr(locale, "Checking recovery session...", "Проверяем сессию восстановления...")}
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-700/80 bg-slate-950 p-6 shadow-[0_24px_56px_-36px_rgba(2,6,23,0.9)] sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-100">
          {tr(locale, "Recovery session is missing", "Сессия восстановления не найдена")}
        </h1>
        <p className="mt-3 text-sm text-slate-300">
          {tr(
            locale,
            "Open the reset link from your email first, or request a new reset email on the login page.",
            "Сначала откройте ссылку из письма для восстановления или запросите новое письмо на странице входа.",
          )}
        </p>
        <Button asChild className="mt-6 h-10 rounded-xl bg-slate-100 text-slate-950 hover:bg-white">
          <Link href="/auth">{tr(locale, "Back to login", "Вернуться ко входу")}</Link>
        </Button>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-700/80 bg-[linear-gradient(180deg,rgba(15,23,42,0.96)_0%,rgba(2,6,23,0.98)_100%)] shadow-[0_30px_72px_-50px_rgba(2,6,23,0.95)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/35 to-transparent" />
        <div className="relative p-6 sm:p-10">
          <span className="inline-flex rounded-full border border-emerald-500/45 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-200">
            {tr(locale, "Password updated", "Пароль обновлен")}
          </span>
          <div className="mt-4 flex items-center gap-3">
            <CheckCircle2 className="size-6 text-emerald-300" />
            <h1 className="text-2xl font-semibold text-slate-50 sm:text-3xl">
              {tr(locale, "Success! Your password is ready.", "Готово! Пароль успешно изменен.")}
            </h1>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200/85 sm:text-base">
            {tr(
              locale,
              "You will be redirected to login automatically.",
              "Вы будете автоматически перенаправлены на страницу входа.",
            )}{" "}
            {tr(locale, "Redirect in", "Переход через")} {secondsLeft}
            {tr(locale, "s.", " сек.")}
          </p>
          <div className="mt-5">
            <Button
              type="button"
              className="h-10 rounded-xl bg-slate-100 text-slate-950 hover:bg-white"
              onClick={() => router.replace("/auth")}
            >
              {tr(locale, "Go to login now", "Перейти ко входу сейчас")}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-700/80 bg-[linear-gradient(180deg,rgba(15,23,42,0.96)_0%,rgba(2,6,23,0.98)_100%)] shadow-[0_30px_72px_-50px_rgba(2,6,23,0.95)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/35 to-transparent" />
      <div className="relative p-6 sm:p-10">
        <span className="inline-flex rounded-full border border-slate-500/65 bg-slate-900/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-200">
          {tr(locale, "Password recovery", "Восстановление пароля")}
        </span>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
          {tr(locale, "Set a new password", "Задайте новый пароль")}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200/85 sm:text-base">
          {tr(
            locale,
            "This page is linked to your recovery email. Enter and confirm your new password.",
            "Эта страница привязана к письму восстановления. Введите и подтвердите новый пароль.",
          )}
        </p>

        <form
          className="mt-6 grid gap-3 rounded-2xl border border-slate-700/80 bg-slate-950/70 p-4 sm:p-5"
          onSubmit={submitPasswordReset}
        >
          <div className="space-y-1.5">
            <Label htmlFor="newPassword" className="text-sm text-slate-200">
              {tr(locale, "New password", "Новый пароль")}
            </Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              required
              value={values.newPassword}
              onChange={(event) => updateField("newPassword", event.target.value)}
              placeholder={tr(
                locale,
                `At least ${PASSWORD_MIN_LENGTH} characters`,
                `Не менее ${PASSWORD_MIN_LENGTH} символов`,
              )}
              className="h-11 rounded-xl border-slate-600 bg-slate-900/90 text-slate-100 placeholder:text-slate-500 focus-visible:ring-slate-300/35"
            />
            {values.newPassword ? (
              <div className="space-y-1.5">
                <div className="grid grid-cols-4 gap-1">
                  {[0, 1, 2, 3].map((index) => (
                    <span
                      key={index}
                      className={`h-1.5 rounded-full ${
                        index < passwordStrengthScore
                          ? getStrengthColorClass(passwordStrengthScore)
                          : "bg-slate-700/80"
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs ${getStrengthTextClass(passwordStrengthScore)}`}>
                  {getStrengthLabel(locale, passwordStrengthScore)}
                </p>
              </div>
            ) : null}
            {errors.newPassword ? <p className="text-xs text-rose-300">{errors.newPassword}</p> : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm text-slate-200">
              {tr(locale, "Confirm password", "Подтвердите пароль")}
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={values.confirmPassword}
              onChange={(event) => updateField("confirmPassword", event.target.value)}
              placeholder={tr(locale, "Repeat password", "Повторите пароль")}
              className="h-11 rounded-xl border-slate-600 bg-slate-900/90 text-slate-100 placeholder:text-slate-500 focus-visible:ring-slate-300/35"
            />
            {errors.confirmPassword ? (
              <p className="text-xs text-rose-300">{errors.confirmPassword}</p>
            ) : null}
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="h-11 rounded-xl bg-slate-100 text-slate-950 transition hover:bg-white"
          >
            {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {tr(locale, "Update password", "Обновить пароль")}
          </Button>
        </form>

        <p className="mt-5 text-xs text-slate-400">
          <Link href="/auth" className="underline underline-offset-4 transition hover:text-white">
            {tr(locale, "Back to login", "Вернуться ко входу")}
          </Link>
        </p>
      </div>
    </section>
  );
}
