import type { Metadata } from "next";
import Link from "next/link";
import { type LucideIcon, ArrowRight, Bot, MessageCircleMore, ShieldCheck, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

type LocalizedCopy = {
  en: string;
  ru: string;
};

type CommunityChannel = {
  name: string;
  description: LocalizedCopy;
  icon: LucideIcon;
};

const communityChannels: readonly CommunityChannel[] = [
  {
    name: "#ship-room",
    description: {
      en: "Daily build logs, launch blockers, and peer feedback on in-flight MCP work.",
      ru: "Ежедневные build-логи, launch-блокеры и peer-фидбек по активным MCP-задачам.",
    },
    icon: Bot,
  },
  {
    name: "#benchmark-ai",
    description: {
      en: "Weekly result drops, benchmark deltas, and model-comparison discussions.",
      ru: "Еженедельные срезы результатов, benchmark-дельты и обсуждения сравнения моделей.",
    },
    icon: MessageCircleMore,
  },
  {
    name: "#integration-support",
    description: {
      en: "Help requests for setup, auth flows, and debugging production MCP connections.",
      ru: "Помощь по setup, auth-flow и отладке production-подключений MCP.",
    },
    icon: ShieldCheck,
  },
] as const;

const participationRules: readonly LocalizedCopy[] = [
  {
    en: "Share reproducible context when asking for help",
    ru: "Добавляйте воспроизводимый контекст, когда запрашиваете помощь",
  },
  {
    en: "Use one thread per issue to keep discussion searchable",
    ru: "Используйте один тред на одну проблему, чтобы сохранить поиск по обсуждению",
  },
  {
    en: "Post benchmark claims with test details and version info",
    ru: "Публикуйте benchmark-результаты с деталями теста и версиями",
  },
  {
    en: "Respect async collaboration across time zones",
    ru: "Учитывайте асинхронную работу команды в разных часовых поясах",
  },
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: tr(locale, "Discord Community", "Discord-сообщество"),
    description: tr(
      locale,
      "Join the BridgeMind developer community for vibe coding and agentic coding.",
      "Присоединяйтесь к сообществу разработчиков BridgeMind для обсуждения vibe coding и agentic coding.",
    ),
  };
}

export default async function DiscordPage() {
  const locale = await getLocale();

  return (
    <div className="relative overflow-hidden border-t border-white/10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#0a1020_0%,#070b17_50%,#050811_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-[radial-gradient(circle_at_17%_7%,rgba(99,102,241,0.24),transparent_42%),radial-gradient(circle_at_84%_4%,rgba(168,85,247,0.2),transparent_38%)]" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 sm:py-14">
        <section className="rounded-3xl border border-indigo-400/20 bg-slate-950/72 p-6 sm:p-8">
          <Badge className="mb-4 w-fit border-indigo-400/35 bg-indigo-500/10 text-indigo-200">
            {tr(locale, "Community", "Сообщество")}
          </Badge>
          <h1 className="text-4xl leading-tight font-semibold tracking-tight text-slate-100 sm:text-6xl">
            {tr(locale, "BridgeMind Discord", "BridgeMind в Discord")}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            {tr(
              locale,
              "Join engineers and AI builders discussing MCP shipping patterns, benchmark results, and day-to-day implementation decisions.",
              "Присоединяйтесь к инженерам и AI-билдерам: обсуждаем паттерны MCP-доставки, benchmark-результаты и практические решения по внедрению.",
            )}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="bg-blue-500 hover:bg-blue-400">
              <Link href="https://discord.gg/bridgemind" target="_blank" rel="noreferrer">
                {tr(locale, "Join Discord", "Войти в Discord")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/20 bg-slate-900/70 text-slate-100 hover:bg-slate-900"
            >
              <Link href="/blog">{tr(locale, "Read latest updates", "Читать последние обновления")}</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3" aria-label={tr(locale, "Discord channels", "Discord-каналы")}>
          {communityChannels.map((channel) => (
            <Card key={channel.name} className="border-white/10 bg-slate-950/75">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg text-slate-100">
                  <channel.icon className="size-4 text-indigo-200" />
                  {channel.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300">
                {tr(locale, channel.description.en, channel.description.ru)}
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-white/10 bg-slate-950/75">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xl text-slate-100">
                <Users className="size-5 text-violet-200" />
                {tr(locale, "Participation rules", "Правила участия")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-300">
              {participationRules.map((rule) => (
                <p
                  key={rule.en}
                  className="rounded-lg border border-white/10 bg-slate-900/65 px-3 py-2 text-slate-200"
                >
                  {tr(locale, rule.en, rule.ru)}
                </p>
              ))}
            </CardContent>
          </Card>

          <Card className="border-indigo-400/20 bg-[linear-gradient(130deg,rgba(50,38,92,0.55),rgba(8,12,24,0.92))]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-slate-100">{tr(locale, "Why teams join", "Зачем команды вступают")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <p>
                {tr(
                  locale,
                  "Fast feedback from engineers actively shipping MCP integrations.",
                  "Быстрый фидбек от инженеров, которые реально поставляют MCP-интеграции.",
                )}
              </p>
              <p>
                {tr(
                  locale,
                  "Direct channel for benchmark discussions and model evaluation requests.",
                  "Прямой канал для обсуждения benchmark-результатов и запросов на оценку моделей.",
                )}
              </p>
              <p>
                {tr(
                  locale,
                  "Shared playbooks for setup, moderation readiness, and rollout quality checks.",
                  "Общие playbook-и по setup, готовности к модерации и проверкам качества rollout.",
                )}
              </p>
              <Button asChild className="bg-blue-500 hover:bg-blue-400">
                <Link href="https://discord.gg/bridgemind" target="_blank" rel="noreferrer">
                  {tr(locale, "Enter the community", "Перейти в сообщество")}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
