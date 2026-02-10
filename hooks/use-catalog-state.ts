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

export function useCatalogState(initialServers: McpServer[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAuthTypes, setSelectedAuthTypes] = useState<AuthType[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortField, setSortField] = useState<CatalogSortField>("rating");
  const [sortDirection, setSortDirection] = useState<CatalogSortDirection>("desc");
  const [viewMode, setViewMode] = useState<CatalogViewMode>("grid");

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
