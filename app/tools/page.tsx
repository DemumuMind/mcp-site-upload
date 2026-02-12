import type { Metadata } from "next";

import { BrandMascotCard } from "@/components/brand-mascot-card";
import { ToolsSection } from "@/components/tools-section";
import { getSectionIndex, getSectionLocaleCopy } from "@/lib/content/section-index";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const sectionCopy = getSectionLocaleCopy(getSectionIndex("tools"), locale);

  return {
    title: sectionCopy?.title ?? tr(locale, "Tools", "Инструменты"),
    description:
      sectionCopy?.description ??
      tr(
        locale,
        "Token calculator and rules generator for MCP projects.",
        "Калькулятор токенов и генератор правил для MCP-проектов.",
      ),
  };
}

export default async function ToolsPage() {
  const locale = await getLocale();
  const sectionCopy = getSectionLocaleCopy(getSectionIndex("tools"), locale);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="space-y-2">
          {sectionCopy?.eyebrow ? (
            <p className="text-xs font-semibold tracking-[0.12em] text-amber-200 uppercase">
              {sectionCopy.eyebrow}
            </p>
          ) : null}
          <h1 className="text-3xl font-semibold tracking-tight text-slate-100">
            {sectionCopy?.heroTitle ??
              tr(
                locale,
                "Tools (Token Calculator / Rules Generator)",
                "Инструменты (Калькулятор токенов / Генератор правил)",
              )}
          </h1>
          <p className="text-sm text-slate-300">
            {sectionCopy?.heroDescription ??
              tr(
                locale,
                "Estimate prompt tokens and generate starter project rules.",
                "Оценивайте токены в промптах и генерируйте стартовые правила проекта.",
              )}
          </p>
        </div>
        <BrandMascotCard locale={locale} />
      </div>
      <ToolsSection />
    </div>
  );
}
