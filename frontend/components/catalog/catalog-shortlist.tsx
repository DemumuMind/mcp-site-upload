import Link from "next/link";
import { Heart, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tr, type Locale } from "@/lib/i18n";
import type { CatalogShortlistItem } from "@/components/catalog-section/use-catalog-controller";

export function CatalogShortlist({
  locale,
  items,
}: {
  locale: Locale;
  items: CatalogShortlistItem[];
}) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-[0_22px_60px_-40px_hsl(var(--foreground)/0.55)]">
      <div className="border-b border-border/60 px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{tr(locale, "Shortlist", "Shortlist")}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {tr(locale, "Save servers to compare them later.", "Save servers to compare them later.")}
            </p>
          </div>
          <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-border/70 px-3 text-sm font-semibold text-foreground">
            {items.length}
          </span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="px-5 py-6">
          <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 p-5 text-sm text-muted-foreground">
            <p>{tr(locale, "Use the save action on any card to build a working compare queue.", "Use the save action on any card to build a working compare queue.")}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3 px-4 py-4">
          <p className="text-sm font-medium text-foreground">
            {tr(locale, `${items.length} saved`, `${items.length} saved`)}
          </p>
          {items.map((item) => (
            <Link
              key={item.slug}
              href={item.href}
              className="group block rounded-2xl border border-border/60 bg-background/80 p-4 transition hover:border-primary/45 hover:bg-background"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground transition group-hover:text-primary">
                    {item.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.category}</p>
                </div>
                <Heart className="size-4 shrink-0 fill-current text-rose-400" />
              </div>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <span className="rounded-full border border-border/70 px-2.5 py-1">{item.verificationLevel}</span>
                <span className="rounded-full border border-border/70 px-2.5 py-1">{item.authType}</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border/70 px-2.5 py-1">
                  <Wrench className="size-3" />
                  {tr(locale, `${item.toolsCount} tools`, `${item.toolsCount} tools`)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="border-t border-border/60 px-4 py-4">
        <Button asChild variant="outline" className="w-full rounded-xl">
          <Link href="/submit-server">{tr(locale, "Add another server to evaluate", "Add another server to evaluate")}</Link>
        </Button>
      </div>
    </section>
  );
}
