import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";

import { PageFrame, PageHero, PageMetric, PageSection } from "@/components/page-templates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: tr(locale, "Pricing", "Цены"),
    description: tr(
      locale,
      "Pricing details for DemumuMind MCP.",
      "Тарифы и текущий план для DemumuMind MCP.",
    ),
  };
}

export default async function PricingPage() {
  const locale = await getLocale();

  return (
    <PageFrame variant="marketing">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
        <PageHero
          badgeTone="emerald"
          eyebrow={tr(locale, "Commercial model", "Коммерческая модель")}
          title={tr(locale, "Simple Pricing for Early Teams", "Прозрачные цены для команд на старте")}
          description={tr(
            locale,
            "Directory access and server discovery remain free while we roll out advanced collaboration and governance modules.",
            "Доступ к каталогу и discovery серверов остаются бесплатными, пока мы развиваем расширенные модули совместной работы и governance.",
          )}
          metrics={
            <>
              <PageMetric
                label={tr(locale, "Current plan", "Текущий план")}
                value={tr(locale, "Free", "Бесплатно")}
                valueClassName="text-emerald-200"
              />
              <PageMetric
                label={tr(locale, "Status", "Статус")}
                value={tr(locale, "Public beta", "Публичная бета")}
              />
            </>
          }
        />

        <PageSection>
          <Card className="border-white/10 bg-slate-900/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-slate-100">
                {tr(locale, "Current plan: Free", "Текущий план: Free")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 text-emerald-300" />
                <p>
                  {tr(
                    locale,
                    "Browse verified and community MCP server listings.",
                    "Просматривайте верифицированные и community MCP-серверы.",
                  )}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 text-emerald-300" />
                <p>
                  {tr(
                    locale,
                    "Use category, language, and auth filters in the catalog.",
                    "Используйте фильтры по категориям, языкам и авторизации.",
                  )}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 text-emerald-300" />
                <p>
                  {tr(
                    locale,
                    "Submit your MCP server after login for moderation.",
                    "Отправляйте MCP-сервер на модерацию после входа.",
                  )}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
                <p className="inline-flex items-center gap-1.5">
                  <Sparkles className="size-3.5" />
                  {tr(
                    locale,
                    "Roadmap: team seats, moderation SLAs, and managed private catalogs.",
                    "Roadmap: командные места, SLA модерации и управляемые приватные каталоги.",
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  variant="outline"
                  className="border-white/15 bg-white/[0.02] hover:bg-white/[0.06]"
                >
                  <Link href="/catalog">{tr(locale, "Go to catalog", "Перейти в каталог")}</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/15 bg-white/[0.02] hover:bg-white/[0.06]"
                >
                  <Link href="/contact">{tr(locale, "Contact sales", "Связаться с продажами")}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </PageSection>
      </div>
    </PageFrame>
  );
}
