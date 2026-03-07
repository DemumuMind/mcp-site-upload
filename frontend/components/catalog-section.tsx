"use client";

import { CatalogComparePanel, CatalogCompareSupportStack, CatalogMobileCompareDock } from "@/components/catalog/catalog-compare-panel";
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
import { getCatalogCompareReadinessCopy } from "@/lib/catalog/compare";
import { tr } from "@/lib/i18n";
import { cn } from "@/lib/utils";
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
  hasActiveFilters,
}: CatalogSectionProps) {
  const locale = useLocale();
  const {
    queryState,
    searchInputValue,
    setSearchInputValue,
    isMobileFiltersOpen,
    setIsMobileFiltersOpen,
    isMobileCompareOpen,
    setIsMobileCompareOpen,
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
    isCompareAvailable,
    isServerSaved,
    toggleShortlist,
    clearShortlist,
  } = useCatalogController(initialQuery, initialResult, locale);
  const compareReadinessCopy = getCatalogCompareReadinessCopy(shortlistCount);

  const handleCompareFocus = () => {
    const compareRail = document.getElementById("catalog-compare-rail");
    if (compareRail) {
      compareRail.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div id="catalog-workspace" className="space-y-5">
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
              ? tr(locale, "Use compare to keep shortlist signal readable while narrowing the workspace.", "Use compare to keep shortlist signal readable while narrowing the workspace.")
              : tr(locale, "Use compare to turn shortlist signal into a decision, not a bookmark pile.", "Use compare to turn shortlist signal into a decision, not a bookmark pile.")}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-border/70 bg-card px-4 py-4 shadow-[0_16px_40px_-28px_hsl(var(--foreground)/0.55)]">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            {tr(locale, "Visible now", "Visible now")}
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground">{result.total}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {tr(locale, "Trust, health, auth and tool-depth stay readable before you open detail pages.", "Trust, health, auth and tool-depth stay readable before you open detail pages.")}
          </p>
        </div>
        <div className={cn(
          "rounded-[1.5rem] border px-4 py-4 shadow-[0_16px_40px_-28px_hsl(var(--foreground)/0.55)]",
          isCompareAvailable ? "border-primary/25 bg-primary/5" : "border-border/70 bg-card",
        )}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.16em] text-primary uppercase">
                {tr(locale, compareReadinessCopy.eyebrow, compareReadinessCopy.eyebrow)}
              </p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                {tr(locale, compareReadinessCopy.title, compareReadinessCopy.title)}
              </p>
            </div>
            <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-primary/25 bg-primary/10 px-2.5 text-xs font-semibold text-primary">
              {shortlistCount}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {tr(locale, compareReadinessCopy.description, compareReadinessCopy.description)}
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
          compareCount={shortlistCount}
          isCompareAvailable={isCompareAvailable}
          activeFilterCount={activeFilterCount}
          isMobileFiltersOpen={isMobileFiltersOpen}
          onSearchQueryChange={setSearchInputValue}
          onSortFieldChange={handleSortFieldChange}
          onSortDirectionChange={handleSortDirectionChange}
          onPageSizeChange={handlePageSizeChange}
          onViewModeChange={handleViewModeChange}
          onCompareClick={handleCompareFocus}
          onToggleMobileFilters={() => {
            setIsMobileCompareOpen(false);
            setIsMobileFiltersOpen(current => !current);
          }}
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

      <div className={cn("grid gap-5", isCompareAvailable ? "xl:grid-cols-[280px_minmax(0,1fr)_420px]" : "xl:grid-cols-[280px_minmax(0,1fr)_320px]")}>
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
          <div className="xl:hidden">
            <CatalogCompareSupportStack locale={locale} hasActiveFilters={hasActiveFilters} />
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

        <div id="catalog-compare-rail" className="hidden space-y-5 xl:sticky xl:top-24 xl:block xl:h-fit">
          <CatalogCompareSupportStack locale={locale} hasActiveFilters={hasActiveFilters} />
          {isCompareAvailable ? (
            <CatalogComparePanel locale={locale} items={shortlist} onClearShortlist={clearShortlist} />
          ) : (
            <CatalogShortlist locale={locale} items={shortlist} />
          )}
        </div>
      </div>

      {isCompareAvailable ? (
        <CatalogMobileCompareDock
          locale={locale}
          items={shortlist}
          isOpen={isMobileCompareOpen}
          onOpenChange={setIsMobileCompareOpen}
          onClearShortlist={clearShortlist}
        />
      ) : null}
    </div>
  );
}
