import type { Metadata } from "next";

import { CatalogSection } from "@/components/catalog-section";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { getActiveServers } from "@/lib/servers";

export const metadata: Metadata = {
  title: "Catalog",
  description: "Browse and filter MCP servers in the catalog.",
};

export default async function CatalogPage() {
  const locale = await getLocale();
  const activeServers = await getActiveServers();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-100">
          {tr(locale, "Catalog", "Каталог")}
        </h1>
        <p className="text-sm text-slate-300">
          {tr(
            locale,
            "Filter by categories, languages, and authentication type, then inspect tools and copy each server URL.",
            "Фильтруйте по категориям, языкам и типу авторизации, затем просматривайте инструменты и копируйте URL серверов.",
          )}
        </p>
        <p className="text-xs text-slate-400">
          {tr(
            locale,
            `${activeServers.length} active servers listed.`,
            `В каталоге ${activeServers.length} активных серверов.`,
          )}
        </p>
      </div>
      <CatalogSection initialServers={activeServers} />
    </div>
  );
}
