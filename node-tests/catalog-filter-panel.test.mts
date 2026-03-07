import assert from "node:assert/strict";
import test from "node:test";

import { buildCatalogFilterPanelModel } from "../frontend/lib/catalog/filter-panel.ts";

test("builds a compact mockup-first filter model for the catalog sidebar", () => {
  const model = buildCatalogFilterPanelModel({
    categoryEntries: [
      ["Other Tools and Integrations", 421],
      ["Developer Tools", 236],
      ["Search", 171],
      ["Databases", 67],
      ["Cloud Platforms", 48],
    ],
    authTypeOptions: [
      { value: "none", label: "No auth", count: 935 },
      { value: "oauth", label: "OAuth", count: 8 },
      { value: "api_key", label: "API key", count: 57 },
    ],
    selectedAuthTypes: ["none"],
    healthOptions: [
      { value: "healthy", label: "Healthy", count: 461 },
      { value: "unknown", label: "Unknown", count: 502 },
      { value: "degraded", label: "Degraded", count: 36 },
      { value: "down", label: "Down", count: 1 },
    ],
    selectedHealthStatuses: ["healthy"],
    selectedVerificationLevels: ["official"],
    selectedTags: ["github"],
    toolsMin: 3,
    toolsMax: null,
  });

  assert.deepEqual(model.visibleCategoryEntries.map(([label]) => label), [
    "Developer Tools",
    "Search",
    "Databases",
  ]);
  assert.deepEqual(model.overflowCategoryEntries.map(([label]) => label), ["Cloud Platforms"]);
  assert.deepEqual(model.visibleHealthOptions.map((option) => option.value), [
    "healthy",
    "unknown",
    "degraded",
  ]);
  assert.deepEqual(
    model.quickFilters.map((filter) => ({ key: filter.key, active: filter.isActive })),
    [
      { key: "healthy", active: true },
      { key: "no_auth", active: true },
    ],
  );
  assert.equal(model.advancedFiltersActiveCount, 3);
});

test("keeps hidden health options visible when they are already selected", () => {
  const model = buildCatalogFilterPanelModel({
    categoryEntries: [["Developer Tools", 236]],
    authTypeOptions: [{ value: "none", label: "No auth", count: 935 }],
    selectedAuthTypes: [],
    healthOptions: [
      { value: "healthy", label: "Healthy", count: 461 },
      { value: "down", label: "Down", count: 1 },
    ],
    selectedHealthStatuses: ["down"],
    selectedVerificationLevels: [],
    selectedTags: [],
    toolsMin: null,
    toolsMax: null,
  });

  assert.deepEqual(model.visibleHealthOptions.map((option) => option.value), [
    "healthy",
    "down",
  ]);
  assert.equal(model.advancedFiltersActiveCount, 0);
});
