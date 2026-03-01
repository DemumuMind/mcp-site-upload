"use client";

import { SearchX, AlertCircle, FilterX, Loader2, X } from "lucide-react";
import { CatalogFilterBar } from "@/components/catalog-filter-bar";
import { CatalogTaxonomyPanel } from "@/components/catalog-taxonomy-panel";
import { useLocale } from "@/components/locale-provider";
import { ServerCard } from "@/components/server-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCatalogController } from "@/components/catalog-section/use-catalog-controller";
import { getServerScore, getServerTrustScore } from "@/lib/catalog/sorting";
import { tr } from "@/lib/i18n";
import type { McpServer } from "@/lib/types";

type CatalogSectionProps = {
  initialServers: McpServer[];
};

export function CatalogSection({ initialServers }: CatalogSectionProps) {
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
  } = useCatalogController(initialServers, locale);

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

      {activeFilterChips.length > 0 ? (
        <div className="rounded-xl border border-border bg-card p-2.5 shadow-[0_16px_32px_-24px_rgba(15,23,42,0.9)] backdrop-blur">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              {tr(locale, "Active filters", "Active filters")}
            </p>

            {activeFilterChips.map(chip => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.onRemove}
                className="inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground transition hover:bg-accent hover:text-foreground"
              >
                <span className="max-w-[170px] truncate">{chip.label}</span>
                <X className="size-3" />
              </button>
            ))}

            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleClearAllFilters}
              className="text-muted-foreground hover:bg-accent hover:text-foreground sm:ml-auto"
            >
              <FilterX className="size-3.5" />
              {tr(locale, "Clear all", "Clear all")}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs text-muted-foreground">{tr(locale, "Quick filters:", "Quick filters:")}</p>
        <Button type="button" variant="outline" size="xs" className="border-border bg-card" onClick={() => applyQuickFilter("official")}>{tr(locale, "Official only", "Official only")}</Button>
        <Button type="button" variant="outline" size="xs" className="border-border bg-card" onClick={() => applyQuickFilter("healthy")}>{tr(locale, "Healthy only", "Healthy only")}</Button>
        <Button type="button" variant="outline" size="xs" className="border-border bg-card" onClick={() => applyQuickFilter("no_auth")}>{tr(locale, "No auth only", "No auth only")}</Button>
      </div>

      <div className="space-y-1 text-sm text-foreground">
        <p>{tr(locale, `${result.total} tools found`, `${result.total} tools found`)}</p>
        {result.total > 0 ? (
          <p className="text-xs text-muted-foreground">
            {tr(locale, `Showing ${firstVisibleIndex}-${lastVisibleIndex} on this page`, `Showing ${firstVisibleIndex}-${lastVisibleIndex} on this page`)}
          </p>
        ) : null}
        {isLoading ? (
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            {tr(locale, "Refreshing catalog...", "Refreshing catalog...")}
          </p>
        ) : null}
        {requestError ? (
          <p className="inline-flex items-center gap-1.5 text-xs text-rose-200">
            <AlertCircle className="size-3.5" />
            {tr(locale, "Could not sync latest catalog results. Showing the latest available snapshot.", "Could not sync latest catalog results. Showing the latest available snapshot.")}
          </p>
        ) : null}
      </div>

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
          {result.total > 0 ? (
            <div className="space-y-5">
              <div className={queryState.layout === "grid" ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" : "space-y-3"}>
                {result.items.map(mcpServer => (
                  <ServerCard
                    key={mcpServer.id}
                    mcpServer={mcpServer}
                    viewMode={queryState.layout}
                    score={getServerScore(mcpServer, queryState.query)}
                    trustScore={getServerTrustScore(mcpServer)}
                  />
                ))}
              </div>

              {result.totalPages > 1 ? (
                <div className="flex flex-wrap items-center justify-center gap-1" role="navigation" aria-label="Catalog pagination">
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => setCatalogPage(result.page - 1)}
                    disabled={result.page <= 1}
                    aria-label={tr(locale, "Previous page", "Previous page")}
                    className="text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    {tr(locale, "Prev", "Prev")}
                  </Button>

                  {paginationEntries.map((entry, index) =>
                    entry === "ellipsis" ? (
                      <span key={`ellipsis-${index}`} className="inline-flex h-6 min-w-8 items-center justify-center px-1 text-xs text-muted-foreground" aria-hidden>
                        ...
                      </span>
                    ) : (
                      <Button
                        key={`page-${entry}`}
                        type="button"
                        variant={entry === result.page ? "default" : "ghost"}
                        size="xs"
                        onClick={() => setCatalogPage(entry)}
                        aria-current={entry === result.page ? "page" : undefined}
                        className={entry === result.page ? "min-w-8 bg-primary text-foreground hover:bg-primary" : "min-w-8 text-muted-foreground hover:bg-accent hover:text-foreground"}
                      >
                        {entry}
                      </Button>
                    ),
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => setCatalogPage(result.page + 1)}
                    disabled={result.page >= result.totalPages}
                    aria-label={tr(locale, "Next page", "Next page")}
                    className="text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    {tr(locale, "Next", "Next")}
                  </Button>
                </div>
              ) : null}
            </div>
          ) : (
            <Card className="border-border bg-card shadow-[0_16px_36px_-26px_rgba(15,23,42,0.95)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <SearchX className="size-4 text-muted-foreground" />
                  {tr(locale, "No tools found", "No tools found")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-foreground">
                {tr(locale, "Try another search query or reset categories/tags/access filters.", "Try another search query or reset categories/tags/access filters.")}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" size="xs" variant="outline" className="border-border bg-card" onClick={handleClearAllFilters}>
                    {tr(locale, "Reset all filters", "Reset all filters")}
                  </Button>
                  <Button asChild size="xs">
                    <a href="/submit-server">{tr(locale, "Submit server", "Submit server")}</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
