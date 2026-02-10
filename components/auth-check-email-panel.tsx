"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, MailCheck } from "lucide-react";
import { toast } from "sonner";

import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import {
  buildAuthCallbackRedirect,
  buildResetPasswordRedirect,
  normalizeInternalPath,
  type AuthCheckEmailFlow,
} from "@/lib/auth-redirects";
import { tr } from "@/lib/i18n";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const RESEND_COOLDOWN_SECONDS = 30;

type AuthCheckEmailPanelProps = {
  flow: AuthCheckEmailFlow;
  email: string;
  nextPath: string;
};

function maskEmail(email: string): string {
  const normalizedEmail = email.trim();
  const [localPart, domain] = normalizedEmail.split("@");

  if (!localPart || !domain) {
    return normalizedEmail;
  }

  if (localPart.length <= 2) {
    return `${localPart[0] || "*"}*@${domain}`;
  }

  const prefix = localPart[0];
  const suffix = localPart.slice(-1);
  const hidden = "*".repeat(Math.max(1, localPart.length - 2));

  return `${prefix}${hidden}${suffix}@${domain}`;
}

export function AuthCheckEmailPanel({ flow, email, nextPath }: AuthCheckEmailPanelProps) {
  const locale = useLocale();
  const safeNextPath = useMemo(() => normalizeInternalPath(nextPath), [nextPath]);
  const [isResending, setIsResending] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const maskedEmail = useMemo(() => maskEmail(email), [email]);
  const loginPath = useMemo(() => {
    if (safeNextPath === "/") {
      return "/auth";
    }

    return `/auth?next=${encodeURIComponent(safeNextPath)}`;
  }, [safeNextPath]);

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCooldownSeconds((previousState) => Math.max(0, previousState - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [cooldownSeconds]);

  async function resendEmail() {
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      toast.error(
        tr(
          locale,
          "Email is missing. Go back to login and request again.",
          "Email не указан. Вернитесь на страницу входа и отправьте запрос заново.",
        ),
      );
      return;
    }

    const supabaseClient = createSupabaseBrowserClient();
    if (!supabaseClient) {
      toast.error(
        tr(
          locale,
          "Auth client is not configured.",
          "Клиент авторизации не настроен.",
        ),
      );
      return;
    }

    setIsResending(true);

    if (flow === "signup") {
      const redirectTo =
        typeof window !== "undefined"
          ? buildAuthCallbackRedirect(window.location.origin, safeNextPath)
          : undefined;
      const { error } = await supabaseClient.auth.resend({
        type: "signup",
        email: normalizedEmail,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      setIsResending(false);

      if (error) {
        toast.error(error.message);
        return;
      }

      setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
      toast.success(
        tr(
          locale,
          "Confirmation email sent again.",
          "Письмо подтверждения отправлено повторно.",
        ),
      );
      return;
    }

    const redirectTo =
      typeof window !== "undefined" ? buildResetPasswordRedirect(window.location.origin) : undefined;
    const { error } = await supabaseClient.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo,
    });

    setIsResending(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
    toast.success(
      tr(
        locale,
        "Reset email sent again.",
        "Письмо для сброса отправлено повторно.",
      ),
    );
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-700/80 bg-[linear-gradient(180deg,rgba(15,23,42,0.96)_0%,rgba(2,6,23,0.98)_100%)] shadow-[0_30px_72px_-50px_rgba(2,6,23,0.95)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/35 to-transparent" />
      <div className="relative p-6 sm:p-10">
        <span className="inline-flex rounded-full border border-slate-500/65 bg-slate-900/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-200">
          {flow === "signup"
            ? tr(locale, "Confirm your email", "Подтвердите email")
            : tr(locale, "Reset link sent", "Ссылка для сброса отправлена")}
        </span>

        <div className="mt-4 flex items-center gap-3">
          <MailCheck className="size-6 text-sky-300" />
          <h1 className="text-2xl font-semibold text-slate-50 sm:text-3xl">
            {flow === "signup"
              ? tr(locale, "Check your inbox", "Проверьте почту")
              : tr(locale, "Check your email for reset link", "Проверьте письмо со ссылкой для сброса")}
          </h1>
        </div>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200/85 sm:text-base">
          {flow === "signup"
            ? tr(
                locale,
                "We sent a confirmation link. Open it to finish account registration.",
                "Мы отправили ссылку подтверждения. Откройте ее, чтобы завершить регистрацию.",
              )
            : tr(
                locale,
                "We sent a password reset link. Open it to set a new password.",
                "Мы отправили ссылку для сброса пароля. Откройте ее, чтобы задать новый пароль.",
              )}{" "}
          {email.trim()
            ? tr(locale, `Email: ${maskedEmail}.`, `Email: ${maskedEmail}.`)
            : tr(
                locale,
                "If needed, request another email from the button below.",
                "Если нужно, отправьте письмо повторно кнопкой ниже.",
              )}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={() => {
              void resendEmail();
            }}
            disabled={isResending || cooldownSeconds > 0}
            className="h-10 rounded-xl bg-slate-100 text-slate-950 hover:bg-white"
          >
            {isResending ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {cooldownSeconds > 0
              ? tr(
                  locale,
                  `Resend in ${cooldownSeconds}s`,
                  `Повторно через ${cooldownSeconds}с`,
                )
              : flow === "signup"
                ? tr(locale, "Resend confirmation email", "Отправить письмо подтверждения повторно")
                : tr(locale, "Resend reset email", "Отправить письмо для сброса повторно")}
          </Button>

          <Button
            asChild
            type="button"
            variant="outline"
            className="h-10 rounded-xl border-slate-600/70 bg-slate-900/70 hover:bg-slate-900"
          >
            <Link href={loginPath}>{tr(locale, "Back to login", "Вернуться ко входу")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
