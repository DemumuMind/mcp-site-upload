"use client";

import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, LoaderCircle, LogIn, Send } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { useSubmitServerWizardController } from "@/components/submit-server-wizard/use-submit-server-wizard-controller";
import { SubmitStepBasics } from "@/components/submit-server/steps/step-basics";
import { SubmitStepReview } from "@/components/submit-server/steps/step-review";
import { SubmitStepTechnical } from "@/components/submit-server/steps/step-technical";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSupabaseUser } from "@/hooks/use-supabase-user";
import { tr } from "@/lib/i18n";

export function SubmitServerWizard() {
  const locale = useLocale();
  const { isConfigured, isLoading, user } = useSupabaseUser();

  const {
    form,
    step,
    restoredDraftAt,
    isPending,
    submittedMessage,
    submittedSlug,
    isAuthenticated,
    goNext,
    goBack,
    handleFinalSubmit,
    wizardSteps,
  } = useSubmitServerWizardController(locale, isConfigured, user ? { id: user.id } : null);

  return (
    <div id="submit" className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        {wizardSteps.map((item, index) => {
          const currentIndex = step;
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div
              key={item.title}
              className={[
                "rounded-xl border p-4 transition",
                isCurrent
                  ? "border-primary/40 bg-primary/10"
                  : isCompleted
                    ? "border-primary/30 bg-primary/10"
                    : "border-border bg-card",
              ].join(" ")}
            >
              <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                {tr(locale, `Step ${index + 1}`, `Step ${index + 1}`)}
              </p>
              <p className="mt-1 text-base font-medium text-foreground">{item.title}</p>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">{item.description}</p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge className="border-primary/30 bg-primary/10 text-primary">
          {isLoading
            ? tr(locale, "Checking session...", "Checking session...")
            : isAuthenticated
              ? tr(locale, "Authenticated: final submit is enabled", "Authenticated: final submit is enabled")
              : tr(locale, "Guest mode: sign in only on final submit", "Guest mode: sign in only on final submit")}
        </Badge>
        {restoredDraftAt ? (
          <Badge className="border-border bg-card text-muted-foreground">
            {tr(locale, "Draft restored", "Draft restored")}: {restoredDraftAt}
          </Badge>
        ) : null}
      </div>

      {!isConfigured ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-medium">{tr(locale, "Auth is not configured", "Auth is not configured")}</p>
          <p className="mt-1">
            {tr(
              locale,
              "Set NEXT_PUBLIC_SUPABASE_URL and a Supabase publishable key (NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) to enable final submissions.",
              "Set NEXT_PUBLIC_SUPABASE_URL and a Supabase publishable key (NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) to enable final submissions.",
            )}
          </p>
        </div>
      ) : null}

      {submittedMessage ? (
        <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
          <p className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="size-4" />
            {submittedMessage}
          </p>
          <p className="mt-2 text-primary/90">
            {submittedSlug
              ? tr(locale, `Server slug: ${submittedSlug}`, `Server slug: ${submittedSlug}`)
              : tr(locale, "Track moderation status from your account page.", "Track moderation status from your account page.")}
          </p>
        </div>
      ) : null}

      <div className="rounded-2xl border border-border bg-card p-5">
        {step === 0 ? <SubmitStepBasics form={form} locale={locale} /> : null}
        {step === 1 ? <SubmitStepTechnical form={form} locale={locale} /> : null}
        {step === 2 ? <SubmitStepReview locale={locale} values={form.getValues()} isAuthenticated={isAuthenticated} /> : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          className="border-border bg-card text-foreground hover:bg-accent"
          onClick={goBack}
          disabled={step === 0 || isPending}
        >
          <ChevronLeft className="size-4" />
          {tr(locale, "Back", "Back")}
        </Button>

        {step < 2 ? (
          <Button
            type="button"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => void goNext()}
            disabled={isPending}
          >
            {tr(locale, "Continue", "Continue")}
            <ChevronRight className="size-4" />
          </Button>
        ) : (
          <Button
            type="button"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => void handleFinalSubmit()}
            disabled={isPending}
          >
            {isPending ? <LoaderCircle className="size-4 animate-spin" /> : isAuthenticated ? <Send className="size-4" /> : <LogIn className="size-4" />}
            {isAuthenticated
              ? tr(locale, "Submit for moderation", "Submit for moderation")
              : tr(locale, "Sign in and submit", "Sign in and submit")}
          </Button>
        )}
      </div>

      <p className="flex items-start gap-2 text-xs leading-6 text-muted-foreground">
        <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
        {tr(
          locale,
          "Your draft stays in this browser until you submit or reset it. Review your data before final submit.",
          "Your draft stays in this browser until you submit or reset it. Review your data before final submit.",
        )}
      </p>
    </div>
  );
}
