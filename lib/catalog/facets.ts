import type { McpServer } from "@/lib/types";

import type { CatalogAuthTypeCounts, CatalogFacetEntries } from "@/lib/catalog/types";

function sortFacetEntries(entries: CatalogFacetEntries): CatalogFacetEntries {
  return [...entries].sort((a, b) => {
    if (b[1] !== a[1]) {
      return b[1] - a[1];
    }

    return a[0].localeCompare(b[0]);
  });
}

export function getCategoryEntries(servers: McpServer[]): CatalogFacetEntries {
  const categoryCountMap = new Map<string, number>();

  for (const mcpServer of servers) {
    categoryCountMap.set(
      mcpServer.category,
      (categoryCountMap.get(mcpServer.category) ?? 0) + 1,
    );
  }

  return sortFacetEntries([...categoryCountMap.entries()]);
}

export function getTagEntries(servers: McpServer[]): CatalogFacetEntries {
  const tagCountMap = new Map<string, number>();

  for (const mcpServer of servers) {
    for (const tag of mcpServer.tags) {
      tagCountMap.set(tag, (tagCountMap.get(tag) ?? 0) + 1);
    }
  }

  return sortFacetEntries([...tagCountMap.entries()]);
}

export function getAuthTypeCounts(servers: McpServer[]): CatalogAuthTypeCounts {
  const counts: CatalogAuthTypeCounts = {
    none: 0,
    api_key: 0,
    oauth: 0,
  };

  for (const mcpServer of servers) {
    counts[mcpServer.authType] += 1;
  }

  return counts;
}

export function getCatalogFacets(servers: McpServer[]) {
  return {
    categoryEntries: getCategoryEntries(servers),
    tagEntries: getTagEntries(servers),
    authTypeCounts: getAuthTypeCounts(servers),
  };
}
