import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Orbit, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { PageFrame, PageHero, PageSection, PageShell } from "@/components/page-templates";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSectionIndex, getSectionLocaleCopy } from "@/lib/content/section-index";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const sectionCopy = getSectionLocaleCopy(getSectionIndex("mcp"), locale);
  return {
    title: sectionCopy?.title ?? tr(locale, "MCP Overview", "MCP Overview"),
    description:
      sectionCopy?.description ??
      tr(locale, "Overview of DemumuMind MCP and how it helps teams.", "Overview of DemumuMind MCP and how it helps teams."),
  };
}

export default async function MCPPage() {
  const locale = await getLocale();
  const sectionCopy = getSectionLocaleCopy(getSectionIndex("mcp"), locale);

  const highlights = [
    {
      title: tr(locale, "Unified Catalog", "Unified Catalog"),
      description: tr(
        locale,
        "Discover MCP servers in one curated searchable directory.",
        "Discover MCP servers in one curated searchable directory.",
      ),
      icon: Sparkles,
    },
    {
      title: tr(locale, "Trust Signals", "Trust Signals"),
      description: tr(
        locale,
        "Track verification and auth type before connecting a server.",
        "Track verification and auth type before connecting a server.",
      ),
      icon: ShieldCheck,
    },
    {
      title: tr(locale, "Fast Integration", "Fast Integration"),
      description: tr(
        locale,
        "Copy-ready server config and clear maintainer metadata.",
        "Copy-ready server config and clear maintainer metadata.",
      ),
      icon: CheckCircle2,
    },
  ];

  const editorialPillars = [
    {
      title: tr(locale, "Editorial Discovery", "Editorial Discovery"),
      description: tr(
        locale,
        "Scan high-signal metadata, security posture, and tool coverage without opening ten tabs.",
        "Scan high-signal metadata, security posture, and tool coverage without opening ten tabs.",
      ),
      icon: Orbit,
    },
    {
      title: tr(locale, "Operational Confidence", "Operational Confidence"),
      description: tr(
        locale,
        "Move from idea to tested MCP connection with traceable trust and setup guidance.",
        "Move from idea to tested MCP connection with traceable trust and setup guidance.",
      ),
      icon: Workflow,
    },
  ];

  return (
    <PageFrame>
      <PageShell className="max-w-6xl gap-6 sm:gap-8">
        <PageHero
          surface="mesh"
          eyebrow={sectionCopy?.eyebrow}
          title={sectionCopy?.heroTitle ?? "MCP"}
          description={
            sectionCopy?.heroDescription ??
            tr(
              locale,
              "Discover verified and community MCP servers, inspect tool capabilities, and connect them to your AI workflows.",
              "Discover verified and community MCP servers, inspect tool capabilities, and connect them to your AI workflows.",
            )
          }
          className="relative overflow-hidden rounded-3xl border-border bg-card/60 p-6 sm:p-10"
          actions={
            <nav className="flex flex-wrap items-center gap-3" aria-label={tr(locale, "MCP page actions", "MCP page actions")}>
              <Button asChild size="lg">
                <Link href="/catalog">
                  {tr(locale, "Browse catalog", "Browse catalog")}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-border bg-background/70 hover:bg-accent">
                <Link href="/how-to-use">{tr(locale, "Open setup guide", "Open setup guide")}</Link>
              </Button>
            </nav>
          }
          metrics={
            <div className="grid gap-3 sm:grid-cols-3" aria-label={tr(locale, "MCP quick facts", "MCP quick facts")}>
              {[
                tr(locale, "Search", "Search"),
                tr(locale, "Verify", "Verify"),
                tr(locale, "Connect", "Connect"),
              ].map((label) => (
                <div key={label} className="rounded-xl border border-border bg-background/50 p-4">
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">{label}</p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground">
                    {tr(
                      locale,
                      "Clear metadata, practical docs, and direct setup paths for production workflows.",
                      "Clear metadata, practical docs, and direct setup paths for production workflows.",
                    )}
                  </p>
                </div>
              ))}
            </div>
          }
        />

        <BlurFade delay={0.2}>
          <section
            className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-muted/40 p-6 sm:p-8"
            aria-label={tr(locale, "MCP editorial hook", "MCP editorial hook")}
          >
            <BorderBeam size={260} duration={14} borderWidth={1} colorFrom="#f4b860" colorTo="#d8a23d" />
            <div className="grid gap-5 md:grid-cols-[1.1fr_1fr] md:items-end">
              <div className="space-y-3">
                <p className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                  {tr(locale, "Industrial Editorial 2.0", "Industrial Editorial 2.0")}
                </p>
                <h2 className="font-serif text-2xl leading-tight font-semibold tracking-tight text-foreground sm:text-3xl">
                  {tr(
                    locale,
                    "From fragmented server notes to one operational reading surface.",
                    "From fragmented server notes to one operational reading surface.",
                  )}
                </h2>
              </div>
              <blockquote className="border-l-2 border-primary/45 pl-4 text-sm leading-relaxed text-foreground/90 sm:text-base">
                {tr(
                  locale,
                  "\"Every server card should answer three things instantly: what it does, why it is trustworthy, and how to wire it into a live flow.\"",
                  "\"Every server card should answer three things instantly: what it does, why it is trustworthy, and how to wire it into a live flow.\"",
                )}
              </blockquote>
            </div>
          </section>
        </BlurFade>

        <PageSection surface="steel" className="grid gap-4 md:grid-cols-3" aria-label={tr(locale, "MCP highlights", "MCP highlights")}>
          {highlights.map((item) => (
            <Card
              key={item.title}
              className="rounded-2xl border-border bg-card/80 shadow-[0_0_0_1px_hsl(var(--border)/0.55)] backdrop-blur transition-colors hover:bg-muted/40"
              aria-label={item.title}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base text-foreground sm:text-lg">
                  <item.icon className="size-4 text-primary" aria-hidden="true" />
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-muted-foreground">{item.description}</CardContent>
            </Card>
          ))}
        </PageSection>

        <PageSection
          surface="mesh"
          className="grid gap-4 md:grid-cols-2"
          aria-label={tr(locale, "MCP editorial pillars", "MCP editorial pillars")}
        >
          {editorialPillars.map((pillar, index) => (
            <BlurFade key={pillar.title} delay={0.05 * (index + 1)}>
              <Card className="rounded-2xl border-border bg-background/70 py-5">
                <CardHeader className="space-y-2 pb-1">
                  <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    {tr(locale, "Pillar", "Pillar")} {index + 1}
                  </p>
                  <CardTitle className="flex items-center gap-2 text-lg leading-tight">
                    <pillar.icon className="size-4 text-accent" aria-hidden="true" />
                    {pillar.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-muted-foreground">{pillar.description}</CardContent>
              </Card>
            </BlurFade>
          ))}
        </PageSection>
      </PageShell>
    </PageFrame>
  );
}
