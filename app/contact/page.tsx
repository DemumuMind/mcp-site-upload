import type { Metadata } from "next";
import Link from "next/link";
import {
  type LucideIcon,
  ArrowRight,
  BriefcaseBusiness,
  Clock3,
  Mail,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

type LocalizedCopy = {
  en: string;
  ru: string;
};

type ContactChannel = {
  title: LocalizedCopy;
  description: LocalizedCopy;
  response: LocalizedCopy;
  cta: LocalizedCopy;
  href: string;
  icon: LucideIcon;
  accentClass: string;
};

const contactChannels: readonly ContactChannel[] = [
  {
    title: {
      en: "General Questions",
      ru: "Общие вопросы",
    },
    description: {
      en: "Platform usage, account support, roadmap requests, and collaboration questions.",
      ru: "Вопросы по платформе, поддержке аккаунта, roadmap и форматам сотрудничества.",
    },
    response: {
      en: "Response target: within 1 business day.",
      ru: "Ориентир по ответу: до 1 рабочего дня.",
    },
    href: "mailto:hello@bridgemind.ai?subject=BridgeMind%20General%20Request",
    cta: {
      en: "Email team",
      ru: "Написать команде",
    },
    icon: Mail,
    accentClass: "text-cyan-200",
  },
  {
    title: {
      en: "Partnerships",
      ru: "Партнерства",
    },
    description: {
      en: "Co-marketing, enterprise onboarding, and ecosystem partnership requests.",
      ru: "Запросы по co-marketing, enterprise-onboarding и экосистемным партнерствам.",
    },
    response: {
      en: "Response target: within 2 business days.",
      ru: "Ориентир по ответу: до 2 рабочих дней.",
    },
    href: "mailto:partners@bridgemind.ai?subject=BridgeMind%20Partnership",
    cta: {
      en: "Contact partnerships",
      ru: "Связаться по партнерствам",
    },
    icon: BriefcaseBusiness,
    accentClass: "text-emerald-200",
  },
  {
    title: {
      en: "Community",
      ru: "Сообщество",
    },
    description: {
      en: "Join builder conversations, events, benchmark discussions, and release notes.",
      ru: "Обсуждения для билдeров, анонсы событий, бенчмарки и заметки о релизах.",
    },
    response: {
      en: "Discord channels are monitored daily.",
      ru: "Каналы Discord модерируются ежедневно.",
    },
    href: "/discord",
    cta: {
      en: "Open Discord",
      ru: "Открыть Discord",
    },
    icon: MessageSquareText,
    accentClass: "text-violet-200",
  },
] as const;

const messageChecklist: readonly LocalizedCopy[] = [
  {
    en: "Your team or project name",
    ru: "Название команды или проекта",
  },
  {
    en: "What you are trying to ship with MCP",
    ru: "Что именно вы хотите запустить с MCP",
  },
  {
    en: "Current blockers or integration constraints",
    ru: "Текущие блокеры или ограничения интеграции",
  },
  {
    en: "Links/screenshots that provide context",
    ru: "Ссылки/скриншоты с полезным контекстом",
  },
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: tr(locale, "Contact", "Контакты"),
    description: tr(
      locale,
      "Get in touch with the BridgeMind team.",
      "Свяжитесь с командой BridgeMind.",
    ),
  };
}

export default async function ContactPage() {
  const locale = await getLocale();

  return (
    <div className="relative overflow-hidden border-t border-white/10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#031022_0%,#050d1d_45%,#030915_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[460px] bg-[radial-gradient(circle_at_20%_5%,rgba(56,189,248,0.22),transparent_40%),radial-gradient(circle_at_80%_5%,rgba(16,185,129,0.14),transparent_38%)]" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 sm:py-14">
        <section className="rounded-3xl border border-cyan-400/20 bg-slate-950/70 p-6 sm:p-8">
          <Badge className="mb-4 w-fit border-cyan-400/35 bg-cyan-500/10 text-cyan-200">
            {tr(locale, "Company", "Компания")}
          </Badge>
          <h1 className="text-4xl leading-tight font-semibold tracking-tight text-slate-100 sm:text-6xl">
            {tr(locale, "Contact BridgeMind", "Связаться с BridgeMind")}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            {tr(
              locale,
              "Reach the team for support, partnerships, and collaboration around MCP rollouts. Send context up front and we can route your request faster.",
              "Свяжитесь с командой по вопросам поддержки, партнерств и совместных запусков MCP. Чем больше контекста в первом сообщении, тем быстрее мы направим запрос по нужному маршруту.",
            )}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="bg-blue-500 hover:bg-blue-400">
              <Link href="mailto:hello@bridgemind.ai?subject=BridgeMind%20Contact%20Request">
                hello@bridgemind.ai
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/20 bg-slate-900/70 text-slate-100 hover:bg-slate-900"
            >
              <Link href="/discord">{tr(locale, "Open Discord", "Открыть Discord")}</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3" aria-label={tr(locale, "Contact channels", "Каналы связи")}>
          {contactChannels.map((channel) => (
            <Card key={channel.title.en} className="border-white/10 bg-slate-950/75">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-slate-100">
                  <channel.icon className={`size-4 ${channel.accentClass}`} />
                  {tr(locale, channel.title.en, channel.title.ru)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                <p>{tr(locale, channel.description.en, channel.description.ru)}</p>
                <div className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  {tr(locale, channel.response.en, channel.response.ru)}
                </div>
                <div>
                  <Button asChild variant="ghost" className="h-auto px-0 text-slate-100 hover:bg-transparent">
                    <Link href={channel.href}>
                      {tr(locale, channel.cta.en, channel.cta.ru)}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <Card className="border-white/10 bg-slate-950/75">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xl text-slate-100">
                <ShieldCheck className="size-5 text-cyan-200" />
                {tr(locale, "Send a high-signal request", "Отправьте high-signal запрос")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <p>
                {tr(
                  locale,
                  "Include these details in your first message to reduce back-and-forth:",
                  "Добавьте эти детали в первое сообщение, чтобы сократить число уточнений:",
                )}
              </p>
              <ul className="space-y-2">
                {messageChecklist.map((item) => (
                  <li
                    key={item.en}
                    className="rounded-lg border border-white/10 bg-slate-900/65 px-3 py-2 text-slate-200"
                  >
                    {tr(locale, item.en, item.ru)}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-950/75">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xl text-slate-100">
                <Clock3 className="size-5 text-emerald-200" />
                {tr(locale, "Response windows", "Окна ответа")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <p>{tr(locale, "Mon-Fri: 09:00-18:00 UTC", "Пн-Пт: 09:00-18:00 UTC")}</p>
              <p>
                {tr(
                  locale,
                  "Priority issues: include urgent in subject line.",
                  "Приоритетные вопросы: добавьте urgent в тему письма.",
                )}
              </p>
              <p>
                {tr(
                  locale,
                  "Community channels: daily async moderation.",
                  "Каналы сообщества: ежедневная асинхронная модерация.",
                )}
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
