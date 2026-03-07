"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  areCatalogQueriesEqual,
  normalizeCatalogQueryV2,
  serializeCatalogQueryV2,
} from "@/lib/catalog/query-v2";
import {
  createCatalogShortlistItem,
  normalizeCatalogShortlistItem,
  shouldEnableCatalogCompare,
  type CatalogShortlistItem,
} from "@/lib/catalog/compare";
import { tr, type Locale } from "@/lib/i18n";
import type { CatalogQueryV2, CatalogSearchResult } from "@/lib/catalog/types";
import type {
  AuthType,
  HealthStatus,
  McpServer,
  VerificationLevel,
} from "@/lib/types";

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
export type { CatalogShortlistItem } from "@/lib/catalog/compare";

const SHORTLIST_STORAGE_KEY = "demumumind.catalog.shortlist.v1";
const SHORTLIST_SYNC_EVENT = "demumumind:catalog-shortlist-sync";
const SHORTLIST_LIMIT = 6;
const EMPTY_SHORTLIST: CatalogShortlistItem[] = [];

let cachedShortlistSerialized = "[]";
let cachedShortlistSnapshot: CatalogShortlistItem[] = EMPTY_SHORTLIST;

function toggleListValue<T extends string>(values: T[], value: T): T[] {
  if (values.includes(value)) {
    return values.filter((item) => item !== value);
  }

  return [...values, value];
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

function readShortlistFromStorage(): CatalogShortlistItem[] {
  if (typeof window === "undefined") {
    return EMPTY_SHORTLIST;
  }

  try {
    const rawValue = window.localStorage.getItem(SHORTLIST_STORAGE_KEY);
    if (!rawValue) {
      cachedShortlistSerialized = "[]";
      cachedShortlistSnapshot = EMPTY_SHORTLIST;
      return EMPTY_SHORTLIST;
    }

    const parsed = JSON.parse(rawValue) as unknown;
    if (!Array.isArray(parsed)) {
      cachedShortlistSerialized = "[]";
      cachedShortlistSnapshot = EMPTY_SHORTLIST;
      return EMPTY_SHORTLIST;
    }

    const nextSnapshot = parsed
      .map(normalizeCatalogShortlistItem)
      .filter((item): item is CatalogShortlistItem => item !== null)
      .slice(0, SHORTLIST_LIMIT);
    const nextSerialized = JSON.stringify(nextSnapshot);

    if (nextSerialized === cachedShortlistSerialized) {
      return cachedShortlistSnapshot;
    }

    cachedShortlistSerialized = nextSerialized;
    cachedShortlistSnapshot = nextSnapshot;
    return cachedShortlistSnapshot;
  } catch {
    cachedShortlistSerialized = "[]";
    cachedShortlistSnapshot = EMPTY_SHORTLIST;
    return EMPTY_SHORTLIST;
  }
}

function subscribeToShortlistStore(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: Event) => {
    if (event instanceof StorageEvent && event.key !== SHORTLIST_STORAGE_KEY) {
      return;
    }

    onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(SHORTLIST_SYNC_EVENT, handleStorage);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(SHORTLIST_SYNC_EVENT, handleStorage);
  };
}

function writeShortlistToStorage(nextShortlist: CatalogShortlistItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    cachedShortlistSerialized = JSON.stringify(nextShortlist);
    cachedShortlistSnapshot = nextShortlist;
    window.localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(nextShortlist));
    window.dispatchEvent(new Event(SHORTLIST_SYNC_EVENT));
  } catch {
    // Ignore storage failures; shortlist stays non-persistent.
  }
}

