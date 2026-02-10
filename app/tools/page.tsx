import type { Metadata } from "next";
import Link from "next/link";

import { PageFrame, PageHero } from "@/components/page-templates";
import { ToolsSection } from "@/components/tools-section";
import { Button } from "@/components/ui/button";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: tr(locale, "Tools", "Инструменты"),
    description: tr(
      locale,
      "Token calculator, rules generator, and date/time localizer for MCP projects.",
      "Калькулятор токенов, генератор правил и локализатор даты/времени для MCP-проектов.",
    ),
  };
}

export default async function ToolsPage() {
  const locale = await getLocale();

  return (
    <PageFrame variant="marketing">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
        <PageHero
          badgeTone="amber"
          eyebrow={tr(locale, "Builder Utilities", "Инструменты разработчика")}
          title={tr(locale, "Utility Toolkit for MCP Teams", "Utility-набор для MCP-команд")}
          description={tr(
            locale,
            "Estimate prompt cost, generate delivery rules, and localize date-time formats for cross-regional operations.",
            "Оценивайте стоимость промптов, генерируйте правила доставки и локализуйте дату/время для кросс-региональной работы.",
          )}
          actions={
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-xl border-white/20 bg-slate-950/70 text-slate-100 hover:bg-slate-900"
            >
              <Link href="/how-to-use">{tr(locale, "How to use these tools", "Как использовать инструменты")}</Link>
            </Button>
          }
        />
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5 sm:p-6">
          <ToolsSection />
        </div>
      </div>
    </PageFrame>
  );
}
