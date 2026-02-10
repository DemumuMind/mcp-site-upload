import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Blocks,
  Bot,
  CheckCircle2,
  Command,
  LayoutDashboard,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Wrench,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageFrame } from "@/components/page-templates";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: tr(locale, "About", "О нас"),
    description: tr(
      locale,
      "Developer-first overview of DemumuMind MCP and how we build with MCP in production.",
      "Обзор DemumuMind MCP для разработчиков: как мы внедряем MCP в продакшене.",
    ),
  };
}

const revealDelayClasses = ["about-delay-0", "about-delay-1", "about-delay-2", "about-delay-3"] as const;

const missionCards = [
  {
    icon: Bot,
    title: {
      en: "Builder Community",
      ru: "Сообщество разработчиков",
    },
    description: {
      en: "A growing community of engineers and AI builders sharing production MCP patterns.",
      ru: "Растущее сообщество инженеров и AI-разработчиков, которые делятся production-паттернами MCP.",
    },
  },
  {
    icon: Blocks,
    title: {
      en: "Real Integrations",
      ru: "Реальные интеграции",
    },
    description: {
      en: "We focus on deployable integrations, not demo-only examples.",
      ru: "Мы фокусируемся на интеграциях, которые можно внедрять, а не на demo-only примерах.",
    },
  },
  {
    icon: ShieldCheck,
    title: {
      en: "Reliable Signals",
      ru: "Надежные сигналы",
    },
    description: {
      en: "Auth, verification, and operational context are visible before rollout.",
      ru: "Контекст авторизации, верификации и эксплуатации виден до rollout.",
    },
  },
] as const;

const differenceCards = [
  {
    icon: Command,
    title: {
      en: "Not a Course",
      ru: "Не курс",
    },
    description: {
      en: "This is an execution platform for teams shipping MCP integrations.",
      ru: "Это платформа исполнения для команд, которые поставляют MCP-интеграции.",
    },
  },
  {
    icon: Wrench,
    title: {
      en: "Not Just a Directory",
      ru: "Не просто каталог",
    },
    description: {
      en: "Catalog + setup utilities + moderation flow in one workspace.",
      ru: "Каталог + setup-инструменты + модерационный поток в одном workspace.",
    },
  },
  {
    icon: Activity,
    title: {
      en: "Not Theoretical",
      ru: "Не теория",
    },
    description: {
      en: "Decisions are based on implementation signal, not hype.",
      ru: "Решения принимаются по сигналам внедрения, а не по хайпу.",
    },
  },
  {
    icon: TerminalSquare,
    title: {
      en: "Built for Delivery",
      ru: "Заточено под delivery",
    },
    description: {
      en: "From candidate selection to production rollout with fewer blind spots.",
      ru: "От выбора кандидата до production-rollout с меньшим количеством слепых зон.",
    },
  },
] as const;

const valueCards = [
  {
    icon: Command,
    title: {
      en: "Ship Over Talk",
      ru: "Поставка важнее разговоров",
    },
    description: {
      en: "We prioritize shipped outcomes over abstract plans.",
      ru: "Мы ставим реальный результат выше абстрактных планов.",
    },
  },
  {
    icon: LayoutDashboard,
    title: {
      en: "Teach Through Practice",
      ru: "Обучение через практику",
    },
    description: {
      en: "Knowledge is captured in reusable workflows and runbooks.",
      ru: "Знания фиксируются в переиспользуемых workflow и runbook-артефактах.",
    },
  },
  {
    icon: MonitorSmartphone,
    title: {
      en: "Agentic Collaboration",
      ru: "Агенто-ориентированная коллаборация",
    },
    description: {
      en: "Humans define direction, AI agents accelerate execution.",
      ru: "Люди задают направление, AI-агенты ускоряют исполнение.",
    },
  },
  {
    icon: ShieldCheck,
    title: {
      en: "Secure by Default",
      ru: "Безопасность по умолчанию",
    },
    description: {
      en: "Trust signals and auth context are first-class in every decision.",
      ru: "Сигналы доверия и auth-контекст — обязательная часть каждого решения.",
    },
  },
] as const;

