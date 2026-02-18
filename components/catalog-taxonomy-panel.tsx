"use client";
import { useMemo, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { Input } from "@/components/ui/input";
import { CATALOG_CATEGORY_OPTIONS, CATALOG_LANGUAGE_OPTIONS, CATALOG_VISIBLE_TAG_LIMIT, getTagDotClass, } from "@/lib/catalog-taxonomy";
import { tr, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { AuthType, HealthStatus, VerificationLevel } from "@/lib/types";
type TaxonomyEntry = {
    label: string;
    count?: number;
};
type FilterOption<TValue extends string> = {
    value: TValue;
    label: string;
    count: number;
};
function TaxonomyList({ title, items, }: {
    title: string;
    items: readonly TaxonomyEntry[];
}) {
    return (<div className="rounded-2xl border border-blacksmith bg-card p-4 shadow-[0_0_0_1px_rgba(148,163,184,0.06)] backdrop-blur">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (<li key={item.label} className="flex items-center justify-between gap-3 rounded-lg border border-blacksmith bg-card px-3 py-1.5 text-xs text-muted-foreground">
            <span>{item.label}</span>
            {typeof item.count === "number" ? (<span className="rounded-full border border-blacksmith bg-card px-2 py-0.5 text-[11px] text-muted-foreground">
                {item.count}
              </span>) : null}
          </li>))}
      </ul>
    </div>);
}
type CatalogTaxonomyPanelBaseProps = {
    className?: string;
};
type CatalogTaxonomyPanelOverviewProps = CatalogTaxonomyPanelBaseProps & {
    mode?: "overview";
    locale: Locale;
    categoryEntries?: Array<[
        string,
        number
    ]>;
    languageEntries?: Array<[
        string,
        number
    ]>;
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
    categoryEntries: Array<[
        string,
        number
    ]>;
    selectedCategories: string[];
    authTypeOptions: CatalogAuthTypeOption[];
    selectedAuthTypes: AuthType[];
    verificationOptions: CatalogVerificationOption[];
    selectedVerificationLevels: VerificationLevel[];
    healthOptions: CatalogHealthOption[];
    selectedHealthStatuses: HealthStatus[];
    toolsMin: number | null;
    toolsMax: number | null;
    tagEntries: Array<[
        string,
        number
    ]>;
    selectedTags: string[];
    onToggleCategory: (category: string) => void;
    onToggleAuthType: (authType: AuthType) => void;
    onToggleVerificationLevel: (verificationLevel: VerificationLevel) => void;
    onToggleHealthStatus: (healthStatus: HealthStatus) => void;
    onToolsMinChange: (value: number | null) => void;
    onToolsMaxChange: (value: number | null) => void;
    onToggleTag: (tag: string) => void;
    onClearAll: () => void;
    onRequestClose?: () => void;
};
type CatalogTaxonomyPanelProps = CatalogTaxonomyPanelOverviewProps | CatalogTaxonomyPanelFilterProps;
function isFilterMode(props: CatalogTaxonomyPanelProps): props is CatalogTaxonomyPanelFilterProps {
    return props.mode === "filters";
}
function toTaxonomyEntries(entries: Array<[
    string,
    number
]> | undefined, fallbackValues: readonly string[]): TaxonomyEntry[] {
    if (entries && entries.length > 0) {
        return entries.map(([label, count]) => ({ label, count }));
    }
    return fallbackValues.map((label) => ({ label }));
}
function parseToolsBound(rawValue: string): number | null {
    if (rawValue.trim().length === 0) {
        return null;
    }
    const parsed = Number.parseInt(rawValue, 10);
    if (!Number.isFinite(parsed)) {
        return null;
    }
    return Math.max(0, parsed);
}
function FilterOptionsSection<TValue extends string>({ title, options, selectedValues, onToggle, className, renderLabelPrefix, }: {
    title: string;
    options: readonly FilterOption<TValue>[];
    selectedValues: readonly TValue[];
    onToggle: (value: TValue) => void;
    className?: string;
    renderLabelPrefix?: (option: FilterOption<TValue>) => ReactNode;
}) {
    return (<div className={cn("border-t border-blacksmith px-4 py-4", className)}>
      <h3 className="mb-2 text-sm font-semibold text-foreground">{title}</h3>
      <div className="space-y-1">
        {options.map((option) => (<label key={option.value} className="flex cursor-pointer items-center justify-between rounded-md px-1.5 py-1.5 transition hover:bg-card">
            <span className="inline-flex items-center gap-2">
              <input type="checkbox" className="size-4 rounded border-blacksmith bg-card text-primary focus:ring-primary" checked={selectedValues.includes(option.value)} onChange={() => onToggle(option.value)}/>
              {renderLabelPrefix ? renderLabelPrefix(option) : null}
              <span className="text-sm text-muted-foreground">{option.label}</span>
            </span>
            <span className="text-xs text-muted-foreground">{option.count}</span>
          </label>))}
      </div>
    </div>);
}
export function CatalogTaxonomyPanel(props: CatalogTaxonomyPanelProps) {
    const localeFromContext = useLocale();
    const [showAllTags, setShowAllTags] = useState(false);
    const visibleTagEntries = useMemo(() => {
        if (!isFilterMode(props)) {
            return [] as Array<[
                string,
                number
            ]>;
        }
        return showAllTags ? props.tagEntries : props.tagEntries.slice(0, CATALOG_VISIBLE_TAG_LIMIT);
    }, [props, showAllTags]);
    if (isFilterMode(props)) {
        const hasAdditionalTags = props.tagEntries.length > CATALOG_VISIBLE_TAG_LIMIT;
        const hiddenTagsCount = Math.max(0, props.tagEntries.length - CATALOG_VISIBLE_TAG_LIMIT);
        const categoryOptions: FilterOption<string>[] = props.categoryEntries.map(([categoryName, count]) => ({
            value: categoryName,
            label: categoryName,
            count,
        }));
        const tagOptions: FilterOption<string>[] = visibleTagEntries.map(([tag, count]) => ({
            value: tag,
            label: tag,
            count,
        }));
        return (<aside id={props.panelId} className={cn("h-fit overflow-hidden rounded-2xl border border-blacksmith bg-card shadow-[0_18px_38px_-26px_rgba(15,23,42,0.95)] backdrop-blur lg:sticky lg:top-24", props.className)}>
        <div className="flex items-center justify-between gap-3 px-4 py-4">
          <h2 className="text-lg font-semibold text-foreground">{tr(localeFromContext, "Filters", "Filters")}</h2>

          <div className="flex items-center gap-1.5">
            <button type="button" className="text-xs font-medium text-muted-foreground transition hover:text-foreground" onClick={props.onClearAll}>
              {tr(localeFromContext, "Clear all", "Clear all")}
            </button>

            {props.onRequestClose ? (<button type="button" className="inline-flex size-7 items-center justify-center rounded-md border border-blacksmith text-muted-foreground transition hover:bg-accent hover:text-foreground" onClick={props.onRequestClose} aria-label={tr(localeFromContext, "Close filters", "Close filters")}>
                <X className="size-4"/>
              </button>) : null}
          </div>
        </div>

        <FilterOptionsSection title={tr(localeFromContext, "Categories", "Categories")} options={categoryOptions} selectedValues={props.selectedCategories} onToggle={props.onToggleCategory} className="[&>div]:max-h-52 [&>div]:overflow-y-auto [&>div]:pr-1"/>

        <FilterOptionsSection title={tr(localeFromContext, "Auth model", "Auth model")} options={props.authTypeOptions} selectedValues={props.selectedAuthTypes} onToggle={props.onToggleAuthType}/>

        <FilterOptionsSection title={tr(localeFromContext, "Verification", "Verification")} options={props.verificationOptions} selectedValues={props.selectedVerificationLevels} onToggle={props.onToggleVerificationLevel}/>

        <FilterOptionsSection title={tr(localeFromContext, "Health status", "Health status")} options={props.healthOptions} selectedValues={props.selectedHealthStatuses} onToggle={props.onToggleHealthStatus}/>

        <div className="border-t border-blacksmith px-4 py-4">
          <h3 className="mb-2 text-sm font-semibold text-foreground">
            {tr(localeFromContext, "Tool count range", "Tool count range")}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{tr(localeFromContext, "Min", "Min")}</p>
              <Input type="number" min={0} inputMode="numeric" value={props.toolsMin ?? ""} onChange={(event) => props.onToolsMinChange(parseToolsBound(event.target.value))} className="h-9 border-blacksmith bg-card text-foreground placeholder:text-muted-foreground"/>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{tr(localeFromContext, "Max", "Max")}</p>
              <Input type="number" min={0} inputMode="numeric" value={props.toolsMax ?? ""} onChange={(event) => props.onToolsMaxChange(parseToolsBound(event.target.value))} className="h-9 border-blacksmith bg-card text-foreground placeholder:text-muted-foreground"/>
            </div>
          </div>
        </div>

        <div className="border-t border-blacksmith px-4 py-4">
          <FilterOptionsSection title={tr(localeFromContext, "Tags", "Tags")} options={tagOptions} selectedValues={props.selectedTags} onToggle={props.onToggleTag} className="border-t-0 p-0 [&>div]:max-h-56 [&>div]:overflow-y-auto [&>div]:pr-1" renderLabelPrefix={(option) => (<span className={cn("inline-block size-2 rounded-full", getTagDotClass(option.value))}/>)} />

          {hasAdditionalTags ? (<button type="button" className="mt-3 text-xs font-medium text-blue-300 transition hover:text-blue-200" onClick={() => setShowAllTags((current) => !current)}>
              {showAllTags
                    ? tr(localeFromContext, "Show fewer tags", "Show fewer tags")
                    : tr(localeFromContext, "Show more tags", "Show more tags")}
              {!showAllTags ? ` (${hiddenTagsCount})` : ""}
            </button>) : null}
        </div>
      </aside>);
    }
    const locale = props.locale ?? localeFromContext;
    const categoryEntries = toTaxonomyEntries(props.categoryEntries, CATALOG_CATEGORY_OPTIONS);
    const languageEntries = toTaxonomyEntries(props.languageEntries, CATALOG_LANGUAGE_OPTIONS);
    return (<section className={cn("space-y-3", props.className)}>
      <h2 className="text-xl font-semibold text-foreground">{tr(locale, "Filters", "Filters")}</h2>
      <div className="grid gap-4">
        <TaxonomyList title={tr(locale, "Categories", "Categories")} items={categoryEntries}/>
        <TaxonomyList title={tr(locale, "Languages", "Languages")} items={languageEntries}/>
      </div>
    </section>);
}

