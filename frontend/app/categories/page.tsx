import type { Metadata } from "next";
import { PageFrame } from "@/components/page-templates";
import { CatalogTaxonomyPanel } from "@/components/catalog-taxonomy-panel";
import { getCatalogSnapshot } from "@/lib/catalog/snapshot";
import { getSectionIndex, getSectionLocaleCopy } from "@/lib/content/section-index";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const sectionCopy = getSectionLocaleCopy(getSectionIndex("categories"), locale);
  return {
    title: sectionCopy?.title ?? tr(locale, "Categories", "Categories"),
    description:
      sectionCopy?.description ??
      tr(locale, "Browse DemumuMind MCP categories and language filters.", "Browse DemumuMind MCP categories and language filters."),
  };
}

export default async function CategoriesPage() {
  const locale = await getLocale();
  const sectionCopy = getSectionLocaleCopy(getSectionIndex("categories"), locale);
  const catalogSnapshot = await getCatalogSnapshot();

  return (
    <PageFrame>
      <main className="bg-background text-foreground">
        <section className="relative isolate overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.16),transparent_24%),radial-gradient(circle_at_82%_18%,hsl(var(--accent)/0.12),transparent_20%),linear-gradient(180deg,hsl(var(--surface-1)),hsl(var(--background))_60%)]" />
          <div className="section-shell flex min-h-[68vh] flex-col justify-center py-16 sm:py-20 lg:py-24">
            <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">
              {sectionCopy?.eyebrow ?? tr(locale, "Taxonomy", "Taxonomy")}
            </p>
            <p className="mt-5 font-serif text-[clamp(3rem,9vw,6.5rem)] leading-none tracking-[-0.06em] text-foreground">DemumuMind</p>
            <h1 className="mt-4 max-w-4xl text-balance text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
              {sectionCopy?.heroTitle ?? tr(locale, "Browse the catalog taxonomy.", "Browse the catalog taxonomy.")}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {sectionCopy?.heroDescription ?? tr(locale, "Explore the categories and language values that shape the catalog filtering system.", "Explore the categories and language values that shape the catalog filtering system.")}
            </p>
          </div>
        </section>

        <section className="border-b border-border/60">
          <div className="section-shell grid gap-px border-y border-border/60 bg-border/60 py-12 md:grid-cols-2">
            <div className="bg-background px-0 py-6 md:px-6">
              <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">{tr(locale, "Category options", "Category options")}</p>
              <p className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-foreground">{catalogSnapshot.categoryEntries.length}</p>
            </div>
            <div className="bg-background px-0 py-6 md:px-6">
              <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">{tr(locale, "Language options", "Language options")}</p>
              <p className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-foreground">{catalogSnapshot.languageEntries.length}</p>
            </div>
          </div>
        </section>

        <section>
          <div className="section-shell py-12 sm:py-16">
            <div className="border border-border/60 p-4 sm:p-6">
              <CatalogTaxonomyPanel locale={locale} categoryEntries={catalogSnapshot.categoryEntries} languageEntries={catalogSnapshot.languageEntries} />
            </div>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
