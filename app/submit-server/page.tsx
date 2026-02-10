import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, LayoutDashboard, ShieldCheck, Sparkles } from "lucide-react";

import { SubmissionAccessPanel } from "@/components/submission-access-panel";
import { PageFrame } from "@/components/page-templates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: tr(locale, "Submit Server", "Отправка сервера"),
    description: tr(
      locale,
      "Submit your MCP server for moderation and publication in the catalog.",
      "Отправьте ваш MCP-сервер на модерацию и публикацию в каталоге.",
    ),
  };
}

const checklistItems = [
  {
    icon: CheckCircle2,
    title: {
      en: "Server metadata is complete",
      ru: "Метаданные сервера заполнены",
    },
    description: {
      en: "Name, category, endpoint, and description are clear and accurate.",
      ru: "Название, категория, endpoint и описание заполнены корректно.",
    },
  },
  {
    icon: ShieldCheck,
    title: {
      en: "Auth details are validated",
      ru: "Детали авторизации проверены",
    },
    description: {
      en: "Specify auth type and maintainer contacts for reliable review.",
      ru: "Укажите тип авторизации и контакты мейнтейнера для быстрой проверки.",
    },
  },
  {
    icon: LayoutDashboard,
    title: {
      en: "Ready for moderation queue",
      ru: "Готово к очереди модерации",
    },
    description: {
      en: "Approved submissions become publicly discoverable in the catalog.",
      ru: "Одобренные заявки публикуются и становятся доступными в каталоге.",
    },
  },
] as const;

export default async function SubmitServerPage() {
  const locale = await getLocale();

  return (
    <PageFrame variant="form">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#02050f_0%,#050a18_45%,#090816_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(circle_at_16%_8%,rgba(217,70,239,0.2),transparent_42%),radial-gradient(circle_at_84%_10%,rgba(59,130,246,0.18),transparent_40%)]" />

      <section className="mx-auto w-full max-w-6xl px-4 pb-6 pt-10 sm:px-6 sm:pt-14">
        <div className="space-y-5 rounded-3xl border border-fuchsia-400/20 bg-slate-950/72 p-6 sm:p-10">
          <Badge className="w-fit border-fuchsia-400/35 bg-fuchsia-500/10 text-fuchsia-200">
            <Sparkles className="size-3" />
            {tr(locale, "Community Submission", "Подача от сообщества")}
          </Badge>

          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-100 sm:text-6xl">
              {tr(locale, "Submit Your MCP Server", "Отправьте ваш MCP-сервер")}
            </h1>
            <p className="max-w-4xl text-base leading-8 text-slate-300 sm:text-lg">
              {tr(
                locale,
                "Sign in, complete server metadata, and send your submission to moderation. Approved servers are published in the DemumuMind MCP catalog.",
                "Войдите, заполните метаданные сервера и отправьте заявку на модерацию. После одобрения сервер публикуется в каталоге DemumuMind MCP.",
              )}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="h-11 rounded-xl bg-blue-500 px-6 text-white hover:bg-blue-400">
              <Link href="/catalog">
                {tr(locale, "Open Catalog", "Открыть каталог")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-xl border-white/20 bg-slate-950/70 text-slate-100 hover:bg-slate-900"
            >
              <Link href="/how-to-use">{tr(locale, "Open setup guide", "Открыть гайд по настройке")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="submit" className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_1.05fr]">
        <Card className="border-fuchsia-400/20 bg-slate-950/78">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-slate-100">
              {tr(locale, "Submission Checklist", "Чеклист отправки")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {checklistItems.map((item) => (
              <div key={item.title.en} className="rounded-xl border border-fuchsia-500/20 bg-slate-900/65 p-3">
                <p className="flex items-center gap-2 text-sm font-medium text-slate-100">
                  <item.icon className="size-4 text-fuchsia-300" />
                  {tr(locale, item.title.en, item.title.ru)}
                </p>
                <p className="mt-2 text-xs leading-6 text-slate-300">
                  {tr(locale, item.description.en, item.description.ru)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/70 p-4 sm:p-5">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-100">
            {tr(locale, "Submission Form", "Форма отправки")}
          </h2>
          <p className="text-sm text-slate-300">
            {tr(
              locale,
              "Use your work email and complete all required fields so moderation can process your server faster.",
              "Используйте рабочий email и заполните обязательные поля, чтобы модерация обработала заявку быстрее.",
            )}
          </p>
          <SubmissionAccessPanel />
        </div>
      </section>
    </PageFrame>
  );
}
