import { z } from "zod";

import type { Locale } from "@/lib/i18n";

export type SubmissionInput = {
  name: string;
  serverUrl: string;
  category: string;
  authType: "oauth" | "api_key" | "none";
  description: string;
  maintainerName: string;
  maintainerEmail: string;
  repoUrl?: string;
};

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function getHttpUrlSchema(errorMessage: string) {
  return z.string().trim().url(errorMessage).refine(isHttpUrl, errorMessage);
}

export function getSubmissionSchema(locale: Locale) {
  const isRu = locale === "ru";

  return z.object({
    name: z.string().trim().min(2, isRu ? "Укажите название" : "Name is required"),
    serverUrl: getHttpUrlSchema(
      isRu ? "Введите корректный URL (http/https)" : "Enter a valid URL (http/https)",
    ),
    category: z
      .string()
      .trim()
      .min(2, isRu ? "Укажите категорию" : "Category is required"),
    authType: z.enum(["oauth", "api_key", "none"], {
      error: isRu ? "Выберите тип авторизации" : "Choose an authentication type",
    }),
    description: z
      .string()
      .trim()
      .min(
        20,
        isRu
          ? "Описание должно содержать минимум 20 символов"
          : "Description must be at least 20 characters",
      ),
    maintainerName: z
      .string()
      .trim()
      .min(2, isRu ? "Укажите имя мейнтейнера" : "Maintainer name is required"),
    maintainerEmail: z.email(isRu ? "Введите корректный email" : "Enter a valid email"),
    repoUrl: z
      .union([
        getHttpUrlSchema(
          isRu
            ? "Введите корректный URL репозитория (http/https)"
            : "Enter a valid repository URL (http/https)",
        ),
        z.literal(""),
      ])
      .optional()
      .default(""),
  });
}
