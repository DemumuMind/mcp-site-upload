import Link from "next/link";
import { type LucideIcon, Activity, ArrowRight, BrainCircuit, Blocks, BotMessageSquare, Bot, CheckCircle2, Code2, Command, Github, LayoutDashboard, MonitorSmartphone, MousePointer2, Search, ShieldCheck, Sparkles, TerminalSquare, Waves, Wrench, } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmissionAccessPanel } from "@/components/submission-access-panel";
import { getCatalogSnapshot } from "@/lib/catalog/snapshot";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import type { AuthType } from "@/lib/types";
const authTypeLabel: Record<AuthType, string> = {
    none: "Open",
    api_key: "API Key",
    oauth: "OAuth",
};
const workflowCards = [
    {
        title: {
            en: "Catalog Discovery Engine",
        },
        badge: {
            en: "Live",
        },
        description: {
            en: "Search MCP servers by category, language, auth type, and verification level in one flow.",
        },
        href: "/catalog",
        cta: {
            en: "Explore catalog",
        },
        icon: Search,
        accent: "text-cyan-300",
        badgeClass: "border-cyan-400/40 bg-cyan-500/10 text-cyan-300",
    },
    {
        title: {
            en: "Submission Pipeline",
        },
        badge: {
            en: "Moderated",
        },
        description: {
            en: "Public submissions plus admin moderation keep the directory high-signal and production-ready.",
        },
        href: "/submit-server",
        cta: {
            en: "Submit server",
        },
        icon: ShieldCheck,
        accent: "text-violet-300",
        badgeClass: "border-violet-400/40 bg-violet-500/10 text-violet-300",
    },
    {
        title: {
            en: "Health Signal Monitoring",
        },
        badge: {
            en: "Automated",
        },
        description: {
            en: "Scheduled probes keep status fresh so teams can quickly prioritize reliable integrations.",
        },
        href: "/about",
        cta: {
            en: "How it works",
        },
        icon: Activity,
        accent: "text-emerald-300",
        badgeClass: "border-emerald-400/40 bg-emerald-500/10 text-emerald-300",
    },
    {
        title: {
            en: "Builder Utilities",
        },
        badge: {
            en: "Built In",
        },
        description: {
            en: "Token estimation and rules generation reduce setup friction for new MCP workflows.",
        },
        href: "/tools",
        cta: {
            en: "Open tools",
        },
        icon: Wrench,
        accent: "text-amber-300",
        badgeClass: "border-amber-400/40 bg-amber-500/10 text-amber-300",
    },
] as const;
const superpowerFeatures = [
    {
        title: {
            en: "Universal Agent Support",
        },
        description: {
            en: "Compatible with Claude, Cursor, Codex, Windsurf, and VS Code workflows.",
        },
        icon: Bot,
    },
    {
        title: {
            en: "Project Workflows",
        },
        description: {
            en: "Keep discovery, review, and rollout in one shared workspace.",
        },
        icon: LayoutDashboard,
    },
    {
        title: {
            en: "Task Orchestration",
        },
        description: {
            en: "Track setup, auth requirements, and ownership by server.",
        },
        icon: CheckCircle2,
    },
    {
        title: {
            en: "Secure by Default",
        },
        description: {
            en: "Auth type, verification level, and maintainer metadata are first-class.",
        },
        icon: ShieldCheck,
    },
] as const;
const icpCards = [
    {
        title: {
            en: "Indie Builders",
        },
        description: {
            en: "Validate MCP options fast and avoid dead-end integrations before you commit your stack.",
        },
        outcome: {
            en: "Ship first working integration in days, not weeks.",
        },
        icon: Command,
        badgeClass: "border-cyan-400/35 bg-cyan-500/10 text-cyan-200",
    },
    {
        title: {
            en: "Product Teams",
        },
        description: {
            en: "Standardize discovery, setup notes, and moderation so every squad reuses proven MCP patterns.",
        },
        outcome: {
            en: "Reduce integration rework and speed up release cycles.",
        },
        icon: LayoutDashboard,
        badgeClass: "border-emerald-400/35 bg-emerald-500/10 text-emerald-200",
    },
    {
        title: {
            en: "Platform & Security",
        },
        description: {
            en: "Audit auth types, ownership, and verification context before allowing server adoption.",
        },
        outcome: {
            en: "Improve governance without slowing down delivery.",
        },
        icon: ShieldCheck,
        badgeClass: "border-violet-400/35 bg-violet-500/10 text-violet-200",
    },
] as const;
type StackItem = {
    name: string;
    icon: LucideIcon;
    badge: string;
    cardClass: string;
    iconClass: string;
};
const stackItems: readonly StackItem[] = [
    {
        name: "Cursor",
        icon: MousePointer2,
        badge: "IDE",
        cardClass: "border-cyan-500/25 bg-cyan-500/8",
        iconClass: "border-cyan-400/30 bg-cyan-500/15 text-cyan-200",
    },
    {
        name: "Windsurf",
        icon: Waves,
        badge: "Agent IDE",
        cardClass: "border-emerald-500/25 bg-emerald-500/8",
        iconClass: "border-emerald-400/30 bg-emerald-500/15 text-emerald-200",
    },
    {
        name: "Claude Code",
        icon: BotMessageSquare,
        badge: "CLI Agent",
        cardClass: "border-orange-500/25 bg-orange-500/8",
        iconClass: "border-orange-400/30 bg-orange-500/15 text-orange-200",
    },
    {
        name: "OpenAI Codex",
        icon: BrainCircuit,
        badge: "Code Agent",
        cardClass: "border-blue-500/25 bg-blue-500/8",
        iconClass: "border-blue-400/30 bg-blue-500/15 text-blue-200",
    },
    {
        name: "GitHub Copilot",
        icon: Github,
        badge: "Pair AI",
        cardClass: "border-violet-500/25 bg-violet-500/8",
        iconClass: "border-violet-400/30 bg-violet-500/15 text-violet-200",
    },
    {
        name: "VS Code",
        icon: Code2,
        badge: "Workspace",
        cardClass: "border-violet-400/25 bg-violet-400/8",
        iconClass: "border-violet-300/30 bg-violet-400/15 text-violet-100",
    },
];
const boardRowStyles = [
    "border-cyan-500/30 text-cyan-200",
    "border-emerald-500/30 text-emerald-200",
    "border-violet-500/30 text-violet-200",
    "border-blue-500/30 text-blue-200",
] as const;
export default async function HomePage() {
    const locale = await getLocale();
    const catalogSnapshot = await getCatalogSnapshot({ featuredLimit: 4 });
    const activeServers = catalogSnapshot.servers;
    const featuredServers = catalogSnapshot.featuredServers;
    const totalTools = catalogSnapshot.totalTools;
    const totalCategories = catalogSnapshot.totalCategories;
    const connectionsCount = Math.max(2, Math.min(4, featuredServers.length));
    const firstServer = featuredServers[0];
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const softwareApplicationJsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "DemumuMind MCP",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        url: siteUrl,
        description: tr(locale, "A community-curated catalog where users can discover, evaluate, and submit MCP servers for AI agents.", "A community-curated catalog where users can discover, evaluate, and submit MCP servers for AI agents."),
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
        },
        featureList: [
            tr(locale, "MCP server search and filtering", "MCP server search and filtering"),
            tr(locale, "Authentication and verification badges", "Authentication and verification badges"),
            tr(locale, "Community submission workflow", "Community submission workflow"),
            tr(locale, "Server detail pages and configuration references", "Server detail pages and configuration references"),
        ],
    };
    return (<div className="relative isolate w-full overflow-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}/>

      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(10,18,36,0.96),rgba(4,8,20,0.98)),linear-gradient(90deg,rgba(56,189,248,0.08)_1px,transparent_1px),linear-gradient(rgba(56,189,248,0.08)_1px,transparent_1px)] bg-[size:auto,44px_44px,44px_44px]"/>
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px] bg-[radial-gradient(circle_at_30%_10%,rgba(59,130,246,0.35),transparent_45%),radial-gradient(circle_at_70%_15%,rgba(14,165,233,0.18),transparent_40%)]"/>

      <section className="mx-auto flex min-h-[82vh] w-full max-w-7xl flex-col items-center justify-start gap-8 px-4 pb-14 pt-20 text-center sm:px-6 sm:pb-16 sm:pt-24 lg:px-8 lg:pt-28">
        <Badge className="mx-auto w-fit border border-cyan-400/45 bg-cyan-500/12 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-cyan-200 uppercase">
          {tr(locale, "Community-Curated MCP Directory", "Community-Curated MCP Directory")}
        </Badge>

        <div className="max-w-5xl space-y-5 sm:space-y-6">
          <h1 className="text-4xl leading-[0.95] font-semibold tracking-tight text-violet-50 sm:text-6xl lg:text-8xl">
            {tr(locale, "Ship MCP Integrations at the", "Ship MCP Integrations at the")}
            <span className="block bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent">
              {tr(locale, "Speed of Trust.", "Speed of Trust.")}
            </span>
          </h1>
          <p className="mx-auto max-w-3xl text-base text-violet-200 sm:text-xl">
            {tr(locale, "The complete ", "The complete ")}
            <span className="font-semibold text-violet-50">
              {tr(locale, "MCP discovery toolkit", "MCP discovery toolkit")}
            </span>
            {tr(locale, ": find trusted servers, validate auth and health signals, and submit your own integrations through a moderated workflow.", ": find trusted servers, validate auth and health signals, and submit your own integrations through a moderated workflow.")}
          </p>
        </div>

        <div className="flex w-full max-w-xl flex-col items-stretch justify-center gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center">
          <Button asChild size="lg" className="h-12 w-full rounded-xl bg-blue-500 px-7 text-sm font-semibold text-white shadow-[0_0_32px_rgba(59,130,246,0.45)] transition hover:bg-blue-400 sm:w-auto">
            <Link href="/catalog">
              {tr(locale, "Get Started", "Get Started")}
              <ArrowRight className="size-4"/>
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 w-full rounded-xl border-white/15 bg-indigo-950/75 px-7 text-sm text-violet-50 hover:bg-indigo-900 sm:w-auto">
            <Link href="/submit-server">{tr(locale, "Submit Server", "Submit Server")}</Link>
          </Button>
        </div>

        <div className="mx-auto flex max-w-full w-fit flex-wrap items-center justify-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-4 py-2 text-xs sm:text-sm">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-200">
            <Sparkles className="size-3.5"/>
            {tr(locale, "Launch Week", "Launch Week")}
          </span>
          <span className="text-violet-200">{tr(locale, "Use code", "Use code")}</span>
          <span className="rounded-md border border-emerald-400/30 bg-indigo-950/65 px-2 py-0.5 font-semibold tracking-wide text-emerald-200">
            MCPFASTLANE
          </span>
          <span className="text-violet-200">
            {tr(locale, "for priority moderation queue.", "for priority moderation queue.")}
          </span>
        </div>

        <div className="grid w-full max-w-4xl gap-3 sm:grid-cols-3">
          <Card className="border-white/10 bg-indigo-950/78">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs tracking-[0.18em] text-violet-300 uppercase">
                {tr(locale, "Active servers", "Active servers")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-violet-50">
              {activeServers.length}
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-indigo-950/78">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs tracking-[0.18em] text-violet-300 uppercase">
                {tr(locale, "Published tools", "Published tools")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-violet-50">
              {totalTools}
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-indigo-950/78">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs tracking-[0.18em] text-violet-300 uppercase">
                {tr(locale, "Categories", "Categories")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-violet-50">
              {totalCategories}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-y border-white/10 bg-indigo-950/45">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-14 sm:px-6 lg:px-8">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-violet-50 sm:text-4xl">
              {tr(locale, "Built for Real ICPs", "Built for Real ICPs")}
            </h2>
            <p className="mx-auto max-w-3xl text-violet-200">
              {tr(locale, "Different teams use MCP differently. The platform is tuned for discovery speed, rollout safety, and repeatable delivery.", "Different teams use MCP differently. The platform is tuned for discovery speed, rollout safety, and repeatable delivery.")}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {icpCards.map((card) => (<Card key={card.title.en} className="border-white/10 bg-indigo-950/70">
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="rounded-xl border border-white/10 bg-indigo-900/80 p-2.5">
                      <card.icon className="size-4 text-violet-100"/>
                    </div>
                    <Badge className={card.badgeClass}>{tr(locale, "ICP", "ICP")}</Badge>
                  </div>
                  <CardTitle className="text-xl text-violet-50">{card.title[locale]}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-violet-200">
                  <p>{card.description[locale]}</p>
                  <p className="text-violet-50">{card.outcome[locale]}</p>
                </CardContent>
              </Card>))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-indigo-950/45">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-20 sm:px-6 lg:px-8">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-violet-50 sm:text-5xl">
              {tr(locale, "The MCP Delivery Toolkit", "The MCP Delivery Toolkit")}
            </h2>
            <p className="mx-auto max-w-3xl text-violet-200">
              {tr(locale, "Four product surfaces. One operational system for shipping MCP integrations.", "Four product surfaces. One operational system for shipping MCP integrations.")}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {workflowCards.map((item) => (<Card key={item.title.en} className="group border-white/10 bg-indigo-950/65 transition hover:border-white/25 hover:bg-indigo-950/85">
                <CardHeader className="space-y-4 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl border border-white/10 bg-indigo-900/80 p-2.5">
                        <item.icon className={`size-4 ${item.accent}`}/>
                      </div>
                      <CardTitle className="text-xl text-violet-50">{item.title[locale]}</CardTitle>
                    </div>
                    <Badge className={`border ${item.badgeClass}`}>{item.badge[locale]}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-violet-200">
                  <p>{item.description[locale]}</p>
                  <Link href={item.href} className={`inline-flex items-center gap-2 text-sm font-medium ${item.accent} transition group-hover:translate-x-0.5`}>
                    {item.cta[locale]}
                    <ArrowRight className="size-4"/>
                  </Link>
                </CardContent>
              </Card>))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[linear-gradient(180deg,rgba(5,12,28,0.86),rgba(3,8,20,0.95))]">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:px-8">
          <div className="space-y-6">
            <Badge className="w-fit border border-blue-400/40 bg-blue-500/12 text-blue-200">
              {tr(locale, "MCP Workflow Layer", "MCP Workflow Layer")}
            </Badge>
            <h3 className="text-4xl leading-tight font-semibold tracking-tight text-violet-50 sm:text-5xl">
              {tr(locale, "Give Your Agents", "Give Your Agents")}
              <span className="block bg-gradient-to-r from-sky-300 via-blue-400 to-blue-500 bg-clip-text text-transparent">
                {tr(locale, "Superpowers", "Superpowers")}
              </span>
            </h3>
            <p className="max-w-xl text-lg text-violet-200">
              {tr(locale, "Use one shared catalog to manage discovery, review, and rollout across your team's AI clients.", "Use one shared catalog to manage discovery, review, and rollout across your team's AI clients.")}
            </p>
            <div className="grid gap-3 text-sm text-violet-100 sm:grid-cols-2">
              {superpowerFeatures.map((feature) => (<div key={feature.title.en} className="rounded-xl border border-white/10 bg-indigo-950/75 p-3">
                  <feature.icon className="mb-2 size-4 text-cyan-300"/>
                  <p className="font-medium text-violet-50">{feature.title[locale]}</p>
                  <p className="text-xs text-violet-300">{feature.description[locale]}</p>
                </div>))}
            </div>
            <Button asChild variant="outline" className="h-11 rounded-xl border-blue-400/35 bg-blue-500/10 text-blue-100 hover:bg-blue-500/20">
              <Link href="/mcp">
                {tr(locale, "View MCP overview", "View MCP overview")}
                <ArrowRight className="size-4"/>
              </Link>
            </Button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-indigo-950/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
            <div className="rounded-xl border border-white/10 bg-indigo-900/80 p-4">
              <div className="mb-5 flex items-center justify-between text-[11px] tracking-[0.18em] text-violet-300 uppercase">
                <span className="inline-flex items-center gap-2">
                  <span className="size-2 rounded-full bg-blue-400"/>
                  {tr(locale, "MCP Session", "MCP Session")}
                </span>
                <span>{tr(locale, "Active Clients", "Active Clients")}</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-emerald-500/25 bg-indigo-950/70 p-3">
                  <p className="font-medium text-violet-50">Cursor IDE</p>
                  <span className="text-xs text-emerald-300">
                    {tr(locale, "Connected", "Connected")}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-cyan-500/25 bg-indigo-950/70 p-3">
                  <p className="font-medium text-violet-50">Claude Code</p>
                  <span className="text-xs text-cyan-300">
                    {tr(locale, "Connected", "Connected")}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-amber-500/25 bg-indigo-950/70 p-3">
                  <p className="font-medium text-violet-50">OpenAI Codex</p>
                  <span className="text-xs text-amber-300">{tr(locale, "Standby", "Standby")}</span>
                </div>
              </div>
              <div className="mt-4 rounded-lg border border-white/10 bg-indigo-950/80 p-4 font-mono text-xs text-violet-200">
                <p className="text-violet-400">
                  {tr(locale, "Workflow status snapshot", "Workflow status snapshot")}
                </p>
                <p className="mt-2 text-blue-300">
                  {tr(locale, "[CATALOG]", "[CATALOG]")} {activeServers.length}{" "}
                  {tr(locale, "active servers indexed", "active servers indexed")}
                </p>
                <p className="text-emerald-300">
                  {tr(locale, "[STATUS]", "[STATUS]")} {connectionsCount}{" "}
                  {tr(locale, "team clients connected", "team clients connected")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="rounded-2xl border border-cyan-500/20 bg-[#02060f] p-5 shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_24px_60px_rgba(2,132,199,0.15)] sm:p-7">
          <div className="mb-4 flex items-center gap-3 text-xs text-violet-400">
            <span className="size-2 rounded-full bg-rose-500"/>
            <span className="size-2 rounded-full bg-amber-400"/>
            <span className="size-2 rounded-full bg-emerald-500"/>
            <span className="ml-2 font-mono tracking-[0.18em] uppercase">
              {tr(locale, "DemumuMind MCP terminal", "DemumuMind MCP terminal")}
            </span>
          </div>
          <div className="space-y-2 font-mono text-xs sm:text-sm">
            <p className="text-violet-300">
              {tr(locale, "STEP 1 - Search by category and auth type", "STEP 1 - Search by category and auth type")}
            </p>
            <p className="pl-4 text-cyan-300">
              + {tr(locale, "Found", "Found")} {activeServers.length}{" "}
              {tr(locale, "active MCP servers", "active MCP servers")}
            </p>
            <p className="pl-4 text-cyan-300">
              + {tr(locale, "Top match", "Top match")}: {firstServer?.name ?? "Linear"} (
              {firstServer?.category ?? tr(locale, "Productivity", "Productivity")})
            </p>
            <p className="text-violet-300">
              {tr(locale, "STEP 2 - Inspect auth and verification metadata", "STEP 2 - Inspect auth and verification metadata")}
            </p>
            <p className="pl-4 text-emerald-300">
              + {tr(locale, "Auth", "Auth")}: {authTypeLabel[firstServer?.authType ?? "oauth"]}
            </p>
            <p className="pl-4 text-emerald-300">
              +{" "}
              {tr(locale, "Verification: production metadata available", "Verification: production metadata available")}
            </p>
            <p className="text-violet-300">
              {tr(locale, "STEP 3 - Document integration and rollout", "STEP 3 - Document integration and rollout")}
            </p>
            <p className="pl-4 text-blue-300">
              + {tr(locale, "Added server profile and setup guidance", "Added server profile and setup guidance")}
            </p>
            <p className="mt-2 text-cyan-200">
              - {tr(locale, "Agent integration ready", "Agent integration ready")}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <Badge className="w-fit border border-cyan-400/40 bg-cyan-500/10 text-cyan-200">
            {tr(locale, "Operational Playbook", "Operational Playbook")}
          </Badge>
          <h3 className="text-4xl leading-tight font-semibold tracking-tight text-violet-50 sm:text-5xl">
            {tr(locale, "Ship From", "Ship From")}
            <span className="block bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              {tr(locale, "Your Terminal", "Your Terminal")}
            </span>
          </h3>
          <p className="max-w-xl text-lg text-violet-200">
            {tr(locale, "Follow a repeatable workflow: search servers, validate trust signals, and capture setup steps your team can reuse.", "Follow a repeatable workflow: search servers, validate trust signals, and capture setup steps your team can reuse.")}
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-indigo-950/70 p-3">
              <TerminalSquare className="size-4 text-cyan-300"/>
              <p className="text-sm text-violet-100">
                {tr(locale, "Search and filter candidates in seconds", "Search and filter candidates in seconds")}
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-indigo-950/70 p-3">
              <Blocks className="size-4 text-cyan-300"/>
              <p className="text-sm text-violet-100">
                {tr(locale, "Review auth and verification before connecting", "Review auth and verification before connecting")}
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-indigo-950/70 p-3">
              <Command className="size-4 text-cyan-300"/>
              <p className="text-sm text-violet-100">
                {tr(locale, "Capture setup notes and rollout checklists", "Capture setup notes and rollout checklists")}
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="h-11 rounded-xl border-cyan-400/35 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20">
            <Link href="/how-to-use">
              {tr(locale, "Explore setup guide", "Explore setup guide")}
              <ArrowRight className="size-4"/>
            </Link>
          </Button>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[linear-gradient(180deg,#040b17_0%,#050f1b_100%)]">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="space-y-6">
            <Badge className="w-fit border border-emerald-400/35 bg-emerald-500/10 text-emerald-200">
              {tr(locale, "Team Operations", "Team Operations")}
            </Badge>
            <h3 className="text-4xl leading-tight font-semibold tracking-tight text-violet-50 sm:text-5xl">
              {tr(locale, "Your Desktop", "Your Desktop")}
              <span className="block bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                {tr(locale, "Command Center", "Command Center")}
              </span>
            </h3>
            <p className="max-w-xl text-lg text-violet-200">
              {tr(locale, "Coordinate catalog discovery, moderation tasks, and integration checks in one operational surface.", "Coordinate catalog discovery, moderation tasks, and integration checks in one operational surface.")}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-indigo-950/75 p-3">
                <p className="text-sm font-medium text-violet-50">
                  {tr(locale, "Workspace Templates", "Workspace Templates")}
                </p>
                <p className="text-xs text-violet-300">
                  {tr(locale, "Saved setup patterns for recurring integrations", "Saved setup patterns for recurring integrations")}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-indigo-950/75 p-3">
                <p className="text-sm font-medium text-violet-50">
                  {tr(locale, "Runbook Blocks", "Runbook Blocks")}
                </p>
                <p className="text-xs text-violet-300">
                  {tr(locale, "Reusable checklists for approval and rollout", "Reusable checklists for approval and rollout")}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-indigo-950/75 p-3">
                <p className="text-sm font-medium text-violet-50">
                  {tr(locale, "Queue Visibility", "Queue Visibility")}
                </p>
                <p className="text-xs text-violet-300">
                  {tr(locale, "Track pending submissions and review status", "Track pending submissions and review status")}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-indigo-950/75 p-3">
                <p className="text-sm font-medium text-violet-50">
                  {tr(locale, "Cross-Client", "Cross-Client")}
                </p>
                <p className="text-xs text-violet-300">
                  {tr(locale, "Supports the MCP clients your team already uses", "Supports the MCP clients your team already uses")}
                </p>
              </div>
            </div>
            <Button asChild variant="outline" className="h-11 rounded-xl border-emerald-400/35 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20">
              <Link href="/tools">
                {tr(locale, "Explore tooling", "Explore tooling")}
                <ArrowRight className="size-4"/>
              </Link>
            </Button>
          </div>

          <div className="rounded-2xl border border-emerald-500/25 bg-indigo-950/80 p-4 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_24px_60px_rgba(5,46,22,0.35)] sm:p-6">
            <div className="mb-4 flex items-center gap-2 text-xs tracking-[0.18em] text-violet-300 uppercase">
              <MonitorSmartphone className="size-4 text-emerald-300"/>
              {tr(locale, "Workspace Activity", "Workspace Activity")}
            </div>
            <div className="space-y-3">
              {featuredServers.map((server, index) => (<div key={server.id} className={`rounded-lg border bg-indigo-900/70 p-3 ${boardRowStyles[index % boardRowStyles.length]}`}>
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <p className="font-medium text-violet-50">{server.name}</p>
                    <Badge className="border-white/15 bg-white/5 text-[10px] text-violet-200">
                      {server.category}
                    </Badge>
                  </div>
                  <p className="line-clamp-1 text-xs text-violet-300">
                    {tr(locale, "Auth", "Auth")}: {authTypeLabel[server.authType]} -{" "}
                    {server.tools.length} {tr(locale, "tools detected", "tools detected")}
                  </p>
                </div>))}
            </div>
          </div>
        </div>
      </section>

      <section id="submit" className="border-y border-fuchsia-500/20 bg-[linear-gradient(180deg,#04040b_0%,#0b0614_100%)]">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="rounded-2xl border border-fuchsia-500/25 bg-indigo-950/80 p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between text-xs text-violet-400">
              <span className="inline-flex items-center gap-2">
                <span className="size-2 rounded-full bg-fuchsia-500"/>
                {tr(locale, "Submission Checklist", "Submission Checklist")}
              </span>
              <span className="font-mono uppercase tracking-[0.18em]">
                {tr(locale, "Moderated", "Moderated")}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-fuchsia-500/20 bg-indigo-900/70 p-3">
                <CheckCircle2 className="mt-0.5 size-4 text-fuchsia-300"/>
                <div>
                  <p className="text-sm font-medium text-violet-50">
                    {tr(locale, "Server metadata complete", "Server metadata complete")}
                  </p>
                  <p className="text-xs text-violet-300">
                    {tr(locale, "Name, endpoint, category, and auth method.", "Name, endpoint, category, and auth method.")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-fuchsia-500/20 bg-indigo-900/70 p-3">
                <ShieldCheck className="mt-0.5 size-4 text-fuchsia-300"/>
                <div>
                  <p className="text-sm font-medium text-violet-50">
                    {tr(locale, "Auth details verified", "Auth details verified")}
                  </p>
                  <p className="text-xs text-violet-300">
                    {tr(locale, "OAuth/API key flow and maintainer contacts.", "OAuth/API key flow and maintainer contacts.")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-fuchsia-500/20 bg-indigo-900/70 p-3">
                <LayoutDashboard className="mt-0.5 size-4 text-fuchsia-300"/>
                <div>
                  <p className="text-sm font-medium text-violet-50">
                    {tr(locale, "Ready for moderation queue", "Ready for moderation queue")}
                  </p>
                  <p className="text-xs text-violet-300">
                    {tr(locale, "Admin review before public listing.", "Admin review before public listing.")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Badge className="w-fit border border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-200">
              {tr(locale, "Community Submission", "Community Submission")}
            </Badge>
            <h3 className="text-4xl leading-tight font-semibold tracking-tight text-violet-50 sm:text-5xl">
              {tr(locale, "Submit With", "Submit With")}
              <span className="block bg-gradient-to-r from-fuchsia-300 to-pink-500 bg-clip-text text-transparent">
                {tr(locale, "Confidence", "Confidence")}
              </span>
            </h3>
            <p className="max-w-xl text-lg text-violet-200">
              {tr(locale, "Sign in, complete server metadata, and submit for moderation. Approved servers become publicly discoverable in the catalog.", "Sign in, complete server metadata, and submit for moderation. Approved servers become publicly discoverable in the catalog.")}
            </p>
            <SubmissionAccessPanel />
          </div>
        </div>
      </section>

      <section className="relative border-y border-white/10 bg-[linear-gradient(180deg,#04060f_0%,#02050c_100%)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.18),transparent_70%)]"/>
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-20 sm:px-6 lg:px-8">
          <div className="space-y-2 text-center">
            <h3 className="text-4xl font-semibold tracking-tight text-violet-50 sm:text-5xl">
              {tr(locale, "The MCP Stack", "The MCP Stack")}
            </h3>
            <p className="text-violet-200">
              {tr(locale, "Leverage the most useful MCP clients and coding agents in one operating model.", "Leverage the most useful MCP clients and coding agents in one operating model.")}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {stackItems.map((item) => {
            const Icon = item.icon;
            return (<div key={item.name} className={`rounded-2xl border px-4 py-5 text-center transition hover:-translate-y-0.5 ${item.cardClass}`}>
                  <div className={`mx-auto mb-3 inline-flex size-10 items-center justify-center rounded-xl border ${item.iconClass}`}>
                    <Icon aria-hidden className="size-5" strokeWidth={2.1}/>
                  </div>
                  <p className="text-sm font-semibold text-violet-50">{item.name}</p>
                  <p className="mt-1 text-[11px] tracking-[0.14em] text-violet-300 uppercase">
                    {item.badge}
                  </p>
                </div>);
        })}
          </div>
        </div>
      </section>

      <section className="relative border-y border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.22),transparent_45%),linear-gradient(180deg,#071228_0%,#050d1f_100%)]">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-4 py-24 text-center sm:px-6">
          <Badge className="border border-emerald-400/35 bg-emerald-500/12 text-emerald-200">
            {tr(locale, "Limited-Time: Priority Review", "Limited-Time: Priority Review")}
          </Badge>
          <h3 className="text-4xl leading-tight font-semibold tracking-tight text-violet-50 sm:text-6xl">
            {tr(locale, "Stop Guessing.", "Stop Guessing.")}
            <span className="block bg-gradient-to-r from-cyan-300 via-blue-300 to-blue-500 bg-clip-text text-transparent">
              {tr(locale, "Start Shipping.", "Start Shipping.")}
            </span>
          </h3>
          <p className="max-w-2xl text-lg text-violet-200">
            {tr(locale, "Use one trusted catalog to discover MCP servers, validate their signals, and move from selection to rollout faster.", "Use one trusted catalog to discover MCP servers, validate their signals, and move from selection to rollout faster.")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-white/10 bg-indigo-950/60 px-4 py-2 text-sm text-violet-200">
            <span>{tr(locale, "Use code", "Use code")}</span>
            <span className="rounded-md border border-blue-400/35 bg-blue-500/15 px-2 py-0.5 font-semibold tracking-wide text-blue-200">
              MCPFASTLANE
            </span>
            <span>{tr(locale, "for priority moderation.", "for priority moderation.")}</span>
          </div>
          <div className="flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Button asChild size="lg" className="h-12 w-full rounded-xl bg-white px-8 text-indigo-900 hover:bg-violet-100 sm:w-auto">
              <Link href="/catalog">{tr(locale, "Open Catalog", "Open Catalog")}</Link>
            </Button>
            <Link href="/how-to-use" className="text-center text-base text-violet-100 underline decoration-violet-400 underline-offset-4 transition hover:text-white sm:text-left">
              {tr(locale, "Read integration guide", "Read integration guide")}
            </Link>
          </div>
        </div>
      </section>
    </div>);
}
