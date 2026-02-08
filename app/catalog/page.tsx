import type { Metadata } from "next";

import { CatalogSection } from "@/components/catalog-section";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { getActiveServers } from "@/lib/servers";

export const metadata: Metadata = {
  title: "AI Tools Directory",
  description: "Discover and filter MCP tools, models, and services in one directory.",
};

export default async function CatalogPage() {
  const locale = await getLocale();
  const activeServers = await getActiveServers();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
      <div className="rounded-3xl border border-slate-200 bg-slate-50/95 p-5 shadow-xl sm:p-7">
        <div className="mb-6 space-y-1.5">
          <h1 className="text-3xl font-semibold tracking-tight text-blue-700">
            {tr(locale, "AI Tools Directory", "Каталог AI-инструментов")}
          </h1>
          <p className="text-sm text-slate-600">
            {tr(
              locale,
              "Discover the best AI tools, models, and services for your projects.",
              "Откройте лучшие AI-инструменты, модели и сервисы для ваших проектов.",
            )}
          </p>
          <p className="text-xs text-slate-500">
            {tr(
              locale,
              `${activeServers.length} tools available in the catalog.`,
              `В каталоге доступно ${activeServers.length} инструментов.`,
            )}
          </p>
        </div>
        <CatalogSection initialServers={activeServers} />
      </div>
    </div>
  );
}
