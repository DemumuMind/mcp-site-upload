"use client";

import { useMemo } from "react";
import { SearchX } from "lucide-react";

import { CatalogFilterBar } from "@/components/catalog-filter-bar";
import { CatalogTaxonomyPanel } from "@/components/catalog-taxonomy-panel";
import { useLocale } from "@/components/locale-provider";
import { ServerCard } from "@/components/server-card";
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

export function CatalogSection({ initialServers }: CatalogSectionProps) {
  const locale = useLocale();
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

  return (
    <div className="space-y-4">
      <CatalogFilterBar
        searchQuery={searchQuery}
        sortField={sortField}
        sortDirection={sortDirection}
        viewMode={viewMode}
        onSearchQueryChange={setSearchQuery}
        onSortFieldChange={setSortField}
        onSortDirectionChange={setSortDirection}
        onViewModeChange={setViewMode}
      />

      <p className="text-sm text-slate-500">
        {tr(
          locale,
          `${filteredServers.length} tools found`,
          `Найдено инструментов: ${filteredServers.length}`,
        )}
      </p>

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