const openRoles = [
  {
    title: {
      en: "Full-Stack Engineer",
      ru: "Full-Stack инженер",
    },
    stack: {
      en: "TypeScript • Next.js • Node",
      ru: "TypeScript • Next.js • Node",
    },
  },
  {
    title: {
      en: "AI Tools Engineer",
      ru: "AI Tools инженер",
    },
    stack: {
      en: "LLMs • MCP • Integrations",
      ru: "LLMs • MCP • Интеграции",
    },
  },
  {
    title: {
      en: "Community Engineer",
      ru: "Community инженер",
    },
    stack: {
      en: "Discord • Docs • Growth",
      ru: "Discord • Документация • Growth",
    },
  },
  {
    title: {
      en: "Product Designer",
      ru: "Product дизайнер",
    },
    stack: {
      en: "UX • Visual • Motion",
      ru: "UX • Visual • Motion",
    },
  },
] as const;

const heroStats = [
  {
    en: "Developer-first",
    ru: "Developer-first",
  },
  {
    en: "MCP workflow ops",
    ru: "MCP workflow ops",
  },
  {
    en: "Production signal",
    ru: "Production signal",
  },
] as const;

export default async function AboutPage() {
  const locale = await getLocale();

  return (
    <PageFrame variant="marketing" className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#02070f_0%,#030b16_45%,#050814_100%)]" />
      <div className="about-hero-glow pointer-events-none absolute inset-x-0 top-0 -z-10 h-[760px] bg-[radial-gradient(circle_at_18%_8%,rgba(56,189,248,0.26),transparent_44%),radial-gradient(circle_at_82%_3%,rgba(14,165,233,0.18),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(56,189,248,0.06)_1px,transparent_1px),linear-gradient(rgba(56,189,248,0.05)_1px,transparent_1px)] bg-[size:44px_44px] opacity-35" />

      <section className="mx-auto w-full max-w-7xl px-4 pb-10 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        <div className="about-reveal about-delay-0 relative overflow-hidden rounded-3xl border border-cyan-400/25 bg-slate-950/72 p-6 sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(10,40,70,0.4),transparent_46%,rgba(6,182,212,0.16)_100%)]" />
          <div className="relative space-y-6">
            <Badge className="border-cyan-400/35 bg-cyan-500/10 text-cyan-200">
              <Sparkles className="size-3" />
              {tr(locale, "We Are Developer-First", "Мы — developer-first")}
            </Badge>

            <h1 className="max-w-5xl text-4xl leading-[0.94] font-semibold tracking-tight text-slate-100 sm:text-7xl lg:text-[5.4rem] lg:leading-[0.88]">
              {tr(locale, "We're an", "Мы —")}
              <span className="block bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-500 bg-clip-text text-transparent">
                {tr(locale, "Agentic Engineering Organization", "агенто-ориентированная инженерная организация")}
              </span>
            </h1>

            <p className="max-w-3xl text-base leading-8 text-slate-300 sm:text-xl sm:leading-9">
              {tr(
                locale,
                "DemumuMind is where AI agents are teammates, not plugins. We build and ship MCP workflows through intent-first engineering, operational clarity, and production feedback loops.",
                "DemumuMind — место, где AI-агенты являются участниками команды, а не плагинами. Мы строим и поставляем MCP-workflow через intent-first инженерный подход, операционную ясность и production-циклы обратной связи.",
              )}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-11 rounded-xl bg-blue-500 px-6 text-white hover:bg-blue-400">
                <Link href="/catalog">
                  {tr(locale, "Join the Build", "Присоединиться к build")}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-xl border-white/15 bg-slate-950/65 text-slate-100 hover:bg-slate-900"
              >
                <Link href="/how-to-use">
                  {tr(locale, "Watch the Workflow", "Посмотреть workflow")}
                  <Activity className="size-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-2 pt-1 sm:grid-cols-3">
              {heroStats.map((item) => (
                <div
                  key={item.en}
                  className="rounded-lg border border-cyan-400/20 bg-cyan-500/5 px-3 py-2 text-xs font-semibold tracking-[0.14em] text-cyan-200 uppercase"
                >
                  {tr(locale, item.en, item.ru)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="about-reveal about-delay-1 space-y-5 rounded-3xl border border-white/10 bg-slate-950/65 p-6 sm:p-8">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-100 sm:text-5xl sm:leading-tight">
              {tr(locale, "That's Not Marketing Speak.", "Это не маркетинговые слова.")}
              <span className="block text-slate-300">{tr(locale, "It's Our Operating Model.", "Это наша рабочая модель.")}</span>
            </h2>
            <p className="text-sm leading-7 text-slate-300 sm:text-base">
              {tr(
                locale,
                "At DemumuMind, AI agents are embedded into the product lifecycle: discovery, implementation, review, and release. Engineers keep architectural control while agents execute high-throughput tasks.",
                "В DemumuMind AI-агенты встроены в жизненный цикл продукта: discovery, implementation, review и release. Инженеры сохраняют архитектурный контроль, а агенты ускоряют исполнение рутинных задач.",
              )}
            </p>
            <p className="text-sm leading-7 text-slate-300 sm:text-base">
              {tr(
                locale,
                "Every integration we publish is proof: human judgment + agentic execution can outperform traditional workflows when signal quality is high.",
                "Каждая опубликованная интеграция — это доказательство: человеческая экспертиза + агентное исполнение превосходят классические workflow при высоком качестве сигналов.",
              )}
            </p>
          </div>

          <Card className="about-reveal about-delay-2 border-cyan-500/25 bg-slate-950/75 transition duration-300 hover:border-cyan-400/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl text-slate-100">{tr(locale, "Execution Model", "Модель исполнения")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-xl border border-white/10 bg-slate-900/65 p-4">
                <p className="mb-1 font-semibold text-slate-100">01 — {tr(locale, "Traditional Teams", "Традиционные команды")}</p>
                <p className="text-slate-400">
                  {tr(locale, "Humans do most implementation, AI assists occasionally.", "Люди делают большую часть внедрения, AI помогает эпизодически.")}
                </p>
              </div>
              <div className="rounded-xl border border-cyan-400/35 bg-cyan-500/10 p-4">
                <p className="mb-1 font-semibold text-cyan-100">02 — DemumuMind</p>
                <p className="text-cyan-200/90">
                  {tr(
                    locale,
                    "Humans direct -> AI agents execute -> humans validate and refine.",
                    "Люди задают направление -> AI-агенты исполняют -> люди валидируют и уточняют.",
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="about-reveal about-delay-0 mb-8 text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-slate-100 sm:text-5xl">
            {tr(locale, "Meet the Founding Team", "Команда основателей")}
          </h2>
          <p className="mt-2 text-slate-400">
            {tr(locale, "The operators behind DemumuMind's agentic workflow model", "Люди, которые строят agentic workflow-модель DemumuMind")}
          </p>
        </div>

        <div className="about-reveal about-delay-1 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 lg:grid lg:grid-cols-[0.42fr_0.58fr]">
          <div className="relative flex min-h-[320px] items-center justify-center border-b border-white/10 bg-[linear-gradient(140deg,rgba(30,64,175,0.35),rgba(6,182,212,0.2))] lg:min-h-[420px] lg:border-b-0 lg:border-r lg:border-white/10">
            <div className="about-float-slow absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(56,189,248,0.3),transparent_70%)]" />
            <div className="relative text-center">
              <div className="mx-auto flex size-44 items-center justify-center rounded-full border border-cyan-300/30 bg-[linear-gradient(135deg,#3b82f6,#06b6d4)] text-4xl font-semibold text-white shadow-[0_0_60px_rgba(56,189,248,0.35)]">
                DM
              </div>
              <p className="mx-auto mt-4 w-fit rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1 text-xs font-semibold text-cyan-200">
                {tr(locale, "Founding Team", "Команда основателей")}
              </p>
            </div>
          </div>

          <div className="space-y-5 p-6 sm:p-8">
            <h3 className="text-3xl font-semibold text-slate-100">DemumuMind</h3>
            <p className="text-cyan-300">{tr(locale, "Developer-First MCP Platform", "Developer-first MCP платформа")}</p>
            <p className="text-base leading-8 text-slate-300">
              {tr(
                locale,
                "We started DemumuMind to solve one practical problem: MCP integration decisions were noisy, fragmented, and hard to operationalize across teams.",
                "Мы запустили DemumuMind, чтобы решить практическую проблему: решения по MCP-интеграциям были шумными, разрозненными и плохо операционализировались между командами.",
              )}
            </p>
            <p className="text-base leading-8 text-slate-300">
              {tr(
                locale,
                "Today, we combine directory signal, setup tooling, and moderated workflow so teams can move from intent to implementation faster.",
                "Сегодня мы объединяем сигналы каталога, setup-инструменты и модерационный workflow, чтобы команды быстрее переходили от intent к внедрению.",
              )}
            </p>
            <blockquote className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4 text-xl font-semibold italic text-cyan-100">
              {tr(
                locale,
                '"The gap between idea and production should be measured in hours, not quarters."',
                '"Разрыв между идеей и production должен измеряться часами, а не кварталами."',
              )}
            </blockquote>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[linear-gradient(180deg,#030916_0%,#060812_100%)]">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="about-reveal about-delay-0 mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-semibold tracking-tight text-slate-100 sm:text-5xl">
              {tr(locale, "Our Mission", "Наша миссия")}
            </h2>
            <p className="mt-4 text-lg text-slate-300">
              {tr(
                locale,
                "Democratize production-grade software delivery by combining human architecture decisions with AI agent execution.",
                "Демократизировать поставку production-grade программных решений через сочетание человеческих архитектурных решений и исполнения AI-агентами.",
              )}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {missionCards.map((item, index) => (
              <Card
                key={item.title.en}
                className={cn(
                  "about-reveal border-white/10 bg-slate-950/75 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/35",
                  revealDelayClasses[index % revealDelayClasses.length],
                )}
              >
                <CardHeader className="pb-2">
                  <div className="mb-2 inline-flex size-10 items-center justify-center rounded-lg border border-cyan-400/35 bg-cyan-500/10 text-cyan-200">
                    <item.icon className="size-5" />
                  </div>
                  <CardTitle className="text-xl text-slate-100">{tr(locale, item.title.en, item.title.ru)}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-7 text-slate-300">
                  {tr(locale, item.description.en, item.description.ru)}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="about-reveal about-delay-2 mx-auto mt-12 max-w-3xl text-center">
            <h3 className="text-4xl font-semibold tracking-tight text-slate-100 sm:text-5xl">
              {tr(locale, "Our Vision", "Наше видение")}
            </h3>
            <p className="mt-4 text-2xl leading-relaxed text-slate-300">
              {tr(
                locale,
                "A world where any technical team can ship robust AI integrations regardless of size.",
                "Мир, в котором любая техническая команда может поставлять надежные AI-интеграции независимо от масштаба.",
              )}
            </p>
            <Badge className="mt-5 border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-emerald-200">
              <CheckCircle2 className="size-3" />
              {tr(locale, "Making every team integration-ready", "Делаем каждую команду integration-ready")}
            </Badge>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="about-reveal about-delay-0 text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-slate-100 sm:text-5xl">
            {tr(locale, "What Makes DemumuMind Different", "Что отличает DemumuMind")}
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-lg text-slate-300">
            {tr(
              locale,
              "We're not another coding platform. We're an operational layer for shipping MCP workflows with trust signals and execution discipline.",
              "Мы не еще одна coding-платформа. Мы операционный слой для поставки MCP-workflow с сигналами доверия и дисциплиной исполнения.",
            )}
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {differenceCards.map((item, index) => (
            <Card
              key={item.title.en}
              className={cn(
                "about-reveal border-white/10 bg-slate-950/75 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/35",
                revealDelayClasses[index % revealDelayClasses.length],
              )}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-2xl text-slate-100">
                  <span className="inline-flex size-8 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-500/10 text-cyan-200">
                    <item.icon className="size-4" />
                  </span>
                  {tr(locale, item.title.en, item.title.ru)}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-slate-300">
                {tr(locale, item.description.en, item.description.ru)}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="about-reveal about-delay-1 mt-14 text-center">
          <h3 className="text-4xl font-semibold tracking-tight text-slate-100 sm:text-5xl">
            {tr(locale, "The DemumuMind Way", "Подход DemumuMind")}
          </h3>
          <p className="mt-3 text-lg text-slate-300">
            {tr(locale, "Principles that guide our engineering culture", "Принципы, которые определяют нашу инженерную культуру")}
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {valueCards.map((item, index) => (
            <Card
              key={item.title.en}
              className={cn(
                "about-reveal border-white/10 bg-slate-950/75 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/35",
                revealDelayClasses[index % revealDelayClasses.length],
              )}
            >
              <CardHeader className="pb-2">
                <div className="mb-2 inline-flex size-10 items-center justify-center rounded-lg border border-cyan-400/35 bg-cyan-500/10 text-cyan-200">
                  <item.icon className="size-5" />
                </div>
                <CardTitle className="text-xl text-slate-100">{tr(locale, item.title.en, item.title.ru)}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-slate-300">
                {tr(locale, item.description.en, item.description.ru)}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="about-reveal about-delay-0 rounded-3xl border border-white/10 bg-slate-950/70 p-6 sm:p-10">
          <div className="text-center">
            <h2 className="text-4xl font-semibold tracking-tight text-slate-100 sm:text-5xl">
              {tr(locale, "Join the Team", "Присоединяйтесь к команде")}
            </h2>
            <p className="mt-3 text-lg text-slate-300">
              {tr(
                locale,
                "Want to build at the edge of agentic software delivery? We're hiring operators who ship.",
                "Хотите работать на передовой agentic-поставки ПО? Мы ищем операторов, которые реально поставляют результат.",
              )}
            </p>
          </div>

          <div className="mt-7 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {openRoles.map((role, index) => (
              <div
                key={role.title.en}
                className={cn(
                  "about-reveal rounded-xl border border-white/10 bg-slate-900/70 p-4 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/35",
                  revealDelayClasses[index % revealDelayClasses.length],
                )}
              >
                <p className="font-semibold text-slate-100">{tr(locale, role.title.en, role.title.ru)}</p>
                <p className="mt-2 inline-flex rounded-md border border-white/15 bg-slate-950/80 px-2 py-0.5 text-xs text-slate-400">
                  {tr(locale, role.stack.en, role.stack.ru)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-7 flex justify-center">
            <Button asChild className="h-11 rounded-xl bg-blue-500 px-6 text-white hover:bg-blue-400">
              <Link href="mailto:demumumind@gmail.com?subject=Open%20Role%20Inquiry%20-%20DemumuMind">
                {tr(locale, "View Open Roles", "Смотреть открытые роли")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="about-reveal about-delay-1 mt-10 rounded-3xl border border-cyan-400/20 bg-[linear-gradient(90deg,rgba(10,25,47,0.92),rgba(4,47,70,0.88))] p-8 text-center sm:p-10">
          <h3 className="text-4xl font-semibold tracking-tight text-slate-100 sm:text-6xl">
            {tr(locale, "The Future Ships From Here", "Будущее поставляется отсюда")}
          </h3>
          <p className="mx-auto mt-4 max-w-3xl text-xl leading-9 text-slate-300">
            {tr(
              locale,
              "Join builders defining what production AI integration looks like: high signal, fast iteration, and real outcomes.",
              "Присоединяйтесь к командам, которые формируют стандарт production AI-интеграций: высокий сигнал, быстрая итерация и реальный результат.",
            )}
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild className="h-11 rounded-xl bg-blue-500 px-6 text-white hover:bg-blue-400">
              <Link href="/catalog">
                {tr(locale, "Join the Movement", "Присоединиться")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-xl border-white/20 bg-slate-950/65 text-slate-100 hover:bg-slate-900"
            >
              <Link href="/how-to-use">{tr(locale, "Get Started", "Начать")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageFrame>
  );
}
