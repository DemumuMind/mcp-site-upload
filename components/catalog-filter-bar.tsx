"use client";

import { Grid2X2, List, Search } from "lucide-react";

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
  activeFiltersCount?: number;
  onSearchQueryChange: (value: string) => void;
  onSortFieldChange: (value: CatalogSortField) => void;
  onSortDirectionChange: (value: CatalogSortDirection) => void;
  onViewModeChange: (value: CatalogViewMode) => void;
  onClearAllFilters?: () => void;
};

export function CatalogFilterBar({
  searchQuery,
  sortField,
  sortDirection,
  viewMode,
  activeFiltersCount = 0,
  onSearchQueryChange,
  onSortFieldChange,
  onSortDirectionChange,
  onViewModeChange,
  onClearAllFilters,
}: CatalogFilterBarProps) {
  const locale = useLocale();

  return (
    <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-3 lg:grid-cols-[1fr_170px_150px_auto] lg:items-center">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500" />
        <Input
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          placeholder={tr(
            locale,
            "Search tools, features, or descriptions...",
            "Поиск по инструментам, фичам или описанию...",
          )}
          className="h-10 border-white/15 bg-slate-900/90 pl-9 text-slate-100 placeholder:text-slate-500"
        />
      </div>

      <Select value={sortField} onValueChange={(value) => onSortFieldChange(value as CatalogSortField)}>
        <SelectTrigger className="h-10 w-full border-white/15 bg-slate-900/90 text-slate-100">
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
        <SelectTrigger className="h-10 w-full border-white/15 bg-slate-900/90 text-slate-100">
          <SelectValue placeholder={tr(locale, "Order", "Порядок")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="desc">{tr(locale, "Descending", "Убывание")}</SelectItem>
          <SelectItem value="asc">{tr(locale, "Ascending", "Возрастание")}</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center justify-end gap-1 rounded-lg border border-white/15 bg-slate-900/90 p-1">
        <Button
          type="button"
          size="icon-sm"
          variant={viewMode === "grid" ? "default" : "ghost"}
          className={cn(
            "transition",
            viewMode === "grid"
              ? "bg-blue-500 text-white hover:bg-blue-400"
              : "text-slate-400 hover:text-slate-100",
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
              ? "bg-blue-500 text-white hover:bg-blue-400"
              : "text-slate-400 hover:text-slate-100",
          )}
          onClick={() => onViewModeChange("list")}
          aria-label={tr(locale, "List view", "Вид списком")}
        >
          <List className="size-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-300 lg:col-span-4">
        <span className="rounded-full border border-white/10 bg-slate-900/80 px-2 py-0.5 text-[11px]">
          {tr(locale, "Active filters", "Активные фильтры")}: {activeFiltersCount}
        </span>
        {onClearAllFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="h-7 rounded-md px-2 text-slate-300 hover:bg-slate-800 hover:text-white"
            onClick={onClearAllFilters}
          >
            {tr(locale, "Reset filters", "Сбросить фильтры")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
