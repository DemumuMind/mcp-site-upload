"use client";

import { SearchX } from "lucide-react";
import { ServerCard } from "@/components/server-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PaginationEntry } from "@/components/catalog-section/use-catalog-controller";
import { getServerScore, getServerTrustScore } from "@/lib/catalog/sorting";
import { tr, type Locale } from "@/lib/i18n";
import type { McpServer } from "@/lib/types";
import type { CatalogSearchResult, CatalogQueryV2 } from "@/lib/catalog/types";

export function CatalogResults({
  locale,
  result,
  queryState,
  paginationEntries,
  onSetCatalogPage,
  onClearAllFilters,
  isServerSaved,
  onToggleShortlist,
}: {
  locale: Locale;
  result: CatalogSearchResult;
  queryState: CatalogQueryV2;
  paginationEntries: PaginationEntry[];
  onSetCatalogPage: (page: number) => void;
  onClearAllFilters: () => void;
  isServerSaved: (slug: string) => boolean;
  onToggleShortlist: (server: McpServer) => void;
}) {
  if (result.total === 0) {
    return (
      <Card className="rounded-[1.6rem] border-border bg-card shadow-[0_16px_36px_-26px_rgba(15,23,42,0.95)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <SearchX className="size-4 text-muted-foreground" />
            {tr(locale, "No tools found", "No tools found")}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-foreground">
          {tr(
            locale,
            "Try another search query or reset categories/tags/access filters.",
            "Try another search query or reset categories/tags/access filters.",
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="xs" variant="outline" className="border-border bg-card" onClick={onClearAllFilters}>
              {tr(locale, "Reset all filters", "Reset all filters")}
            </Button>
            <Button asChild size="xs">
              <a href="/submit-server">{tr(locale, "Submit server", "Submit server")}</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className={queryState.layout === "grid" ? "grid gap-4 md:grid-cols-2 2xl:grid-cols-3" : "space-y-3"}>
        {result.items.map(mcpServer => (
          <ServerCard
            key={mcpServer.id}
            mcpServer={mcpServer}
            viewMode={queryState.layout}
            score={getServerScore(mcpServer, queryState.query)}
            trustScore={getServerTrustScore(mcpServer)}
            isSaved={isServerSaved(mcpServer.slug)}
            onToggleSave={onToggleShortlist}
          />
        ))}
      </div>

      {result.totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-1" role="navigation" aria-label="Catalog pagination">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => onSetCatalogPage(result.page - 1)}
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
                onClick={() => onSetCatalogPage(entry)}
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
            onClick={() => onSetCatalogPage(result.page + 1)}
            disabled={result.page >= result.totalPages}
            aria-label={tr(locale, "Next page", "Next page")}
            className="text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {tr(locale, "Next", "Next")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
