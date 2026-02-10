"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { GitCompareArrows, Heart, SearchX } from "lucide-react";

import { CatalogFilterBar } from "@/components/catalog-filter-bar";
import { CatalogTaxonomyPanel } from "@/components/catalog-taxonomy-panel";
import { useLocale } from "@/components/locale-provider";
import { ServerCard } from "@/components/server-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCatalogState } from "@/hooks/use-catalog-state";
import { getServerScore } from "@/lib/catalog/sorting";
import { tr } from "@/lib/i18n";
import type { AuthType, McpServer } from "@/lib/types";

type CatalogSectionProps = {
  initialServers: McpServer[];
};

type AuthTypeOption = {
  value: AuthType;
  label: string;
  count: number;
};

const savedIdsStorageKey = "demumumind.savedServerIds";
const compareIdsStorageKey = "demumumind.compareServerIds";
const maxComparedServers = 3;

function readStoredIds(storageKey: string, limit?: number): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(storageKey);

    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue);

    if (!Array.isArray(parsed)) {
      return [];
    }

    const ids = parsed.filter((value): value is string => typeof value === "string");

    if (typeof limit === "number") {
      return ids.slice(0, limit);
    }

    return ids;
  } catch {
    return [];
  }
}

export function CatalogSection({ initialServers }: CatalogSectionProps) {
  const locale = useLocale();
  const [savedServerIds, setSavedServerIds] = useState<string[]>(() => readStoredIds(savedIdsStorageKey));
  const [comparedServerIds, setComparedServerIds] = useState<string[]>(() =>
    readStoredIds(compareIdsStorageKey, maxComparedServers),
  );

  const {
    searchQuery,
    selectedCategories,
    selectedAuthTypes,
    selectedTags,
    sortField,
    sortDirection,
    viewMode,
    filteredServers,
    categoryEntries,
    tagEntries,
    authTypeCounts,
    setSearchQuery,
    setSortField,
    setSortDirection,
    setViewMode,
    toggleCategory,
    toggleTag,
    toggleAuthType,
    clearAllFilters,
  } = useCatalogState(initialServers);

  const comparedServers = useMemo(
    () => comparedServerIds
      .map((serverId) => initialServers.find((server) => server.id === serverId))
      .filter((server): server is McpServer => Boolean(server)),
    [comparedServerIds, initialServers],
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(savedIdsStorageKey, JSON.stringify(savedServerIds));
    } catch {
      // ignore storage errors in restricted environments
    }
  }, [savedServerIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(compareIdsStorageKey, JSON.stringify(comparedServerIds));
    } catch {
      // ignore storage errors in restricted environments
    }
  }, [comparedServerIds]);

  const authTypeOptions = useMemo<AuthTypeOption[]>(
    () => [
      {
        value: "none",
        label: tr(locale, "Free", "Бесплатно"),
        count: authTypeCounts.none,
      },
      {
        value: "oauth",
        label: tr(locale, "Freemium", "Freemium"),
        count: authTypeCounts.oauth,
      },
      {
        value: "api_key",
        label: tr(locale, "Paid", "Платно"),
        count: authTypeCounts.api_key,
      },
    ],
    [authTypeCounts.api_key, authTypeCounts.none, authTypeCounts.oauth, locale],
  );

  const activeFiltersCount =
    selectedCategories.length +
    selectedAuthTypes.length +
    selectedTags.length +
    (searchQuery.trim().length > 0 ? 1 : 0);

  function toggleSaved(serverId: string) {
    setSavedServerIds((current) => {
      if (current.includes(serverId)) {
        return current.filter((id) => id !== serverId);
      }

      return [...current, serverId];
    });
  }

  function toggleCompared(serverId: string) {
    setComparedServerIds((current) => {
      if (current.includes(serverId)) {
        return current.filter((id) => id !== serverId);
      }

      if (current.length >= maxComparedServers) {
        return [...current.slice(1), serverId];
      }

      return [...current, serverId];
    });
  }

  return (
    <div className="space-y-4">
      {comparedServers.length > 0 ? (
        <Card className="border-blue-400/25 bg-blue-500/10 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg text-blue-100">
              <GitCompareArrows className="size-4" />
              {tr(locale, "Compare shortlist", "Сравнение shortlist")} ({comparedServers.length}/
              {maxComparedServers})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid gap-2 lg:grid-cols-3">
              {comparedServers.map((server) => (
                <div key={server.id} className="rounded-lg border border-blue-400/25 bg-slate-950/70 p-3">
                  <p className="font-medium text-slate-100">{server.name}</p>
                  <p className="mt-1 text-xs text-slate-400">{server.category}</p>
                  <p className="mt-1 text-xs text-slate-300">
                    {tr(locale, "Auth", "Авторизация")}: {server.authType}
                  </p>
                  <p className="text-xs text-slate-300">
                    {tr(locale, "Tools", "Инструменты")}: {server.tools.length}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Button asChild size="xs" className="h-7 bg-blue-500 hover:bg-blue-400">
                      <Link href={`/server/${server.slug}`}>{tr(locale, "Open", "Открыть")}</Link>
                    </Button>
                    <Button
                      type="button"
                      size="xs"
                      variant="ghost"
                      className="h-7 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                      onClick={() => toggleCompared(server.id)}
                    >
                      {tr(locale, "Remove", "Убрать")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              size="xs"
              variant="ghost"
              className="h-7 text-blue-100 hover:bg-blue-500/20 hover:text-blue-50"
              onClick={() => setComparedServerIds([])}
            >
              {tr(locale, "Clear compare list", "Очистить сравнение")}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <CatalogFilterBar
        searchQuery={searchQuery}
        sortField={sortField}
        sortDirection={sortDirection}
        viewMode={viewMode}
        activeFiltersCount={activeFiltersCount}
        onSearchQueryChange={setSearchQuery}
        onSortFieldChange={setSortField}
        onSortDirectionChange={setSortDirection}
        onViewModeChange={setViewMode}
        onClearAllFilters={clearAllFilters}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="text-slate-300">
        {tr(
          locale,
          `${filteredServers.length} tools found`,
          `Найдено инструментов: ${filteredServers.length}`,
        )}
        </p>
        <p className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-slate-900/80 px-2 py-0.5 text-xs text-slate-400">
          <Heart className="size-3.5" />
          {tr(locale, "Saved", "Сохранено")}: {savedServerIds.length}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
        <CatalogTaxonomyPanel
          mode="filters"
          categoryEntries={categoryEntries}
          selectedCategories={selectedCategories}
          authTypeOptions={authTypeOptions}
          selectedAuthTypes={selectedAuthTypes}
          tagEntries={tagEntries}
          selectedTags={selectedTags}
          onToggleCategory={toggleCategory}
          onToggleAuthType={toggleAuthType}
          onToggleTag={toggleTag}
          onClearAll={clearAllFilters}
        />

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
                  isSaved={savedServerIds.includes(mcpServer.id)}
                  isCompared={comparedServerIds.includes(mcpServer.id)}
                  onToggleSaved={toggleSaved}
                  onToggleCompared={toggleCompared}
                />
              ))}
            </div>
          ) : (
            <Card className="border-white/10 bg-slate-900/70 shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-100">
                  <SearchX className="size-4 text-slate-400" />
                  {tr(locale, "No tools found", "Инструменты не найдены")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300">
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
