"use client";

import { useMemo, useState } from "react";
import { Grid2X2, List, Search, SearchX } from "lucide-react";

import { useLocale } from "@/components/locale-provider";
import { ServerCard } from "@/components/server-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { AuthType, McpServer } from "@/lib/types";

type CatalogSectionProps = {
  initialServers: McpServer[];
};

type SortField = "rating" | "name" | "tools";
type SortDirection = "asc" | "desc";
type ViewMode = "grid" | "list";

const tagDotClasses = [
  "bg-sky-400",
  "bg-emerald-400",
  "bg-violet-400",
  "bg-fuchsia-400",
  "bg-amber-400",
  "bg-rose-400",
];

function includesIgnoreCase(value: string, query: string): boolean {
  return value.toLowerCase().includes(query.toLowerCase());
}

function getTagDotClass(tag: string): string {
  let hash = 0;

  for (let index = 0; index < tag.length; index += 1) {
    hash = (hash + tag.charCodeAt(index) * 17) % 10_000;
  }

  return tagDotClasses[hash % tagDotClasses.length];
}

function getServerScore(mcpServer: McpServer): number {
  const verificationScore = {
    official: 3.5,
    partner: 2.4,
    community: 1.6,
  }[mcpServer.verificationLevel];

  const healthScore = {
    healthy: 1.2,
    unknown: 0.6,
    degraded: 0.25,
    down: 0,
  }[mcpServer.healthStatus ?? "unknown"];

  const toolsScore = Math.min(mcpServer.tools.length / 10, 2.2);
  const tagsScore = Math.min(mcpServer.tags.length / 6, 0.8);

  return verificationScore + healthScore + toolsScore + tagsScore;
}

