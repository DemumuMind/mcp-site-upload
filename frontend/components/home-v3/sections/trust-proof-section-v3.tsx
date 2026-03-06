import Link from "next/link";
import { ArrowRight, Blocks, CheckCircle2, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrustProofFeaturedServerCard } from "@/components/home-v3/sections/trust-proof-featured-server";
import { SectionLabel } from "@/components/home-v3/primitives/section-label";
import { BlurFade } from "@/components/ui/blur-fade";
import type { HomeContent } from "@/lib/home/content";
import type { HomeFacetEntry, HomeFeaturedServer, HomeMetric } from "@/lib/home/types";

const iconMap: Record<string, LucideIcon> = {
  "shield-check": ShieldCheck,
  "check-circle": CheckCircle2,
  blocks: Blocks,
};

type TrustProofSectionV3Props = {
  content: HomeContent["trust"];
  metrics: HomeMetric[];
  featuredServers: HomeFeaturedServer[];
  topCategories: HomeFacetEntry[];
  topLanguages: HomeFacetEntry[];
};

export function TrustProofSectionV3({ content, metrics, featuredServers, topCategories, topLanguages }: TrustProofSectionV3Props) {
  const categorySummary = topCategories.slice(0, 4).map((entry) => `${entry.label} (${entry.count})`).join(" / ");
  const languageSummary = topLanguages.slice(0, 4).map((entry) => `${entry.label} (${entry.count})`).join(" / ");

  return (
    <section className="border-b border-border/60 bg-background">
      <div className="section-shell grid gap-10 py-16 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
        <div className="space-y-6">
          <BlurFade delay={0.1} inView>
            <SectionLabel className="text-primary/80">Trust proof</SectionLabel>
          </BlurFade>
          <BlurFade delay={0.2} inView>
            <h2 className="max-w-xl font-serif text-3xl leading-tight font-semibold tracking-tight text-foreground sm:text-5xl">
              {content.heading}
            </h2>
          </BlurFade>
          <BlurFade delay={0.3} inView>
            <p className="max-w-xl text-muted-foreground">{content.description}</p>
          </BlurFade>

          <div className="grid gap-px border border-border/60 bg-border/60">
            {metrics.map((metric, index) => (
              <BlurFade key={metric.id} delay={0.34 + index * 0.06} inView>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 bg-background px-5 py-4">
                  <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">{metric.label}</p>
                  <p className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
                    {metric.value.toLocaleString("en-US")}
                  </p>
                </div>
              </BlurFade>
            ))}
          </div>

          <div className="space-y-0 border-y border-border/60">
            {content.points.map((point, idx) => (
              <BlurFade key={point.title} delay={0.4 + idx * 0.1} inView>
                <article className="grid gap-3 border-b border-border/60 py-4 last:border-b-0 sm:grid-cols-[auto_1fr] sm:items-start">
                  <div className="inline-flex size-10 items-center justify-center border border-border/70 text-primary">
                    {(() => {
                      const Icon = iconMap[point.icon];
                      return Icon ? <Icon className="size-4" aria-hidden="true" /> : null;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold tracking-[0.12em] text-foreground uppercase">{point.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{point.description}</p>
                  </div>
                </article>
              </BlurFade>
            ))}
          </div>

          <BlurFade delay={0.6} inView>
            <div className="space-y-3 border-t border-border/60 pt-5 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">{content.categoriesLabel}:</span> {categorySummary || "Developer Tools / Data / Automation / Security"}
              </p>
              <p>
                <span className="font-medium text-foreground">{content.languagesLabel}:</span> {languageSummary || "TypeScript / Python / Go / Rust"}
              </p>
            </div>
          </BlurFade>
        </div>

        <div className="space-y-6">
          <BlurFade delay={0.4} inView>
            <div className="border border-border/60 p-5 sm:p-6">
              <div className="flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <SectionLabel className="text-primary/80">{content.featuredLabel}</SectionLabel>
                  <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                    Open a few strong candidates first, compare their trust context, then commit engineering time.
                  </p>
                </div>
                <Button asChild variant="outline" className="h-10 rounded-none border-border/80 bg-transparent px-4">
                  <Link href="/catalog">
                    {content.exploreCta}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
              <div className="mt-5 grid gap-3">
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
