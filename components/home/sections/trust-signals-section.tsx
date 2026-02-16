import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HomeContent } from "@/lib/home/content";
import type { HomeFacetEntry, HomeFeaturedServer } from "@/lib/home/types";

type TrustSignalsSectionProps = {
  content: HomeContent["trust"];
  featuredServers: HomeFeaturedServer[];
  topCategories: HomeFacetEntry[];
  topLanguages: HomeFacetEntry[];
};

export function TrustSignalsSection({ content, featuredServers, topCategories, topLanguages }: TrustSignalsSectionProps) {
  return (
    <section className="border-y border-blacksmith bg-black/20">
      <div className="section-shell grid gap-8 py-20 lg:grid-cols-[1fr_1.05fr]">
        <div className="space-y-6">
          <h3 className="text-3xl leading-tight font-semibold tracking-tight text-foreground sm:text-5xl">{content.heading}</h3>
          <p className="max-w-xl text-lg text-muted-foreground">{content.description}</p>

          <div className="grid gap-3 text-sm sm:grid-cols-1">
            {content.points.map((point) => (
              <div key={point.title} className="rounded-xl border border-blacksmith bg-card p-3">
                <point.icon className="mb-2 size-4 text-primary" />
                <p className="font-medium text-foreground">{point.title}</p>
                <p className="text-xs text-muted-foreground">{point.description}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-blacksmith bg-card p-3">
              <p className="mb-2 text-xs tracking-[0.16em] text-muted-foreground uppercase">{content.categoriesLabel}</p>
              <div className="flex flex-wrap gap-2">
                {topCategories.map((entry) => (
                  <Badge key={entry.label} variant="secondary">
                    {entry.label} · {entry.count}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-blacksmith bg-card p-3">
              <p className="mb-2 text-xs tracking-[0.16em] text-muted-foreground uppercase">{content.languagesLabel}</p>
              <div className="flex flex-wrap gap-2">
                {topLanguages.map((entry) => (
                  <Badge key={entry.label} variant="secondary">
                    {entry.label} · {entry.count}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Button asChild variant="outline" className="h-11 rounded-lg">
            <Link href="/catalog">
              {content.exploreCta}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <Card className="border-primary/20 shadow-blacksmith-gold">
          <CardHeader>
            <CardTitle className="text-xs tracking-[0.18em] text-muted-foreground uppercase">{content.featuredLabel}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {featuredServers.length === 0 ? (
              <p className="text-sm text-muted-foreground">{content.featuredEmptyLabel}</p>
            ) : (
              featuredServers.map((server) => (
                <div key={server.id} className="rounded-lg border border-blacksmith bg-black/35 p-3">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <p className="font-medium text-foreground">{server.name}</p>
                    <Badge variant="secondary" className="text-[10px]">{server.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {content.featuredAuthLabel}: {server.authLabel} · {server.toolsCount} {content.featuredToolsLabel}
                  </p>
                  <p className="mt-1 text-xs text-primary">{server.verificationLabel}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

