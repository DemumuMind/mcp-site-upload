"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { submitServerAction } from "@/app/actions";
import { getSubmissionSchema, type SubmissionInput } from "@/lib/submission-schema";
import { tr, type Locale } from "@/lib/i18n";

export const defaultFormValues: SubmissionInput = {
  name: "",
  serverUrl: "",
  category: "",
  authType: "oauth",
  description: "",
  maintainerName: "",
  maintainerEmail: "",
  repoUrl: "",
};

export const DRAFT_STORAGE_KEY = "demumumind-submit-server-draft-v2";

export const wizardSteps = [
  { title: "Basics", description: "Identity and short product context." },
  { title: "Technical", description: "Endpoints, auth model, and maintainer info." },
  { title: "Review", description: "Final review and submit to moderation." },
] as const;

type WizardDraftState = {
  step: number;
  values: SubmissionInput;
  updatedAt: string;
};

function clampStep(step: number): 0 | 1 | 2 {
  if (step <= 0) return 0;
  if (step === 1) return 1;
  return 2;
}

function parseDraftState(raw: string | null): WizardDraftState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<WizardDraftState> | null;
    if (!parsed || typeof parsed !== "object" || !parsed.values) return null;
    return {
      step: Number.isFinite(parsed.step) ? Number(parsed.step) : 0,
      values: { ...defaultFormValues, ...parsed.values },
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function useSubmitServerWizardController(locale: Locale, isConfigured: boolean, user: { id: string } | null) {
  const router = useRouter();
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
        form.reset({ ...defaultFormValues, ...draft.values });
      }
      setIsDraftHydrated(true);
    }, 0);
    return () => window.clearTimeout(applyDraftTimer);
  }, [form]);

  useEffect(() => {
    if (!isDraftHydrated || submittedMessage) return;
    const payload: WizardDraftState = {
      step,
      values: { ...defaultFormValues, ...watchedValues },
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
      if (!isValid) return;
      setStep(1);
      return;
    }
    if (step === 1) {
      const isValid = await form.trigger(["serverUrl", "authType", "repoUrl", "maintainerName", "maintainerEmail"], { shouldFocus: true });
      if (!isValid) return;
      setStep(2);
    }
  }

  function goBack() {
    if (step === 0) return;
    setStep(current => clampStep(current - 1));
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
            if (!errorMessage) continue;
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

  return {
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
  };
}
