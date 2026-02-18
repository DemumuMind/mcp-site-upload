import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/home-v3/primitives/section-label";
import type { HomeContent } from "@/lib/home/content";
import type { HomeFacetEntry, HomeFeaturedServer } from "@/lib/home/types";

type TrustProofSectionV3Props = {
  content: HomeContent["trust"];
  featuredServers: HomeFeaturedServer[];
  topCategories: HomeFacetEntry[];
  topLanguages: HomeFacetEntry[];
};

export function TrustProofSectionV3({ content, featuredServers, topCategories, topLanguages }: TrustProofSectionV3Props) {
  return (
    <section className="border-b border-blacksmith bg-background">
      <div className="section-shell grid gap-8 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="space-y-5">
          <SectionLabel>Trust proof</SectionLabel>
          <h2 className="font-serif text-3xl leading-tight font-semibold tracking-tight text-foreground sm:text-5xl">{content.heading}</h2>
          <p className="max-w-xl text-muted-foreground">{content.description}</p>

          <div className="space-y-3">
            {content.points.map((point) => (
              <article key={point.title} className="rounded-md border border-blacksmith bg-card p-4">
                <div className="mb-2 inline-flex rounded-sm border border-blacksmith bg-background p-1.5">
                  <point.icon className="size-4 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{point.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{point.description}</p>
              </article>
            ))}
          </div>

          <Button asChild variant="outline" className="h-11 rounded-md">
            <Link href="/catalog">
              {content.exploreCta}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-blacksmith bg-card p-4">
              <SectionLabel>{content.categoriesLabel}</SectionLabel>
              <div className="mt-3 flex flex-wrap gap-2">
                {topCategories.map((entry) => (
                  <Badge key={entry.label} variant="secondary">
                    {entry.label} - {entry.count}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-blacksmith bg-card p-4">
              <SectionLabel>{content.languagesLabel}</SectionLabel>
              <div className="mt-3 flex flex-wrap gap-2">
                {topLanguages.map((entry) => (
                  <Badge key={entry.label} variant="secondary">
                    {entry.label} - {entry.count}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-md border border-blacksmith bg-card p-4">
            <SectionLabel>{content.featuredLabel}</SectionLabel>
            <div className="mt-4 space-y-3">
              {featuredServers.length === 0 ? (
                <p className="text-sm text-muted-foreground">{content.featuredEmptyLabel}</p>
              ) : (
                featuredServers.map((server) => (
                  <article key={server.id} className="rounded-md border border-blacksmith bg-background p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{server.name}</h3>
                        <p className="text-xs text-muted-foreground">{server.verificationLabel}</p>
                      </div>
                      <Badge variant="secondary" className="shrink-0 text-[10px]">
                        {server.category}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {content.featuredAuthLabel}: {server.authLabel} - {server.toolsCount} {content.featuredToolsLabel}
                    </p>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
