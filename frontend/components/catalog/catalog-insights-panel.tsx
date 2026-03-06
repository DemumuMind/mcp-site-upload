import Link from "next/link";
import { ArrowUpRight, Sparkles, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { tr, type Locale } from "@/lib/i18n";
import type { McpServer } from "@/lib/types";

export function CatalogInsightsPanel({
  locale,
  featuredServers,
  topCategoryEntries,
  topTagEntries,
  hasActiveFilters,
}: {
  locale: Locale;
  featuredServers: McpServer[];
  topCategoryEntries: Array<[string, number]>;
  topTagEntries: Array<[string, number]>;
  hasActiveFilters: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-[linear-gradient(180deg,hsl(var(--surface-1))/0.98,hsl(var(--surface-0))/0.92)] shadow-[0_24px_60px_-36px_hsl(var(--foreground)/0.5)]">
      <div className="border-b border-border/60 px-5 py-5">
        <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
          <Sparkles className="size-3.5" />
          <span>{tr(locale, "Featured picks", "Featured picks")}</span>
        </div>
        <h2 className="mt-3 text-lg font-semibold text-foreground">
          {tr(locale, "Featured picks", "Featured picks")}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {hasActiveFilters
            ? tr(
                locale,
                "Keep one high-trust server in view while narrowing the result set.",
                "Keep one high-trust server in view while narrowing the result set.",
              )
            : tr(
                locale,
                "Start with proven anchors, then branch into narrower fits from the workspace filters.",
                "Start with proven anchors, then branch into narrower fits from the workspace filters.",
              )}
        </p>
      </div>

      <div className="space-y-3 px-4 py-4">
        {featuredServers.map((server) => (
          <Link
            key={server.slug}
            href={`/server/${server.slug}`}
            className="group block rounded-2xl border border-border/60 bg-background/85 p-4 transition hover:border-primary/45 hover:bg-background"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground transition group-hover:text-primary">
                  {server.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{server.category}</p>
              </div>
              <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
            </div>

            <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {server.description}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px]">
                {server.verificationLevel}
              </Badge>
              <span className="inline-flex items-center gap-1 rounded-full border border-border/70 px-2.5 py-1 text-[11px] text-muted-foreground">
                <Wrench className="size-3" />
                {tr(locale, `${server.tools.length} tools`, `${server.tools.length} tools`)}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-px border-t border-border/60 bg-border/60 sm:grid-cols-2">
        <div className="bg-background/85 px-4 py-4">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            {tr(locale, "Top lanes", "Top lanes")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {topCategoryEntries.map(([categoryName, count]) => (
              <span
                key={categoryName}
                className="inline-flex items-center gap-2 rounded-full border border-border/70 px-2.5 py-1 text-[11px] text-foreground"
              >
                <span>{categoryName}</span>
                <span className="text-muted-foreground">{count}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="bg-background/85 px-4 py-4">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            {tr(locale, "Signal tags", "Signal tags")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {topTagEntries.length > 0 ? (
              topTagEntries.map(([tag, count]) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 px-2.5 py-1 text-[11px] text-foreground"
                >
                  <span>#{tag}</span>
                  <span className="text-muted-foreground">{count}</span>
                </span>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                {tr(locale, "Tags narrow as the current view becomes more specific.", "Tags narrow as the current view becomes more specific.")}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
