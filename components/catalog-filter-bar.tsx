"use client";
import { Grid2X2, List, Search, SlidersHorizontal } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import type { CatalogSortDirection, CatalogSortField, CatalogViewMode, } from "@/lib/catalog/types";
import { tr } from "@/lib/i18n";
import { cn } from "@/lib/utils";
type CatalogFilterBarProps = {
    searchQuery: string;
    sortField: CatalogSortField;
    sortDirection: CatalogSortDirection;
    pageSize: number;
    viewMode: CatalogViewMode;
    activeFilterCount: number;
    isMobileFiltersOpen: boolean;
    onSearchQueryChange: (value: string) => void;
    onSortFieldChange: (value: CatalogSortField) => void;
    onSortDirectionChange: (value: CatalogSortDirection) => void;
    onPageSizeChange: (value: number) => void;
    onViewModeChange: (value: CatalogViewMode) => void;
    onToggleMobileFilters: () => void;
};
export function CatalogFilterBar({ searchQuery, sortField, sortDirection, pageSize, viewMode, activeFilterCount, isMobileFiltersOpen, onSearchQueryChange, onSortFieldChange, onSortDirectionChange, onPageSizeChange, onViewModeChange, onToggleMobileFilters, }: CatalogFilterBarProps) {
    const locale = useLocale();
    return (<div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_170px_150px_130px_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"/>
        <Input value={searchQuery} onChange={(event) => onSearchQueryChange(event.target.value)} placeholder={tr(locale, "Search tools, features, or descriptions...", "Search tools, features, or descriptions...")} className="h-10 rounded-xl border-blacksmith bg-card pl-9 text-foreground placeholder:text-muted-foreground focus-visible:border-blue-400/55 focus-visible:ring-blue-500/20"/>
      </div>

      <Select value={sortField} onValueChange={(value) => onSortFieldChange(value as CatalogSortField)}>
        <SelectTrigger className="h-10 w-full rounded-xl border-blacksmith bg-card text-foreground hover:bg-accent">
          <SelectValue placeholder={tr(locale, "Sort by", "Sort by")}/>
        </SelectTrigger>
        <SelectContent className="border-blacksmith bg-card text-foreground">
          <SelectItem value="rating" className="focus:bg-card focus:text-foreground">
            {tr(locale, "Rating", "Rating")}
          </SelectItem>
          <SelectItem value="name" className="focus:bg-card focus:text-foreground">
            {tr(locale, "Name", "Name")}
          </SelectItem>
          <SelectItem value="tools" className="focus:bg-card focus:text-foreground">
            {tr(locale, "Tool count", "Tool count")}
          </SelectItem>
          <SelectItem value="updated" className="focus:bg-card focus:text-foreground">
            {tr(locale, "Recently added", "Recently added")}
          </SelectItem>
        </SelectContent>
      </Select>

      <Select value={sortDirection} onValueChange={(value) => onSortDirectionChange(value as CatalogSortDirection)}>
        <SelectTrigger className="h-10 w-full rounded-xl border-blacksmith bg-card text-foreground hover:bg-accent">
          <SelectValue placeholder={tr(locale, "Order", "Order")}/>
        </SelectTrigger>
        <SelectContent className="border-blacksmith bg-card text-foreground">
          <SelectItem value="desc" className="focus:bg-card focus:text-foreground">
            {tr(locale, "Descending", "Descending")}
          </SelectItem>
          <SelectItem value="asc" className="focus:bg-card focus:text-foreground">
            {tr(locale, "Ascending", "Ascending")}
          </SelectItem>
        </SelectContent>
      </Select>

      <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number.parseInt(value, 10))}>
        <SelectTrigger className="h-10 w-full rounded-xl border-blacksmith bg-card text-foreground hover:bg-accent">
          <SelectValue placeholder={tr(locale, "Page size", "Page size")}/>
        </SelectTrigger>
        <SelectContent className="border-blacksmith bg-card text-foreground">
          <SelectItem value="12" className="focus:bg-card focus:text-foreground">
            12 / {tr(locale, "page", "page")}
          </SelectItem>
          <SelectItem value="24" className="focus:bg-card focus:text-foreground">
            24 / {tr(locale, "page", "page")}
          </SelectItem>
          <SelectItem value="48" className="focus:bg-card focus:text-foreground">
            48 / {tr(locale, "page", "page")}
          </SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" size="sm" variant="outline" className="h-10 rounded-xl border-blacksmith bg-card text-foreground hover:bg-accent lg:hidden" onClick={onToggleMobileFilters} aria-label={tr(locale, "Open filters", "Open filters")} aria-expanded={isMobileFiltersOpen} aria-controls="catalog-mobile-filters">
          <SlidersHorizontal className="size-4"/>
          {tr(locale, "Filters", "Filters")}
          {activeFilterCount > 0 ? (<span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-semibold text-foreground">
              {activeFilterCount}
            </span>) : null}
        </Button>

        <div className="flex items-center gap-1 rounded-lg border border-blacksmith bg-card p-1">
          <Button type="button" size="icon-sm" variant={viewMode === "grid" ? "default" : "ghost"} className={cn("transition", viewMode === "grid"
            ? "bg-blue-600 text-foreground hover:bg-blue-500"
            : "text-muted-foreground hover:bg-accent hover:text-foreground")} onClick={() => onViewModeChange("grid")} aria-label={tr(locale, "Grid view", "Grid view")}>
            <Grid2X2 className="size-4"/>
          </Button>
          <Button type="button" size="icon-sm" variant={viewMode === "list" ? "default" : "ghost"} className={cn("transition", viewMode === "list"
            ? "bg-blue-600 text-foreground hover:bg-blue-500"
            : "text-muted-foreground hover:bg-accent hover:text-foreground")} onClick={() => onViewModeChange("list")} aria-label={tr(locale, "List view", "List view")}>
            <List className="size-4"/>
          </Button>
        </div>
      </div>
    </div>);
}

