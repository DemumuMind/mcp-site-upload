import type { Metadata } from "next";

import { ToolsSection } from "@/components/tools-section";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export const metadata: Metadata = {
  title: "Tools",
  description: "Token calculator, rules generator, and date/time localizer for MCP projects.",
};

export default async function ToolsPage() {
  const locale = await getLocale();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-100">
          {tr(
            locale,
            "Tools (Token Calculator / Rules Generator / Date & Time Localizer)",
            "Инструменты (Калькулятор токенов / Генератор правил / Локализатор даты и времени)",
          )}
        </h1>
        <p className="text-sm text-slate-300">
          {tr(
            locale,
            "Estimate prompt tokens, generate starter project rules, and convert US↔RU date/time formats.",
            "Оценивайте токены в промптах, генерируйте стартовые правила проекта и конвертируйте форматы даты/времени США↔РФ.",
          )}
        </p>
      </div>
      <ToolsSection />
    </div>
  );
}
