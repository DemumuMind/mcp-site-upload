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

export function getSubmissionSchema(locale: Locale) {
  const isRu = locale === "ru";

  return z.object({
    name: z.string().trim().min(2, isRu ? "Укажите название" : "Name is required"),
    serverUrl: z.url(isRu ? "Введите корректный URL" : "Enter a valid URL"),
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
      .url(isRu ? "Введите корректный URL репозитория" : "Enter a valid repository URL")
      .optional()
      .or(z.literal("")),
  });
}
