"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "@/components/locale-provider";
import { useSupabaseUser } from "@/hooks/use-supabase-user";
import { Button } from "@/components/ui/button";
import { buildResetPasswordRedirect, normalizeInternalPath, type AuthCheckEmailFlow, } from "@/lib/auth-redirects";
import { tr } from "@/lib/i18n";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
const RESEND_COOLDOWN_SECONDS = 30;
type AuthCheckEmailPanelProps = {
    flow: AuthCheckEmailFlow;
    email: string;
    nextPath: string;
};
type ResendFeedback = {
    tone: "success" | "error";
    text: string;
} | null;
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
    const [resendFeedback, setResendFeedback] = useState<ResendFeedback>(null);
    const maskedEmail = useMemo(() => maskEmail(email), [email]);
    const { user } = useSupabaseUser();
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
    const isRedirectingAfterConfirm = Boolean(user && flow === "signup");
    useEffect(() => {
        if (!user || flow !== "signup" || typeof window === "undefined") {
            return;
        }
        const destination = safeNextPath || "/";
        if (window.opener && !window.opener.closed) {
            window.opener.location.href = destination;
            window.close();
            return;
        }
        const timer = window.setTimeout(() => {
            window.location.assign(destination);
        }, 1200);
        return () => window.clearTimeout(timer);
    }, [flow, safeNextPath, user]);
    function getEmailSignupRedirectTo(): string | undefined {
        if (typeof window === "undefined") {
            return undefined;
        }
        return `${window.location.origin}/auth?next=${encodeURIComponent(safeNextPath)}`;
    }
    function getResendErrorMessage(message: string): string {
        const normalizedMessage = message.trim().toLowerCase();
        if (normalizedMessage.includes("rate limit") ||
            normalizedMessage.includes("over_email_send_rate_limit")) {
            return tr(locale, "Email send limit reached. Please wait and try again later (Supabase default SMTP is usually limited to 2 emails/hour).", "Email send limit reached. Please wait and try again later (Supabase default SMTP is usually limited to 2 emails/hour).");
        }
        if (normalizedMessage.includes("email address not authorized") ||
            normalizedMessage.includes("not authorized")) {
            return tr(locale, "This email address is not authorized by the current SMTP setup. Configure custom SMTP in Supabase Auth settings.", "This email address is not authorized by the current SMTP setup. Configure custom SMTP in Supabase Auth settings.");
        }
        return message;
    }
    async function resendEmail() {
        const normalizedEmail = email.trim();
        if (!normalizedEmail) {
            const errorMessage = tr(locale, "Email is missing. Go back to login and request again.", "Email is missing. Go back to login and request again.");
            setResendFeedback({ tone: "error", text: errorMessage });
            toast.error(errorMessage);
            return;
        }
        const supabaseClient = createSupabaseBrowserClient();
        if (!supabaseClient) {
            const errorMessage = tr(locale, "Auth client is not configured.", "Auth client is not configured.");
            setResendFeedback({ tone: "error", text: errorMessage });
            toast.error(errorMessage);
            return;
        }
        setIsResending(true);
        setResendFeedback(null);
        if (flow === "signup") {
            const redirectTo = getEmailSignupRedirectTo();
            const { error } = await supabaseClient.auth.resend({
                type: "signup",
                email: normalizedEmail,
                options: {
                    emailRedirectTo: redirectTo,
                },
            });
            setIsResending(false);
            if (error) {
                const errorMessage = getResendErrorMessage(error.message);
                setResendFeedback({ tone: "error", text: errorMessage });
                toast.error(errorMessage);
                return;
            }
            setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
            const successMessage = tr(locale, "Confirmation email sent again.", "Confirmation email sent again.");
            setResendFeedback({ tone: "success", text: successMessage });
            toast.success(successMessage);
            return;
        }
        const redirectTo = typeof window !== "undefined" ? buildResetPasswordRedirect(window.location.origin) : undefined;
        const { error } = await supabaseClient.auth.resetPasswordForEmail(normalizedEmail, {
            redirectTo,
        });
        setIsResending(false);
        if (error) {
            const errorMessage = getResendErrorMessage(error.message);
            setResendFeedback({ tone: "error", text: errorMessage });
            toast.error(errorMessage);
            return;
        }
        setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
        const successMessage = tr(locale, "Reset email sent again.", "Reset email sent again.");
        setResendFeedback({ tone: "success", text: successMessage });
        toast.success(successMessage);
    }
    return (<section className="relative overflow-hidden rounded-[2rem] border border-blacksmith bg-[linear-gradient(180deg,rgba(15,23,42,0.96)_0%,rgba(2,6,23,0.98)_100%)] shadow-[0_30px_72px_-50px_rgba(2,6,23,0.95)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent"/>
      <div className="relative p-6 sm:p-10">
        <span className="inline-flex rounded-full border border-primary/40 bg-card px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground">
          {flow === "signup"
            ? tr(locale, "Confirm your email", "Confirm your email")
            : tr(locale, "Reset link sent", "Reset link sent")}
        </span>

        <div className="mt-4 flex items-center gap-3">
          <MailCheck className="size-6 text-primary"/>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            {flow === "signup"
            ? tr(locale, "Check your inbox", "Check your inbox")
            : tr(locale, "Check your email for reset link", "Check your email for reset link")}
          </h1>
        </div>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-foreground/85 sm:text-base">
          {flow === "signup"
            ? tr(locale, "We sent a confirmation link. Open it to finish account registration.", "We sent a confirmation link. Open it to finish account registration.")
            : tr(locale, "We sent a password reset link. Open it to set a new password.", "We sent a password reset link. Open it to set a new password.")}{" "}
          {email.trim()
            ? tr(locale, `Email: ${maskedEmail}.`, `Email: ${maskedEmail}.`)
            : tr(locale, "If needed, request another email from the button below.", "If needed, request another email from the button below.")}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" onClick={() => {
            void resendEmail();
        }} disabled={isResending || cooldownSeconds > 0} className="h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary">
            {isResending ? <LoaderCircle className="size-4 animate-spin"/> : null}
            {cooldownSeconds > 0
            ? tr(locale, `Resend in ${cooldownSeconds}s`, `Resend in ${cooldownSeconds}s`)
            : flow === "signup"
                ? tr(locale, "Resend confirmation email", "Resend confirmation email")
                : tr(locale, "Resend reset email", "Resend reset email")}
          </Button>

          <Button asChild type="button" variant="outline" className="h-10 rounded-xl border-blacksmith bg-card hover:bg-accent">
            <Link href={loginPath}>{tr(locale, "Back to login", "Back to login")}</Link>
          </Button>
        </div>

        {resendFeedback ? (<p className={resendFeedback.tone === "error"
                ? "mt-4 rounded-xl border border-rose-300/35 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-100"
                : "mt-4 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2.5 text-sm text-primary"}>
            {resendFeedback.text}
          </p>) : null}
        {isRedirectingAfterConfirm ? (<p className="mt-4 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2.5 text-sm text-primary">
            {tr(locale, "Email confirmed. Redirecting...", "Email confirmed. Redirecting...")}
          </p>) : null}

        <p className="mt-4 text-xs leading-6 text-muted-foreground/80">
          {tr(locale, "Tip: if emails do not arrive, check spam/promotions and review Supabase Auth SMTP + rate-limit settings.", "Tip: if emails do not arrive, check spam/promotions and review Supabase Auth SMTP + rate-limit settings.")}
        </p>
      </div>
    </section>);
}


