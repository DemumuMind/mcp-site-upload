"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  areCatalogQueriesEqual,
  buildCatalogQueryV2SearchParams,
  parseCatalogQueryV2,
  serializeCatalogQueryV2,
} from "@/lib/catalog/query-v2";
import {
  getCatalogSearchClientError,
  type CatalogSearchClientError,
} from "@/components/catalog-section/catalog-search-client-error";
import { runCatalogSearch } from "@/lib/catalog/server-search";
import { tr, type Locale } from "@/lib/i18n";
import type { CatalogQueryV2, CatalogSearchResult } from "@/lib/catalog/types";
import type { AuthType, HealthStatus, McpServer, VerificationLevel } from "@/lib/types";

type AuthTypeOption = {
  value: AuthType;
  label: string;
  count: number;
};

type VerificationLevelOption = {
  value: VerificationLevel;
  label: string;
  count: number;
};

type HealthStatusOption = {
  value: HealthStatus;
  label: string;
  count: number;
};

export type PaginationEntry = number | "ellipsis";

export type ActiveFilterChip = {
  key: string;
  label: string;
  onRemove: () => void;
};

function toggleListValue<T extends string>(values: T[], value: T): T[] {
  if (values.includes(value)) return values.filter(item => item !== value);
  return [...values, value];
}

function buildPaginationEntries(currentPage: number, totalPages: number): PaginationEntry[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const entries: PaginationEntry[] = [1];
  const leftBoundary = Math.max(2, currentPage - 1);
  const rightBoundary = Math.min(totalPages - 1, currentPage + 1);
  if (leftBoundary > 2) entries.push("ellipsis");
  for (let page = leftBoundary; page <= rightBoundary; page += 1) entries.push(page);
  if (rightBoundary < totalPages - 1) entries.push("ellipsis");
  entries.push(totalPages);
  return entries;
}

function getResponseMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) return error.message;
  return "Unknown request error";
}

