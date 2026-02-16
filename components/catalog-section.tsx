"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, FilterX, Loader2, SearchX, X } from "lucide-react";
import { CatalogFilterBar } from "@/components/catalog-filter-bar";
import { CatalogTaxonomyPanel } from "@/components/catalog-taxonomy-panel";
import { useLocale } from "@/components/locale-provider";
import { ServerCard } from "@/components/server-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { areCatalogQueriesEqual, buildCatalogQueryV2SearchParams, parseCatalogQueryV2, serializeCatalogQueryV2, } from "@/lib/catalog/query-v2";
import { getServerScore } from "@/lib/catalog/sorting";
import { runCatalogSearch } from "@/lib/catalog/server-search";
import { tr } from "@/lib/i18n";
import type { CatalogQueryV2, CatalogSearchResult } from "@/lib/catalog/types";
import type { AuthType, HealthStatus, McpServer, VerificationLevel } from "@/lib/types";
type CatalogSectionProps = {
    initialServers: McpServer[];
};
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
type PaginationEntry = number | "ellipsis";
type ActiveFilterChip = {
    key: string;
    label: string;
    onRemove: () => void;
};
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
function getResponseMessage(error: unknown): string {
    if (error instanceof Error && error.message.trim().length > 0) {
        return error.message;
    }
    return "Unknown request error";
}
export function CatalogSection({ initialServers }: CatalogSectionProps) {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const parsedQueryFromUrl = useMemo(() => parseCatalogQueryV2(searchParams), [searchParams]);
    const [queryState, setQueryState] = useState<CatalogQueryV2>(parsedQueryFromUrl);
    const [searchInputValue, setSearchInputValue] = useState(parsedQueryFromUrl.query);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [requestError, setRequestError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<CatalogSearchResult>(() => runCatalogSearch(initialServers, parsedQueryFromUrl));
    const authTypeOptions = useMemo<AuthTypeOption[]>(() => [
        {
            value: "none",
            label: tr(locale, "Free", "Free"),
            count: result.facets.authTypeCounts.none,
        },
        {
            value: "oauth",
            label: tr(locale, "Freemium", "Freemium"),
            count: result.facets.authTypeCounts.oauth,
        },
        {
            value: "api_key",
            label: tr(locale, "Paid", "Paid"),
            count: result.facets.authTypeCounts.api_key,
        },
    ], [locale, result.facets.authTypeCounts.api_key, result.facets.authTypeCounts.none, result.facets.authTypeCounts.oauth]);
    const verificationOptions = useMemo<VerificationLevelOption[]>(() => [
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
    ], [
        locale,
        result.facets.verificationCounts.community,
        result.facets.verificationCounts.official,
        result.facets.verificationCounts.partner,
    ]);
    const healthOptions = useMemo<HealthStatusOption[]>(() => [
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
    ], [
        locale,
        result.facets.healthCounts.degraded,
        result.facets.healthCounts.down,
        result.facets.healthCounts.healthy,
        result.facets.healthCounts.unknown,
    ]);
    const activeFilterCount = queryState.categories.length +
        queryState.pricing.length +
        queryState.tags.length +
        queryState.verification.length +
        queryState.health.length +
        (queryState.toolsMin !== null ? 1 : 0) +
        (queryState.toolsMax !== null ? 1 : 0);
    const paginationEntries = useMemo(() => buildPaginationEntries(result.page, result.totalPages), [result.page, result.totalPages]);
    const firstVisibleIndex = result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
    const lastVisibleIndex = Math.min(result.page * result.pageSize, result.total);
    const commitQuery = useCallback((nextState: Partial<CatalogQueryV2>) => {
        const nextQuery: CatalogQueryV2 = {
            ...queryState,
            ...nextState,
        };
        if (nextQuery.toolsMin !== null && nextQuery.toolsMax !== null && nextQuery.toolsMin > nextQuery.toolsMax) {
            [nextQuery.toolsMin, nextQuery.toolsMax] = [nextQuery.toolsMax, nextQuery.toolsMin];
        }
        if (areCatalogQueriesEqual(nextQuery, queryState)) {
            return;
        }
        setQueryState(nextQuery);
        setResult(runCatalogSearch(initialServers, nextQuery));
        setRequestError(null);
        const nextQueryString = serializeCatalogQueryV2(nextQuery);
        const currentQueryString = serializeCatalogQueryV2(parsedQueryFromUrl);
        if (nextQueryString === currentQueryString) {
            return;
        }
        router.replace(nextQueryString.length > 0 ? `${pathname}?${nextQueryString}` : pathname, {
            scroll: false,
        });
    }, [initialServers, parsedQueryFromUrl, pathname, queryState, router]);
    function clearSearchQuery() {
        setSearchInputValue("");
        commitQuery({
            page: 1,
            query: "",
        });
    }
    function handleSortFieldChange(value: CatalogQueryV2["sortBy"]) {
        commitQuery({
            page: 1,
            sortBy: value,
        });
    }
    function handleSortDirectionChange(value: CatalogQueryV2["sortDir"]) {
        commitQuery({
            page: 1,
            sortDir: value,
        });
    }
    function handlePageSizeChange(value: number) {
        commitQuery({
            page: 1,
            pageSize: value,
        });
    }
    function handleViewModeChange(value: CatalogQueryV2["layout"]) {
        commitQuery({
            layout: value,
        });
    }
    function handleToggleCategory(category: string) {
        commitQuery({
            page: 1,
            categories: toggleListValue(queryState.categories, category),
        });
    }
    function handleToggleAuthType(authType: AuthType) {
        commitQuery({
            page: 1,
            pricing: toggleListValue(queryState.pricing, authType),
        });
    }
    function handleToggleVerificationLevel(value: VerificationLevel) {
        commitQuery({
            page: 1,
            verification: toggleListValue(queryState.verification, value),
        });
    }
    function handleToggleHealthStatus(value: HealthStatus) {
        commitQuery({
            page: 1,
            health: toggleListValue(queryState.health, value),
        });
    }
    function handleToggleTag(tag: string) {
        commitQuery({
            page: 1,
            tags: toggleListValue(queryState.tags, tag),
        });
    }
    function handleToolsMinChange(value: number | null) {
        commitQuery({
            page: 1,
            toolsMin: value,
        });
    }
    function handleToolsMaxChange(value: number | null) {
        commitQuery({
            page: 1,
            toolsMax: value,
        });
    }
    function handleClearAllFilters() {
        setSearchInputValue("");
        commitQuery({
            page: 1,
            query: "",
            categories: [],
            pricing: [],
            tags: [],
            verification: [],
            health: [],
            toolsMin: null,
            toolsMax: null,
        });
    }
    function setCatalogPage(pageNumber: number) {
        const normalizedPage = Math.min(Math.max(pageNumber, 1), result.totalPages);
        if (normalizedPage === result.page) {
            return;
        }
        commitQuery({ page: normalizedPage });
    }
    const activeFilterChips: ActiveFilterChip[] = [];
    if (queryState.query.trim().length > 0) {
        activeFilterChips.push({
            key: "query",
            label: tr(locale, `Search: ${queryState.query}`, `Search: ${queryState.query}`),
            onRemove: clearSearchQuery,
        });
    }
    queryState.categories.forEach((category) => {
        activeFilterChips.push({
            key: `category-${category}`,
            label: category,
            onRemove: () => handleToggleCategory(category),
        });
    });
    queryState.pricing.forEach((pricing) => {
        const option = authTypeOptions.find((item) => item.value === pricing);
        activeFilterChips.push({
            key: `pricing-${pricing}`,
            label: `${tr(locale, "Pricing", "Pricing")}: ${option?.label ?? pricing}`,
            onRemove: () => handleToggleAuthType(pricing),
        });
    });
    queryState.verification.forEach((verification) => {
        const option = verificationOptions.find((item) => item.value === verification);
        activeFilterChips.push({
            key: `verification-${verification}`,
            label: `${tr(locale, "Verification", "Verification")}: ${option?.label ?? verification}`,
            onRemove: () => handleToggleVerificationLevel(verification),
        });
    });
    queryState.health.forEach((health) => {
        const option = healthOptions.find((item) => item.value === health);
        activeFilterChips.push({
            key: `health-${health}`,
            label: `${tr(locale, "Health", "Health")}: ${option?.label ?? health}`,
            onRemove: () => handleToggleHealthStatus(health),
        });
    });
    queryState.tags.forEach((tag) => {
        activeFilterChips.push({
            key: `tag-${tag}`,
            label: `#${tag}`,
            onRemove: () => handleToggleTag(tag),
        });
    });
    if (queryState.toolsMin !== null) {
        activeFilterChips.push({
            key: "tools-min",
            label: tr(locale, `Tools >= ${queryState.toolsMin}`, `Tools >= ${queryState.toolsMin}`),
            onRemove: () => handleToolsMinChange(null),
        });
    }
    if (queryState.toolsMax !== null) {
        activeFilterChips.push({
            key: "tools-max",
            label: tr(locale, `Tools <= ${queryState.toolsMax}`, `Tools <= ${queryState.toolsMax}`),
            onRemove: () => handleToolsMaxChange(null),
        });
    }
    useEffect(() => {
        const canonicalQueryString = serializeCatalogQueryV2(parsedQueryFromUrl);
        const currentQueryString = searchParams.toString();
        if (canonicalQueryString === currentQueryString) {
            return;
        }
        router.replace(canonicalQueryString.length > 0 ? `${pathname}?${canonicalQueryString}` : pathname, {
            scroll: false,
        });
    }, [parsedQueryFromUrl, pathname, router, searchParams]);
    useEffect(() => {
        if (areCatalogQueriesEqual(parsedQueryFromUrl, queryState)) {
            return;
        }
        setQueryState(parsedQueryFromUrl);
        setSearchInputValue(parsedQueryFromUrl.query);
        setResult(runCatalogSearch(initialServers, parsedQueryFromUrl));
    }, [initialServers, parsedQueryFromUrl, queryState]);
    useEffect(() => {
        if (searchInputValue === queryState.query) {
            return;
        }
        const timeoutId = window.setTimeout(() => {
            commitQuery({
                page: 1,
                query: searchInputValue,
            });
        }, 260);
        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [commitQuery, queryState.query, searchInputValue]);
    useEffect(() => {
        const controller = new AbortController();
        async function fetchCatalogResult() {
            setIsLoading(true);
            try {
                const queryString = buildCatalogQueryV2SearchParams(queryState).toString();
                const response = await fetch(queryString.length > 0 ? `/api/catalog/search?${queryString}` : "/api/catalog/search", {
                    method: "GET",
                    signal: controller.signal,
                    cache: "no-store",
                });
                if (!response.ok) {
                    throw new Error(`Failed to load catalog (${response.status})`);
                }
                const payload = (await response.json()) as CatalogSearchResult;
                setResult(payload);
                setRequestError(null);
            }
            catch (error) {
                if (controller.signal.aborted) {
                    return;
                }
                setRequestError(getResponseMessage(error));
            }
            finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }
        void fetchCatalogResult();
        return () => {
            controller.abort();
        };
    }, [queryState]);
    useEffect(() => {
        if (!isMobileFiltersOpen) {
            return;
        }
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isMobileFiltersOpen]);
    return (<div className="space-y-4">
      <div className="sticky top-14 z-30 rounded-2xl border border-blacksmith bg-card/86 p-2 shadow-[0_18px_44px_-26px_rgba(15,23,42,0.9)] backdrop-blur sm:top-16 sm:p-3">
        <CatalogFilterBar searchQuery={searchInputValue} sortField={queryState.sortBy} sortDirection={queryState.sortDir} pageSize={queryState.pageSize} viewMode={queryState.layout} activeFilterCount={activeFilterCount} isMobileFiltersOpen={isMobileFiltersOpen} onSearchQueryChange={setSearchInputValue} onSortFieldChange={handleSortFieldChange} onSortDirectionChange={handleSortDirectionChange} onPageSizeChange={handlePageSizeChange} onViewModeChange={handleViewModeChange} onToggleMobileFilters={() => setIsMobileFiltersOpen((current) => !current)}/>
      </div>

      {activeFilterChips.length > 0 ? (<div className="rounded-xl border border-blacksmith bg-card p-2.5 shadow-[0_16px_32px_-24px_rgba(15,23,42,0.9)] backdrop-blur">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              {tr(locale, "Active filters", "Active filters")}
            </p>

            {activeFilterChips.map((chip) => (<button key={chip.key} type="button" onClick={chip.onRemove} className="inline-flex max-w-full items-center gap-1 rounded-full border border-blacksmith bg-card px-2.5 py-1 text-xs text-foreground transition hover:bg-accent hover:text-foreground">
                <span className="max-w-[170px] truncate">{chip.label}</span>
                <X className="size-3"/>
              </button>))}

            <Button type="button" variant="ghost" size="xs" onClick={handleClearAllFilters} className="text-muted-foreground hover:bg-accent hover:text-foreground sm:ml-auto">
              <FilterX className="size-3.5"/>
              {tr(locale, "Clear all", "Clear all")}
            </Button>
          </div>
        </div>) : null}

      <div className="space-y-1 text-sm text-foreground">
        <p>
          {tr(locale, `${result.total} tools found`, `${result.total} tools found`)}
        </p>
        {result.total > 0 ? (<p className="text-xs text-muted-foreground">
            {tr(locale, `Showing ${firstVisibleIndex}-${lastVisibleIndex} on this page`, `Showing ${firstVisibleIndex}-${lastVisibleIndex} on this page`)}
          </p>) : null}
        {isLoading ? (<p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin"/>
            {tr(locale, "Refreshing catalog...", "Refreshing catalog...")}
          </p>) : null}
        {requestError ? (<p className="inline-flex items-center gap-1.5 text-xs text-rose-200">
            <AlertCircle className="size-3.5"/>
            {tr(locale, "Could not sync latest catalog results.", "Could not sync latest catalog results.")}
          </p>) : null}
      </div>

      {isMobileFiltersOpen ? (<>
          <button type="button" className="fixed inset-0 z-40 bg-card backdrop-blur-[1.5px] lg:hidden" onClick={() => setIsMobileFiltersOpen(false)} aria-label={tr(locale, "Close filters", "Close filters")}/>
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm p-3 lg:hidden">
            <CatalogTaxonomyPanel mode="filters" panelId="catalog-mobile-filters" className="h-full overflow-y-auto" categoryEntries={result.facets.categoryEntries} selectedCategories={queryState.categories} authTypeOptions={authTypeOptions} selectedAuthTypes={queryState.pricing} verificationOptions={verificationOptions} selectedVerificationLevels={queryState.verification} healthOptions={healthOptions} selectedHealthStatuses={queryState.health} toolsMin={queryState.toolsMin} toolsMax={queryState.toolsMax} tagEntries={result.facets.tagEntries} selectedTags={queryState.tags} onToggleCategory={handleToggleCategory} onToggleAuthType={handleToggleAuthType} onToggleVerificationLevel={handleToggleVerificationLevel} onToggleHealthStatus={handleToggleHealthStatus} onToolsMinChange={handleToolsMinChange} onToolsMaxChange={handleToolsMaxChange} onToggleTag={handleToggleTag} onClearAll={handleClearAllFilters} onRequestClose={() => setIsMobileFiltersOpen(false)}/>
          </div>
        </>) : null}

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <CatalogTaxonomyPanel mode="filters" className="hidden lg:block" categoryEntries={result.facets.categoryEntries} selectedCategories={queryState.categories} authTypeOptions={authTypeOptions} selectedAuthTypes={queryState.pricing} verificationOptions={verificationOptions} selectedVerificationLevels={queryState.verification} healthOptions={healthOptions} selectedHealthStatuses={queryState.health} toolsMin={queryState.toolsMin} toolsMax={queryState.toolsMax} tagEntries={result.facets.tagEntries} selectedTags={queryState.tags} onToggleCategory={handleToggleCategory} onToggleAuthType={handleToggleAuthType} onToggleVerificationLevel={handleToggleVerificationLevel} onToggleHealthStatus={handleToggleHealthStatus} onToolsMinChange={handleToolsMinChange} onToolsMaxChange={handleToolsMaxChange} onToggleTag={handleToggleTag} onClearAll={handleClearAllFilters}/>

        <div>
          {result.total > 0 ? (<div className="space-y-5">
              <div className={queryState.layout === "grid" ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" : "space-y-3"}>
                {result.items.map((mcpServer) => (<ServerCard key={mcpServer.id} mcpServer={mcpServer} viewMode={queryState.layout} score={getServerScore(mcpServer)}/>))}
              </div>

              {result.totalPages > 1 ? (<div className="flex flex-wrap items-center justify-center gap-1" role="navigation" aria-label="Catalog pagination">
                  <Button type="button" variant="ghost" size="xs" onClick={() => setCatalogPage(result.page - 1)} disabled={result.page <= 1} aria-label={tr(locale, "Previous page", "Previous page")} className="text-muted-foreground hover:bg-accent hover:text-foreground">
                    {tr(locale, "Prev", "Prev")}
                  </Button>

                  {paginationEntries.map((entry, index) => entry === "ellipsis" ? (<span key={`ellipsis-${index}`} className="inline-flex h-6 min-w-8 items-center justify-center px-1 text-xs text-muted-foreground" aria-hidden>
                        ...
                      </span>) : (<Button key={`page-${entry}`} type="button" variant={entry === result.page ? "default" : "ghost"} size="xs" onClick={() => setCatalogPage(entry)} aria-current={entry === result.page ? "page" : undefined} className={entry === result.page
                        ? "min-w-8 bg-blue-600 text-foreground hover:bg-blue-500"
                        : "min-w-8 text-muted-foreground hover:bg-accent hover:text-foreground"}>
                        {entry}
                      </Button>))}

                  <Button type="button" variant="ghost" size="xs" onClick={() => setCatalogPage(result.page + 1)} disabled={result.page >= result.totalPages} aria-label={tr(locale, "Next page", "Next page")} className="text-muted-foreground hover:bg-accent hover:text-foreground">
                    {tr(locale, "Next", "Next")}
                  </Button>
                </div>) : null}
            </div>) : (<Card className="border-blacksmith bg-card shadow-[0_16px_36px_-26px_rgba(15,23,42,0.95)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <SearchX className="size-4 text-muted-foreground"/>
                  {tr(locale, "No tools found", "No tools found")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-foreground">
                {tr(locale, "Try another search query or reset categories/tags/access filters.", "Try another search query or reset categories/tags/access filters.")}
              </CardContent>
            </Card>)}
        </div>
      </div>
    </div>);
}

