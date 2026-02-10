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
    title: sectionCopy?.title ?? tr(locale, "Categories", "Категории"),
    description:
      sectionCopy?.description ??
      tr(
        locale,
        "Browse DemumuMind MCP categories and language filters.",
        "Просматривайте категории DemumuMind MCP и языковые фильтры.",
      ),
  };
}

export default async function CategoriesPage() {
  const locale = await getLocale();
  const sectionCopy = getSectionLocaleCopy(getSectionIndex("categories"), locale);
  const catalogSnapshot = await getCatalogSnapshot();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
      <div className="space-y-2">
        {sectionCopy?.eyebrow ? (
          <p className="text-xs font-semibold tracking-[0.12em] text-cyan-200 uppercase">
            {sectionCopy.eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-semibold tracking-tight text-slate-100">
          {sectionCopy?.heroTitle ?? tr(locale, "Categories", "Категории")}
        </h1>
        <p className="text-sm text-slate-300">
          {sectionCopy?.heroDescription ??
            tr(
              locale,
              "Explore available taxonomy values used by the catalog filters.",
              "Изучите значения таксономии, используемые фильтрами каталога.",
            )}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
          <p className="text-xs text-slate-400">{tr(locale, "Category options", "Категории")}</p>
          <p className="text-2xl font-semibold text-slate-100">
            {catalogSnapshot.categoryEntries.length}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
          <p className="text-xs text-slate-400">{tr(locale, "Language options", "Языки")}</p>
          <p className="text-2xl font-semibold text-slate-100">
            {catalogSnapshot.languageEntries.length}
          </p>
        </div>
      </div>

      <CatalogTaxonomyPanel
        locale={locale}
        categoryEntries={catalogSnapshot.categoryEntries}
        languageEntries={catalogSnapshot.languageEntries}
      />
    </div>
  );
}
