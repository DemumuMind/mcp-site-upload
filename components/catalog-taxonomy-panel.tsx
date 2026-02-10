"use client";

import { useLocale } from "@/components/locale-provider";
import {
  CATALOG_CATEGORY_OPTIONS,
  CATALOG_LANGUAGE_OPTIONS,
  CATALOG_VISIBLE_TAG_LIMIT,
  getTagDotClass,
} from "@/lib/catalog-taxonomy";
import { tr, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { AuthType } from "@/lib/types";

type TaxonomyEntry = {
  label: string;
  count?: number;
};

function TaxonomyList({
  title,
  items,
}: {
  title: string;
  items: readonly TaxonomyEntry[];
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-[0_0_0_1px_rgba(148,163,184,0.06)] backdrop-blur">
      <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li
            key={item.label}
            className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-slate-950/70 px-3 py-1.5 text-xs text-slate-300"
          >
            <span>{item.label}</span>
            {typeof item.count === "number" ? (
              <span className="rounded-full border border-white/10 bg-slate-800/80 px-2 py-0.5 text-[11px] text-slate-400">
                {item.count}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

type CatalogTaxonomyPanelOverviewProps = {
  mode?: "overview";
  locale: Locale;
  categoryEntries?: Array<[string, number]>;
  languageEntries?: Array<[string, number]>;
};

type CatalogAuthTypeOption = {
  value: AuthType;
  label: string;
  count: number;
};

type CatalogTaxonomyPanelFilterProps = {
  mode: "filters";
  categoryEntries: Array<[string, number]>;
  selectedCategories: string[];
  authTypeOptions: CatalogAuthTypeOption[];
  selectedAuthTypes: AuthType[];
  tagEntries: Array<[string, number]>;
  selectedTags: string[];
  onToggleCategory: (category: string) => void;
  onToggleAuthType: (authType: AuthType) => void;
  onToggleTag: (tag: string) => void;
  onClearAll: () => void;
};

type CatalogTaxonomyPanelProps =
  | CatalogTaxonomyPanelOverviewProps
  | CatalogTaxonomyPanelFilterProps;

function isFilterMode(
  props: CatalogTaxonomyPanelProps,
): props is CatalogTaxonomyPanelFilterProps {
  return props.mode === "filters";
}

function toTaxonomyEntries(
  entries: Array<[string, number]> | undefined,
  fallbackValues: readonly string[],
): TaxonomyEntry[] {
  if (entries && entries.length > 0) {
    return entries.map(([label, count]) => ({ label, count }));
  }

  return fallbackValues.map((label) => ({ label }));
}

export function CatalogTaxonomyPanel(props: CatalogTaxonomyPanelProps) {
  const localeFromContext = useLocale();

  if (isFilterMode(props)) {
    return (
      <aside className="h-fit overflow-hidden rounded-2xl border border-white/10 bg-slate-950/72 shadow-[0_0_0_1px_rgba(148,163,184,0.08)] lg:sticky lg:top-24">
        <div className="flex items-center justify-between px-4 py-4">
          <h2 className="text-lg font-semibold text-slate-100">{tr(localeFromContext, "Filters", "Фильтры")}</h2>
          <button
            type="button"
            className="text-xs font-medium text-slate-400 transition hover:text-slate-100"
            onClick={props.onClearAll}
          >
            {tr(localeFromContext, "Clear All", "Сбросить")}
          </button>
        </div>

        <div className="border-t border-white/10 px-4 py-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-100">
            {tr(localeFromContext, "Categories", "Категории")}
          </h3>
          <div className="max-h-52 space-y-1 overflow-y-auto pr-1">
            {props.categoryEntries.map(([categoryName, count]) => (
              <label
                key={categoryName}
                className="flex cursor-pointer items-center justify-between rounded-md px-1.5 py-1.5 transition hover:bg-slate-900"
              >
                <span className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-slate-500 bg-slate-900 text-blue-500 focus:ring-blue-500"
                    checked={props.selectedCategories.includes(categoryName)}
                    onChange={() => props.onToggleCategory(categoryName)}
                  />
                  <span className="text-sm text-slate-300">{categoryName}</span>
                </span>
                <span className="text-xs text-slate-500">{count}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 px-4 py-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-100">
            {tr(localeFromContext, "Pricing", "Стоимость")}
          </h3>
          <div className="space-y-1">
            {props.authTypeOptions.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center justify-between rounded-md px-1.5 py-1.5 transition hover:bg-slate-900"
              >
                <span className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-slate-500 bg-slate-900 text-blue-500 focus:ring-blue-500"
                    checked={props.selectedAuthTypes.includes(option.value)}
                    onChange={() => props.onToggleAuthType(option.value)}
                  />
                  <span className="text-sm text-slate-300">{option.label}</span>
                </span>
                <span className="text-xs text-slate-500">{option.count}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 px-4 py-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-100">
            {tr(localeFromContext, "Tags", "Теги")}
          </h3>
          <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
            {props.tagEntries.slice(0, CATALOG_VISIBLE_TAG_LIMIT).map(([tag, count]) => (
              <label
                key={tag}
                className="flex cursor-pointer items-center justify-between rounded-md px-1.5 py-1.5 transition hover:bg-slate-900"
              >
                <span className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-slate-500 bg-slate-900 text-blue-500 focus:ring-blue-500"
                    checked={props.selectedTags.includes(tag)}
                    onChange={() => props.onToggleTag(tag)}
                  />
                  <span className={cn("inline-block size-2 rounded-full", getTagDotClass(tag))} />
                  <span className="text-sm text-slate-300">{tag}</span>
                </span>
                <span className="text-xs text-slate-500">{count}</span>
              </label>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  const locale = props.locale ?? localeFromContext;
  const categoryEntries = toTaxonomyEntries(props.categoryEntries, CATALOG_CATEGORY_OPTIONS);
  const languageEntries = toTaxonomyEntries(props.languageEntries, CATALOG_LANGUAGE_OPTIONS);

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-slate-100">{tr(locale, "Filters", "Фильтры")}</h2>
      <div className="grid gap-4">
        <TaxonomyList
          title={tr(locale, "Categories", "Категории")}
          items={categoryEntries}
        />
        <TaxonomyList
          title={tr(locale, "Languages", "Языки")}
          items={languageEntries}
        />
      </div>
    </section>
  );
}
