"use server";

import {
  getAccountPasswordSchema,
  getAccountProfileSchema,
  type AccountPasswordInput,
  type AccountProfileInput,
} from "@/lib/account-profile-schema";
import { createSupabaseServerAuthClient } from "@/lib/supabase/auth-server";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

type AccountProfileActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: Partial<Record<keyof AccountProfileInput, string>>;
  profile?: AccountProfileInput;
};

type AccountPasswordActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: Partial<Record<keyof AccountPasswordInput, string>>;
};

function getFirstFieldErrors<T extends string>(
  fieldErrors: Partial<Record<T, string[] | undefined>>,
): Partial<Record<T, string>> {
  const nextFieldErrors: Partial<Record<T, string>> = {};

  for (const [field, value] of Object.entries(fieldErrors) as [T, string[] | undefined][]) {
    if (!Array.isArray(value) || value.length === 0) {
      continue;
    }

    nextFieldErrors[field] = value[0] ?? "";
  }

  return nextFieldErrors;
}

async function requireAuthenticatedUser() {
  const supabaseClient = await createSupabaseServerAuthClient();

  if (!supabaseClient) {
    return { supabaseClient: null, user: null };
  }

  const { data, error } = await supabaseClient.auth.getUser();

  if (error || !data.user) {
    return { supabaseClient, user: null };
  }

  return { supabaseClient, user: data.user };
}

export async function updateAccountProfileAction(
  input: AccountProfileInput,
): Promise<AccountProfileActionResult> {
  const locale = await getLocale();
  const profileSchema = getAccountProfileSchema(locale);
  const parsedInput = profileSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      success: false,
      message: tr(
        locale,
        "Please check the highlighted profile fields.",
        "Проверьте поля профиля с ошибками.",
      ),
      fieldErrors: getFirstFieldErrors(parsedInput.error.flatten().fieldErrors),
    };
  }

  const { supabaseClient, user } = await requireAuthenticatedUser();

  if (!supabaseClient) {
    return {
      success: false,
      message: tr(
        locale,
        "Auth is not configured. Set Supabase environment variables.",
        "Авторизация не настроена. Проверьте переменные окружения Supabase.",
      ),
    };
  }

  if (!user) {
    return {
      success: false,
      message: tr(
        locale,
        "You need to sign in before editing your profile.",
        "Перед редактированием профиля нужно войти в аккаунт.",
      ),
    };
  }

  const normalizedProfile = parsedInput.data;
  const currentMetadata =
    user.user_metadata && typeof user.user_metadata === "object" && !Array.isArray(user.user_metadata)
      ? (user.user_metadata as Record<string, unknown>)
      : {};

  const { error } = await supabaseClient.auth.updateUser({
    data: {
      ...currentMetadata,
      full_name: normalizedProfile.fullName || null,
      username: normalizedProfile.username || null,
      avatar_url: normalizedProfile.avatarUrl || null,
      website: normalizedProfile.website || null,
      bio: normalizedProfile.bio || null,
    },
  });

  if (error) {
    return {
      success: false,
      message: tr(
        locale,
        "Could not save profile changes right now.",
        "Сейчас не удалось сохранить изменения профиля.",
      ),
    };
  }

  return {
    success: true,
    message: tr(locale, "Profile updated.", "Профиль обновлён."),
    profile: normalizedProfile,
  };
}

export async function updateAccountPasswordAction(
  input: AccountPasswordInput,
): Promise<AccountPasswordActionResult> {
  const locale = await getLocale();
  const passwordSchema = getAccountPasswordSchema(locale);
  const parsedInput = passwordSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      success: false,
      message: tr(locale, "Please check the password fields.", "Проверьте поля пароля."),
      fieldErrors: getFirstFieldErrors(parsedInput.error.flatten().fieldErrors),
    };
  }

  const { supabaseClient, user } = await requireAuthenticatedUser();

  if (!supabaseClient) {
    return {
      success: false,
      message: tr(
        locale,
        "Auth is not configured. Set Supabase environment variables.",
        "Авторизация не настроена. Проверьте переменные окружения Supabase.",
      ),
    };
  }

  if (!user) {
    return {
      success: false,
      message: tr(
        locale,
        "You need to sign in before changing password.",
        "Перед сменой пароля нужно войти в аккаунт.",
      ),
    };
  }

  const { error } = await supabaseClient.auth.updateUser({
    password: parsedInput.data.newPassword,
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  return {
    success: true,
    message: tr(locale, "Password updated.", "Пароль обновлён."),
  };
}
