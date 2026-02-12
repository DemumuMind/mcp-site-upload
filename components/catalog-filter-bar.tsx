"use client";

import { Grid2X2, List, Search, SlidersHorizontal } from "lucide-react";

import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tr } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type {
  CatalogSortDirection,
  CatalogSortField,
  CatalogViewMode,
} from "@/lib/catalog/types";

type CatalogFilterBarProps = {
  searchQuery: string;
  sortField: CatalogSortField;
  sortDirection: CatalogSortDirection;
  viewMode: CatalogViewMode;
  activeFilterCount: number;
  isMobileFiltersOpen: boolean;
  onSearchQueryChange: (value: string) => void;
  onSortFieldChange: (value: CatalogSortField) => void;
  onSortDirectionChange: (value: CatalogSortDirection) => void;
  onViewModeChange: (value: CatalogViewMode) => void;
  onToggleMobileFilters: () => void;
};

export function CatalogFilterBar({
  searchQuery,
  sortField,
  sortDirection,
  viewMode,
  activeFilterCount,
  isMobileFiltersOpen,
  onSearchQueryChange,
  onSortFieldChange,
  onSortDirectionChange,
  onViewModeChange,
  onToggleMobileFilters,
}: CatalogFilterBarProps) {
  const locale = useLocale();

  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_170px_150px_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          placeholder={tr(
            locale,
            "Search tools, features, or descriptions...",
            "Поиск по инструментам, фичам или описанию...",
          )}
          className="h-10 border-slate-300 bg-white pl-9 text-slate-700 placeholder:text-slate-400"
        />
      </div>

      <Select value={sortField} onValueChange={(value) => onSortFieldChange(value as CatalogSortField)}>
        <SelectTrigger className="h-10 w-full border-slate-300 bg-white text-slate-700">
          <SelectValue placeholder={tr(locale, "Sort by", "Сортировка")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="rating">{tr(locale, "Rating", "Рейтинг")}</SelectItem>
          <SelectItem value="name">{tr(locale, "Name", "Название")}</SelectItem>
          <SelectItem value="tools">{tr(locale, "Tool Count", "Кол-во инструментов")}</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={sortDirection}
        onValueChange={(value) => onSortDirectionChange(value as CatalogSortDirection)}
      >
        <SelectTrigger className="h-10 w-full border-slate-300 bg-white text-slate-700">
          <SelectValue placeholder={tr(locale, "Order", "Порядок")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="desc">{tr(locale, "Descending", "Убывание")}</SelectItem>
          <SelectItem value="asc">{tr(locale, "Ascending", "Возрастание")}</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-10 border-slate-300 bg-white text-slate-700 hover:bg-slate-100 lg:hidden"
          onClick={onToggleMobileFilters}
          aria-label={tr(locale, "Open filters", "Открыть фильтры")}
          aria-expanded={isMobileFiltersOpen}
          aria-controls="catalog-mobile-filters"
        >
          <SlidersHorizontal className="size-4" />
          {tr(locale, "Filters", "Фильтры")}
          {activeFilterCount > 0 ? (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-semibold text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </Button>

        <div className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white p-1">
          <Button
            type="button"
            size="icon-sm"
            variant={viewMode === "grid" ? "default" : "ghost"}
            className={cn(
              "transition",
              viewMode === "grid"
                ? "bg-blue-600 text-white hover:bg-blue-500"
                : "text-slate-500 hover:text-slate-800",
            )}
            onClick={() => onViewModeChange("grid")}
            aria-label={tr(locale, "Grid view", "Вид сеткой")}
          >
            <Grid2X2 className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant={viewMode === "list" ? "default" : "ghost"}
            className={cn(
              "transition",
              viewMode === "list"
                ? "bg-blue-600 text-white hover:bg-blue-500"
                : "text-slate-500 hover:text-slate-800",
            )}
            onClick={() => onViewModeChange("list")}
            aria-label={tr(locale, "List view", "Вид списком")}
          >
            <List className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
