import type { McpServer } from "@/lib/types";

import type { CatalogFilters } from "@/lib/catalog/types";

function includesIgnoreCase(value: string, query: string): boolean {
  return value.toLowerCase().includes(query.toLowerCase());
}

function matchesSearchQuery(mcpServer: McpServer, normalizedQuery: string): boolean {
  if (!normalizedQuery) {
    return true;
  }

  const searchableMaintainer = mcpServer.maintainer?.name ?? "";

  return (
    includesIgnoreCase(mcpServer.name, normalizedQuery) ||
    includesIgnoreCase(mcpServer.description, normalizedQuery) ||
    includesIgnoreCase(mcpServer.category, normalizedQuery) ||
    includesIgnoreCase(searchableMaintainer, normalizedQuery) ||
    mcpServer.tags.some((tag) => includesIgnoreCase(tag, normalizedQuery)) ||
    mcpServer.tools.some((tool) => includesIgnoreCase(tool, normalizedQuery))
  );
}

export function filterCatalogServers(
  servers: McpServer[],
  filters: CatalogFilters,
): McpServer[] {
  const normalizedQuery = filters.searchQuery.trim().toLowerCase();

  return servers.filter((mcpServer) => {
    const searchMatches = matchesSearchQuery(mcpServer, normalizedQuery);
    const categoryMatches =
      filters.selectedCategories.length === 0 ||
      filters.selectedCategories.includes(mcpServer.category);
    const authMatches =
      filters.selectedAuthTypes.length === 0 ||
      filters.selectedAuthTypes.includes(mcpServer.authType);
    const tagMatches =
      filters.selectedTags.length === 0 ||
      filters.selectedTags.every((tag) => mcpServer.tags.includes(tag));

    return searchMatches && categoryMatches && authMatches && tagMatches;
  });
}
