import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: tr(locale, "Free & Open", "Бесплатно и Open"),
    description: tr(
      locale,
      "DemumuMind MCP is free today with a transparent roadmap for future Pro capabilities.",
      "DemumuMind MCP бесплатен сегодня с прозрачным roadmap будущих Pro-возможностей.",
    ),
  };
}

type LocalizedText = {
  en: string;
  ru: string;
};

export default async function PricingPage() {
  const locale = await getLocale();

  const freeNowItems: LocalizedText[] = [
    {
      en: "Browse verified and community MCP servers in one catalog.",
      ru: "Просматривайте верифицированные и community MCP-серверы в одном каталоге.",
    },
    {
      en: "Use category, language, and auth filters without limits.",
      ru: "Используйте фильтры по категориям, языкам и авторизации без ограничений.",
    },
    {
      en: "Submit your MCP server for moderation after login.",
      ru: "Отправляйте свой MCP-сервер на модерацию после входа.",
    },
  ];

  const proLaterItems: LocalizedText[] = [
    {
      en: "Team collaboration layers and advanced workspace controls.",
      ru: "Командные сценарии и расширенные настройки workspace.",
    },
    {
      en: "Deeper operational analytics and rollout visibility.",
      ru: "Более глубокая операционная аналитика и прозрачность rollout.",
    },
    {
      en: "Optional premium workflows for large-scale teams.",
      ru: "Опциональные premium-workflow для команд большого масштаба.",
    },
  ];

  const transparencyPrinciples: LocalizedText[] = [
    {
      en: "No hidden paywall for current free catalog capabilities.",
      ru: "Никакого скрытого paywall для текущих бесплатных возможностей каталога.",
    },
    {
      en: "We announce monetization changes publicly before launch.",
      ru: "О монетизации сообщаем публично заранее, до запуска изменений.",
    },
    {
      en: "Every paid direction must add clear value beyond the free baseline.",
      ru: "Каждое платное направление должно давать понятную ценность сверх бесплатной базы.",
    },
  ];

  const roadmapCards: Array<{
    stage: LocalizedText;
    title: LocalizedText;
    description: LocalizedText;
  }> = [
    {
      stage: { en: "Now", ru: "Сейчас" },
      title: { en: "Free catalog access", ru: "Бесплатный доступ к каталогу" },
      description: {
        en: "Core discovery and submission flow stays free for everyone.",
        ru: "Базовые сценарии discovery и отправки серверов остаются бесплатными для всех.",
      },
    },
    {
      stage: { en: "Next", ru: "Далее" },
      title: { en: "Pro experiments", ru: "Pro-эксперименты" },
      description: {
        en: "Small optional experiments around advanced team workflows.",
        ru: "Небольшие опциональные эксперименты вокруг расширенных командных workflow.",
      },
    },
    {
      stage: { en: "Later", ru: "Позже" },
      title: { en: "Freemium model", ru: "Freemium-модель" },
      description: {
        en: "Clear split between always-free core and premium extensions.",
        ru: "Прозрачное разделение между всегда бесплатным core и premium-расширениями.",
      },
    },
  ];

  const faqItems: Array<{ question: LocalizedText; answer: LocalizedText }> = [
    {
      question: {
        en: "Will the current free catalog become paid?",
        ru: "Станет ли текущий бесплатный каталог платным?",
      },
      answer: {
        en: "No. The current core catalog experience is planned to remain free.",
        ru: "Нет. Текущий базовый опыт работы с каталогом планируется оставить бесплатным.",
      },
    },
    {
      question: {
        en: "How will future paid features be introduced?",
        ru: "Как будут вводиться будущие платные функции?",
      },
      answer: {
        en: "Via public roadmap updates and clear feature boundaries before release.",
        ru: "Через публичные обновления roadmap и чёткие границы функционала до релиза.",
      },
    },
    {
      question: {
        en: "Why mention freemium now?",
        ru: "Зачем сейчас говорить о freemium?",
      },
      answer: {
        en: "To keep pricing expectations transparent and avoid surprise changes.",
        ru: "Чтобы держать ожидания по цене прозрачными и избежать внезапных изменений.",
      },
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
      <section className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/65 p-6 sm:p-8">
        <p className="text-xs font-semibold tracking-[0.14em] text-cyan-300 uppercase">
          {tr(locale, "Pricing", "Тарифы")}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
          {tr(locale, "Free & Open", "Бесплатно и Open")}
        </h1>
        <p className="max-w-3xl text-sm text-slate-300 sm:text-base">
          {tr(
            locale,
            "DemumuMind MCP is free today. We keep monetization transparent with a clear roadmap for future Pro options.",
            "DemumuMind MCP бесплатен сегодня. Мы сохраняем прозрачность монетизации и заранее показываем roadmap будущих Pro-опций.",
          )}
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2" aria-label={tr(locale, "Plans", "Планы")}>
        <Card className="border-emerald-400/30 bg-slate-900/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-slate-100">
              {tr(locale, "Free Now", "Free сейчас")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            {freeNowItems.map((item) => (
              <div key={item.en} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-300" />
                <p>{tr(locale, item.en, item.ru)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-cyan-400/30 bg-slate-900/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-slate-100">
              {tr(locale, "Pro Later (Preview)", "Pro позже (Preview)")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            {proLaterItems.map((item) => (
              <div key={item.en} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-cyan-300" />
                <p>{tr(locale, item.en, item.ru)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-slate-100">
          {tr(locale, "Transparency principles", "Принципы прозрачности")}
        </h2>
        <div className="mt-4 space-y-3 text-sm text-slate-300">
          {transparencyPrinciples.map((item) => (
            <div key={item.en} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-sky-300" />
              <p>{tr(locale, item.en, item.ru)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4" aria-label={tr(locale, "Roadmap", "Roadmap")}>
        <h2 className="text-xl font-semibold text-slate-100">
          {tr(locale, "Roadmap", "Roadmap")}
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {roadmapCards.map((item) => (
            <Card key={item.stage.en} className="border-white/10 bg-slate-900/70">
              <CardHeader className="pb-2">
                <p className="text-xs font-semibold tracking-[0.14em] text-cyan-300 uppercase">
                  {tr(locale, item.stage.en, item.stage.ru)}
                </p>
                <CardTitle className="text-base text-slate-100">
                  {tr(locale, item.title.en, item.title.ru)}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300">
                {tr(locale, item.description.en, item.description.ru)}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4" aria-label={tr(locale, "FAQ", "FAQ")}>
        <h2 className="text-xl font-semibold text-slate-100">FAQ</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {faqItems.map((item) => (
            <Card key={item.question.en} className="border-white/10 bg-slate-900/65">
              <CardHeader className="pb-1">
                <CardTitle className="text-base text-slate-100">
                  {tr(locale, item.question.en, item.question.ru)}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300">
                {tr(locale, item.answer.en, item.answer.ru)}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-900/65 p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-slate-100">
              {tr(locale, "Start with the free catalog", "Начните с бесплатного каталога")}
            </h2>
            <p className="text-sm text-slate-300">
              {tr(
                locale,
                "Explore MCP servers now and track roadmap updates as we grow.",
                "Изучайте MCP-серверы уже сейчас и следите за обновлениями roadmap по мере роста.",
              )}
            </p>
          </div>
          <Button
            asChild
            className="gap-1 bg-blue-500 hover:bg-blue-400"
          >
            <Link href="/catalog">
              {tr(locale, "Go to catalog", "Перейти в каталог")}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
