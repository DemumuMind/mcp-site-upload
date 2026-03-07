import type { AuthType, HealthStatus, VerificationLevel } from "@/lib/types";

type CountedOption<TValue extends string> = {
  value: TValue;
  label: string;
  count: number;
};

export type CatalogQuickFilterKey = "healthy" | "no_auth";

export type CatalogQuickFilterModel = {
  key: CatalogQuickFilterKey;
  label: string;
  isActive: boolean;
};

export type CatalogFilterPanelModel = {
  visibleCategoryEntries: Array<[string, number]>;
  overflowCategoryEntries: Array<[string, number]>;
  visibleAuthOptions: CountedOption<AuthType>[];
  visibleHealthOptions: CountedOption<HealthStatus>[];
  quickFilters: CatalogQuickFilterModel[];
  advancedFiltersActiveCount: number;
};

type CatalogFilterPanelModelInput = {
  categoryEntries: Array<[string, number]>;
  authTypeOptions: CountedOption<AuthType>[];
  selectedAuthTypes: AuthType[];
  healthOptions: CountedOption<HealthStatus>[];
  selectedHealthStatuses: HealthStatus[];
  selectedVerificationLevels: VerificationLevel[];
  selectedTags: string[];
  toolsMin: number | null;
  toolsMax: number | null;
};

const COMPACT_CATEGORY_LIMIT = 3;
const COMPACT_CATEGORY_EXCLUSIONS = new Set(["All Categories", "Other Tools and Integrations"]);

export function buildCatalogFilterPanelModel({
  categoryEntries,
  authTypeOptions,
  selectedAuthTypes,
  healthOptions,
  selectedHealthStatuses,
  selectedVerificationLevels,
  selectedTags,
  toolsMin,
  toolsMax,
}: CatalogFilterPanelModelInput): CatalogFilterPanelModel {
  const prioritizedCategoryEntries = categoryEntries.filter(
    ([categoryName, count]) => count > 0 && !COMPACT_CATEGORY_EXCLUSIONS.has(categoryName),
  );

  const visibleCategoryEntries = prioritizedCategoryEntries.slice(0, COMPACT_CATEGORY_LIMIT);
  const overflowCategoryEntries = prioritizedCategoryEntries.slice(COMPACT_CATEGORY_LIMIT);

  const visibleAuthOptions = authTypeOptions.filter((option) => option.count > 0);
  const visibleHealthOptions = healthOptions.filter(
    (option) => option.count > 0 && (option.value !== "down" || selectedHealthStatuses.includes("down")),
  );

  const quickFilters: CatalogQuickFilterModel[] = [
    {
      key: "healthy",
      label: "Healthy only",
      isActive: selectedHealthStatuses.length === 1 && selectedHealthStatuses[0] === "healthy",
    },
    {
      key: "no_auth",
      label: "No auth",
      isActive: selectedAuthTypes.length === 1 && selectedAuthTypes[0] === "none",
    },
  ];

  const advancedFiltersActiveCount =
    selectedVerificationLevels.length +
    selectedTags.length +
    (toolsMin !== null ? 1 : 0) +
    (toolsMax !== null ? 1 : 0);

  return {
    visibleCategoryEntries,
    overflowCategoryEntries,
    visibleAuthOptions,
    visibleHealthOptions,
    quickFilters,
    advancedFiltersActiveCount,
  };
}
