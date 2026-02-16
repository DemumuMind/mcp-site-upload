"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, LoaderCircle, LogIn, Send } from "lucide-react";
import { useWatch, useForm } from "react-hook-form";
import { toast } from "sonner";
import { submitServerAction } from "@/app/actions";
import { useLocale } from "@/components/locale-provider";
import { SubmitStepBasics } from "@/components/submit-server/steps/step-basics";
import { SubmitStepReview } from "@/components/submit-server/steps/step-review";
import { SubmitStepTechnical } from "@/components/submit-server/steps/step-technical";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSupabaseUser } from "@/hooks/use-supabase-user";
import { tr } from "@/lib/i18n";
import { getSubmissionSchema, type SubmissionInput } from "@/lib/submission-schema";

const defaultFormValues: SubmissionInput = {
  name: "",
  serverUrl: "",
  category: "",
  authType: "oauth",
  description: "",
  maintainerName: "",
  maintainerEmail: "",
  repoUrl: "",
};

const DRAFT_STORAGE_KEY = "demumumind-submit-server-draft-v2";

const wizardSteps = [
  {
    title: "Basics",
    description: "Identity and short product context.",
  },
  {
    title: "Technical",
    description: "Endpoints, auth model, and maintainer info.",
  },
  {
    title: "Review",
    description: "Final review and submit to moderation.",
  },
] as const;

type WizardDraftState = {
  step: number;
  values: SubmissionInput;
  updatedAt: string;
};

function clampStep(step: number): 0 | 1 | 2 {
  if (step <= 0) {
    return 0;
  }
  if (step === 1) {
    return 1;
  }
  return 2;
}

function parseDraftState(raw: string | null): WizardDraftState | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<WizardDraftState> | null;
    if (!parsed || typeof parsed !== "object" || !parsed.values) {
      return null;
    }

    return {
      step: Number.isFinite(parsed.step) ? Number(parsed.step) : 0,
      values: {
        ...defaultFormValues,
        ...parsed.values,
      },
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function SubmitServerWizard() {
  const locale = useLocale();
  const router = useRouter();
  const { isConfigured, isLoading, user } = useSupabaseUser();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [restoredDraftAt, setRestoredDraftAt] = useState<string | null>(null);
  const [isDraftHydrated, setIsDraftHydrated] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [submittedSlug, setSubmittedSlug] = useState<string | null>(null);
  const submissionSchema = useMemo(() => getSubmissionSchema(locale), [locale]);

  const form = useForm<SubmissionInput>({
    resolver: zodResolver(submissionSchema),
    defaultValues: defaultFormValues,
    mode: "onBlur",
  });

  const watchedValues = useWatch({ control: form.control });
  const isAuthenticated = Boolean(user);

  useEffect(() => {
    const draft = parseDraftState(window.localStorage.getItem(DRAFT_STORAGE_KEY));
    const applyDraftTimer = window.setTimeout(() => {
      if (draft) {
        setStep(clampStep(draft.step));
        setRestoredDraftAt(new Date(draft.updatedAt).toLocaleString("en-US"));
        form.reset({
          ...defaultFormValues,
          ...draft.values,
        });
      }
      setIsDraftHydrated(true);
    }, 0);
    return () => window.clearTimeout(applyDraftTimer);
  }, [form]);

  useEffect(() => {
    if (!isDraftHydrated || submittedMessage) {
      return;
    }

    const payload: WizardDraftState = {
      step,
      values: {
        ...defaultFormValues,
        ...watchedValues,
      },
      updatedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
  }, [isDraftHydrated, step, submittedMessage, watchedValues]);

  function clearDraft() {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    setRestoredDraftAt(null);
  }

  async function goNext() {
    if (step === 0) {
      const isValid = await form.trigger(["name", "category", "description"], { shouldFocus: true });
      if (!isValid) {
        return;
      }
      setStep(1);
      return;
    }

    if (step === 1) {
      const isValid = await form.trigger(["serverUrl", "authType", "repoUrl", "maintainerName", "maintainerEmail"], {
        shouldFocus: true,
      });
      if (!isValid) {
        return;
      }
      setStep(2);
    }
  }

  function goBack() {
    if (step === 0) {
      return;
    }

    setStep((current) => clampStep(current - 1));
  }

  async function handleFinalSubmit() {
    const isValid = await form.trigger(undefined, { shouldFocus: true });
    if (!isValid) {
      toast.error(tr(locale, "Please complete the highlighted fields first.", "Please complete the highlighted fields first."));
      return;
    }

    const values = form.getValues();
    if (!isConfigured) {
      toast.error(
        tr(
          locale,
          "Auth is not configured. Set Supabase environment variables before submitting.",
          "Auth is not configured. Set Supabase environment variables before submitting.",
        ),
      );
      return;
    }

    if (!user) {
      window.localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          step: 2,
          values,
          updatedAt: new Date().toISOString(),
        } satisfies WizardDraftState),
      );
      toast.message(
        tr(
          locale,
          "Sign in required for final submit. Your draft is saved and will restore after login.",
          "Sign in required for final submit. Your draft is saved and will restore after login.",
        ),
      );
      router.push(`/auth?next=${encodeURIComponent("/submit-server#submit")}`);
      return;
    }

    startTransition(async () => {
      const result = await submitServerAction(values);
      if (!result.success) {
        if (result.fieldErrors) {
          for (const [fieldName, errorMessage] of Object.entries(result.fieldErrors)) {
            if (!errorMessage) {
              continue;
            }

            form.setError(fieldName as keyof SubmissionInput, { message: errorMessage });
          }
        }

        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setSubmittedMessage(result.message);
      setSubmittedSlug(result.serverSlug ?? null);
      clearDraft();
      form.reset(defaultFormValues);
      setStep(0);
    });
  }

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
                  ? "border-cyan-400/40 bg-primary/10"
                  : isCompleted
                    ? "border-primary/30 bg-primary/10"
                    : "border-blacksmith bg-card",
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
          <Badge className="border-blacksmith bg-card text-muted-foreground">
            {tr(locale, "Draft restored", "Draft restored")}: {restoredDraftAt}
          </Badge>
        ) : null}
      </div>

      {!isConfigured ? (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
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
        <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm text-primary-foreground">
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

      <div className="rounded-2xl border border-blacksmith bg-card p-5">
        {step === 0 ? <SubmitStepBasics form={form} locale={locale} /> : null}
        {step === 1 ? <SubmitStepTechnical form={form} locale={locale} /> : null}
        {step === 2 ? <SubmitStepReview locale={locale} values={form.getValues()} isAuthenticated={isAuthenticated} /> : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          className="border-blacksmith bg-card text-foreground hover:bg-accent"
          onClick={goBack}
          disabled={step === 0 || isPending}
        >
          <ChevronLeft className="size-4" />
          {tr(locale, "Back", "Back")}
        </Button>

        {step < 2 ? (
          <Button type="button" className="bg-blue-500 hover:bg-blue-400" onClick={() => void goNext()} disabled={isPending}>
            {tr(locale, "Continue", "Continue")}
            <ChevronRight className="size-4" />
          </Button>
        ) : (
          <Button type="button" className="bg-blue-500 hover:bg-blue-400" onClick={() => void handleFinalSubmit()} disabled={isPending}>
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

