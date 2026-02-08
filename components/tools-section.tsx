"use client";

import { useMemo, useState } from "react";

import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { tr } from "@/lib/i18n";

function estimateTokens(value: string): number {
  const trimmed = value.trim();

  if (!trimmed) {
    return 0;
  }

  return Math.ceil(trimmed.length / 4);
}

function countWords(value: string): number {
  const trimmed = value.trim();

  if (!trimmed) {
    return 0;
  }

  return trimmed.split(/\s+/).length;
}

function buildRules(description: string, locale: "en" | "ru"): string {
  const trimmed = description.trim();

  if (!trimmed) {
    return "";
  }

  if (locale === "ru") {
    return [
      "# Правила проекта",
      "",
      "## Контекст проекта",
      `- ${trimmed}`,
      "",
      "## Инженерная база",
      "- Изменения должны быть минимальными и обратимыми.",
      "- Используйте понятные названия и явную обработку ошибок.",
      "- Для каждого изменения поведения добавляйте тест или верификацию.",
      "",
      "## Инструкции для AI-ассистента",
      "- Изучайте существующие паттерны перед добавлением новых абстракций.",
      "- Не изменяйте несвязанные файлы.",
      "- Проверяйте lint/build/tests перед завершением задачи.",
    ].join("\n");
  }

  return [
    "# Project Rules",
    "",
    "## Project Context",
    `- ${trimmed}`,
    "",
    "## Engineering Baseline",
    "- Keep changes minimal and reversible.",
    "- Prefer clear naming and explicit error handling.",
    "- Add tests or verification for every behavior change.",
    "",
    "## AI Assistant Instructions",
    "- Read existing patterns before introducing new abstractions.",
    "- Do not modify unrelated files.",
    "- Validate with lint/build/tests before claiming completion.",
  ].join("\n");
}

type DateParts = {
  day: number;
  month: number;
  year: number;
  hour24?: number;
  minute?: number;
};

type ConversionResult = {
  source: "us" | "ru";
  converted: string;
  wordsRu: string;
  wordsEn: string;
};

type ConversionError = "empty" | "invalid" | "ambiguous";

type AmbiguousPreview = {
  us: string;
  ru: string;
};

type ConversionAttempt = {
  result?: ConversionResult;
  error?: ConversionError;
  ambiguousPreview?: AmbiguousPreview;
};

const EN_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const RU_MONTHS = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
] as const;

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function isValidDate(day: number, month: number, year: number): boolean {
  if (year < 1000 || year > 9999 || month < 1 || month > 12 || day < 1) {
    return false;
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  return day <= daysInMonth;
}

function to12h(hour24: number): { hour12: number; period: "AM" | "PM" } {
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return { hour12, period };
}

function formatUs(parts: DateParts): string {
  const datePart = `${pad2(parts.month)}/${pad2(parts.day)}/${parts.year}`;

  if (parts.hour24 === undefined || parts.minute === undefined) {
    return datePart;
  }

  const { hour12, period } = to12h(parts.hour24);
  return `${datePart} ${hour12}:${pad2(parts.minute)} ${period}`;
}

function formatRu(parts: DateParts): string {
  const datePart = `${pad2(parts.day)}.${pad2(parts.month)}.${parts.year}`;

  if (parts.hour24 === undefined || parts.minute === undefined) {
    return datePart;
  }

  return `${datePart} ${pad2(parts.hour24)}:${pad2(parts.minute)}`;
}

function toWordsEn(parts: DateParts): string {
  const base = `${EN_MONTHS[parts.month - 1]} ${parts.day}, ${parts.year}`;

  if (parts.hour24 === undefined || parts.minute === undefined) {
    return base;
  }

  const { hour12, period } = to12h(parts.hour24);
  return `${base}, ${hour12}:${pad2(parts.minute)} ${period}`;
}

function toWordsRu(parts: DateParts): string {
  const base = `${parts.day} ${RU_MONTHS[parts.month - 1]} ${parts.year} года`;

  if (parts.hour24 === undefined || parts.minute === undefined) {
    return base;
  }

  return `${base}, ${pad2(parts.hour24)}:${pad2(parts.minute)}`;
}

function parseUsInput(value: string): DateParts | null {
  const match = value.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})\s*(AM|PM))?$/i,
  );

  if (!match) {
    return null;
  }

  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);

  if (!isValidDate(day, month, year)) {
    return null;
  }

  if (!match[4]) {
    return { day, month, year };
  }

  const hour12 = Number(match[4]);
  const minute = Number(match[5]);

  if (!Number.isInteger(hour12) || hour12 < 1 || hour12 > 12 || minute < 0 || minute > 59) {
    return null;
  }

  const period = match[6].toUpperCase();
  const hour24 = period === "PM" ? (hour12 % 12) + 12 : hour12 % 12;

  return { day, month, year, hour24, minute };
}

