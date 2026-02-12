import type { Metadata } from "next";
import Link from "next/link";
import { Activity, ArrowRight, Blocks, Bot, CheckCircle2, Command, LayoutDashboard, MonitorSmartphone, ShieldCheck, Sparkles, TerminalSquare, Wrench, } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { cn } from "@/lib/utils";
export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    return {
        title: tr(locale, "About", "About"),
        description: tr(locale, "Developer-first overview of DemumuMind MCP and how we build with MCP in production.", "Developer-first overview of DemumuMind MCP and how we build with MCP in production."),
    };
}
const revealDelayClasses = ["about-delay-0", "about-delay-1", "about-delay-2", "about-delay-3"] as const;
const missionCards = [
    {
        icon: Bot,
        title: {
            en: "Builder Community",
        },
        description: {
            en: "A growing community of engineers and AI builders sharing production MCP patterns.",
        },
    },
    {
        icon: Blocks,
        title: {
            en: "Real Integrations",
        },
        description: {
            en: "We focus on deployable integrations, not demo-only examples.",
        },
    },
    {
        icon: ShieldCheck,
        title: {
            en: "Reliable Signals",
        },
        description: {
            en: "Auth, verification, and operational context are visible before rollout.",
        },
    },
] as const;
const differenceCards = [
    {
        icon: Command,
        title: {
            en: "Not a Course",
        },
        description: {
            en: "This is an execution platform for teams shipping MCP integrations.",
        },
    },
    {
        icon: Wrench,
        title: {
            en: "Not Just a Directory",
        },
        description: {
            en: "Catalog + setup utilities + moderation flow in one workspace.",
        },
    },
    {
        icon: Activity,
        title: {
            en: "Not Theoretical",
        },
        description: {
            en: "Decisions are based on implementation signal, not hype.",
        },
    },
    {
        icon: TerminalSquare,
        title: {
            en: "Built for Delivery",
        },
        description: {
            en: "From candidate selection to production rollout with fewer blind spots.",
        },
    },
] as const;
const valueCards = [
    {
        icon: Command,
        title: {
            en: "Ship Over Talk",
        },
        description: {
            en: "We prioritize shipped outcomes over abstract plans.",
        },
    },
    {
        icon: LayoutDashboard,
        title: {
            en: "Teach Through Practice",
        },
        description: {
            en: "Knowledge is captured in reusable workflows and runbooks.",
        },
    },
    {
        icon: MonitorSmartphone,
        title: {
            en: "Agentic Collaboration",
        },
        description: {
            en: "Humans define direction, AI agents accelerate execution.",
        },
    },
    {
        icon: ShieldCheck,
        title: {
            en: "Secure by Default",
        },
        description: {
            en: "Trust signals and auth context are first-class in every decision.",
        },
    },
] as const;
const openRoles = [
    {
        title: {
            en: "Full-Stack Engineer",
        },
        stack: {
            en: "TypeScript • Next.js • Node",
        },
    },
    {
        title: {
            en: "AI Tools Engineer",
        },
        stack: {
            en: "LLMs • MCP • Integrations",
        },
    },
    {
        title: {
            en: "Community Engineer",
        },
        stack: {
            en: "Discord • Docs • Growth",
        },
    },
    {
        title: {
            en: "Product Designer",
        },
        stack: {
            en: "UX • Visual • Motion",
        },
    },
] as const;
const heroStats = [
    {
        en: "Developer-first",
    },
    {
        en: "MCP workflow ops",
    },
    {
        en: "Production signal",
    },
] as const;
export default async function AboutPage() {
    const locale = await getLocale();
    return (<div className="relative overflow-hidden border-t border-white/10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#02070f_0%,#030b16_45%,#050814_100%)]"/>
      <div className="about-hero-glow pointer-events-none absolute inset-x-0 top-0 -z-10 h-[760px] bg-[radial-gradient(circle_at_18%_8%,rgba(56,189,248,0.26),transparent_44%),radial-gradient(circle_at_82%_3%,rgba(14,165,233,0.18),transparent_40%)]"/>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(56,189,248,0.06)_1px,transparent_1px),linear-gradient(rgba(56,189,248,0.05)_1px,transparent_1px)] bg-[size:44px_44px] opacity-35"/>

      <section className="mx-auto w-full max-w-7xl px-4 pb-10 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        <div className="about-reveal about-delay-0 relative overflow-hidden rounded-3xl border border-cyan-400/25 bg-indigo-950/72 p-6 sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(10,40,70,0.4),transparent_46%,rgba(6,182,212,0.16)_100%)]"/>
          <div className="relative space-y-6">
            <Badge className="border-cyan-400/35 bg-cyan-500/10 text-cyan-200">
              <Sparkles className="size-3"/>
              {tr(locale, "We Are Developer-First", "We Are Developer-First")}
            </Badge>

            <h1 className="max-w-5xl text-4xl leading-[0.94] font-semibold tracking-tight text-violet-50 sm:text-7xl lg:text-[5.4rem] lg:leading-[0.88]">
              {tr(locale, "We're an", "We're an")}
              <span className="block bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-500 bg-clip-text text-transparent">
                {tr(locale, "Agentic Engineering Organization", "Agentic Engineering Organization")}
              </span>
            </h1>

            <p className="max-w-3xl text-base leading-8 text-violet-200 sm:text-xl sm:leading-9">
              {tr(locale, "DemumuMind is where AI agents are teammates, not plugins. We build and ship MCP workflows through intent-first engineering, operational clarity, and production feedback loops.", "DemumuMind is where AI agents are teammates, not plugins. We build and ship MCP workflows through intent-first engineering, operational clarity, and production feedback loops.")}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-11 rounded-xl bg-blue-500 px-6 text-white hover:bg-blue-400">
                <Link href="/catalog">
                  {tr(locale, "Join the Build", "Join the Build")}
                  <ArrowRight className="size-4"/>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-xl border-white/15 bg-indigo-950/65 text-violet-50 hover:bg-indigo-900">
                <Link href="/how-to-use">
                  {tr(locale, "Watch the Workflow", "Watch the Workflow")}
                  <Activity className="size-4"/>
                </Link>
              </Button>
            </div>

            <div className="grid gap-2 pt-1 sm:grid-cols-3">
              {heroStats.map((item) => (<div key={item.en} className="rounded-lg border border-cyan-400/20 bg-cyan-500/5 px-3 py-2 text-xs font-semibold tracking-[0.14em] text-cyan-200 uppercase">
                  {tr(locale, item.en, item.en)}
                </div>))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="about-reveal about-delay-1 space-y-5 rounded-3xl border border-white/10 bg-indigo-950/65 p-6 sm:p-8">
            <h2 className="text-3xl font-semibold tracking-tight text-violet-50 sm:text-5xl sm:leading-tight">
              {tr(locale, "That's Not Marketing Speak.", "That's Not Marketing Speak.")}
              <span className="block text-violet-200">{tr(locale, "It's Our Operating Model.", "It's Our Operating Model.")}</span>
            </h2>
            <p className="text-sm leading-7 text-violet-200 sm:text-base">
              {tr(locale, "At DemumuMind, AI agents are embedded into the product lifecycle: discovery, implementation, review, and release. Engineers keep architectural control while agents execute high-throughput tasks.", "At DemumuMind, AI agents are embedded into the product lifecycle: discovery, implementation, review, and release. Engineers keep architectural control while agents execute high-throughput tasks.")}
            </p>
            <p className="text-sm leading-7 text-violet-200 sm:text-base">
              {tr(locale, "Every integration we publish is proof: human judgment + agentic execution can outperform traditional workflows when signal quality is high.", "Every integration we publish is proof: human judgment + agentic execution can outperform traditional workflows when signal quality is high.")}
            </p>
          </div>

          <Card className="about-reveal about-delay-2 border-cyan-500/25 bg-indigo-950/75 transition duration-300 hover:border-cyan-400/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl text-violet-50">{tr(locale, "Execution Model", "Execution Model")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-xl border border-white/10 bg-indigo-900/65 p-4">
                <p className="mb-1 font-semibold text-violet-50">01 — {tr(locale, "Traditional Teams", "Traditional Teams")}</p>
                <p className="text-violet-300">
                  {tr(locale, "Humans do most implementation, AI assists occasionally.", "Humans do most implementation, AI assists occasionally.")}
                </p>
              </div>
              <div className="rounded-xl border border-cyan-400/35 bg-cyan-500/10 p-4">
                <p className="mb-1 font-semibold text-cyan-100">02 — DemumuMind</p>
                <p className="text-cyan-200/90">
                  {tr(locale, "Humans direct -> AI agents execute -> humans validate and refine.", "Humans direct -> AI agents execute -> humans validate and refine.")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="about-reveal about-delay-0 mb-8 text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-violet-50 sm:text-5xl">
            {tr(locale, "Meet the Founding Team", "Meet the Founding Team")}
          </h2>
          <p className="mt-2 text-violet-300">
            {tr(locale, "The operators behind DemumuMind's agentic workflow model", "The operators behind DemumuMind's agentic workflow model")}
          </p>
        </div>

        <div className="about-reveal about-delay-1 overflow-hidden rounded-3xl border border-white/10 bg-indigo-950/70 lg:grid lg:grid-cols-[0.42fr_0.58fr]">
          <div className="relative flex min-h-[320px] items-center justify-center border-b border-white/10 bg-[linear-gradient(140deg,rgba(30,64,175,0.35),rgba(6,182,212,0.2))] lg:min-h-[420px] lg:border-b-0 lg:border-r lg:border-white/10">
            <div className="about-float-slow absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(56,189,248,0.3),transparent_70%)]"/>
            <div className="relative text-center">
              <div className="mx-auto flex size-44 items-center justify-center rounded-full border border-cyan-300/30 bg-[linear-gradient(135deg,#3b82f6,#06b6d4)] text-4xl font-semibold text-white shadow-[0_0_60px_rgba(56,189,248,0.35)]">
                DM
              </div>
              <p className="mx-auto mt-4 w-fit rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1 text-xs font-semibold text-cyan-200">
                {tr(locale, "Founding Team", "Founding Team")}
              </p>
            </div>
          </div>

          <div className="space-y-5 p-6 sm:p-8">
            <h3 className="text-3xl font-semibold text-violet-50">DemumuMind</h3>
            <p className="text-cyan-300">{tr(locale, "Developer-First MCP Platform", "Developer-First MCP Platform")}</p>
            <p className="text-base leading-8 text-violet-200">
              {tr(locale, "We started DemumuMind to solve one practical problem: MCP integration decisions were noisy, fragmented, and hard to operationalize across teams.", "We started DemumuMind to solve one practical problem: MCP integration decisions were noisy, fragmented, and hard to operationalize across teams.")}
            </p>
            <p className="text-base leading-8 text-violet-200">
              {tr(locale, "Today, we combine directory signal, setup tooling, and moderated workflow so teams can move from intent to implementation faster.", "Today, we combine directory signal, setup tooling, and moderated workflow so teams can move from intent to implementation faster.")}
            </p>
            <blockquote className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4 text-xl font-semibold italic text-cyan-100">
              {tr(locale, '"The gap between idea and production should be measured in hours, not quarters."', '"The gap between idea and production should be measured in hours, not quarters."')}
            </blockquote>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[linear-gradient(180deg,#030916_0%,#060812_100%)]">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="about-reveal about-delay-0 mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-semibold tracking-tight text-violet-50 sm:text-5xl">
              {tr(locale, "Our Mission", "Our Mission")}
            </h2>
            <p className="mt-4 text-lg text-violet-200">
              {tr(locale, "Democratize production-grade software delivery by combining human architecture decisions with AI agent execution.", "Democratize production-grade software delivery by combining human architecture decisions with AI agent execution.")}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {missionCards.map((item, index) => (<Card key={item.title.en} className={cn("about-reveal border-white/10 bg-indigo-950/75 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/35", revealDelayClasses[index % revealDelayClasses.length])}>
                <CardHeader className="pb-2">
                  <div className="mb-2 inline-flex size-10 items-center justify-center rounded-lg border border-cyan-400/35 bg-cyan-500/10 text-cyan-200">
                    <item.icon className="size-5"/>
                  </div>
                  <CardTitle className="text-xl text-violet-50">{tr(locale, item.title.en, item.title.en)}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-7 text-violet-200">
                  {tr(locale, item.description.en, item.description.en)}
                </CardContent>
              </Card>))}
          </div>

          <div className="about-reveal about-delay-2 mx-auto mt-12 max-w-3xl text-center">
            <h3 className="text-4xl font-semibold tracking-tight text-violet-50 sm:text-5xl">
              {tr(locale, "Our Vision", "Our Vision")}
            </h3>
            <p className="mt-4 text-2xl leading-relaxed text-violet-200">
              {tr(locale, "A world where any technical team can ship robust AI integrations regardless of size.", "A world where any technical team can ship robust AI integrations regardless of size.")}
            </p>
            <Badge className="mt-5 border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-emerald-200">
              <CheckCircle2 className="size-3"/>
              {tr(locale, "Making every team integration-ready", "Making every team integration-ready")}
            </Badge>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="about-reveal about-delay-0 text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-violet-50 sm:text-5xl">
            {tr(locale, "What Makes DemumuMind Different", "What Makes DemumuMind Different")}
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-lg text-violet-200">
            {tr(locale, "We're not another coding platform. We're an operational layer for shipping MCP workflows with trust signals and execution discipline.", "We're not another coding platform. We're an operational layer for shipping MCP workflows with trust signals and execution discipline.")}
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {differenceCards.map((item, index) => (<Card key={item.title.en} className={cn("about-reveal border-white/10 bg-indigo-950/75 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/35", revealDelayClasses[index % revealDelayClasses.length])}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-2xl text-violet-50">
                  <span className="inline-flex size-8 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-500/10 text-cyan-200">
                    <item.icon className="size-4"/>
                  </span>
                  {tr(locale, item.title.en, item.title.en)}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-violet-200">
                {tr(locale, item.description.en, item.description.en)}
              </CardContent>
            </Card>))}
        </div>

        <div className="about-reveal about-delay-1 mt-14 text-center">
          <h3 className="text-4xl font-semibold tracking-tight text-violet-50 sm:text-5xl">
            {tr(locale, "The DemumuMind Way", "The DemumuMind Way")}
          </h3>
          <p className="mt-3 text-lg text-violet-200">
            {tr(locale, "Principles that guide our engineering culture", "Principles that guide our engineering culture")}
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {valueCards.map((item, index) => (<Card key={item.title.en} className={cn("about-reveal border-white/10 bg-indigo-950/75 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/35", revealDelayClasses[index % revealDelayClasses.length])}>
              <CardHeader className="pb-2">
                <div className="mb-2 inline-flex size-10 items-center justify-center rounded-lg border border-cyan-400/35 bg-cyan-500/10 text-cyan-200">
                  <item.icon className="size-5"/>
                </div>
                <CardTitle className="text-xl text-violet-50">{tr(locale, item.title.en, item.title.en)}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-violet-200">
                {tr(locale, item.description.en, item.description.en)}
              </CardContent>
            </Card>))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="about-reveal about-delay-0 rounded-3xl border border-white/10 bg-indigo-950/70 p-6 sm:p-10">
          <div className="text-center">
            <h2 className="text-4xl font-semibold tracking-tight text-violet-50 sm:text-5xl">
              {tr(locale, "Join the Team", "Join the Team")}
            </h2>
            <p className="mt-3 text-lg text-violet-200">
              {tr(locale, "Want to build at the edge of agentic software delivery? We're hiring operators who ship.", "Want to build at the edge of agentic software delivery? We're hiring operators who ship.")}
            </p>
          </div>

          <div className="mt-7 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {openRoles.map((role, index) => (<div key={role.title.en} className={cn("about-reveal rounded-xl border border-white/10 bg-indigo-900/70 p-4 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/35", revealDelayClasses[index % revealDelayClasses.length])}>
                <p className="font-semibold text-violet-50">{tr(locale, role.title.en, role.title.en)}</p>
                <p className="mt-2 inline-flex rounded-md border border-white/15 bg-indigo-950/80 px-2 py-0.5 text-xs text-violet-300">
                  {tr(locale, role.stack.en, role.stack.en)}
                </p>
              </div>))}
          </div>

          <div className="mt-7 flex justify-center">
            <Button asChild className="h-11 rounded-xl bg-blue-500 px-6 text-white hover:bg-blue-400">
              <Link href="mailto:demumumind@gmail.com?subject=Open%20Role%20Inquiry%20-%20DemumuMind">
                {tr(locale, "View Open Roles", "View Open Roles")}
                <ArrowRight className="size-4"/>
              </Link>
            </Button>
          </div>
        </div>

        <div className="about-reveal about-delay-1 mt-10 rounded-3xl border border-cyan-400/20 bg-[linear-gradient(90deg,rgba(10,25,47,0.92),rgba(4,47,70,0.88))] p-8 text-center sm:p-10">
          <h3 className="text-4xl font-semibold tracking-tight text-violet-50 sm:text-6xl">
            {tr(locale, "The Future Ships From Here", "The Future Ships From Here")}
          </h3>
          <p className="mx-auto mt-4 max-w-3xl text-xl leading-9 text-violet-200">
            {tr(locale, "Join builders defining what production AI integration looks like: high signal, fast iteration, and real outcomes.", "Join builders defining what production AI integration looks like: high signal, fast iteration, and real outcomes.")}
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild className="h-11 rounded-xl bg-blue-500 px-6 text-white hover:bg-blue-400">
              <Link href="/catalog">
                {tr(locale, "Join the Movement", "Join the Movement")}
                <ArrowRight className="size-4"/>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-xl border-white/20 bg-indigo-950/65 text-violet-50 hover:bg-indigo-900">
              <Link href="/how-to-use">{tr(locale, "Get Started", "Get Started")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>);
}
