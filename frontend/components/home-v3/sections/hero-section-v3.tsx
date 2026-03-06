import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/home-v3/primitives/section-label";
import { BlurFade } from "@/components/ui/blur-fade";
import type { HomeContent } from "@/lib/home/content";
import type { HomeFacetEntry, HomeFeaturedServer } from "@/lib/home/types";

type HeroSectionV3Props = {
  content: HomeContent["hero"];
  workflows: HomeContent["workflows"];
  featuredServers: HomeFeaturedServer[];
  topCategories: HomeFacetEntry[];
};

type HeroSurfaceServer = Pick<HomeFeaturedServer, "id" | "name" | "category" | "authLabel" | "toolsCount" | "verificationLabel">;

const fallbackServers: HeroSurfaceServer[] = [
  {
    id: "fallback-1",
    name: "GitHub MCP",
    category: "Developer Tools",
    authLabel: "OAuth",
    toolsCount: 18,
    verificationLabel: "Moderated",
  },
  {
    id: "fallback-2",
    name: "Postgres MCP",
    category: "Data",
    authLabel: "API Key",
    toolsCount: 11,
    verificationLabel: "Reviewed",
  },
  {
    id: "fallback-3",
    name: "Playwright MCP",
    category: "Testing",
    authLabel: "Open",
    toolsCount: 9,
    verificationLabel: "Verified",
  },
];

export function HeroSectionV3({ content, workflows, featuredServers, topCategories }: HeroSectionV3Props) {
  const heroServers = featuredServers.length > 0 ? featuredServers.slice(0, 3) : fallbackServers;
  const categoryLine = topCategories.slice(0, 4).map((entry) => entry.label).join(" / ");

  return (
    <section className="relative isolate overflow-hidden border-b border-border/60 bg-background">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--accent)/0.2),transparent_28%),radial-gradient(circle_at_82%_18%,hsl(var(--primary)/0.28),transparent_22%),linear-gradient(180deg,hsl(var(--surface-2)),hsl(var(--background))_58%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
      </div>

      <div className="section-shell relative z-10 flex min-h-[calc(100vh-4rem)] flex-col justify-center py-16 sm:py-20 lg:py-24">
        <div className="max-w-4xl">
          <BlurFade delay={0.06}>
            <SectionLabel className="text-primary/90">{content.eyebrow}</SectionLabel>
          </BlurFade>
          <BlurFade delay={0.12}>
            <p className="mt-5 font-serif text-[clamp(3.7rem,12vw,9rem)] leading-none tracking-[-0.06em] text-foreground">
              {content.titleLead}
            </p>
          </BlurFade>
          <BlurFade delay={0.18}>
            <h1 className="mt-4 max-w-3xl text-balance text-3xl leading-[1.02] font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
              {content.titleAccent}
            </h1>
          </BlurFade>
          <BlurFade delay={0.24}>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {content.description}
            </p>
          </BlurFade>
          <BlurFade delay={0.3}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-11 rounded-none px-6 shadow-[0_22px_60px_-28px_hsl(var(--primary)/0.9)]">
                <Link href="/catalog">
                  {content.primaryCta}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-11 rounded-none border-border/80 bg-transparent px-6">
                <Link href="/submit-server">{content.secondaryCta}</Link>
              </Button>
            </div>
          </BlurFade>
        </div>

        <BlurFade delay={0.38}>
          <div className="mt-14 overflow-hidden border border-border/70 bg-[linear-gradient(180deg,hsl(var(--surface-1))/0.95,hsl(var(--surface-0))/0.88)] shadow-[0_48px_120px_-56px_hsl(var(--foreground)/0.9)]">
            <div className="grid lg:grid-cols-[1.45fr_0.55fr]">
              <div className="border-b border-border/50 p-5 sm:p-7 lg:border-r lg:border-b-0 lg:p-8">
                <div className="flex items-center justify-between border-b border-border/50 pb-4">
                  <div>
                    <p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">{content.pulseLabel}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{content.pulseText}</p>
                  </div>
                  <div className="hidden items-center gap-2 text-[11px] tracking-[0.16em] text-muted-foreground uppercase sm:flex">
                    <span className="size-2 rounded-full bg-emerald-400" />
                    live review surface
                  </div>
                </div>

                <div className="mt-5 overflow-hidden border border-border/50">
                  <div className="grid grid-cols-[minmax(0,1.2fr)_0.8fr_0.8fr_72px] bg-white/5 px-4 py-3 text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                    <span>Server</span>
                    <span>Category</span>
                    <span>Auth</span>
                    <span className="text-right">Tools</span>
                  </div>
                  {heroServers.map((server, index) => (
                    <div
                      key={server.id}
                      className="grid grid-cols-[minmax(0,1.2fr)_0.8fr_0.8fr_72px] items-center border-t border-border/40 px-4 py-4 text-sm"
                    >
                      <div>
                        <p className="font-medium text-foreground">{server.name}</p>
                        <p className="mt-1 text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                          {server.verificationLabel || `Reviewed ${index + 1}`}
                        </p>
                      </div>
                      <p className="text-muted-foreground">{server.category}</p>
                      <p className="text-muted-foreground">{server.authLabel}</p>
                      <p className="text-right font-medium text-foreground">{server.toolsCount}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 border-t border-border/50 pt-4 text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                  <span>Focus</span>
                  <span className="text-foreground">{categoryLine || "Developer Tools / Data / Automation / Security"}</span>
                </div>
              </div>

              <div className="grid divide-y divide-border/50 bg-black/10">
                <div className="p-5 sm:p-6">
                  <p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">What you review</p>
                  <div className="mt-4 space-y-4">
                    <p className="text-sm leading-relaxed text-foreground">
                      Auth model, verification state, and tool depth are visible before implementation begins.
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Teams stop guessing server fit from marketing copy alone.
                    </p>
                  </div>
                </div>
                <div className="p-5 sm:p-6">
                  <p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">Next moves</p>
                  <nav aria-label="Primary homepage workflows" className="mt-4 space-y-3">
                    {workflows.cards.slice(0, 3).map((item) => (
                      <Link
                        key={item.title}
                        href={item.href}
                        className="group flex items-center justify-between border-b border-border/40 pb-3 text-sm text-foreground transition-colors hover:text-primary"
                      >
                        <span>{item.cta}</span>
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
