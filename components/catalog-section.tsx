"use client";

import { useMemo, useState } from "react";

import { CatalogFilterBar } from "@/components/catalog-filter-bar";
import { useLocale } from "@/components/locale-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CATALOG_CATEGORY_OPTIONS,
  CATALOG_LANGUAGE_OPTIONS,
  inferServerLanguage,
} from "@/lib/catalog-taxonomy";
import { tr } from "@/lib/i18n";
import { ServerCard } from "@/components/server-card";
import type { AuthType, McpServer } from "@/lib/types";

type CatalogSectionProps = {
  initialServers: McpServer[];
};

function includesIgnoreCase(value: string, query: string): boolean {
  return value.toLowerCase().includes(query.toLowerCase());
}

export function CatalogSection({ initialServers }: CatalogSectionProps) {
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [authFilter, setAuthFilter] = useState<AuthType | "all">("all");

  const categories = useMemo(() => CATALOG_CATEGORY_OPTIONS.slice(1), []);
  const languages = useMemo(() => CATALOG_LANGUAGE_OPTIONS.slice(1), []);

  const filteredServers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return initialServers.filter((mcpServer) => {
      const searchMatches =
        !normalizedQuery ||
        includesIgnoreCase(mcpServer.name, normalizedQuery) ||
        includesIgnoreCase(mcpServer.description, normalizedQuery) ||
        includesIgnoreCase(mcpServer.category, normalizedQuery) ||
        mcpServer.tags.some((tag) => includesIgnoreCase(tag, normalizedQuery)) ||
        mcpServer.tools.some((tool) => includesIgnoreCase(tool, normalizedQuery));

      const categoryMatches =
        categoryFilter === "all" || mcpServer.category === categoryFilter;
      const languageMatches =
        languageFilter === "all" || inferServerLanguage(mcpServer) === languageFilter;
      const authMatches = authFilter === "all" || mcpServer.authType === authFilter;

      return searchMatches && categoryMatches && languageMatches && authMatches;
    });
  }, [authFilter, categoryFilter, initialServers, languageFilter, searchQuery]);

  return (
    <div className="space-y-5">
      <CatalogFilterBar
        searchQuery={searchQuery}
        categoryFilter={categoryFilter}
        languageFilter={languageFilter}
        authFilter={authFilter}
        categories={categories}
        languages={languages}
        onSearchQueryChange={setSearchQuery}
        onCategoryFilterChange={setCategoryFilter}
        onLanguageFilterChange={setLanguageFilter}
        onAuthFilterChange={setAuthFilter}
      />

      {filteredServers.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredServers.map((mcpServer) => (
            <ServerCard key={mcpServer.id} mcpServer={mcpServer} />
          ))}
        </div>
      ) : (
        <Card className="border-white/10 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-slate-100">
              {tr(locale, "No servers found", "Серверы не найдены")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">
            {tr(
              locale,
              "Try another search query or reset category/language/auth filters.",
              "Измените поисковый запрос или сбросьте фильтры категории, языка и авторизации.",
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
