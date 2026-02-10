import type { Metadata } from "next";
import Link from "next/link";

import { CatalogTaxonomyPanel } from "@/components/catalog-taxonomy-panel";
import { PageFrame, PageHero, PageMetric, PageSection } from "@/components/page-templates";
import { Button } from "@/components/ui/button";
import { getCatalogSnapshot } from "@/lib/catalog/snapshot";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: tr(locale, "Categories", "Категории"),
    description: tr(
      locale,
      "Browse DemumuMind MCP categories and language filters.",
      "Просматривайте категории DemumuMind MCP и языковые фильтры.",
    ),
  };
}

export default async function CategoriesPage() {
  const locale = await getLocale();
  const catalogSnapshot = await getCatalogSnapshot();

  return (
    <PageFrame variant="directory">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
        <PageHero
          badgeTone="emerald"
          eyebrow={tr(locale, "Taxonomy Map", "Карта таксономии")}
          title={tr(locale, "Catalog Categories & Languages", "Категории и языки каталога")}
          description={tr(
            locale,
            "Use this index to understand how servers are grouped, filtered, and discovered across the platform.",
            "Используйте этот индекс, чтобы понять как серверы группируются, фильтруются и находятся в каталоге.",
          )}
          actions={
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-xl border-white/20 bg-slate-950/70 text-slate-100 hover:bg-slate-900"
            >
              <Link href="/catalog">{tr(locale, "Back to directory", "Назад в каталог")}</Link>
            </Button>
          }
          metrics={
            <>
              <PageMetric
                label={tr(locale, "Category options", "Категории")}
                value={catalogSnapshot.categoryEntries.length}
              />
              <PageMetric
                label={tr(locale, "Language options", "Языки")}
                value={catalogSnapshot.languageEntries.length}
              />
            </>
          }
        />

        <PageSection>
          <CatalogTaxonomyPanel
            locale={locale}
            categoryEntries={catalogSnapshot.categoryEntries}
            languageEntries={catalogSnapshot.languageEntries}
          />
        </PageSection>
      </div>
    </PageFrame>
  );
}
