"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchX } from "lucide-react";

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
import type {
  CatalogSortDirection,
  CatalogSortField,
  CatalogViewMode,
} from "@/lib/catalog/types";

type CatalogSectionProps = {
  initialServers: McpServer[];
};

type AuthTypeOption = {
  value: AuthType;
  label: string;
  count: number;
};

type PaginationEntry = number | "ellipsis";

type CatalogQueryState = {
  page: number;
  searchQuery: string;
  selectedCategories: string[];
  selectedAuthTypes: AuthType[];
  selectedTags: string[];
  sortField: CatalogSortField;
  sortDirection: CatalogSortDirection;
  viewMode: CatalogViewMode;
};

const catalogPageSize = 12;
const defaultSortField: CatalogSortField = "rating";
const defaultSortDirection: CatalogSortDirection = "desc";
const defaultViewMode: CatalogViewMode = "grid";
const authTypeUrlOrder: AuthType[] = ["none", "oauth", "api_key"];

function parseCatalogPage(value: string | null): number {
  if (!value) {
    return 1;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

function parseCatalogSortField(value: string | null): CatalogSortField {
  if (value === "name" || value === "tools" || value === "rating") {
    return value;
  }

  return defaultSortField;
}

function parseCatalogSortDirection(value: string | null): CatalogSortDirection {
  if (value === "asc" || value === "desc") {
    return value;
  }

  return defaultSortDirection;
}

function parseCatalogViewMode(value: string | null): CatalogViewMode {
  if (value === "grid" || value === "list") {
    return value;
  }

  return defaultViewMode;
}

function parseCatalogList(values: string[]): string[] {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter((value) => value.length > 0)),
  );
}

function parseCatalogAuthTypes(values: string[]): AuthType[] {
  const parsed = values.filter(
    (value): value is AuthType => value === "none" || value === "oauth" || value === "api_key",
  );

  return Array.from(new Set(parsed));
}

function toSortedUniqueCatalogList(values: string[]): string[] {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter((value) => value.length > 0)),
  ).sort((left, right) => left.localeCompare(right));
}

function toSortedUniqueAuthTypes(values: AuthType[]): AuthType[] {
  return Array.from(new Set(values)).sort((left, right) =>
    authTypeUrlOrder.indexOf(left) - authTypeUrlOrder.indexOf(right),
  );
}

function buildPaginationEntries(currentPage: number, totalPages: number): PaginationEntry[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const entries: PaginationEntry[] = [1];
  const leftBoundary = Math.max(2, currentPage - 1);
  const rightBoundary = Math.min(totalPages - 1, currentPage + 1);

  if (leftBoundary > 2) {
    entries.push("ellipsis");
  }

  for (let page = leftBoundary; page <= rightBoundary; page += 1) {
    entries.push(page);
  }

  if (rightBoundary < totalPages - 1) {
    entries.push("ellipsis");
  }

  entries.push(totalPages);

  return entries;
}

