import { getCatalogFacets } from "@/lib/catalog/facets";
import { filterCatalogServers } from "@/lib/catalog/filtering";
import { normalizeCatalogQueryV2 } from "@/lib/catalog/query-v2";
import { sortCatalogServers } from "@/lib/catalog/sorting";
import type { CatalogQueryV2, CatalogSearchResult } from "@/lib/catalog/types";
import type { McpServer } from "@/lib/types";
export function runCatalogSearch(servers: McpServer[], queryInput: Partial<CatalogQueryV2>): CatalogSearchResult {
    const query = normalizeCatalogQueryV2(queryInput);
    const filteredServers = filterCatalogServers(servers, {
        searchQuery: query.query,
        selectedCategories: query.categories,
        selectedAuthTypes: query.auth,
        selectedTags: query.tags,
        selectedVerificationLevels: query.verification,
        selectedHealthStatuses: query.health,
        toolsMin: query.toolsMin,
        toolsMax: query.toolsMax,
    });
    const sortedServers = sortCatalogServers(filteredServers, {
        field: query.sortBy,
        direction: query.sortDir,
    }, query.query);
    const total = sortedServers.length;
    const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
    const page = Math.min(query.page, totalPages);
    const start = (page - 1) * query.pageSize;
    const items = sortedServers.slice(start, start + query.pageSize);
    return {
        items,
        total,
        page,
        pageSize: query.pageSize,
        totalPages,
        facets: getCatalogFacets(filteredServers),
        appliedFilters: {
            ...query,
            page,
        },
    };
}
