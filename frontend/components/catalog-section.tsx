"use client";

import { CatalogInsightsPanel } from "@/components/catalog/catalog-insights-panel";
import { CatalogShortlist } from "@/components/catalog/catalog-shortlist";
import { ActiveFilterChips } from "@/components/catalog-section/active-filter-chips";
import { CatalogResults } from "@/components/catalog-section/catalog-results";
import { QuickFilters } from "@/components/catalog-section/quick-filters";
import { ResultsSummary } from "@/components/catalog-section/results-summary";
import { CatalogFilterBar } from "@/components/catalog-filter-bar";
import { CatalogTaxonomyPanel } from "@/components/catalog-taxonomy-panel";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { useCatalogController } from "@/components/catalog-section/use-catalog-controller";
import { tr } from "@/lib/i18n";
import type { CatalogQueryV2, CatalogSearchResult } from "@/lib/catalog/types";
import type { McpServer } from "@/lib/types";

type CatalogSectionProps = {
  initialQuery: CatalogQueryV2;
  initialResult: CatalogSearchResult;
  featuredServers: McpServer[];
  topCategoryEntries: Array<[string, number]>;
  topTagEntries: Array<[string, number]>;
  hasActiveFilters: boolean;
};

export function CatalogSection({
  initialQuery,
  initialResult,
  featuredServers,
  topCategoryEntries,
  topTagEntries,
  hasActiveFilters,
}: CatalogSectionProps) {
  const locale = useLocale();
  const {
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
    applyQuickFilter,
    setCatalogPage,
    handleSortFieldChange,
    handleSortDirectionChange,
    handlePageSizeChange,
    handleViewModeChange,
    handleClearAllFilters,
    taxonomyPanelCommonProps,
    shortlist,
    shortlistCount,
    isServerSaved,
    toggleShortlist,
  } = useCatalogController(initialQuery, initialResult, locale);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-[1.5rem] border border-border/70 bg-card px-4 py-4 shadow-[0_16px_40px_-28px_hsl(var(--foreground)/0.55)]">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            {tr(locale, "Current view", "Current view")}
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground">
            {queryState.query.trim().length > 0 ? queryState.query : tr(locale, "All servers", "All servers")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {hasActiveFilters
              ? tr(locale, "The workspace is narrowed by active filters.", "The workspace is narrowed by active filters.")
              : tr(locale, "Use the controls below to tighten the result set.", "Use the controls below to tighten the result set.")}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-border/70 bg-card px-4 py-4 shadow-[0_16px_40px_-28px_hsl(var(--foreground)/0.55)]">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            {tr(locale, "Visible now", "Visible now")}
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground">{result.total}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {tr(locale, "Servers in the active slice before you open details.", "Servers in the active slice before you open details.")}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-border/70 bg-card px-4 py-4 shadow-[0_16px_40px_-28px_hsl(var(--foreground)/0.55)]">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            {tr(locale, "Shortlist", "Shortlist")}
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground">{shortlistCount}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {tr(locale, "Saved candidates persist across reloads on this device.", "Saved candidates persist across reloads on this device.")}
          </p>
        </div>
      </div>

      <div className="sticky top-14 z-30 rounded-[1.6rem] border border-border bg-card/88 p-2 shadow-[0_20px_48px_-30px_rgba(15,23,42,0.9)] backdrop-blur sm:top-16 sm:p-3">
        <CatalogFilterBar
          searchQuery={searchInputValue}
          sortField={queryState.sortBy}
          sortDirection={queryState.sortDir}
          pageSize={queryState.pageSize}
          viewMode={queryState.layout}
          activeFilterCount={activeFilterCount}
          isMobileFiltersOpen={isMobileFiltersOpen}
          onSearchQueryChange={setSearchInputValue}
          onSortFieldChange={handleSortFieldChange}
          onSortDirectionChange={handleSortDirectionChange}
          onPageSizeChange={handlePageSizeChange}
          onViewModeChange={handleViewModeChange}
          onToggleMobileFilters={() => setIsMobileFiltersOpen(current => !current)}
        />
      </div>

      <ActiveFilterChips locale={locale} chips={activeFilterChips} onClearAll={handleClearAllFilters} />

      <QuickFilters locale={locale} applyQuickFilter={applyQuickFilter} />

      <ResultsSummary
        locale={locale}
        total={result.total}
        firstVisibleIndex={firstVisibleIndex}
        lastVisibleIndex={lastVisibleIndex}
        isLoading={isLoading}
        requestError={requestError}
      />

      {isMobileFiltersOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-background/70 backdrop-blur-[1.5px] lg:hidden"
            onClick={() => setIsMobileFiltersOpen(false)}
            aria-label={tr(locale, "Close filters", "Close filters")}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm p-3 lg:hidden">
            <CatalogTaxonomyPanel
              mode="filters"
              panelId="catalog-mobile-filters"
              className="h-full overflow-y-auto"
              {...taxonomyPanelCommonProps}
              onRequestClose={() => setIsMobileFiltersOpen(false)}
            />
          </div>
        </>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <div className="hidden xl:block">
          <CatalogTaxonomyPanel mode="filters" {...taxonomyPanelCommonProps} />
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-[1.4rem] border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">{tr(locale, "Can't find your MCP server?", "Can't find your MCP server?")}</p>
            <Button asChild size="sm" className="h-9 rounded-xl px-3.5">
              <a href="/submit-server">{tr(locale, "Submit server", "Submit server")}</a>
            </Button>
          </div>
          <CatalogResults
            locale={locale}
            result={result}
            queryState={queryState}
            paginationEntries={paginationEntries}
            onSetCatalogPage={setCatalogPage}
            onClearAllFilters={handleClearAllFilters}
            isServerSaved={isServerSaved}
            onToggleShortlist={toggleShortlist}
          />
        </div>

        <div className="space-y-5 xl:sticky xl:top-24 xl:h-fit">
          <CatalogInsightsPanel
            locale={locale}
            featuredServers={featuredServers}
            topCategoryEntries={topCategoryEntries}
            topTagEntries={topTagEntries}
            hasActiveFilters={hasActiveFilters}
          />
          <CatalogShortlist locale={locale} items={shortlist} />
        </div>
      </div>
    </div>
  );
}