export function CatalogSection({ initialServers }: CatalogSectionProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialSearchQuery = searchParams.get("q") ?? "";
  const initialSelectedCategories = parseCatalogList(searchParams.getAll("cat"));
  const initialSelectedAuthTypes = parseCatalogAuthTypes(searchParams.getAll("auth"));
  const initialSelectedTags = parseCatalogList(searchParams.getAll("tag"));
  const initialSortField = parseCatalogSortField(searchParams.get("sort"));
  const initialSortDirection = parseCatalogSortDirection(searchParams.get("order"));
  const initialViewMode = parseCatalogViewMode(searchParams.get("view"));
  const currentPage = parseCatalogPage(searchParams.get("page"));

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
  } = useCatalogState(initialServers, {
    searchQuery: initialSearchQuery,
    selectedCategories: initialSelectedCategories,
    selectedAuthTypes: initialSelectedAuthTypes,
    selectedTags: initialSelectedTags,
    sortField: initialSortField,
    sortDirection: initialSortDirection,
    viewMode: initialViewMode,
  });

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

  const totalPages = Math.max(1, Math.ceil(filteredServers.length / catalogPageSize));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedServers = useMemo(() => {
    const startIndex = (activePage - 1) * catalogPageSize;

    return filteredServers.slice(startIndex, startIndex + catalogPageSize);
  }, [activePage, filteredServers]);
  const paginationEntries = useMemo(
    () => buildPaginationEntries(activePage, totalPages),
    [activePage, totalPages],
  );
  const firstVisibleIndex = filteredServers.length === 0 ? 0 : (activePage - 1) * catalogPageSize + 1;
  const lastVisibleIndex = Math.min(activePage * catalogPageSize, filteredServers.length);

  function replaceCatalogUrl(nextState: Partial<CatalogQueryState>) {
    const mergedState: CatalogQueryState = {
      page: currentPage,
      searchQuery,
      selectedCategories,
      selectedAuthTypes,
      selectedTags,
      sortField,
      sortDirection,
      viewMode,
      ...nextState,
    };

    const normalizedSearchQuery = mergedState.searchQuery.trim();
    const normalizedCategories = toSortedUniqueCatalogList(mergedState.selectedCategories);
    const normalizedAuthTypes = toSortedUniqueAuthTypes(mergedState.selectedAuthTypes);
    const normalizedTags = toSortedUniqueCatalogList(mergedState.selectedTags);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    params.delete("q");
    params.delete("cat");
    params.delete("auth");
    params.delete("tag");
    params.delete("sort");
    params.delete("order");
    params.delete("view");

    if (mergedState.page > 1) {
      params.set("page", String(mergedState.page));
    }

    if (normalizedSearchQuery.length > 0) {
      params.set("q", normalizedSearchQuery);
    }

    normalizedCategories.forEach((category) => {
      params.append("cat", category);
    });

    normalizedAuthTypes.forEach((authType) => {
      params.append("auth", authType);
    });

    normalizedTags.forEach((tag) => {
      params.append("tag", tag);
    });

    if (mergedState.sortField !== defaultSortField) {
      params.set("sort", mergedState.sortField);
    }

    if (mergedState.sortDirection !== defaultSortDirection) {
      params.set("order", mergedState.sortDirection);
    }

    if (mergedState.viewMode !== defaultViewMode) {
      params.set("view", mergedState.viewMode);
    }

    const query = params.toString();
    const currentQuery = searchParams.toString();

    if (query === currentQuery) {
      return;
    }

    router.replace(query.length > 0 ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function handleSearchQueryChange(value: string) {
    setSearchQuery(value);
    replaceCatalogUrl({
      page: 1,
      searchQuery: value,
    });
  }

  function handleSortFieldChange(value: CatalogSortField) {
    setSortField(value);
    replaceCatalogUrl({
      page: 1,
      sortField: value,
    });
  }

  function handleSortDirectionChange(value: CatalogSortDirection) {
    setSortDirection(value);
    replaceCatalogUrl({
      page: 1,
      sortDirection: value,
    });
  }

  function handleViewModeChange(value: CatalogViewMode) {
    setViewMode(value);
    replaceCatalogUrl({
      viewMode: value,
    });
  }

  function handleToggleCategory(category: string) {
    const nextSelectedCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((item) => item !== category)
      : [...selectedCategories, category];

    toggleCategory(category);
    replaceCatalogUrl({
      page: 1,
      selectedCategories: nextSelectedCategories,
    });
  }

  function handleToggleAuthType(authType: AuthType) {
    const nextSelectedAuthTypes = selectedAuthTypes.includes(authType)
      ? selectedAuthTypes.filter((item) => item !== authType)
      : [...selectedAuthTypes, authType];

    toggleAuthType(authType);
    replaceCatalogUrl({
      page: 1,
      selectedAuthTypes: nextSelectedAuthTypes,
    });
  }

  function handleToggleTag(tag: string) {
    const nextSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter((item) => item !== tag)
      : [...selectedTags, tag];

    toggleTag(tag);
    replaceCatalogUrl({
      page: 1,
      selectedTags: nextSelectedTags,
    });
  }

  function handleClearAllFilters() {
    clearAllFilters();
    replaceCatalogUrl({
      page: 1,
      searchQuery: "",
      selectedCategories: [],
      selectedAuthTypes: [],
      selectedTags: [],
    });
  }

  function setCatalogPage(pageNumber: number) {
    const normalizedPage = Math.min(Math.max(pageNumber, 1), totalPages);

    if (normalizedPage === currentPage) {
      return;
    }

    replaceCatalogUrl({ page: normalizedPage });
  }

  return (
    <div className="space-y-4">
      <CatalogFilterBar
        searchQuery={searchQuery}
        sortField={sortField}
        sortDirection={sortDirection}
        viewMode={viewMode}
        onSearchQueryChange={handleSearchQueryChange}
        onSortFieldChange={handleSortFieldChange}
        onSortDirectionChange={handleSortDirectionChange}
        onViewModeChange={handleViewModeChange}
      />

      <div className="space-y-1 text-sm text-slate-500">
        <p>
          {tr(
            locale,
            `${filteredServers.length} tools found`,
            `Найдено инструментов: ${filteredServers.length}`,
          )}
        </p>
        {filteredServers.length > 0 ? (
          <p className="text-xs text-slate-400">
            {tr(
              locale,
              `Showing ${firstVisibleIndex}-${lastVisibleIndex} on this page`,
              `Показано ${firstVisibleIndex}-${lastVisibleIndex} на этой странице`,
            )}
          </p>
        ) : null}
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
          onToggleCategory={handleToggleCategory}
          onToggleAuthType={handleToggleAuthType}
          onToggleTag={handleToggleTag}
          onClearAll={handleClearAllFilters}
        />

        <div>
          {filteredServers.length > 0 ? (
            <div className="space-y-5">
              <div
                className={
                  viewMode === "grid" ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" : "space-y-3"
                }
              >
                {paginatedServers.map((mcpServer) => (
                  <ServerCard
                    key={mcpServer.id}
                    mcpServer={mcpServer}
                    viewMode={viewMode}
                    score={getServerScore(mcpServer)}
                  />
                ))}
              </div>

              {totalPages > 1 ? (
                <div
                  className="flex flex-wrap items-center justify-center gap-1"
                  role="navigation"
                  aria-label="Catalog pagination"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => setCatalogPage(activePage - 1)}
                    disabled={activePage <= 1}
                    aria-label={tr(locale, "Previous page", "Предыдущая страница")}
                  >
                    {tr(locale, "Prev", "Назад")}
                  </Button>

                  {paginationEntries.map((entry, index) =>
                    entry === "ellipsis" ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="inline-flex h-6 min-w-8 items-center justify-center px-1 text-xs text-slate-500"
                        aria-hidden
                      >
                        …
                      </span>
                    ) : (
                      <Button
                        key={`page-${entry}`}
                        type="button"
                        variant={entry === activePage ? "secondary" : "ghost"}
                        size="xs"
                        onClick={() => setCatalogPage(entry)}
                        aria-current={entry === activePage ? "page" : undefined}
                        className="min-w-8"
                      >
                        {entry}
                      </Button>
                    ),
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => setCatalogPage(activePage + 1)}
                    disabled={activePage >= totalPages}
                    aria-label={tr(locale, "Next page", "Следующая страница")}
                  >
                    {tr(locale, "Next", "Вперед")}
                  </Button>
                </div>
              ) : null}
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
