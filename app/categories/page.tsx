import type { Metadata } from "next";
import { PageFrame, PageHero, PageSection, PageShell } from "@/components/page-templates";
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
      <PageShell className="max-w-6xl">
        <PageHero
          surface="rail"
          eyebrow={sectionCopy?.eyebrow}
          title={sectionCopy?.heroTitle ?? tr(locale, "Categories", "Categories")}
          description={
            sectionCopy?.heroDescription ??
            tr(locale, "Explore available taxonomy values used by the catalog filters.", "Explore available taxonomy values used by the catalog filters.")
          }
        />

        <PageSection surface="plain" className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-blacksmith bg-card p-4">
            <p className="text-xs text-muted-foreground">{tr(locale, "Category options", "Category options")}</p>
            <p className="text-2xl font-semibold text-foreground">{catalogSnapshot.categoryEntries.length}</p>
          </div>
          <div className="rounded-2xl border border-blacksmith bg-card p-4">
            <p className="text-xs text-muted-foreground">{tr(locale, "Language options", "Language options")}</p>
            <p className="text-2xl font-semibold text-foreground">{catalogSnapshot.languageEntries.length}</p>
          </div>
        </PageSection>

        <PageSection surface="steel">
          <CatalogTaxonomyPanel locale={locale} categoryEntries={catalogSnapshot.categoryEntries} languageEntries={catalogSnapshot.languageEntries} />
        </PageSection>
      </PageShell>
    </PageFrame>
  );
}
