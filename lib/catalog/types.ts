import type { AuthType } from "@/lib/types";

export type CatalogSortField = "rating" | "name" | "tools";
export type CatalogSortDirection = "asc" | "desc";
export type CatalogViewMode = "grid" | "list";

export type CatalogFilters = {
  searchQuery: string;
  selectedCategories: string[];
  selectedAuthTypes: AuthType[];
  selectedTags: string[];
};

export type CatalogSort = {
  field: CatalogSortField;
  direction: CatalogSortDirection;
};

export type CatalogFacetEntries = Array<[string, number]>;

export type CatalogAuthTypeCounts = Record<AuthType, number>;
