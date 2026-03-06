"use client";

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

type CatalogSectionProps = {
  initialQuery: CatalogQueryV2;
  initialResult: CatalogSearchResult;
};

export function CatalogSection({ initialQuery, initialResult }: CatalogSectionProps) {
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
  } = useCatalogController(initialQuery, initialResult, locale);

  return (
    <div className="space-y-4">
      <div className="sticky top-14 z-30 rounded-2xl border border-border bg-card/86 p-2 shadow-[0_18px_44px_-26px_rgba(15,23,42,0.9)] backdrop-blur sm:top-16 sm:p-3">
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
            className="fixed inset-0 z-40 bg-card backdrop-blur-[1.5px] lg:hidden"
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

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <CatalogTaxonomyPanel mode="filters" className="hidden lg:block" {...taxonomyPanelCommonProps} />

        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-2.5">
            <p className="text-xs text-muted-foreground">{tr(locale, "Can't find your MCP server?", "Can't find your MCP server?")}</p>
            <Button asChild size="sm" className="h-8 rounded-lg px-3">
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
          />
        </div>
      </div>
    </div>
  );
}
