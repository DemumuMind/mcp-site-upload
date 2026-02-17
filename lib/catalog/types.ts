import type { AuthType, HealthStatus, McpServer, VerificationLevel, } from "@/lib/types";
export type CatalogSortField = "rating" | "name" | "tools" | "updated";
export type CatalogSortDirection = "asc" | "desc";
export type CatalogViewMode = "grid" | "list";
export type CatalogFilters = {
    searchQuery: string;
    selectedCategories: string[];
    selectedAuthTypes: AuthType[];
    selectedTags: string[];
    selectedVerificationLevels?: VerificationLevel[];
    selectedHealthStatuses?: HealthStatus[];
    toolsMin?: number | null;
    toolsMax?: number | null;
};
export type CatalogSort = {
    field: CatalogSortField;
    direction: CatalogSortDirection;
};
export type CatalogFacetEntries = Array<[
    string,
    number
]>;
export type CatalogAuthTypeCounts = Record<AuthType, number>;
export type CatalogVerificationCounts = Record<VerificationLevel, number>;
export type CatalogHealthCounts = Record<HealthStatus, number>;
export type CatalogToolsRange = {
    min: number;
    max: number;
};
export type CatalogFacetSetV2 = {
    categoryEntries: CatalogFacetEntries;
    tagEntries: CatalogFacetEntries;
    authTypeCounts: CatalogAuthTypeCounts;
    verificationCounts: CatalogVerificationCounts;
    healthCounts: CatalogHealthCounts;
    toolsRange: CatalogToolsRange;
};
export type CatalogQueryV2 = {
    page: number;
    pageSize: number;
    query: string;
    categories: string[];
    auth: AuthType[];
    tags: string[];
    verification: VerificationLevel[];
    health: HealthStatus[];
    toolsMin: number | null;
    toolsMax: number | null;
    sortBy: CatalogSortField;
    sortDir: CatalogSortDirection;
    layout: CatalogViewMode;
};
export type CatalogSearchResult = {
    items: McpServer[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    facets: CatalogFacetSetV2;
    appliedFilters: CatalogQueryV2;
};
