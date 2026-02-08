import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Newspaper, Sparkles, Workflow } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Articles on vibe coding, agentic coding, prompt engineering, and AI development best practices.",
};

const featuredArticle = {
  title: "MCP Setup Playbook for Production Teams",
  summary:
    "A practical rollout sequence to move from MCP discovery to controlled deployment without integration dead-ends.",
  readTime: "6 min read",
  href: "/how-to-use",
  tag: "Playbook",
} as const;

const latestArticles = [
  {
    title: "MCP Setup Playbook for Production Teams",
    excerpt:
      "A practical rollout sequence to move from MCP discovery to controlled deployment without integration dead-ends.",
    href: "/how-to-use",
    readTime: "6 min",
    tag: "Playbook",
  },
  {
    title: "MCP Overview: Choosing the Right Integration Surface",
    excerpt:
      "How to evaluate server fit by auth requirements, operational ownership, and long-term maintainability.",
    href: "/mcp",
    readTime: "5 min",
    tag: "Architecture",
  },
  {
    title: "Catalog Patterns: From Discovery to Reuse",
    excerpt:
      "Workflow patterns that help teams reuse integration knowledge and avoid duplicated setup effort.",
    href: "/catalog",
    readTime: "7 min",
    tag: "Workflow",
  },
] as const;

const editorialTracks = [
  {
    title: "MCP Overview",
    description: "Architecture notes, trust signals, and integration surface decisions.",
    href: "/mcp",
    icon: Workflow,
  },
  {
    title: "Implementation Guides",
    description: "Hands-on integration walkthroughs, constraints, and deployment notes.",
    href: "/how-to-use",
    icon: BookOpen,
  },
  {
    title: "Product Updates",
    description: "Catalog updates, moderation pipeline improvements, and release announcements.",
    href: "/tools",
    icon: Newspaper,
  },
] as const;

export default function BlogPage() {
  return (
    <div className="relative overflow-hidden border-t border-white/10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#050d1b_0%,#060b16_45%,#040811_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-[radial-gradient(circle_at_15%_5%,rgba(139,92,246,0.2),transparent_38%),radial-gradient(circle_at_82%_5%,rgba(56,189,248,0.14),transparent_38%)]" />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <section className="rounded-3xl border border-violet-400/20 bg-slate-950/72 p-6 sm:p-8">
          <Badge className="mb-4 w-fit border-violet-400/35 bg-violet-500/10 text-violet-200">
            Resources
          </Badge>
          <h1 className="text-4xl leading-tight font-semibold tracking-tight text-slate-100 sm:text-6xl">
            BridgeMind Blog
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            Editorial notes, benchmarks, and implementation playbooks for teams shipping agentic
            coding workflows.
          </p>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <Card className="border-violet-400/20 bg-[linear-gradient(130deg,rgba(53,30,96,0.45),rgba(10,18,35,0.85))]">
            <CardHeader className="pb-2">
              <div className="inline-flex w-fit rounded-full border border-violet-400/30 bg-violet-500/12 px-3 py-1 text-xs text-violet-200">
                {featuredArticle.tag}
              </div>
              <CardTitle className="mt-3 text-2xl text-slate-100 sm:text-3xl">
                {featuredArticle.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <p>{featuredArticle.summary}</p>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs tracking-[0.14em] text-slate-400 uppercase">
                  {featuredArticle.readTime}
                </span>
                <Button asChild className="bg-blue-500 hover:bg-blue-400">
                  <Link href={featuredArticle.href}>
                    Open article
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-950/75">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xl text-slate-100">
                <Sparkles className="size-4 text-violet-200" />
                Editorial tracks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {editorialTracks.map((track) => (
                <Link
                  key={track.title}
                  href={track.href}
                  className="block rounded-xl border border-white/10 bg-slate-900/65 p-3 transition hover:border-violet-400/35"
                >
                  <p className="flex items-center gap-2 font-medium text-slate-100">
                    <track.icon className="size-4 text-violet-200" />
                    {track.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">{track.description}</p>
                </Link>
              ))}
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-100 sm:text-3xl">
              Latest from BridgeMind
            </h2>
            <Button
              asChild
              variant="outline"
              className="border-white/20 bg-slate-900/70 text-slate-100 hover:bg-slate-900"
            >
              <Link href="/how-to-use">Open setup guide</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {latestArticles.map((article) => (
              <Card key={article.title} className="border-white/10 bg-slate-950/75">
                <CardHeader className="pb-2">
                  <div className="inline-flex w-fit rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-200">
                    {article.tag}
                  </div>
                  <CardTitle className="mt-2 text-lg text-slate-100">{article.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-300">
                  <p>{article.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs tracking-[0.14em] text-slate-400 uppercase">
                      {article.readTime}
                    </span>
                    <Link
                      href={article.href}
                      className="inline-flex items-center gap-1 text-slate-100 transition hover:text-white"
                    >
                      Read
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-cyan-400/20 bg-[linear-gradient(120deg,rgba(11,30,50,0.85),rgba(6,12,24,0.95))] p-6 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-100 sm:text-3xl">
            Want to suggest an article or benchmark scenario?
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            Send us your topic idea, production challenge, or model comparison request and we will
            include it in the editorial queue.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="bg-blue-500 hover:bg-blue-400">
              <Link href="/contact">
                Contact editorial team
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/20 bg-slate-900/70 text-slate-100 hover:bg-slate-900"
            >
              <Link href="/discord">Discuss in Discord</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
