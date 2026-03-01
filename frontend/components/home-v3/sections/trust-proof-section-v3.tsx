"use client";

import Link from "next/link";
import { ArrowRight, Blocks, CheckCircle2, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrustProofFeaturedServerCard } from "@/components/home-v3/sections/trust-proof-featured-server";
import { SectionLabel } from "@/components/home-v3/primitives/section-label";
import { CoolMode } from "@/components/ui/cool-mode";
import { BlurFade } from "@/components/ui/blur-fade";
import { GridPattern } from "@/components/ui/grid-pattern";
import { cn } from "@/lib/utils";
import type { HomeContent } from "@/lib/home/content";
import type { HomeFacetEntry, HomeFeaturedServer } from "@/lib/home/types";

const iconMap: Record<string, LucideIcon> = {
  "shield-check": ShieldCheck,
  "check-circle": CheckCircle2,
  blocks: Blocks,
};

type TrustProofSectionV3Props = {
  content: HomeContent["trust"];
  featuredServers: HomeFeaturedServer[];
  topCategories: HomeFacetEntry[];
  topLanguages: HomeFacetEntry[];
};

export function TrustProofSectionV3({ content, featuredServers, topCategories, topLanguages }: TrustProofSectionV3Props) {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Background Depth */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <GridPattern
          width={40}
          height={40}
          className={cn(
            "[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]",
            "opacity-[0.02]"
          )}
        />
        <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 size-[500px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="section-shell relative z-10 grid gap-8 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="space-y-5">
          <BlurFade delay={0.1} inView>
            <SectionLabel className="text-primary/80 tracking-[0.2em] uppercase">Trust proof</SectionLabel>
          </BlurFade>
          <BlurFade delay={0.2} inView>
            <h2 className="font-serif text-3xl leading-tight font-semibold tracking-tight text-foreground sm:text-5xl">{content.heading}</h2>
          </BlurFade>
          <BlurFade delay={0.3} inView>
            <p className="max-w-xl text-muted-foreground">{content.description}</p>
          </BlurFade>

          <div className="space-y-3">
            {content.points.map((point, idx) => (
              <BlurFade key={point.title} delay={0.4 + idx * 0.1} inView>
                <article className="rounded-xl border border-border bg-card/30 p-4 backdrop-blur-sm transition-all hover:bg-card/50">
                  <div className="mb-2 inline-flex rounded-sm border border-border bg-background p-1.5 shadow-inner">
                    {(() => { const Icon = iconMap[point.icon]; return Icon ? <Icon className="size-4 text-primary" aria-hidden="true" /> : null; })()}
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{point.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{point.description}</p>
                </article>
              </BlurFade>
            ))}
          </div>

          <BlurFade delay={0.6} inView>
            <CoolMode>
              <Button asChild variant="outline" className="h-11 rounded-md border-border bg-background/50 hover:bg-primary/5">
                <Link href="/catalog">
                  {content.exploreCta}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CoolMode>
          </BlurFade>
        </div>

        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <BlurFade delay={0.2} inView>
              <div className="space-y-4">
                <SectionLabel className="text-primary/80 tracking-[0.2em] uppercase">{content.categoriesLabel}</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {topCategories.map((entry) => (
                    <Badge
                      key={entry.label}
                      variant="outline"
                      className="border-border bg-background/40 px-3 py-1.5 text-[11px] font-medium backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                    >
                      {entry.label}
                      <span className="ml-2 opacity-50">{entry.count}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            </BlurFade>
            <BlurFade delay={0.3} inView>
              <div className="space-y-4">
                <SectionLabel className="text-primary/80 tracking-[0.2em] uppercase">{content.languagesLabel}</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {topLanguages.map((entry) => (
                    <Badge
                      key={entry.label}
                      variant="outline"
                      className="border-border bg-background/40 px-3 py-1.5 text-[11px] font-medium backdrop-blur-sm transition-all hover:border-accent/50 hover:bg-accent/5 hover:text-accent"
                    >
                      {entry.label}
                      <span className="ml-2 opacity-50">{entry.count}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            </BlurFade>
          </div>

          <BlurFade delay={0.4} inView>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <SectionLabel className="text-primary/80 tracking-[0.2em] uppercase">{content.featuredLabel}</SectionLabel>
                <Link href="/catalog" className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase hover:text-primary transition-colors">
                  View all
                </Link>
              </div>
              <div className="grid gap-3">
                {featuredServers.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">{content.featuredEmptyLabel}</p>
                ) : (
                  featuredServers.map((server) => (
                    <TrustProofFeaturedServerCard
                      key={server.id}
                      server={server}
                      featuredAuthLabel={content.featuredAuthLabel}
                      featuredToolsLabel={content.featuredToolsLabel}
                    />
                  ))
                )}
              </div>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
