import { tr, type Locale } from "@/lib/i18n";
import {
  CATALOG_CATEGORY_OPTIONS,
  CATALOG_LANGUAGE_OPTIONS,
} from "@/lib/catalog-taxonomy";

function TaxonomyList({
  title,
  items,
}: {
  title: string;
  items: readonly string[];
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-[0_0_0_1px_rgba(148,163,184,0.06)] backdrop-blur">
      <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-lg border border-white/10 bg-slate-950/70 px-3 py-1.5 text-xs text-slate-300"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

type CatalogTaxonomyPanelProps = {
  locale: Locale;
};

export function CatalogTaxonomyPanel({ locale }: CatalogTaxonomyPanelProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-slate-100">{tr(locale, "Filters", "Фильтры")}</h2>
      <div className="grid gap-4">
        <TaxonomyList
          title={tr(locale, "Categories", "Категории")}
          items={CATALOG_CATEGORY_OPTIONS}
        />
        <TaxonomyList
          title={tr(locale, "Languages", "Языки")}
          items={CATALOG_LANGUAGE_OPTIONS}
        />
      </div>
    </section>
  );
}
