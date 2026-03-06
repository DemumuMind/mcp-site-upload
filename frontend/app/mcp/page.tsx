import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Orbit, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { PageFrame } from "@/components/page-templates";
import { Button } from "@/components/ui/button";
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
      description: tr(locale, "Discover MCP servers in one curated searchable directory.", "Discover MCP servers in one curated searchable directory."),
      icon: Sparkles,
    },
    {
      title: tr(locale, "Trust Signals", "Trust Signals"),
      description: tr(locale, "Track verification and auth type before connecting a server.", "Track verification and auth type before connecting a server."),
      icon: ShieldCheck,
    },
    {
      title: tr(locale, "Fast Integration", "Fast Integration"),
      description: tr(locale, "Copy-ready server config and clear maintainer metadata.", "Copy-ready server config and clear maintainer metadata."),
      icon: CheckCircle2,
    },
  ];

  const editorialPillars = [
    {
      title: tr(locale, "Editorial Discovery", "Editorial Discovery"),
      description: tr(locale, "Scan high-signal metadata, security posture, and tool coverage without opening ten tabs.", "Scan high-signal metadata, security posture, and tool coverage without opening ten tabs."),
      icon: Orbit,
    },
    {
      title: tr(locale, "Operational Confidence", "Operational Confidence"),
      description: tr(locale, "Move from idea to tested MCP connection with traceable trust and setup guidance.", "Move from idea to tested MCP connection with traceable trust and setup guidance."),
      icon: Workflow,
    },
  ];

  return (
    <PageFrame>
      <main className="bg-background text-foreground">
        <section className="relative isolate overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--accent)/0.14),transparent_24%),radial-gradient(circle_at_82%_18%,hsl(var(--primary)/0.18),transparent_20%),linear-gradient(180deg,hsl(var(--surface-1)),hsl(var(--background))_62%)]" />
          <div className="section-shell flex min-h-[72vh] flex-col justify-center py-16 sm:py-20 lg:py-24">
            <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">{sectionCopy?.eyebrow ?? tr(locale, "MCP overview", "MCP overview")}</p>
            <p className="mt-5 font-serif text-[clamp(3.1rem,10vw,7rem)] leading-none tracking-[-0.06em] text-foreground">DemumuMind</p>
            <h1 className="mt-4 max-w-4xl text-balance text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
              {sectionCopy?.heroTitle ?? "MCP"}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {sectionCopy?.heroDescription ?? tr(locale, "Discover verified and community MCP servers, inspect tool capabilities, and connect them to your AI workflows.", "Discover verified and community MCP servers, inspect tool capabilities, and connect them to your AI workflows.")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-11 rounded-none px-6">
                <Link href="/catalog">
                  {tr(locale, "Browse catalog", "Browse catalog")}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-11 rounded-none border-border/80 bg-transparent px-6">
                <Link href="/how-to-use">{tr(locale, "Open setup guide", "Open setup guide")}</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-b border-border/60">
          <div className="section-shell grid gap-10 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">{tr(locale, "What MCP means here", "What MCP means here")}</p>
              <h2 className="mt-4 max-w-3xl font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {tr(locale, "One operational reading surface for server selection.", "One operational reading surface for server selection.")}
              </h2>
              <blockquote className="mt-8 max-w-2xl border-l-2 border-primary/45 pl-4 text-sm leading-relaxed text-foreground/90 sm:text-base">
                {tr(locale, '"Every server card should answer three things instantly: what it does, why it is trustworthy, and how to wire it into a live flow."', '"Every server card should answer three things instantly: what it does, why it is trustworthy, and how to wire it into a live flow."')}
              </blockquote>
            </div>

            <div className="border border-border/60 p-6 sm:p-8">
              <p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">{tr(locale, "Core loop", "Core loop")}</p>
              <div className="mt-6 space-y-0 border-y border-border/60">
                {[tr(locale, "Search", "Search"), tr(locale, "Verify", "Verify"), tr(locale, "Connect", "Connect")].map((label) => (
                  <div key={label} className="border-b border-border/60 py-4 last:border-b-0">
                    <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">{label}</p>
                    <p className="mt-2 text-sm leading-relaxed text-foreground">
                      {tr(locale, "Clear metadata, practical docs, and direct setup paths for production workflows.", "Clear metadata, practical docs, and direct setup paths for production workflows.")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border/60">
          <div className="section-shell py-16">
            <div className="mb-8">
              <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">{tr(locale, "Highlights", "Highlights")}</p>
              <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">{tr(locale, "What the product surface prioritizes", "What the product surface prioritizes")}</h2>
            </div>
            <div className="grid gap-px border-y border-border/60 bg-border/60 md:grid-cols-3">
              {highlights.map((item) => (
                <article key={item.title} className="bg-background px-0 py-6 md:px-6">
                  <div className="inline-flex size-10 items-center justify-center border border-border/70 text-primary">
                    <item.icon className="size-4" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-foreground">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="section-shell grid gap-px border-y border-border/60 bg-border/60 py-16 md:grid-cols-2">
            {editorialPillars.map((pillar, index) => (
              <article key={pillar.title} className="bg-background px-0 py-6 md:px-6">
                <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">{tr(locale, "Pillar", "Pillar")} {index + 1}</p>
                <div className="mt-4 inline-flex size-10 items-center justify-center border border-border/70 text-accent">
                  <pillar.icon className="size-4" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-foreground">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{pillar.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
