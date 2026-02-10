"use server";

import { sendSubmissionReceivedEmail } from "@/lib/email/notifications";
import { getSupabaseServerUser } from "@/lib/supabase/auth-server";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { getSubmissionSchema, type SubmissionInput } from "@/lib/submission-schema";

export type SubmissionActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: Partial<Record<keyof SubmissionInput, string>>;
};

const SLUG_FALLBACK_PREFIX = "server";

function toSlug(name: string): string {
  const normalized = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (normalized) {
    return normalized;
  }

  return `${SLUG_FALLBACK_PREFIX}-${crypto.randomUUID().slice(0, 8)}`;
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
        ([field, errors]) => [field, errors?.[0] ?? tr(locale, "Invalid value", "Неверное значение")],
      ),
    );

    return {
      success: false,
      message: tr(
        locale,
        "Validation failed. Please check highlighted fields.",
        "Ошибка валидации. Проверьте поля с ошибками.",
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
        "Авторизация не настроена. Проверьте переменные окружения Supabase перед отправкой.",
      ),
    };
  }

  if (!user) {
    return {
      success: false,
      message: tr(
        locale,
        "Login / Sign in is required before submitting a server.",
        "Перед отправкой сервера нужно войти в аккаунт.",
      ),
    };
  }

  const serverSlug = toSlug(data.name);

  const { error } = await supabaseClient.from("servers").insert({
    name: data.name,
    slug: serverSlug,
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
    if (error.code === "23505") {
      return {
        success: false,
        message: tr(
          locale,
          "A server with a similar name already exists. Please use a more specific name.",
          "Сервер с похожим названием уже существует. Используйте более уникальное имя.",
        ),
      };
    }

    return {
      success: false,
      message: tr(
        locale,
        "Submission failed. Please try again later.",
        "Не удалось отправить заявку. Попробуйте позже.",
      ),
    };
  }

  const recipientEmail = user.email || data.maintainerEmail;

  const emailResult = await sendSubmissionReceivedEmail({
    locale,
    recipientEmail,
    serverName: data.name,
    serverSlug,
    category: data.category,
    authType: data.authType,
  });

  if (!emailResult.sent && !emailResult.skipped) {
    console.error("[submitServerAction] Failed to send submission email:", emailResult.reason);
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
