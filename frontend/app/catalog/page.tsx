import type { Metadata } from "next";
import Link from "next/link";
import { PageFrame } from "@/components/page-templates";
import { Button } from "@/components/ui/button";
import { CatalogSection } from "@/components/catalog-section";
import { Badge } from "@/components/ui/badge";
import { buildCatalogComparePreview } from "@/lib/catalog/compare";
import { getCatalogPageViewModel, type CatalogPageSearchParams } from "@/lib/catalog/page-view-model";
import { getSectionIndex, getSectionLocaleCopy } from "@/lib/content/section-index";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const sectionCopy = getSectionLocaleCopy(getSectionIndex("catalog"), locale);
  return {
    title: sectionCopy?.title ?? tr(locale, "AI Tools Directory", "AI Tools Directory"),
    description:
      sectionCopy?.description ??
      tr(locale, "Discover and filter MCP tools, models, and services in one directory.", "Discover and filter MCP tools, models, and services in one directory."),
  };
}

function formatHealthLabel(healthStatus: string) {
  switch (healthStatus) {
    case "healthy":
      return "Healthy";
    case "degraded":
      return "Degraded";
    case "down":
      return "Down";
    default:
      return "Unknown";
  }
}

type CatalogPageProps = {
  searchParams: Promise<CatalogPageSearchParams>;
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const locale = await getLocale();
  const sectionCopy = getSectionLocaleCopy(getSectionIndex("catalog"), locale);
  const pageViewModel = await getCatalogPageViewModel(await searchParams);
  const heroComparePreview = buildCatalogComparePreview(pageViewModel.featuredServers);
  const heroRecommended = heroComparePreview[0] ?? null;

  return (
    <PageFrame variant="directory">
      <main className="bg-background text-foreground">
        <section className="relative isolate overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_16%,hsl(var(--primary)/0.18),transparent_22%),radial-gradient(circle_at_84%_12%,hsl(var(--primary)/0.12),transparent_18%),linear-gradient(180deg,hsl(var(--surface-1)),hsl(var(--background))_68%)]" />
          <div className="section-shell py-14 sm:py-18 lg:py-22">
            <div className="grid gap-10 xl:grid-cols-[minmax(0,1.02fr)_420px] xl:items-center">
              <div>
                <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">
                  {sectionCopy?.eyebrow ?? tr(locale, "Directory control center", "Directory control center")}
                </p>
                <p className="mt-4 font-serif text-[clamp(3rem,8vw,6rem)] leading-none tracking-[-0.06em] text-foreground">DemumuMind</p>
                <h1 className="mt-5 max-w-4xl text-balance text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
                  {sectionCopy?.heroTitle ?? tr(locale, "Find trusted MCP servers faster", "Find trusted MCP servers faster")}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {sectionCopy?.heroDescription ??
                    tr(
                      locale,
                      "Search by category, auth model, and capability tags. Compare candidates side-by-side and move to integration with less rework.",
                      "Search by category, auth model, and capability tags. Compare candidates side-by-side and move to integration with less rework.",
                    )}
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button asChild size="lg" className="h-11 rounded-xl px-6">
                    <Link href="#catalog-workspace">{tr(locale, "Active compare mode", "Active compare mode")}</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-11 rounded-xl border-border/80 bg-transparent px-6">
                    <Link href="/how-to-use">{tr(locale, "Open setup guide", "Open setup guide")}</Link>
                  </Button>
                </div>
              </div>

              <div className="overflow-hidden rounded-[2rem] border border-primary/18 bg-[radial-gradient(circle_at_86%_12%,hsl(var(--primary)/0.14),transparent_24%),linear-gradient(180deg,hsl(var(--surface-1))/0.98,hsl(var(--surface-0))/0.94)] shadow-[0_40px_120px_-60px_hsl(var(--foreground)/0.95)]">
                <div className="grid gap-px border-b border-border/60 bg-border/60 sm:grid-cols-2">
                  {[
                    { label: tr(locale, "Active servers", "Active servers"), value: pageViewModel.summary.totalServers.toLocaleString("en-US") },
                    { label: tr(locale, "Preview set", "Preview set"), value: heroComparePreview.length.toLocaleString("en-US") },
                  ].map((metric) => (
                    <div key={metric.label} className="bg-background/88 px-5 py-5">
                      <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">{metric.label}</p>
                      <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-foreground">{metric.value}</p>
                    </div>
                  ))}
                </div>

                {heroRecommended ? (
                  <div className="px-5 py-5">
                    <p className="text-[11px] font-semibold tracking-[0.16em] text-primary uppercase">
                      {tr(locale, "Best fit now", "Best fit now")}
                    </p>
                    <div className="mt-3">
                      <p className="text-[1.7rem] font-semibold tracking-[-0.04em] text-foreground">{heroRecommended.name}</p>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {tr(
                          locale,
                          "Fastest path for a trust-first compare: strong docs signal, low auth friction, and clear developer-tools fit.",
                          "Fastest path for a trust-first compare: strong docs signal, low auth friction, and clear developer-tools fit.",
                        )}
                      </p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px]">
                        {tr(locale, `Trust ${heroRecommended.trustScore.toFixed(1)}`, `Trust ${heroRecommended.trustScore.toFixed(1)}`)}
                      </Badge>
                      <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px]">
                        {tr(locale, formatHealthLabel(heroRecommended.healthStatus), formatHealthLabel(heroRecommended.healthStatus))}
                      </Badge>
                      <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px]">
                        {tr(locale, `${heroRecommended.toolsCount} tools`, `${heroRecommended.toolsCount} tools`)}
                      </Badge>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {heroComparePreview.map((item, index) => (
                        <span
                          key={item.slug}
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] ${
                            index === 0
                              ? "border-primary/35 bg-primary/10 text-primary"
                              : "border-border/70 bg-background/70 text-muted-foreground"
                          }`}
                        >
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="section-shell py-8 sm:py-10">
            <CatalogSection
              initialQuery={pageViewModel.initialQuery}
              initialResult={pageViewModel.initialResult}
              featuredServers={pageViewModel.featuredServers}
              topCategoryEntries={pageViewModel.topCategoryEntries}
              topTagEntries={pageViewModel.topTagEntries}
              hasActiveFilters={pageViewModel.hasActiveFilters}
            />
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
