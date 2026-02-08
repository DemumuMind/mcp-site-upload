"use server";

import { getSupabaseServerUser } from "@/lib/supabase/auth-server";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { getSubmissionSchema, type SubmissionInput } from "@/lib/submission-schema";

export type SubmissionActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: Partial<Record<keyof SubmissionInput, string>>;
};

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function submitServerAction(
  input: SubmissionInput,
): Promise<SubmissionActionResult> {
  const locale = await getLocale();
  const submissionSchema = getSubmissionSchema(locale);
  const parsedSubmission = submissionSchema.safeParse(input);

  if (!parsedSubmission.success) {
    const fieldErrors = Object.fromEntries(
      Object.entries(parsedSubmission.error.flatten().fieldErrors).map(
        ([field, errors]) => [field, errors?.[0] ?? tr(locale, "Invalid value", "Invalid value")],
      ),
    );

    return {
      success: false,
      message: tr(
        locale,
        "Validation failed. Please check highlighted fields.",
        "Validation failed. Please check highlighted fields.",
      ),
      fieldErrors: fieldErrors as Partial<Record<keyof SubmissionInput, string>>,
    };
  }

  const data = parsedSubmission.data;
  const { supabaseClient, user } = await getSupabaseServerUser();

  if (!supabaseClient) {
    return {
      success: false,
      message: tr(
        locale,
        "Auth is not configured. Set Supabase environment variables before submitting.",
        "Auth is not configured. Set Supabase environment variables before submitting.",
      ),
    };
  }

  if (!user) {
    return {
      success: false,
      message: tr(
        locale,
        "Login / Sign in is required before submitting a server.",
        "Login / Sign in is required before submitting a server.",
      ),
    };
  }

  const { error } = await supabaseClient.from("servers").insert({
    name: data.name,
    slug: toSlug(data.name),
    description: data.description,
    server_url: data.serverUrl,
    category: data.category,
    auth_type: data.authType,
    repo_url: data.repoUrl || null,
    maintainer: {
      name: data.maintainerName,
      email: data.maintainerEmail,
    },
    owner_user_id: user.id,
    status: "pending",
    verification_level: "community",
    tags: [],
  });

  if (error) {
    return {
      success: false,
      message:
        tr(locale, "Submission failed", "Submission failed") + `: ${error.message}`,
    };
  }

  return {
    success: true,
    message: tr(
      locale,
      "Server submitted successfully. Status: pending moderation.",
      "Server submitted successfully. Status: pending moderation.",
    ),
  };
}
