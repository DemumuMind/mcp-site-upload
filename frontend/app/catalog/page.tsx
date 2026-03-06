import type { Metadata } from "next";
import Link from "next/link";
import { PageFrame } from "@/components/page-templates";
import { Button } from "@/components/ui/button";
import { CatalogSection } from "@/components/catalog-section";
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

type CatalogPageProps = {
  searchParams: Promise<CatalogPageSearchParams>;
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const locale = await getLocale();
  const sectionCopy = getSectionLocaleCopy(getSectionIndex("catalog"), locale);
  const pageViewModel = await getCatalogPageViewModel(await searchParams);
  const leadFeaturedServer = pageViewModel.featuredServers[0] ?? null;

  return (
    <PageFrame variant="directory">
      <main className="bg-background text-foreground">
        <section className="relative isolate overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.2),transparent_22%),radial-gradient(circle_at_86%_16%,hsl(var(--accent)/0.16),transparent_18%),linear-gradient(180deg,hsl(var(--surface-1)),hsl(var(--background))_65%)]" />
          <div className="section-shell py-14 sm:py-18 lg:py-22">
            <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
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
                      "Search by category, auth model, and capability tags. Build a shortlist, compare fit, and move into setup with less guesswork.",
                      "Search by category, auth model, and capability tags. Build a shortlist, compare fit, and move into setup with less guesswork.",
                    )}
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button asChild size="lg" className="h-11 rounded-xl px-6">
                    <Link href="/submit-server">{tr(locale, "Submit server", "Submit server")}</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-11 rounded-xl border-border/80 bg-transparent px-6">
                    <Link href="/how-to-use">{tr(locale, "Open setup guide", "Open setup guide")}</Link>
                  </Button>
                </div>
              </div>

              <div className="overflow-hidden rounded-[1.8rem] border border-border/70 bg-[linear-gradient(180deg,hsl(var(--surface-1))/0.96,hsl(var(--surface-0))/0.9)] shadow-[0_40px_100px_-60px_hsl(var(--foreground)/0.9)]">
                <div className="grid gap-px bg-border/60 sm:grid-cols-2">
                  {[
                    { label: tr(locale, "Active servers", "Active servers"), value: pageViewModel.summary.totalServers.toLocaleString("en-US") },
                    { label: tr(locale, "Published tools", "Published tools"), value: pageViewModel.summary.totalTools.toLocaleString("en-US") },
                    { label: tr(locale, "Categories", "Categories"), value: pageViewModel.summary.totalCategories.toLocaleString("en-US") },
                    { label: tr(locale, "Featured", "Featured"), value: pageViewModel.summary.featuredServers.length.toLocaleString("en-US") },
                  ].map((metric) => (
                    <div key={metric.label} className="bg-background/88 px-5 py-5">
                      <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">{metric.label}</p>
                      <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-foreground">{metric.value}</p>
                    </div>
                  ))}
                </div>

                {leadFeaturedServer ? (
                  <div className="border-t border-border/60 px-5 py-5">
                    <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                      {tr(locale, "Lead featured server", "Lead featured server")}
                    </p>
                    <div className="mt-3">
                      <p className="text-lg font-semibold text-foreground">{leadFeaturedServer.name}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{leadFeaturedServer.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                        <span className="rounded-full border border-border/70 px-2.5 py-1">{leadFeaturedServer.category}</span>
                        <span className="rounded-full border border-border/70 px-2.5 py-1">{leadFeaturedServer.verificationLevel}</span>
                        <span className="rounded-full border border-border/70 px-2.5 py-1">
                          {tr(locale, `${leadFeaturedServer.tools.length} tools`, `${leadFeaturedServer.tools.length} tools`)}
                        </span>
                      </div>
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
