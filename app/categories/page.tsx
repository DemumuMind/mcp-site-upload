import type { Metadata } from "next";

import { CatalogTaxonomyPanel } from "@/components/catalog-taxonomy-panel";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import {
  CATALOG_CATEGORY_OPTIONS,
  CATALOG_LANGUAGE_OPTIONS,
} from "@/lib/catalog-taxonomy";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse DemumuMind MCP categories and language filters.",
};

export default async function CategoriesPage() {
  const locale = await getLocale();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-100">
          {tr(locale, "Categories", "Категории")}
        </h1>
        <p className="text-sm text-slate-300">
          {tr(
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
            {CATALOG_CATEGORY_OPTIONS.length}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
          <p className="text-xs text-slate-400">{tr(locale, "Language options", "Языки")}</p>
          <p className="text-2xl font-semibold text-slate-100">
            {CATALOG_LANGUAGE_OPTIONS.length}
          </p>
        </div>
      </div>

      <CatalogTaxonomyPanel locale={locale} />
    </div>
  );
}
