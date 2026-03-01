"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useLocale } from "@/components/locale-provider";
import {
  AuthNotConfiguredPanel,
  getAuthErrorMessage,
  LoadingSignInPanel,
  SignedInPanel,
} from "@/components/auth-sign-in-panel/panel-states";
import {
  AuthHeroIntro,
  AuthLegalFooter,
  EmailAuthFormSection,
  OAuthButtonsSection,
} from "@/components/auth-sign-in-panel/sections";
import { useEmailAuthController } from "@/components/auth-sign-in-panel/use-email-auth";
import { Button } from "@/components/ui/button";
import { useSupabaseUser } from "@/hooks/use-supabase-user";
import { normalizeInternalPath } from "@/lib/auth-redirects";
import { tr } from "@/lib/i18n";

type AuthSignInPanelProps = {
  nextPath: string;
  errorCode?: string;
  authErrorCode?: string;
  authErrorDescription?: string;
};

export function AuthSignInPanel({
  nextPath,
  errorCode,
  authErrorCode,
  authErrorDescription,
}: AuthSignInPanelProps) {
  const locale = useLocale();
  const hasMounted = useSyncExternalStore(
    onStoreChange => {
      onStoreChange();
      return () => undefined;
    },
    () => true,
    () => false,
  );
  const safeNextPath = useMemo(() => normalizeInternalPath(nextPath), [nextPath]);
  const callbackErrorMessage = useMemo(
    () => getAuthErrorMessage(locale, errorCode, authErrorCode, authErrorDescription),
    [authErrorCode, authErrorDescription, errorCode, locale],
  );
  const isEmailLinkError = authErrorCode === "otp_expired" || authErrorCode === "access_denied";
  const { isConfigured, isLoading, user } = useSupabaseUser();
  const controller = useEmailAuthController({ locale, safeNextPath });

  const oauthButtonClass =
    "h-12 w-full justify-start rounded-xl border border-border/60 bg-card px-4 text-left text-sm font-semibold text-foreground transition hover:border-primary/50 hover:bg-accent focus-visible:ring-primary/40";
  const primaryActionButtonClass = "h-11 w-full rounded-xl bg-primary text-primary-foreground transition hover:bg-primary/90";

  if (!hasMounted) {
    return <LoadingSignInPanel locale={locale} />;
  }

  if (!isConfigured) {
    return <AuthNotConfiguredPanel locale={locale} />;
  }

  if (user) {
    return (
      <SignedInPanel
        locale={locale}
        safeNextPath={safeNextPath}
        email={user.email}
        onSignOut={() => void controller.signOut()}
      />
    );
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-[0_24px_56px_-36px_hsl(var(--foreground)/0.35)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
      <div className="relative p-6 sm:p-10">
        <AuthHeroIntro
          locale={locale}
          description={tr(
            locale,
            "Sign in to submit MCP servers and manage your integrations.",
            "Sign in to submit MCP servers and manage your integrations.",
          )}
        />

        {callbackErrorMessage ? (
          <p className="mt-5 rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-100">
            {callbackErrorMessage}
          </p>
        ) : null}

        {isEmailLinkError ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-amber-300/40 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-100">
            <span>
              {tr(
                locale,
                "Enter your email and request a fresh confirmation link.",
                "Enter your email and request a fresh confirmation link.",
              )}
            </span>
            <Button
              type="button"
              variant="outline"
              className="h-8 rounded-lg border-amber-200/40 bg-transparent px-3 text-amber-100 hover:bg-amber-500/15"
              disabled={!controller.emailAuthValues.email.trim()}
              onClick={() => {
                if (typeof window === "undefined") return;
                window.location.assign(
                  controller.getCheckEmailPath("signup", controller.emailAuthValues.email.trim()),
                );
              }}
            >
              {tr(locale, "Open check-email page", "Open check-email page")}
            </Button>
          </div>
        ) : null}

        {controller.oauthProviderMessage ? (
          <p className="mt-3 rounded-xl border border-amber-300/45 bg-amber-400/10 px-3 py-2.5 text-sm text-amber-100">
            {controller.oauthProviderMessage}
          </p>
        ) : null}

        {isLoading ? (
          <p className="mt-3 text-xs text-muted-foreground/70">
            {tr(locale, "Checking your session...", "Checking your session...")}
          </p>
        ) : null}

        <OAuthButtonsSection
          locale={locale}
          pendingOAuthProvider={controller.pendingOAuthProvider}
          isEmailPending={controller.isEmailPending}
          onSignInWithProvider={provider => void controller.signInWithProvider(provider)}
          oauthButtonClass={oauthButtonClass}
        />

        <EmailAuthFormSection
          locale={locale}
          emailAuthMode={controller.emailAuthMode}
          isSignUpMode={controller.isSignUpMode}
          isResetRequestMode={controller.isResetRequestMode}
          emailAuthValues={controller.emailAuthValues}
          emailAuthErrors={controller.emailAuthErrors}
          emailPasswordStrengthScore={controller.emailPasswordStrengthScore}
          signupChecklistItems={controller.signupChecklistItems}
          isEmailPending={controller.isEmailPending}
          pendingOAuthProvider={controller.pendingOAuthProvider}
          primaryActionButtonClass={primaryActionButtonClass}
          updateEmailField={controller.updateEmailField}
          onSubmit={controller.submitEmailAuth}
          onSwitchMode={controller.switchEmailAuthMode}
        />

        {controller.emailMessage ? (
          <p className="mt-4 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2.5 text-sm text-primary">
            {controller.emailMessage}
          </p>
        ) : null}

        <AuthLegalFooter locale={locale} />
      </div>
    </section>
  );
}
