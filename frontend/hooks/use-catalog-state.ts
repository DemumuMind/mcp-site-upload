"use client";

import { useMemo, useState } from "react";

import { getCatalogFacets } from "@/lib/catalog/facets";
import { filterCatalogServers } from "@/lib/catalog/filtering";
import { sortCatalogServers } from "@/lib/catalog/sorting";
import type {
  CatalogSortDirection,
  CatalogSortField,
  CatalogViewMode,
} from "@/lib/catalog/types";
import type { AuthType, McpServer } from "@/lib/types";

type CatalogStateInitialValues = {
  searchQuery?: string;
  selectedCategories?: string[];
  selectedAuthTypes?: AuthType[];
  selectedTags?: string[];
  sortField?: CatalogSortField;
  sortDirection?: CatalogSortDirection;
  viewMode?: CatalogViewMode;
};

export function useCatalogState(
  initialServers: McpServer[],
  initialValues: CatalogStateInitialValues = {},
) {
  const [searchQuery, setSearchQuery] = useState(initialValues.searchQuery ?? "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialValues.selectedCategories ?? [],
  );
  const [selectedAuthTypes, setSelectedAuthTypes] = useState<AuthType[]>(
    initialValues.selectedAuthTypes ?? [],
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(initialValues.selectedTags ?? []);
  const [sortField, setSortField] = useState<CatalogSortField>(initialValues.sortField ?? "rating");
  const [sortDirection, setSortDirection] = useState<CatalogSortDirection>(
    initialValues.sortDirection ?? "desc",
  );
  const [viewMode, setViewMode] = useState<CatalogViewMode>(initialValues.viewMode ?? "grid");

  const facets = useMemo(() => getCatalogFacets(initialServers), [initialServers]);

  const filteredServers = useMemo(() => {
    const filtered = filterCatalogServers(initialServers, {
      searchQuery,
      selectedCategories,
      selectedAuthTypes,
      selectedTags,
    });

    return sortCatalogServers(filtered, {
      field: sortField,
      direction: sortDirection,
    });
  }, [
    initialServers,
    searchQuery,
    selectedCategories,
    selectedAuthTypes,
    selectedTags,
    sortField,
    sortDirection,
  ]);

  function toggleCategory(category: string) {
    setSelectedCategories((current) => {
      if (current.includes(category)) {
        return current.filter((item) => item !== category);
      }

      return [...current, category];
    });
  }

  function toggleTag(tag: string) {
    setSelectedTags((current) => {
      if (current.includes(tag)) {
        return current.filter((item) => item !== tag);
      }

      return [...current, tag];
    });
  }

  function toggleAuthType(authType: AuthType) {
    setSelectedAuthTypes((current) => {
      if (current.includes(authType)) {
        return current.filter((item) => item !== authType);
      }

      return [...current, authType];
    });
  }

  function clearAllFilters() {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedAuthTypes([]);
    setSelectedTags([]);
  }

  return {
    searchQuery,
    selectedCategories,
    selectedAuthTypes,
    selectedTags,
    sortField,
    sortDirection,
    viewMode,
    filteredServers,
    categoryEntries: facets.categoryEntries,
    tagEntries: facets.tagEntries,
    authTypeCounts: facets.authTypeCounts,
    setSearchQuery,
    setSortField,
    setSortDirection,
    setViewMode,
    toggleCategory,
    toggleTag,
    toggleAuthType,
    clearAllFilters,
  };
}
