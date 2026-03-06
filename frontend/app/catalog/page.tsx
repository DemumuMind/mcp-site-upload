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

  return (
    <PageFrame variant="directory">
      <main className="bg-background text-foreground">
        <section className="relative isolate overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.18),transparent_24%),radial-gradient(circle_at_84%_18%,hsl(var(--accent)/0.14),transparent_20%),linear-gradient(180deg,hsl(var(--surface-1)),hsl(var(--background))_62%)]" />
          <div className="section-shell flex min-h-[78vh] flex-col justify-center py-16 sm:py-20 lg:py-24">
            <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">
              {sectionCopy?.eyebrow ?? tr(locale, "Directory control center", "Directory control center")}
            </p>
            <p className="mt-5 font-serif text-[clamp(3.2rem,10vw,7rem)] leading-none tracking-[-0.06em] text-foreground">DemumuMind</p>
            <h1 className="mt-4 max-w-4xl text-balance text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
              {sectionCopy?.heroTitle ?? tr(locale, "Find trusted MCP servers faster", "Find trusted MCP servers faster")}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {sectionCopy?.heroDescription ??
                tr(
                  locale,
                  "Search by category, auth model, and capability tags. Compare candidates side by side and move to integration with less rework.",
                  "Search by category, auth model, and capability tags. Compare candidates side by side and move to integration with less rework.",
                )}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-11 rounded-none px-6">
                <Link href="/submit-server">{tr(locale, "Submit server", "Submit server")}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-11 rounded-none border-border/80 bg-transparent px-6">
                <Link href="/how-to-use">{tr(locale, "Open setup guide", "Open setup guide")}</Link>
              </Button>
            </div>

            <div className="mt-14 overflow-hidden border border-border/70 bg-[linear-gradient(180deg,hsl(var(--surface-1))/0.95,hsl(var(--surface-0))/0.88)] shadow-[0_48px_120px_-56px_hsl(var(--foreground)/0.9)]">
              <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
                <div className="border-b border-border/50 p-5 sm:p-7 lg:border-r lg:border-b-0 lg:p-8">
                  <p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">{tr(locale, "Catalog signal", "Catalog signal")}</p>
                  <div className="mt-5 grid gap-px border-y border-border/60 bg-border/60 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      { label: tr(locale, "Active servers", "Active servers"), value: pageViewModel.summary.totalServers.toLocaleString("en-US") },
                      { label: tr(locale, "Published tools", "Published tools"), value: pageViewModel.summary.totalTools.toLocaleString("en-US") },
                      { label: tr(locale, "Categories", "Categories"), value: pageViewModel.summary.totalCategories.toLocaleString("en-US") },
                      { label: tr(locale, "Featured", "Featured"), value: pageViewModel.summary.featuredServers.length.toLocaleString("en-US") },
                    ].map((metric) => (
                      <div key={metric.label} className="bg-background px-4 py-4">
                        <p className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">{metric.label}</p>
                        <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-foreground">{metric.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid divide-y divide-border/50 bg-black/10">
                  <div className="p-5 sm:p-6">
                    <p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">{tr(locale, "What this page does", "What this page does")}</p>
                    <p className="mt-4 text-sm leading-relaxed text-foreground">
                      {tr(locale, "This is the working surface for selection, shortlisting, and first-pass trust review.", "This is the working surface for selection, shortlisting, and first-pass trust review.")}
                    </p>
                  </div>
                  <div className="p-5 sm:p-6 text-sm leading-relaxed text-muted-foreground">
                    {tr(locale, "Use filters below to narrow candidates by fit instead of scrolling a generic marketplace.", "Use filters below to narrow candidates by fit instead of scrolling a generic marketplace.")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="section-shell py-8 sm:py-10">
            <CatalogSection
              initialQuery={pageViewModel.initialQuery}
              initialResult={pageViewModel.initialResult}
            />
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