function parseRuInput(value: string): DateParts | null {
  const match = value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/);

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (!isValidDate(day, month, year)) {
    return null;
  }

  if (!match[4]) {
    return { day, month, year };
  }

  const hour24 = Number(match[4]);
  const minute = Number(match[5]);

  if (!Number.isInteger(hour24) || hour24 < 0 || hour24 > 23 || minute < 0 || minute > 59) {
    return null;
  }

  return { day, month, year, hour24, minute };
}

function parseAmbiguousInput(value: string): AmbiguousPreview | null {
  const match = value.match(/^(\d{1,2})-(\d{1,2})-(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/);

  if (!match) {
    return null;
  }

  const first = Number(match[1]);
  const second = Number(match[2]);
  const year = Number(match[3]);

  if (first < 1 || first > 12 || second < 1 || second > 12) {
    return null;
  }

  const maybeHour = match[4] ? Number(match[4]) : undefined;
  const maybeMinute = match[5] ? Number(match[5]) : undefined;

  if (
    (maybeHour !== undefined && (maybeHour < 0 || maybeHour > 23)) ||
    (maybeMinute !== undefined && (maybeMinute < 0 || maybeMinute > 59))
  ) {
    return null;
  }

  const usPreview = formatUs({
    month: first,
    day: second,
    year,
    hour24: maybeHour,
    minute: maybeMinute,
  });

  const ruPreview = formatRu({
    day: first,
    month: second,
    year,
    hour24: maybeHour,
    minute: maybeMinute,
  });

  return {
    us: usPreview,
    ru: ruPreview,
  };
}

function convertLocalizedDate(input: string): ConversionAttempt {
  const trimmed = input.trim();

  if (!trimmed) {
    return { error: "empty" };
  }

  const usParsed = parseUsInput(trimmed);

  if (usParsed) {
    return {
      result: {
        source: "us",
        converted: formatRu(usParsed),
        wordsRu: toWordsRu(usParsed),
        wordsEn: toWordsEn(usParsed),
      },
    };
  }

  const ruParsed = parseRuInput(trimmed);

  if (ruParsed) {
    return {
      result: {
        source: "ru",
        converted: formatUs(ruParsed),
        wordsRu: toWordsRu(ruParsed),
        wordsEn: toWordsEn(ruParsed),
      },
    };
  }

  const ambiguousPreview = parseAmbiguousInput(trimmed);

  if (ambiguousPreview) {
    return { error: "ambiguous", ambiguousPreview };
  }

  return { error: "invalid" };
}

export function ToolsSection() {
  const locale = useLocale();
  const [promptInput, setPromptInput] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [generatedRules, setGeneratedRules] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [conversionError, setConversionError] = useState<ConversionError | null>(null);
  const [ambiguousPreview, setAmbiguousPreview] = useState<AmbiguousPreview | null>(null);

  const tokenCount = useMemo(() => estimateTokens(promptInput), [promptInput]);
  const wordCount = useMemo(() => countWords(promptInput), [promptInput]);
  const charCount = promptInput.length;

  return (
    <section id="tools" className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-100">
        {tr(locale, "Tools", "Инструменты")}
      </h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-white/10 bg-slate-900/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-slate-100">
              {tr(locale, "LLM Token Calculator", "Калькулятор LLM-токенов")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-300">
              {tr(
                locale,
                "Estimate token usage for your prompts. Paste a prompt in the box below.",
                "Оцените количество токенов в вашем промпте. Вставьте текст ниже.",
              )}
            </p>
            <Textarea
              value={promptInput}
              onChange={(event) => setPromptInput(event.target.value)}
              rows={8}
              placeholder={tr(locale, "Paste your prompt...", "Вставьте ваш промпт...")}
              className="border-white/10 bg-slate-950/80"
            />
            <p className="text-sm text-slate-300">
              {tr(
                locale,
                `${tokenCount} tokens, ${wordCount} words, ${charCount} characters`,
                `${tokenCount} токенов, ${wordCount} слов, ${charCount} символов`,
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-900/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-slate-100">
              {tr(locale, "Rules Generator", "Генератор правил")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-300">
              {tr(
                locale,
                "Generate starter project rules to help AI assistants better understand your codebase.",
                "Сгенерируйте базовые правила проекта, чтобы AI-ассистенты лучше понимали ваш код.",
              )}
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="project-description">
                {tr(locale, "Project Description", "Описание проекта")}
              </Label>
              <Input
                id="project-description"
                value={projectDescription}
                onChange={(event) => setProjectDescription(event.target.value)}
                placeholder={tr(locale, "Describe your project...", "Опишите ваш проект...")}
                className="border-white/10 bg-slate-950/80"
              />
            </div>
            <Button
              type="button"
              className="bg-blue-500 hover:bg-blue-400"
              onClick={() => {
                setGeneratedRules(buildRules(projectDescription, locale));
              }}
            >
              {tr(locale, "Generate Rules", "Сгенерировать правила")}
            </Button>
            {generatedRules ? (
              <pre className="overflow-x-auto rounded-lg border border-white/10 bg-slate-950/80 p-3 text-xs text-slate-200">
                <code>{generatedRules}</code>
              </pre>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10 bg-slate-900/70">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-slate-100">
            {tr(
              locale,
              "Date & Time Localizer (US ↔ RU)",
              "Локализатор даты и времени (США ↔ РФ)",
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-300">
            {tr(
              locale,
              "Detect source format, convert to opposite format, and show date in words in both languages.",
              "Определяет исходный формат, конвертирует в противоположный и выводит дату словами на двух языках.",
            )}
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="localized-date-input">
              {tr(locale, "Date/Time Input", "Входная дата/время")}
            </Label>
            <Input
              id="localized-date-input"
              value={dateInput}
              onChange={(event) => setDateInput(event.target.value)}
              placeholder={tr(
                locale,
                "Example: 10/12/2024 3:30 PM or 12.10.2024 15:30",
                "Пример: 10/12/2024 3:30 PM или 12.10.2024 15:30",
              )}
              className="border-white/10 bg-slate-950/80"
            />
          </div>

          <Button
            type="button"
            className="bg-blue-500 hover:bg-blue-400"
            onClick={() => {
              const conversion = convertLocalizedDate(dateInput);
              setConversionResult(conversion.result ?? null);
              setConversionError(conversion.error ?? null);
              setAmbiguousPreview(conversion.ambiguousPreview ?? null);
            }}
          >
            {tr(locale, "Convert", "Конвертировать")}
          </Button>

          {conversionError === "empty" ? (
            <p className="text-sm text-rose-300">
              {tr(locale, "Enter date/time first.", "Сначала введите дату/время.")}
            </p>
          ) : null}

          {conversionError === "invalid" ? (
            <p className="text-sm text-rose-300">
              {tr(
                locale,
                "Invalid format. Use US: MM/DD/YYYY hh:mm AM/PM or RU: DD.MM.YYYY HH:mm.",
                "Неверный формат. Используйте США: MM/DD/YYYY hh:mm AM/PM или РФ: DD.MM.YYYY HH:mm.",
              )}
            </p>
          ) : null}

          {conversionError === "ambiguous" && ambiguousPreview ? (
            <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-100">
              <p>
                {tr(
                  locale,
                  "Ambiguous input. Clarify region format:",
                  "Двусмысленный ввод. Уточните региональный формат:",
                )}
              </p>
              <p>{tr(locale, "US interpretation:", "Интерпретация США:")} {ambiguousPreview.us}</p>
              <p>{tr(locale, "RU interpretation:", "Интерпретация РФ:")} {ambiguousPreview.ru}</p>
            </div>
          ) : null}

          {conversionResult ? (
            <div className="space-y-2 rounded-lg border border-white/10 bg-slate-950/80 p-3 text-sm text-slate-200">
              <p>
                <span className="font-semibold text-slate-100">
                  {tr(locale, "Source format:", "Исходный формат:")}
                </span>{" "}
                {conversionResult.source === "us"
                  ? tr(locale, "US (MM/DD/YYYY, 12h AM/PM)", "США (MM/DD/YYYY, 12ч AM/PM)")
                  : tr(locale, "RU (DD.MM.YYYY, 24h)", "РФ (DD.MM.YYYY, 24ч)")}
              </p>
              <p>
                <span className="font-semibold text-slate-100">
                  {tr(locale, "Converted:", "Конвертация:")}
                </span>{" "}
                {conversionResult.converted}
              </p>
              <p>
                <span className="font-semibold text-slate-100">
                  {tr(locale, "Date in words (RU):", "Дата словами (RU):")}
                </span>{" "}
                {conversionResult.wordsRu}
              </p>
              <p>
                <span className="font-semibold text-slate-100">
                  {tr(locale, "Date in words (EN):", "Дата словами (EN):")}
                </span>{" "}
                {conversionResult.wordsEn}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
