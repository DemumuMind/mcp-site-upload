"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
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
  accessToken?: string | null,
): Promise<SubmissionActionResult> {
  const locale = await getLocale();
  const submissionSchema = getSubmissionSchema(locale);
  const parsedSubmission = submissionSchema.safeParse(input);

  if (!parsedSubmission.success) {
    const fieldErrors = Object.fromEntries(
      Object.entries(parsedSubmission.error.flatten().fieldErrors).map(
        ([field, errors]) => [field, errors?.[0] ?? tr(locale, "Invalid value", "Некорректное значение")],
      ),
    );

    return {
      success: false,
      message: tr(
        locale,
        "Validation failed. Please check highlighted fields.",
        "Проверка не пройдена. Исправьте выделенные поля.",
      ),
      fieldErrors: fieldErrors as Partial<Record<keyof SubmissionInput, string>>,
    };
  }

  const data = parsedSubmission.data;
  const supabaseClient = createSupabaseServerClient();

  if (!supabaseClient) {
    return {
      success: true,
      message: tr(
        locale,
        "Submission accepted in local mode. Configure Supabase env vars to persist records.",
        "Заявка принята в локальном режиме. Настройте переменные Supabase для сохранения данных.",
      ),
    };
  }

  if (!accessToken) {
    return {
      success: false,
      message: tr(
        locale,
        "Login / Sign in is required before submitting a server.",
        "Перед отправкой сервера необходимо войти в аккаунт.",
      ),
    };
  }

  const { data: authData, error: authError } =
    await supabaseClient.auth.getUser(accessToken);

  if (authError || !authData.user) {
    return {
      success: false,
      message: tr(
        locale,
        "Session expired or invalid. Please sign in again.",
        "Сессия истекла или недействительна. Войдите снова.",
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
    status: "pending",
    verification_level: "community",
    tags: [],
  });

  if (error) {
    return {
      success: false,
      message: tr(locale, "Submission failed", "Отправка не удалась") + `: ${error.message}`,
    };
  }

  return {
    success: true,
    message: tr(
      locale,
      "Server submitted successfully. Status: pending moderation.",
      "Сервер успешно отправлен. Статус: ожидает модерации.",
    ),
  };
}