export function CatalogSection({ initialServers }: CatalogSectionProps) {
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAuthTypes, setSelectedAuthTypes] = useState<AuthType[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>("rating");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const categoryEntries = useMemo(() => {
    const categoryCountMap = new Map<string, number>();

    for (const mcpServer of initialServers) {
      categoryCountMap.set(
        mcpServer.category,
        (categoryCountMap.get(mcpServer.category) ?? 0) + 1,
      );
    }

    return [...categoryCountMap.entries()].sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }

      return a[0].localeCompare(b[0]);
    });
  }, [initialServers]);

  const tagEntries = useMemo(() => {
    const tagCountMap = new Map<string, number>();

    for (const mcpServer of initialServers) {
      for (const tag of mcpServer.tags) {
        tagCountMap.set(tag, (tagCountMap.get(tag) ?? 0) + 1);
      }
    }

    return [...tagCountMap.entries()].sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }

      return a[0].localeCompare(b[0]);
    });
  }, [initialServers]);

  const authTypeCounts = useMemo(() => {
    const counts: Record<AuthType, number> = {
      none: 0,
      api_key: 0,
      oauth: 0,
    };

    for (const mcpServer of initialServers) {
      counts[mcpServer.authType] += 1;
    }

    return counts;
  }, [initialServers]);

  const authTypeOptions = useMemo(
    () => [
      {
        value: "none" as const,
        label: tr(locale, "Free", "Бесплатно"),
        count: authTypeCounts.none,
      },
      {
        value: "oauth" as const,
        label: tr(locale, "Freemium", "Freemium"),
        count: authTypeCounts.oauth,
      },
      {
        value: "api_key" as const,
        label: tr(locale, "Paid", "Платно"),
        count: authTypeCounts.api_key,
      },
    ],
    [authTypeCounts.api_key, authTypeCounts.none, authTypeCounts.oauth, locale],
  );

  function toggleCategory(category: string) {
    setSelectedCategories((current) => {
      if (current.includes(category)) {
        return current.filter((item) => item !== category);
      }

      return [...current, category];
    });
  }

  function toggleTag(tag: string) {
    setSelectedTags((current) => {
      if (current.includes(tag)) {
        return current.filter((item) => item !== tag);
      }

      return [...current, tag];
    });
  }

  function toggleAuthType(authType: AuthType) {
    setSelectedAuthTypes((current) => {
      if (current.includes(authType)) {
        return current.filter((item) => item !== authType);
      }

      return [...current, authType];
    });
  }

  function clearAllFilters() {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedAuthTypes([]);
    setSelectedTags([]);
  }

  const filteredServers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filtered = initialServers.filter((mcpServer) => {
      const searchableMaintainer = mcpServer.maintainer?.name ?? "";
      const searchMatches =
        !normalizedQuery ||
        includesIgnoreCase(mcpServer.name, normalizedQuery) ||
        includesIgnoreCase(mcpServer.description, normalizedQuery) ||
        includesIgnoreCase(mcpServer.category, normalizedQuery) ||
        includesIgnoreCase(searchableMaintainer, normalizedQuery) ||
        mcpServer.tags.some((tag) => includesIgnoreCase(tag, normalizedQuery)) ||
        mcpServer.tools.some((tool) => includesIgnoreCase(tool, normalizedQuery));

      const categoryMatches =
        selectedCategories.length === 0 || selectedCategories.includes(mcpServer.category);
      const authMatches =
        selectedAuthTypes.length === 0 || selectedAuthTypes.includes(mcpServer.authType);
      const tagMatches =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => mcpServer.tags.includes(tag));

      return searchMatches && categoryMatches && authMatches && tagMatches;
    });

    return [...filtered].sort((a, b) => {
      if (sortField === "name") {
        const compared = a.name.localeCompare(b.name);
        return sortDirection === "asc" ? compared : -compared;
      }

      if (sortField === "tools") {
        const compared = a.tools.length - b.tools.length;

        if (compared === 0) {
          return a.name.localeCompare(b.name);
        }

        return sortDirection === "asc" ? compared : -compared;
      }

      const compared = getServerScore(a) - getServerScore(b);

      if (compared === 0) {
        return a.name.localeCompare(b.name);
      }

      return sortDirection === "asc" ? compared : -compared;
    });
  }, [
    initialServers,
    searchQuery,
    selectedCategories,
    selectedAuthTypes,
    selectedTags,
    sortDirection,
    sortField,
  ]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-[1fr_170px_150px_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={tr(
              locale,
              "Search tools, features, or descriptions...",
              "Поиск по инструментам, фичам или описанию...",
            )}
            className="h-10 border-slate-300 bg-white pl-9 text-slate-700 placeholder:text-slate-400"
          />
        </div>

        <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
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
          onValueChange={(value) => setSortDirection(value as SortDirection)}
        >
          <SelectTrigger className="h-10 w-full border-slate-300 bg-white text-slate-700">
            <SelectValue placeholder={tr(locale, "Order", "Порядок")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">{tr(locale, "Descending", "Убывание")}</SelectItem>
            <SelectItem value="asc">{tr(locale, "Ascending", "Возрастание")}</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center justify-end gap-1 rounded-lg border border-slate-300 bg-white p-1">
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
            onClick={() => setViewMode("grid")}
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
            onClick={() => setViewMode("list")}
            aria-label={tr(locale, "List view", "Вид списком")}
          >
            <List className="size-4" />
          </Button>
        </div>
      </div>

      <p className="text-sm text-slate-500">
        {tr(
          locale,
          `${filteredServers.length} tools found`,
          `Найдено инструментов: ${filteredServers.length}`,
        )}
      </p>

      <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-24">
          <div className="flex items-center justify-between px-4 py-4">
            <h2 className="text-lg font-semibold text-slate-900">{tr(locale, "Filters", "Фильтры")}</h2>
            <button
              type="button"
              className="text-xs font-medium text-slate-500 transition hover:text-slate-900"
              onClick={clearAllFilters}
            >
              {tr(locale, "Clear All", "Сбросить")}
            </button>
          </div>

          <div className="border-t border-slate-200 px-4 py-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-800">
              {tr(locale, "Categories", "Категории")}
            </h3>
            <div className="max-h-52 space-y-1 overflow-y-auto pr-1">
              {categoryEntries.map(([categoryName, count]) => (
                <label
                  key={categoryName}
                  className="flex cursor-pointer items-center justify-between rounded-md px-1.5 py-1.5 transition hover:bg-slate-50"
                >
                  <span className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedCategories.includes(categoryName)}
                      onChange={() => toggleCategory(categoryName)}
                    />
                    <span className="text-sm text-slate-700">{categoryName}</span>
                  </span>
                  <span className="text-xs text-slate-400">{count}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 px-4 py-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-800">
              {tr(locale, "Pricing", "Стоимость")}
            </h3>
            <div className="space-y-1">
              {authTypeOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center justify-between rounded-md px-1.5 py-1.5 transition hover:bg-slate-50"
                >
                  <span className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedAuthTypes.includes(option.value)}
                      onChange={() => toggleAuthType(option.value)}
                    />
                    <span className="text-sm text-slate-700">{option.label}</span>
                  </span>
                  <span className="text-xs text-slate-400">{option.count}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 px-4 py-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-800">
              {tr(locale, "Tags", "Теги")}
            </h3>
            <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
              {tagEntries.slice(0, 24).map(([tag, count]) => (
                <label
                  key={tag}
                  className="flex cursor-pointer items-center justify-between rounded-md px-1.5 py-1.5 transition hover:bg-slate-50"
                >
                  <span className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedTags.includes(tag)}
                      onChange={() => toggleTag(tag)}
                    />
                    <span className={cn("inline-block size-2 rounded-full", getTagDotClass(tag))} />
                    <span className="text-sm text-slate-700">{tag}</span>
                  </span>
                  <span className="text-xs text-slate-400">{count}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        <div>
          {filteredServers.length > 0 ? (
            <div
              className={
                viewMode === "grid" ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" : "space-y-3"
              }
            >
              {filteredServers.map((mcpServer) => (
                <ServerCard
                  key={mcpServer.id}
                  mcpServer={mcpServer}
                  viewMode={viewMode}
                  score={getServerScore(mcpServer)}
                />
              ))}
            </div>
          ) : (
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <SearchX className="size-4 text-slate-500" />
                  {tr(locale, "No tools found", "Инструменты не найдены")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">
                {tr(
                  locale,
                  "Try another search query or reset categories/tags/access filters.",
                  "Попробуйте другой запрос или сбросьте фильтры категорий, тегов и доступа.",
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
