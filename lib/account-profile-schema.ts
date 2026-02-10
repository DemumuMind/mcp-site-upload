import { z } from "zod";

import { tr, type Locale } from "@/lib/i18n";

export const ACCOUNT_PASSWORD_MIN_LENGTH = 8;

export type AccountProfileInput = {
  fullName: string;
  username: string;
  avatarUrl: string;
  website: string;
  bio: string;
};

export type AccountPasswordInput = {
  newPassword: string;
  confirmPassword: string;
};

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function getAccountProfileSchema(locale: Locale) {
  return z.object({
    fullName: z
      .string()
      .trim()
      .max(
        80,
        tr(locale, "Name must be at most 80 characters.", "Имя должно быть не длиннее 80 символов."),
      ),
    username: z
      .string()
      .trim()
      .max(
        32,
        tr(
          locale,
          "Username must be at most 32 characters.",
          "Имя пользователя должно быть не длиннее 32 символов.",
        ),
      )
      .refine(
        (value) => value.length === 0 || /^[a-zA-Z0-9_.-]+$/.test(value),
        tr(
          locale,
          "Username can contain only letters, numbers, dot, underscore and hyphen.",
          "Имя пользователя может содержать только буквы, цифры, точку, подчёркивание и дефис.",
        ),
      ),
    avatarUrl: z
      .string()
      .trim()
      .max(
        300,
        tr(locale, "Avatar URL is too long.", "URL аватара слишком длинный."),
      )
      .refine(
        (value) => value.length === 0 || isValidHttpUrl(value),
        tr(
          locale,
          "Enter a valid avatar URL starting with http:// or https://.",
          "Укажите корректный URL аватара, который начинается с http:// или https://.",
        ),
      ),
    website: z
      .string()
      .trim()
      .max(
        200,
        tr(locale, "Website URL is too long.", "URL сайта слишком длинный."),
      )
      .refine(
        (value) => value.length === 0 || isValidHttpUrl(value),
        tr(
          locale,
          "Enter a valid URL starting with http:// or https://.",
          "Укажите корректный URL, который начинается с http:// или https://.",
        ),
      ),
    bio: z
      .string()
      .trim()
      .max(
        240,
        tr(locale, "Bio must be at most 240 characters.", "О себе — максимум 240 символов."),
      ),
  });
}

export function getAccountPasswordSchema(locale: Locale) {
  return z
    .object({
      newPassword: z
        .string()
        .min(
          ACCOUNT_PASSWORD_MIN_LENGTH,
          tr(
            locale,
            `Password must be at least ${ACCOUNT_PASSWORD_MIN_LENGTH} characters.`,
            `Пароль должен быть не короче ${ACCOUNT_PASSWORD_MIN_LENGTH} символов.`,
          ),
        )
        .max(
          72,
          tr(locale, "Password is too long.", "Пароль слишком длинный."),
        ),
      confirmPassword: z.string().min(
        1,
        tr(locale, "Please confirm your password.", "Подтвердите пароль."),
      ),
    })
    .superRefine((data, context) => {
      if (data.newPassword !== data.confirmPassword) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["confirmPassword"],
          message: tr(locale, "Passwords do not match.", "Пароли не совпадают."),
        });
      }
    });
}
