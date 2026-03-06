import assert from "node:assert/strict";
import test from "node:test";

import * as homeViewModelModule from "../frontend/lib/home/view-model.ts";

const { buildHomePageViewModel } = homeViewModelModule;

test("uses fallback homepage metrics and featured servers when catalog snapshot is empty", () => {
  const viewModel = buildHomePageViewModel({
    locale: "en",
    siteUrl: "http://localhost:3000",
    snapshot: {
      servers: [],
      featuredServers: [],
      sampleServer: null,
      totalServers: 0,
      totalTools: 0,
      totalCategories: 0,
      totalGithubLinked: 0,
      githubLinkedPercent: 0,
      categoryEntries: [],
      languageEntries: [],
    },
  });

  assert.deepEqual(
    viewModel.metrics.map((metric) => metric.value),
    [248, 1836, 18],
  );
  assert.equal(viewModel.featuredServers.length, 3);
  assert.deepEqual(
    viewModel.topCategories.map((entry) => entry.label),
    ["Developer Tools", "Databases", "Automation"],
  );
});
