import assert from "node:assert/strict";
import test from "node:test";

import * as automationStatusCoreModule from "../frontend/lib/catalog/automation-status-core.ts";

const { executeCatalogAutomationStatus } = automationStatusCoreModule;

test("marks status degraded when cron secret or schedules are missing", async () => {
  const response = await executeCatalogAutomationStatus({
    readCronSchedules: async () => [],
    hasCatalogSecret: () => false,
    readCatalogData: async () => ({
      supabaseConfigured: false,
      autoManagedActiveCount: null,
      lastAutoManagedCreatedAt: null,
      dataCheckError: null,
    }),
    readRecentRuns: async () => ({
      degraded: true,
      data: [],
    }),
    readActiveLocks: async () => ({
      degraded: true,
      data: [],
    }),
  });

  assert.equal(response.ok, false);
  assert.deepEqual(response.checks, {
    cronConfigured: false,
    secretConfigured: false,
    runtimeReady: false,
  });
});

test("marks runtime not ready when data checks fail", async () => {
  const response = await executeCatalogAutomationStatus({
    readCronSchedules: async () => ["0 * * * *"],
    hasCatalogSecret: () => true,
    readCatalogData: async () => ({
      supabaseConfigured: true,
      autoManagedActiveCount: null,
      lastAutoManagedCreatedAt: null,
      dataCheckError: "relation servers does not exist",
    }),
    readRecentRuns: async () => ({
      degraded: false,
      data: [],
    }),
    readActiveLocks: async () => ({
      degraded: false,
      data: [],
    }),
  });

  assert.equal(response.ok, false);
  assert.equal(response.checks.runtimeReady, false);
  assert.equal(response.catalogAutoSync.dataCheckError, "relation servers does not exist");
});
