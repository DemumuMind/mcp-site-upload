import type { Metadata } from "next";
import Link from "next/link";

import { CatalogSection } from "@/components/catalog-section";
import { PageFrame, PageHero, PageMetric } from "@/components/page-templates";
import { Button } from "@/components/ui/button";
import { getCatalogSnapshot } from "@/lib/catalog/snapshot";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: tr(locale, "AI Tools Directory", "Каталог AI-инструментов"),
    description: tr(
      locale,
      "Discover and filter MCP tools, models, and services in one directory.",
      "Находите и фильтруйте MCP-инструменты, модели и сервисы в едином каталоге.",
    ),
  };
}

export default async function CatalogPage() {
  const locale = await getLocale();
  const catalogSnapshot = await getCatalogSnapshot();

  return (
    <PageFrame variant="directory">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
        <PageHero
          badgeTone="cyan"
          eyebrow={tr(locale, "Directory Control Center", "Центр управления каталогом")}
          title={tr(locale, "Find Trusted MCP Servers Faster", "Находите проверенные MCP-серверы быстрее")}
          description={tr(
            locale,
            "Search by category, auth model, and capability tags. Compare candidates side-by-side and move to integration with less rework.",
            "Ищите по категориям, типу авторизации и capability-тегам. Сравнивайте кандидатов и переходите к интеграции без лишних переделок.",
          )}
          actions={
            <>
              <Button asChild className="h-11 rounded-xl bg-blue-500 px-6 text-white hover:bg-blue-400">
                <Link href="/submit-server">
                  {tr(locale, "Submit server", "Отправить сервер")}
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-xl border-white/20 bg-slate-950/70 text-slate-100 hover:bg-slate-900"
              >
                <Link href="/how-to-use">
                  {tr(locale, "Open setup guide", "Открыть гайд")}
                </Link>
              </Button>
            </>
          }
          metrics={
            <>
              <PageMetric
                label={tr(locale, "Active servers", "Активные серверы")}
                value={catalogSnapshot.totalServers}
              />
              <PageMetric
                label={tr(locale, "Published tools", "Опубликованные инструменты")}
                value={catalogSnapshot.totalTools}
              />
              <PageMetric
                label={tr(locale, "Categories", "Категории")}
                value={catalogSnapshot.totalCategories}
              />
              <PageMetric
                label={tr(locale, "Featured", "Рекомендовано")}
                value={catalogSnapshot.featuredServers.length}
                valueClassName="text-cyan-200"
              />
            </>
          }
        />
        <CatalogSection initialServers={catalogSnapshot.servers} />
      </div>
    </PageFrame>
  );
}
