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

export function TrustSignalsSection({
  content,
  featuredServers,
  topCategories,
  topLanguages,
}: TrustSignalsSectionProps) {
  return (
    <section className="border-y border-white/10 bg-[linear-gradient(180deg,#040b17_0%,#050f1b_100%)]">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:px-8">
        <div className="space-y-6">
          <h3 className="text-3xl leading-tight font-semibold tracking-tight text-violet-50 sm:text-5xl">{content.heading}</h3>
          <p className="max-w-xl text-lg text-violet-200">{content.description}</p>

          <div className="grid gap-3 text-sm text-violet-100 sm:grid-cols-1">
            {content.points.map((point) => (
              <div key={point.title} className="rounded-xl border border-white/10 bg-indigo-950/75 p-3">
                <point.icon className="mb-2 size-4 text-cyan-300" />
                <p className="font-medium text-violet-50">{point.title}</p>
                <p className="text-xs text-violet-300">{point.description}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-indigo-950/70 p-3">
              <p className="mb-2 text-xs tracking-[0.16em] text-violet-300 uppercase">{content.categoriesLabel}</p>
              <div className="flex flex-wrap gap-2">
                {topCategories.map((entry) => (
                  <Badge key={entry.label} className="border-white/15 bg-white/5 text-violet-100">
                    {entry.label} · {entry.count}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-indigo-950/70 p-3">
              <p className="mb-2 text-xs tracking-[0.16em] text-violet-300 uppercase">{content.languagesLabel}</p>
              <div className="flex flex-wrap gap-2">
                {topLanguages.map((entry) => (
                  <Badge key={entry.label} className="border-white/15 bg-white/5 text-violet-100">
                    {entry.label} · {entry.count}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            className="h-11 rounded-xl border-cyan-400/35 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20"
          >
            <Link href="/catalog">
              {content.exploreCta}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <Card className="border-cyan-500/25 bg-indigo-950/80 shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_24px_60px_rgba(2,132,199,0.15)]">
          <CardHeader>
            <CardTitle className="text-xs tracking-[0.18em] text-violet-300 uppercase">{content.featuredLabel}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {featuredServers.length === 0 ? (
              <p className="text-sm text-violet-300">{content.featuredEmptyLabel}</p>
            ) : (
              featuredServers.map((server) => (
                <div key={server.id} className="rounded-lg border border-white/10 bg-indigo-900/70 p-3">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <p className="font-medium text-violet-50">{server.name}</p>
                    <Badge className="border-white/15 bg-white/5 text-[10px] text-violet-200">{server.category}</Badge>
                  </div>
                  <p className="text-xs text-violet-300">
                    {content.featuredAuthLabel}: {server.authLabel} · {server.toolsCount} {content.featuredToolsLabel}
                  </p>
                  <p className="mt-1 text-xs text-cyan-200">{server.verificationLabel}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
