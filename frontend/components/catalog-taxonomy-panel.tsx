"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import {
  FilterOptionsSection,
  parseToolsBound,
  TaxonomyList,
  toTaxonomyEntries,
  type FilterOption,
} from "@/components/catalog-taxonomy-panel/parts";
import { Input } from "@/components/ui/input";
import { buildCatalogFilterPanelModel, type CatalogQuickFilterKey } from "@/lib/catalog/filter-panel";
import {
  CATALOG_CATEGORY_OPTIONS,
  CATALOG_LANGUAGE_OPTIONS,
  CATALOG_VISIBLE_TAG_LIMIT,
  getTagDotClass,
} from "@/lib/catalog-taxonomy";
import { tr, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { AuthType, HealthStatus, VerificationLevel } from "@/lib/types";

type CatalogTaxonomyPanelBaseProps = {
  className?: string;
};

type CatalogTaxonomyPanelOverviewProps = CatalogTaxonomyPanelBaseProps & {
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

type CatalogVerificationOption = {
  value: VerificationLevel;
  label: string;
  count: number;
};

type CatalogHealthOption = {
  value: HealthStatus;
  label: string;
  count: number;
};

type CatalogTaxonomyPanelFilterProps = CatalogTaxonomyPanelBaseProps & {
  mode: "filters";
  panelId?: string;
  categoryEntries: Array<[string, number]>;
  selectedCategories: string[];
  authTypeOptions: CatalogAuthTypeOption[];
  selectedAuthTypes: AuthType[];
  verificationOptions: CatalogVerificationOption[];
  selectedVerificationLevels: VerificationLevel[];
  healthOptions: CatalogHealthOption[];
  selectedHealthStatuses: HealthStatus[];
  toolsMin: number | null;
  toolsMax: number | null;
  tagEntries: Array<[string, number]>;
  selectedTags: string[];
  onToggleCategory: (category: string) => void;
  onToggleAuthType: (authType: AuthType) => void;
  onToggleVerificationLevel: (verificationLevel: VerificationLevel) => void;
  onToggleHealthStatus: (healthStatus: HealthStatus) => void;
  onToolsMinChange: (value: number | null) => void;
  onToolsMaxChange: (value: number | null) => void;
  onToggleTag: (tag: string) => void;
  onApplyQuickFilter: (type: "official" | "healthy" | "no_auth") => void;
  onClearAll: () => void;
  onRequestClose?: () => void;
};

type CatalogTaxonomyPanelProps =
  | CatalogTaxonomyPanelOverviewProps
  | CatalogTaxonomyPanelFilterProps;

function isFilterMode(
  props: CatalogTaxonomyPanelProps,
): props is CatalogTaxonomyPanelFilterProps {
  return props.mode === "filters";
}

function getQuickFilterLabel(locale: Locale, key: CatalogQuickFilterKey) {
  if (key === "healthy") {
    return tr(locale, "Healthy only", "Healthy only");
  }

  return tr(locale, "No auth", "No auth");
}

export function CatalogTaxonomyPanel(props: CatalogTaxonomyPanelProps) {
  const localeFromContext = useLocale();
  const [showAllTags, setShowAllTags] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const visibleTagEntries = useMemo(() => {
    if (!isFilterMode(props)) {
      return [] as Array<[string, number]>;
    }

    return showAllTags
      ? props.tagEntries
      : props.tagEntries.slice(0, CATALOG_VISIBLE_TAG_LIMIT);
  }, [props, showAllTags]);

  if (isFilterMode(props)) {
    const filterPanelModel = buildCatalogFilterPanelModel({
      categoryEntries: props.categoryEntries,
      authTypeOptions: props.authTypeOptions,
      selectedAuthTypes: props.selectedAuthTypes,
      healthOptions: props.healthOptions,
      selectedHealthStatuses: props.selectedHealthStatuses,
      selectedVerificationLevels: props.selectedVerificationLevels,
      selectedTags: props.selectedTags,
      toolsMin: props.toolsMin,
      toolsMax: props.toolsMax,
    });

    const hasAdditionalTags = props.tagEntries.length > CATALOG_VISIBLE_TAG_LIMIT;
    const hiddenTagsCount = Math.max(
      0,
      props.tagEntries.length - CATALOG_VISIBLE_TAG_LIMIT,
    );
    const hasAdditionalCategories =
      filterPanelModel.overflowCategoryEntries.length > 0;
    const visibleCategoryEntries = showAllCategories
      ? [
          ...filterPanelModel.visibleCategoryEntries,
          ...filterPanelModel.overflowCategoryEntries,
        ]
      : filterPanelModel.visibleCategoryEntries;
    const isAdvancedOpen =
      showAdvancedFilters || filterPanelModel.advancedFiltersActiveCount > 0;

    const categoryOptions: FilterOption<string>[] = visibleCategoryEntries.map(
      ([categoryName, count]) => ({
        value: categoryName,
        label: categoryName,
        count,
      }),
    );
    const authTypeOptions: FilterOption<AuthType>[] =
      filterPanelModel.visibleAuthOptions;
    const healthOptions: FilterOption<HealthStatus>[] =
      filterPanelModel.visibleHealthOptions;
    const tagOptions: FilterOption<string>[] = visibleTagEntries.map(
      ([tag, count]) => ({
        value: tag,
        label: tag,
        count,
      }),
    );

    return (
      <aside
        id={props.panelId}
        className={cn(
          "h-fit overflow-hidden rounded-2xl border border-border bg-card shadow-[0_18px_38px_-26px_hsl(var(--foreground)/0.35)] backdrop-blur lg:sticky lg:top-24",
          props.className,
        )}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            {tr(localeFromContext, "Filters", "Filters")}
          </h2>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
              onClick={props.onClearAll}
            >
              {tr(localeFromContext, "Clear all", "Clear all")}
            </button>

            {props.onRequestClose ? (
              <button
                type="button"
                className="inline-flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:bg-accent hover:text-foreground"
                onClick={props.onRequestClose}
                aria-label={tr(localeFromContext, "Close filters", "Close filters")}
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
        </div>

        <FilterOptionsSection
          title={tr(localeFromContext, "Categories", "Categories")}
          options={categoryOptions}
          selectedValues={props.selectedCategories}
          onToggle={props.onToggleCategory}
          className="[&>div]:pr-1"
        />

        {hasAdditionalCategories ? (
          <div className="border-t border-border px-4 pb-4">
            <button
              type="button"
              className="text-xs font-medium text-primary transition hover:text-primary/80"
              onClick={() => setShowAllCategories((current) => !current)}
              aria-expanded={showAllCategories}
            >
              {showAllCategories
                ? tr(localeFromContext, "Show fewer categories", "Show fewer categories")
                : tr(localeFromContext, "Show more categories", "Show more categories")}
            </button>
          </div>
        ) : null}

        <FilterOptionsSection
          title={tr(localeFromContext, "Auth model", "Auth model")}
          options={authTypeOptions}
          selectedValues={props.selectedAuthTypes}
          onToggle={props.onToggleAuthType}
        />

        <FilterOptionsSection
          title={tr(localeFromContext, "Health status", "Health status")}
          options={healthOptions}
          selectedValues={props.selectedHealthStatuses}
          onToggle={props.onToggleHealthStatus}
        />

        <div className="border-t border-border px-4 py-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            {tr(localeFromContext, "Quick filters", "Quick filters")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {filterPanelModel.quickFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  filter.isActive
                    ? "border-primary/35 bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/25 hover:text-foreground",
                )}
                onClick={() => props.onApplyQuickFilter(filter.key)}
                aria-pressed={filter.isActive}
              >
                {getQuickFilterLabel(localeFromContext, filter.key)}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-border px-4 py-4">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 text-left"
            onClick={() => setShowAdvancedFilters((current) => !current)}
            aria-expanded={isAdvancedOpen}
          >
            <span className="text-sm font-semibold text-foreground">
              {tr(localeFromContext, "Advanced filters", "Advanced filters")}
            </span>
            <span className="inline-flex items-center gap-2">
              {filterPanelModel.advancedFiltersActiveCount > 0 ? (
                <span className="inline-flex min-w-6 items-center justify-center rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {filterPanelModel.advancedFiltersActiveCount}
                </span>
              ) : null}
              <span className="text-xs text-muted-foreground">
                {isAdvancedOpen
                  ? tr(localeFromContext, "Hide", "Hide")
                  : tr(localeFromContext, "Show", "Show")}
              </span>
            </span>
          </button>

          {isAdvancedOpen ? (
            <div className="mt-3 space-y-3">
              <FilterOptionsSection
                title={tr(localeFromContext, "Verification", "Verification")}
                options={props.verificationOptions}
                selectedValues={props.selectedVerificationLevels}
                onToggle={props.onToggleVerificationLevel}
                className="rounded-xl border border-border/70 bg-background/35 px-0 py-0 [&>div]:px-4 [&>div]:py-3"
              />

              <div className="rounded-xl border border-border/70 bg-background/35 px-4 py-4">
                <h3 className="mb-2 text-sm font-semibold text-foreground">
                  {tr(localeFromContext, "Tool count range", "Tool count range")}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {tr(localeFromContext, "Min", "Min")}
                    </p>
                    <Input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={props.toolsMin ?? ""}
                      onChange={(event) =>
                        props.onToolsMinChange(parseToolsBound(event.target.value))
                      }
                      className="h-9 border-border bg-card text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {tr(localeFromContext, "Max", "Max")}
                    </p>
                    <Input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={props.toolsMax ?? ""}
                      onChange={(event) =>
                        props.onToolsMaxChange(parseToolsBound(event.target.value))
                      }
                      className="h-9 border-border bg-card text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border/70 bg-background/35 px-4 py-4">
                <FilterOptionsSection
                  title={tr(localeFromContext, "Tags", "Tags")}
                  options={tagOptions}
                  selectedValues={props.selectedTags}
                  onToggle={props.onToggleTag}
                  className="border-t-0 p-0 [&>div]:max-h-56 [&>div]:overflow-y-auto [&>div]:pr-1"
                  renderLabelPrefix={(option) => (
                    <span
                      className={cn(
                        "inline-block size-2 rounded-full",
                        getTagDotClass(option.value),
                      )}
                    />
                  )}
                />

                {hasAdditionalTags ? (
                  <button
                    type="button"
                    className="mt-3 text-xs font-medium text-primary transition hover:text-primary/80"
                    onClick={() => setShowAllTags((current) => !current)}
                    aria-expanded={showAllTags}
                  >
                    {showAllTags
                      ? tr(localeFromContext, "Show fewer tags", "Show fewer tags")
                      : tr(localeFromContext, "Show more tags", "Show more tags")}
                    {!showAllTags ? ` (${hiddenTagsCount})` : ""}
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </aside>
    );
  }

  const locale = props.locale ?? localeFromContext;
  const categoryEntries = toTaxonomyEntries(
    props.categoryEntries,
    CATALOG_CATEGORY_OPTIONS,
  );
  const languageEntries = toTaxonomyEntries(
    props.languageEntries,
    CATALOG_LANGUAGE_OPTIONS,
  );

  return (
    <section className={cn("space-y-3", props.className)}>
      <h2 className="text-xl font-semibold text-foreground">
        {tr(locale, "Filters", "Filters")}
      </h2>
      <div className="grid gap-4">
        <TaxonomyList
          title={tr(locale, "Categories", "Categories")}
          items={categoryEntries}
        />
        <TaxonomyList
          title={tr(locale, "Languages", "Languages")}
          items={languageEntries}
        />
      </div>
    </section>
  );
}