export function useCatalogController(initialServers: McpServer[], locale: Locale) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const parsedQueryFromUrl = useMemo(() => parseCatalogQueryV2(searchParams), [searchParams]);

  const [queryState, setQueryState] = useState<CatalogQueryV2>(parsedQueryFromUrl);
  const [searchInputValue, setSearchInputValue] = useState(parsedQueryFromUrl.query);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [requestError, setRequestError] = useState<CatalogSearchClientError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CatalogSearchResult>(() =>
    runCatalogSearch(initialServers, parsedQueryFromUrl),
  );

  const authTypeOptions = useMemo<AuthTypeOption[]>(
    () => [
      {
        value: "none",
        label: tr(locale, "No auth", "No auth"),
        count: result.facets.authTypeCounts.none,
      },
      {
        value: "oauth",
        label: tr(locale, "OAuth", "OAuth"),
        count: result.facets.authTypeCounts.oauth,
      },
      {
        value: "api_key",
        label: tr(locale, "API key", "API key"),
        count: result.facets.authTypeCounts.api_key,
      },
    ],
    [
      locale,
      result.facets.authTypeCounts.none,
      result.facets.authTypeCounts.oauth,
      result.facets.authTypeCounts.api_key,
    ],
  );

  const verificationOptions = useMemo<VerificationLevelOption[]>(
    () => [
      {
        value: "official",
        label: tr(locale, "Official", "Official"),
        count: result.facets.verificationCounts.official,
      },
      {
        value: "partner",
        label: tr(locale, "Partner", "Partner"),
        count: result.facets.verificationCounts.partner,
      },
      {
        value: "community",
        label: tr(locale, "Community", "Community"),
        count: result.facets.verificationCounts.community,
      },
    ],
    [
      locale,
      result.facets.verificationCounts.official,
      result.facets.verificationCounts.partner,
      result.facets.verificationCounts.community,
    ],
  );

  const healthOptions = useMemo<HealthStatusOption[]>(
    () => [
      {
        value: "healthy",
        label: tr(locale, "Healthy", "Healthy"),
        count: result.facets.healthCounts.healthy,
      },
      {
        value: "unknown",
        label: tr(locale, "Unknown", "Unknown"),
        count: result.facets.healthCounts.unknown,
      },
      {
        value: "degraded",
        label: tr(locale, "Degraded", "Degraded"),
        count: result.facets.healthCounts.degraded,
      },
      {
        value: "down",
        label: tr(locale, "Down", "Down"),
        count: result.facets.healthCounts.down,
      },
    ],
    [
      locale,
      result.facets.healthCounts.healthy,
      result.facets.healthCounts.unknown,
      result.facets.healthCounts.degraded,
      result.facets.healthCounts.down,
    ],
  );

  const activeFilterCount =
    queryState.categories.length +
    queryState.auth.length +
    queryState.tags.length +
    queryState.verification.length +
    queryState.health.length +
    (queryState.toolsMin !== null ? 1 : 0) +
    (queryState.toolsMax !== null ? 1 : 0);

  const paginationEntries = useMemo(
    () => buildPaginationEntries(result.page, result.totalPages),
    [result.page, result.totalPages],
  );

  const firstVisibleIndex = result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const lastVisibleIndex = Math.min(result.page * result.pageSize, result.total);

  const commitQuery = useCallback(
    (nextState: Partial<CatalogQueryV2>) => {
      const nextQuery: CatalogQueryV2 = { ...queryState, ...nextState };
      if (
        nextQuery.toolsMin !== null &&
        nextQuery.toolsMax !== null &&
        nextQuery.toolsMin > nextQuery.toolsMax
      ) {
        [nextQuery.toolsMin, nextQuery.toolsMax] = [nextQuery.toolsMax, nextQuery.toolsMin];
      }
      if (areCatalogQueriesEqual(nextQuery, queryState)) return;

      setQueryState(nextQuery);
      setResult(runCatalogSearch(initialServers, nextQuery));
      setRequestError(null);

      const nextQueryString = serializeCatalogQueryV2(nextQuery);
      const currentQueryString = serializeCatalogQueryV2(parsedQueryFromUrl);
      if (nextQueryString === currentQueryString) return;

      router.replace(nextQueryString.length > 0 ? `${pathname}?${nextQueryString}` : pathname, {
        scroll: false,
      });
    },
    [initialServers, parsedQueryFromUrl, pathname, queryState, router],
  );

  const clearSearchQuery = useCallback(() => {
    setSearchInputValue("");
    commitQuery({ page: 1, query: "" });
  }, [commitQuery]);

  const handleSortFieldChange = useCallback(
    (value: CatalogQueryV2["sortBy"]) => commitQuery({ page: 1, sortBy: value }),
    [commitQuery],
  );
  const handleSortDirectionChange = useCallback(
    (value: CatalogQueryV2["sortDir"]) => commitQuery({ page: 1, sortDir: value }),
    [commitQuery],
  );
  const handlePageSizeChange = useCallback(
    (value: number) => commitQuery({ page: 1, pageSize: value }),
    [commitQuery],
  );
  const handleViewModeChange = useCallback(
    (value: CatalogQueryV2["layout"]) => commitQuery({ layout: value }),
    [commitQuery],
  );
  const handleToggleCategory = useCallback(
    (category: string) =>
      commitQuery({ page: 1, categories: toggleListValue(queryState.categories, category) }),
    [commitQuery, queryState.categories],
  );
  const handleToggleAuthType = useCallback(
    (authType: AuthType) => commitQuery({ page: 1, auth: toggleListValue(queryState.auth, authType) }),
    [commitQuery, queryState.auth],
  );
  const handleToggleVerificationLevel = useCallback(
    (value: VerificationLevel) =>
      commitQuery({ page: 1, verification: toggleListValue(queryState.verification, value) }),
    [commitQuery, queryState.verification],
  );
  const handleToggleHealthStatus = useCallback(
    (value: HealthStatus) => commitQuery({ page: 1, health: toggleListValue(queryState.health, value) }),
    [commitQuery, queryState.health],
  );
  const handleToggleTag = useCallback(
    (tag: string) => commitQuery({ page: 1, tags: toggleListValue(queryState.tags, tag) }),
    [commitQuery, queryState.tags],
  );
  const handleToolsMinChange = useCallback(
    (value: number | null) => commitQuery({ page: 1, toolsMin: value }),
    [commitQuery],
  );
  const handleToolsMaxChange = useCallback(
    (value: number | null) => commitQuery({ page: 1, toolsMax: value }),
    [commitQuery],
  );

  const handleClearAllFilters = useCallback(() => {
    setSearchInputValue("");
    commitQuery({
      page: 1,
      query: "",
      categories: [],
      auth: [],
      tags: [],
      verification: [],
      health: [],
      toolsMin: null,
      toolsMax: null,
    });
  }, [commitQuery]);

  const applyQuickFilter = useCallback(
    (type: "official" | "healthy" | "no_auth") => {
      if (type === "official") {
        commitQuery({
          page: 1,
          verification: queryState.verification.includes("official") ? [] : ["official"],
        });
        return;
      }
      if (type === "healthy") {
        commitQuery({
          page: 1,
          health: queryState.health.includes("healthy") ? [] : ["healthy"],
        });
        return;
      }
      commitQuery({
        page: 1,
        auth: queryState.auth.includes("none") ? [] : ["none"],
      });
    },
    [commitQuery, queryState.auth, queryState.health, queryState.verification],
  );

  const setCatalogPage = useCallback(
    (pageNumber: number) => {
      const normalizedPage = Math.min(Math.max(pageNumber, 1), result.totalPages);
      if (normalizedPage === result.page) return;
      commitQuery({ page: normalizedPage });
    },
    [commitQuery, result.page, result.totalPages],
  );

  const activeFilterChips = useMemo<ActiveFilterChip[]>(() => {
    const chips: ActiveFilterChip[] = [];
    if (queryState.query.trim().length > 0) {
      chips.push({
        key: "query",
        label: tr(locale, `Search: ${queryState.query}`, `Search: ${queryState.query}`),
        onRemove: clearSearchQuery,
      });
    }
    queryState.categories.forEach((category) => {
      chips.push({
        key: `category-${category}`,
        label: category,
        onRemove: () => handleToggleCategory(category),
      });
    });
    queryState.auth.forEach((authType) => {
      const option = authTypeOptions.find(item => item.value === authType);
      chips.push({
        key: `auth-${authType}`,
        label: `${tr(locale, "Auth", "Auth")}: ${option?.label ?? authType}`,
        onRemove: () => handleToggleAuthType(authType),
      });
    });
    queryState.verification.forEach((verification) => {
      const option = verificationOptions.find(item => item.value === verification);
      chips.push({
        key: `verification-${verification}`,
        label: `${tr(locale, "Verification", "Verification")}: ${option?.label ?? verification}`,
        onRemove: () => handleToggleVerificationLevel(verification),
      });
    });
    queryState.health.forEach((health) => {
      const option = healthOptions.find(item => item.value === health);
      chips.push({
        key: `health-${health}`,
        label: `${tr(locale, "Health", "Health")}: ${option?.label ?? health}`,
        onRemove: () => handleToggleHealthStatus(health),
      });
    });
    queryState.tags.forEach((tag) => {
      chips.push({
        key: `tag-${tag}`,
        label: `#${tag}`,
        onRemove: () => handleToggleTag(tag),
      });
    });
    if (queryState.toolsMin !== null) {
      chips.push({
        key: "tools-min",
        label: tr(locale, `Tools >= ${queryState.toolsMin}`, `Tools >= ${queryState.toolsMin}`),
        onRemove: () => handleToolsMinChange(null),
      });
    }
    if (queryState.toolsMax !== null) {
      chips.push({
        key: "tools-max",
        label: tr(locale, `Tools <= ${queryState.toolsMax}`, `Tools <= ${queryState.toolsMax}`),
        onRemove: () => handleToolsMaxChange(null),
      });
    }
    return chips;
  }, [
    authTypeOptions,
    clearSearchQuery,
    handleToggleAuthType,
    handleToggleCategory,
    handleToggleHealthStatus,
    handleToggleTag,
    handleToggleVerificationLevel,
    handleToolsMaxChange,
    handleToolsMinChange,
    healthOptions,
    locale,
    queryState,
    verificationOptions,
  ]);

  useEffect(() => {
    const canonicalQueryString = serializeCatalogQueryV2(parsedQueryFromUrl);
    const currentQueryString = searchParams.toString();
    if (canonicalQueryString === currentQueryString) return;
    router.replace(canonicalQueryString.length > 0 ? `${pathname}?${canonicalQueryString}` : pathname, {
      scroll: false,
    });
  }, [parsedQueryFromUrl, pathname, router, searchParams]);

  useEffect(() => {
    if (areCatalogQueriesEqual(parsedQueryFromUrl, queryState)) return;
    setQueryState(parsedQueryFromUrl);
    setSearchInputValue(parsedQueryFromUrl.query);
    setResult(runCatalogSearch(initialServers, parsedQueryFromUrl));
  }, [initialServers, parsedQueryFromUrl, queryState]);

  useEffect(() => {
    if (searchInputValue === queryState.query) return;
    const timeoutId = window.setTimeout(() => {
      commitQuery({ page: 1, query: searchInputValue });
    }, 260);
    return () => window.clearTimeout(timeoutId);
  }, [commitQuery, queryState.query, searchInputValue]);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchCatalogResult() {
      setIsLoading(true);
      try {
        const queryString = buildCatalogQueryV2SearchParams(queryState).toString();
        const response = await fetch(
          queryString.length > 0 ? `/api/catalog/search?${queryString}` : "/api/catalog/search",
          { method: "GET", signal: controller.signal, cache: "no-store" },
        );
        if (!response.ok) {
          const clientError = await getCatalogSearchClientError(response);
          const thrownError = new Error(clientError.message) as Error & {
            catalogSearchClientError?: CatalogSearchClientError;
          };
          thrownError.catalogSearchClientError = clientError;
          throw thrownError;
        }
        const payload = (await response.json()) as CatalogSearchResult;
        setResult(payload);
        setRequestError(null);
      } catch (error) {
        if (controller.signal.aborted) return;
        if (
          error instanceof Error &&
          "catalogSearchClientError" in error &&
          (error as { catalogSearchClientError?: CatalogSearchClientError }).catalogSearchClientError
        ) {
          setRequestError(
            (error as { catalogSearchClientError: CatalogSearchClientError }).catalogSearchClientError,
          );
        } else {
          setRequestError({
            message: getResponseMessage(error),
            code: "unknown",
          });
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }
    void fetchCatalogResult();
    return () => controller.abort();
  }, [queryState]);

  useEffect(() => {
    if (!isMobileFiltersOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileFiltersOpen]);

  const taxonomyPanelCommonProps = {
    categoryEntries: result.facets.categoryEntries,
    selectedCategories: queryState.categories,
    authTypeOptions,
    selectedAuthTypes: queryState.auth,
    verificationOptions,
    selectedVerificationLevels: queryState.verification,
    healthOptions,
    selectedHealthStatuses: queryState.health,
    toolsMin: queryState.toolsMin,
    toolsMax: queryState.toolsMax,
    tagEntries: result.facets.tagEntries,
    selectedTags: queryState.tags,
    onToggleCategory: handleToggleCategory,
    onToggleAuthType: handleToggleAuthType,
    onToggleVerificationLevel: handleToggleVerificationLevel,
    onToggleHealthStatus: handleToggleHealthStatus,
    onToolsMinChange: handleToolsMinChange,
    onToolsMaxChange: handleToolsMaxChange,
    onToggleTag: handleToggleTag,
    onClearAll: handleClearAllFilters,
  };

  return {
    queryState,
    searchInputValue,
    setSearchInputValue,
    isMobileFiltersOpen,
    setIsMobileFiltersOpen,
    requestError,
    isLoading,
    result,
    activeFilterCount,
    paginationEntries,
    firstVisibleIndex,
    lastVisibleIndex,
    activeFilterChips,
    clearSearchQuery,
    applyQuickFilter,
    setCatalogPage,
    handleSortFieldChange,
    handleSortDirectionChange,
    handlePageSizeChange,
    handleViewModeChange,
    handleClearAllFilters,
    taxonomyPanelCommonProps,
  };
}
