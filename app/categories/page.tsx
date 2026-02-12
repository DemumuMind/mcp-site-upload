import type { Metadata } from "next";
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
        description: sectionCopy?.description ??
            tr(locale, "Browse DemumuMind MCP categories and language filters.", "Browse DemumuMind MCP categories and language filters."),
    };
}
export default async function CategoriesPage() {
    const locale = await getLocale();
    const sectionCopy = getSectionLocaleCopy(getSectionIndex("categories"), locale);
    const catalogSnapshot = await getCatalogSnapshot();
    return (<div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
      <div className="space-y-2">
        {sectionCopy?.eyebrow ? (<p className="text-xs font-semibold tracking-[0.12em] text-cyan-200 uppercase">
            {sectionCopy.eyebrow}
          </p>) : null}
        <h1 className="text-3xl font-semibold tracking-tight text-violet-50">
          {sectionCopy?.heroTitle ?? tr(locale, "Categories", "Categories")}
        </h1>
        <p className="text-sm text-violet-200">
          {sectionCopy?.heroDescription ??
            tr(locale, "Explore available taxonomy values used by the catalog filters.", "Explore available taxonomy values used by the catalog filters.")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-indigo-900/70 p-4">
          <p className="text-xs text-violet-300">{tr(locale, "Category options", "Category options")}</p>
          <p className="text-2xl font-semibold text-violet-50">
            {catalogSnapshot.categoryEntries.length}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-indigo-900/70 p-4">
          <p className="text-xs text-violet-300">{tr(locale, "Language options", "Language options")}</p>
          <p className="text-2xl font-semibold text-violet-50">
            {catalogSnapshot.languageEntries.length}
          </p>
        </div>
      </div>

      <CatalogTaxonomyPanel locale={locale} categoryEntries={catalogSnapshot.categoryEntries} languageEntries={catalogSnapshot.languageEntries}/>
    </div>);
}