export function useCatalogController(
  currentQuery: CatalogQueryV2,
  currentResult: CatalogSearchResult,
  locale: Locale,
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [pendingQueryString, setPendingQueryString] = useState<string | null>(null);
  const [searchDebounceTimeoutId, setSearchDebounceTimeoutId] = useState<number | null>(null);
  const [searchInputValue, setSearchInputValue] = useState(currentQuery.query);
  const lastAppliedQueryRef = useRef(currentQuery.query);

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isMobileCompareOpen, setIsMobileCompareOpen] = useState(false);
  const shortlist = useSyncExternalStore(
    subscribeToShortlistStore,
    readShortlistFromStorage,
    () => EMPTY_SHORTLIST,
  );

  useEffect(() => {
    if (lastAppliedQueryRef.current === currentQuery.query) {
      return;
    }
    lastAppliedQueryRef.current = currentQuery.query;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchInputValue(currentQuery.query);
  }, [currentQuery.query]);

  const navigateToQuery = useCallback(
    (nextState: Partial<CatalogQueryV2>) => {
      const nextQuery = normalizeCatalogQueryV2({ ...currentQuery, ...nextState });

      if (areCatalogQueriesEqual(nextQuery, currentQuery)) {
        return;
      }

      const nextQueryString = serializeCatalogQueryV2(nextQuery);
      setPendingQueryString(nextQueryString);
      startTransition(() => {
        router.replace(nextQueryString.length > 0 ? `${pathname}?${nextQueryString}` : pathname, {
          scroll: false,
        });
      });
    },
    [currentQuery, pathname, router, startTransition],
  );

  useEffect(() => {
    const canonicalQueryString = serializeCatalogQueryV2(currentQuery);
    const currentQueryString = searchParams.toString();

    if (pendingQueryString === currentQueryString) {
      return;
    }

    if (pendingQueryString === canonicalQueryString) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPendingQueryString(null);
    }

    if (canonicalQueryString === currentQueryString) {
      return;
    }

    startTransition(() => {
      router.replace(
        canonicalQueryString.length > 0 ? `${pathname}?${canonicalQueryString}` : pathname,
        { scroll: false },
      );
    });
  }, [currentQuery, pathname, pendingQueryString, router, searchParams, startTransition]);

  useEffect(() => {
    const canonicalQueryString = serializeCatalogQueryV2(currentQuery);
    if (pendingQueryString === canonicalQueryString) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPendingQueryString(null);
    }
  }, [currentQuery, pendingQueryString]);

  useEffect(() => {
    return () => {
      if (searchDebounceTimeoutId !== null) {
        window.clearTimeout(searchDebounceTimeoutId);
      }
    };
  }, [searchDebounceTimeoutId]);

  const isCompareAvailable = shouldEnableCatalogCompare(shortlist);
  const isMobileCompareVisible = isMobileCompareOpen && isCompareAvailable && !isMobileFiltersOpen;

  useEffect(() => {
    if (!isMobileFiltersOpen && !isMobileCompareVisible) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileCompareVisible, isMobileFiltersOpen]);

  const authTypeOptions = useMemo<AuthTypeOption[]>(
    () => [
      {
        value: "none",
        label: tr(locale, "No auth", "No auth"),
        count: currentResult.facets.authTypeCounts.none,
      },
      {
        value: "oauth",
        label: tr(locale, "OAuth", "OAuth"),
        count: currentResult.facets.authTypeCounts.oauth,
      },
      {
        value: "api_key",
        label: tr(locale, "API key", "API key"),
        count: currentResult.facets.authTypeCounts.api_key,
      },
    ],
    [
      currentResult.facets.authTypeCounts.api_key,
      currentResult.facets.authTypeCounts.none,
      currentResult.facets.authTypeCounts.oauth,
      locale,
    ],
  );

  const verificationOptions = useMemo<VerificationLevelOption[]>(
    () => [
      {
        value: "official",
        label: tr(locale, "Official", "Official"),
        count: currentResult.facets.verificationCounts.official,
      },
      {
        value: "partner",
        label: tr(locale, "Partner", "Partner"),
        count: currentResult.facets.verificationCounts.partner,
      },
      {
        value: "community",
        label: tr(locale, "Community", "Community"),
        count: currentResult.facets.verificationCounts.community,
      },
    ],
    [
      currentResult.facets.verificationCounts.community,
      currentResult.facets.verificationCounts.official,
      currentResult.facets.verificationCounts.partner,
      locale,
    ],
  );

  const healthOptions = useMemo<HealthStatusOption[]>(
    () => [
      {
        value: "healthy",
        label: tr(locale, "Healthy", "Healthy"),
        count: currentResult.facets.healthCounts.healthy,
      },
      {
        value: "unknown",
        label: tr(locale, "Unknown", "Unknown"),
        count: currentResult.facets.healthCounts.unknown,
      },
      {
        value: "degraded",
        label: tr(locale, "Degraded", "Degraded"),
        count: currentResult.facets.healthCounts.degraded,
      },
      {
        value: "down",
        label: tr(locale, "Down", "Down"),
        count: currentResult.facets.healthCounts.down,
      },
    ],
    [
      currentResult.facets.healthCounts.degraded,
      currentResult.facets.healthCounts.down,
      currentResult.facets.healthCounts.healthy,
      currentResult.facets.healthCounts.unknown,
      locale,
    ],
  );

  const activeFilterCount =
    currentQuery.categories.length +
    currentQuery.auth.length +
    currentQuery.tags.length +
    currentQuery.verification.length +
    currentQuery.health.length +
    (currentQuery.toolsMin !== null ? 1 : 0) +
    (currentQuery.toolsMax !== null ? 1 : 0);

  const paginationEntries = useMemo(
    () => buildPaginationEntries(currentResult.page, currentResult.totalPages),
    [currentResult.page, currentResult.totalPages],
  );

  const firstVisibleIndex = currentResult.total === 0 ? 0 : (currentResult.page - 1) * currentResult.pageSize + 1;
  const lastVisibleIndex = Math.min(currentResult.page * currentResult.pageSize, currentResult.total);

  const clearSearchQuery = useCallback(() => {
    setSearchInputValue("");
    if (searchDebounceTimeoutId !== null) {
      window.clearTimeout(searchDebounceTimeoutId);
      setSearchDebounceTimeoutId(null);
    }
    navigateToQuery({ page: 1, query: "" });
  }, [navigateToQuery, searchDebounceTimeoutId]);
  const handleSearchInputChange = useCallback(
    (value: string) => {
      setSearchInputValue(value);
      if (searchDebounceTimeoutId !== null) {
        window.clearTimeout(searchDebounceTimeoutId);
      }
      const nextTimeoutId = window.setTimeout(() => {
        navigateToQuery({ page: 1, query: value });
      }, 220);
      setSearchDebounceTimeoutId(nextTimeoutId);
    },
    [navigateToQuery, searchDebounceTimeoutId],
  );

  const handleSortFieldChange = useCallback(
    (value: CatalogQueryV2["sortBy"]) => navigateToQuery({ page: 1, sortBy: value }),
    [navigateToQuery],
  );
  const handleSortDirectionChange = useCallback(
    (value: CatalogQueryV2["sortDir"]) => navigateToQuery({ page: 1, sortDir: value }),
    [navigateToQuery],
  );
  const handlePageSizeChange = useCallback(
    (value: number) => navigateToQuery({ page: 1, pageSize: value }),
    [navigateToQuery],
  );
  const handleViewModeChange = useCallback(
    (value: CatalogQueryV2["layout"]) => navigateToQuery({ layout: value }),
    [navigateToQuery],
  );
  const handleToggleCategory = useCallback(
    (category: string) =>
      navigateToQuery({ page: 1, categories: toggleListValue(currentQuery.categories, category) }),
    [currentQuery.categories, navigateToQuery],
  );
  const handleToggleAuthType = useCallback(
    (authType: AuthType) => navigateToQuery({ page: 1, auth: toggleListValue(currentQuery.auth, authType) }),
    [currentQuery.auth, navigateToQuery],
  );
  const handleToggleVerificationLevel = useCallback(
    (value: VerificationLevel) =>
      navigateToQuery({ page: 1, verification: toggleListValue(currentQuery.verification, value) }),
    [currentQuery.verification, navigateToQuery],
  );
  const handleToggleHealthStatus = useCallback(
    (value: HealthStatus) => navigateToQuery({ page: 1, health: toggleListValue(currentQuery.health, value) }),
    [currentQuery.health, navigateToQuery],
  );
  const handleToggleTag = useCallback(
    (tag: string) => navigateToQuery({ page: 1, tags: toggleListValue(currentQuery.tags, tag) }),
    [currentQuery.tags, navigateToQuery],
  );
  const handleToolsMinChange = useCallback(
    (value: number | null) => navigateToQuery({ page: 1, toolsMin: value }),
    [navigateToQuery],
  );
  const handleToolsMaxChange = useCallback(
    (value: number | null) => navigateToQuery({ page: 1, toolsMax: value }),
    [navigateToQuery],
  );

  const handleClearAllFilters = useCallback(() => {
    setSearchInputValue("");
    if (searchDebounceTimeoutId !== null) {
      window.clearTimeout(searchDebounceTimeoutId);
      setSearchDebounceTimeoutId(null);
    }
    navigateToQuery({
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
  }, [navigateToQuery, searchDebounceTimeoutId]);

  const applyQuickFilter = useCallback(
    (type: "official" | "healthy" | "no_auth") => {
      if (type === "official") {
        navigateToQuery({
          page: 1,
          verification: currentQuery.verification.includes("official") ? [] : ["official"],
        });
        return;
      }

      if (type === "healthy") {
        navigateToQuery({
          page: 1,
          health: currentQuery.health.includes("healthy") ? [] : ["healthy"],
        });
        return;
      }

      navigateToQuery({
        page: 1,
        auth: currentQuery.auth.includes("none") ? [] : ["none"],
      });
    },
    [currentQuery.auth, currentQuery.health, currentQuery.verification, navigateToQuery],
  );

  const setCatalogPage = useCallback(
    (pageNumber: number) => {
      const normalizedPage = Math.min(Math.max(pageNumber, 1), currentResult.totalPages);

      if (normalizedPage === currentResult.page) {
        return;
      }

      navigateToQuery({ page: normalizedPage });
    },
    [currentResult.page, currentResult.totalPages, navigateToQuery],
  );

  const activeFilterChips = useMemo<ActiveFilterChip[]>(() => {
    const chips: ActiveFilterChip[] = [];

    if (currentQuery.query.trim().length > 0) {
      chips.push({
        key: "query",
        label: tr(locale, `Search: ${currentQuery.query}`, `Search: ${currentQuery.query}`),
        onRemove: clearSearchQuery,
      });
    }

    currentQuery.categories.forEach((category) => {
      chips.push({
        key: `category-${category}`,
        label: category,
        onRemove: () => handleToggleCategory(category),
      });
    });

    currentQuery.auth.forEach((authType) => {
      const option = authTypeOptions.find((item) => item.value === authType);
      chips.push({
        key: `auth-${authType}`,
        label: `${tr(locale, "Auth", "Auth")}: ${option?.label ?? authType}`,
        onRemove: () => handleToggleAuthType(authType),
      });
    });

    currentQuery.verification.forEach((verification) => {
      const option = verificationOptions.find((item) => item.value === verification);
      chips.push({
        key: `verification-${verification}`,
        label: `${tr(locale, "Verification", "Verification")}: ${option?.label ?? verification}`,
        onRemove: () => handleToggleVerificationLevel(verification),
      });
    });

    currentQuery.health.forEach((health) => {
      const option = healthOptions.find((item) => item.value === health);
      chips.push({
        key: `health-${health}`,
        label: `${tr(locale, "Health", "Health")}: ${option?.label ?? health}`,
        onRemove: () => handleToggleHealthStatus(health),
      });
    });

    currentQuery.tags.forEach((tag) => {
      chips.push({
        key: `tag-${tag}`,
        label: `#${tag}`,
        onRemove: () => handleToggleTag(tag),
      });
    });

    if (currentQuery.toolsMin !== null) {
      chips.push({
        key: "tools-min",
        label: tr(locale, `Tools >= ${currentQuery.toolsMin}`, `Tools >= ${currentQuery.toolsMin}`),
        onRemove: () => handleToolsMinChange(null),
      });
    }

    if (currentQuery.toolsMax !== null) {
      chips.push({
        key: "tools-max",
        label: tr(locale, `Tools <= ${currentQuery.toolsMax}`, `Tools <= ${currentQuery.toolsMax}`),
        onRemove: () => handleToolsMaxChange(null),
      });
    }

    return chips;
  }, [
    authTypeOptions,
    clearSearchQuery,
    currentQuery,
    handleToggleAuthType,
    handleToggleCategory,
    handleToggleHealthStatus,
    handleToggleTag,
    handleToggleVerificationLevel,
    handleToolsMaxChange,
    handleToolsMinChange,
    healthOptions,
    locale,
    verificationOptions,
  ]);

  const toggleShortlist = useCallback(
    (server: McpServer) => {
      const alreadySaved = shortlist.some((item) => item.slug === server.slug);
      const nextShortlist = alreadySaved
        ? shortlist.filter((item) => item.slug !== server.slug)
        : [createCatalogShortlistItem(server), ...shortlist].slice(0, SHORTLIST_LIMIT);

      if (!shouldEnableCatalogCompare(nextShortlist)) {
        setIsMobileCompareOpen(false);
      }
      writeShortlistToStorage(nextShortlist);
    },
    [shortlist],
  );

  const clearShortlist = useCallback(() => {
    setIsMobileCompareOpen(false);
    writeShortlistToStorage(EMPTY_SHORTLIST);
  }, []);

  const shortlistSlugSet = useMemo(
    () => new Set(shortlist.map((item) => item.slug)),
    [shortlist],
  );

  const taxonomyPanelCommonProps = {
    categoryEntries: currentResult.facets.categoryEntries,
    selectedCategories: currentQuery.categories,
    authTypeOptions,
    selectedAuthTypes: currentQuery.auth,
    verificationOptions,
    selectedVerificationLevels: currentQuery.verification,
    healthOptions,
    selectedHealthStatuses: currentQuery.health,
    toolsMin: currentQuery.toolsMin,
    toolsMax: currentQuery.toolsMax,
    tagEntries: currentResult.facets.tagEntries,
    selectedTags: currentQuery.tags,
    onToggleCategory: handleToggleCategory,
    onToggleAuthType: handleToggleAuthType,
    onToggleVerificationLevel: handleToggleVerificationLevel,
    onToggleHealthStatus: handleToggleHealthStatus,
    onToolsMinChange: handleToolsMinChange,
    onToolsMaxChange: handleToolsMaxChange,
    onToggleTag: handleToggleTag,
    onApplyQuickFilter: applyQuickFilter,
    onClearAll: handleClearAllFilters,
  };

  return {
    queryState: currentQuery,
    searchInputValue,
    setSearchInputValue: handleSearchInputChange,
    isMobileFiltersOpen,
    setIsMobileFiltersOpen,
    isMobileCompareOpen: isMobileCompareVisible,
    setIsMobileCompareOpen,
    requestError: null,
    isLoading: isPending,
    result: currentResult,
    activeFilterCount,
    paginationEntries,
    firstVisibleIndex,
    lastVisibleIndex,
    activeFilterChips,
    applyQuickFilter,
    setCatalogPage,
    handleSortFieldChange,
    handleSortDirectionChange,
    handlePageSizeChange,
    handleViewModeChange,
    handleClearAllFilters,
    taxonomyPanelCommonProps,
    shortlist,
    shortlistCount: shortlist.length,
    isCompareAvailable,
    isServerSaved: (slug: string) => shortlistSlugSet.has(slug),
    toggleShortlist,
    clearShortlist,
  };
}
