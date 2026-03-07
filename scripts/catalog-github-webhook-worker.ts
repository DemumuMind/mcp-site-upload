#!/usr/bin/env node

import { randomUUID } from "node:crypto";
import { createLogger } from "../frontend/lib/api/logger.ts";
import { executeCatalogGithubWebhookWorker } from "../frontend/lib/catalog/github-webhook-worker-core.ts";
import { runCatalogIngestion } from "../frontend/lib/catalog/ingestion.ts";
import {
  acquireCatalogSyncLock,
  finishCatalogSyncRun,
  getQueuedGithubWebhookDeliveryCount,
  recordCatalogSyncFailures,
  releaseCatalogSyncLock,
  startCatalogSyncRun,
} from "../frontend/lib/catalog/sync-run-store.ts";

type Args = {
  "base-url"?: string;
  "include-admin"?: boolean;
};

function parseArgs(argv: string[]): Args {
  const parsed: Args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }
    const key = token.slice(2) as keyof Args;
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true as Args[keyof Args];
      continue;
    }
    parsed[key] = next as Args[keyof Args];
    index += 1;
  }
  return parsed;
}

async function invalidateChangedSlugs(baseUrl: string, changedSlugs: string[], includeAdmin: boolean): Promise<void> {
  if (changedSlugs.length === 0) {
    return;
  }

  const cronSecret = process.env.CATALOG_AUTOSYNC_CRON_SECRET || process.env.CRON_SECRET;
  if (!cronSecret) {
    throw new Error("Missing CATALOG_AUTOSYNC_CRON_SECRET/CRON_SECRET for cache invalidation callback.");
  }

  const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/api/catalog/cache-invalidate`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${cronSecret}`,
    },
    body: JSON.stringify({
      changedSlugs,
      includeAdmin,
    }),
  });

  if (!response.ok) {
    throw new Error(`Cache invalidation callback failed (${response.status})`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const baseUrl = (args["base-url"] || process.env.NEXT_PUBLIC_SITE_URL || process.env.SMOKE_BASE_URL || "").replace(/\/+$/, "");
  if (!baseUrl) {
    throw new Error("Missing base URL. Use --base-url or set NEXT_PUBLIC_SITE_URL/SMOKE_BASE_URL.");
  }

  const logger = createLogger("catalog.github_webhook_external_worker");
  const lockHolderId = randomUUID();

  const response = await executeCatalogGithubWebhookWorker({
    lockKey: "catalog:sync-all",
    acquireLock: () =>
      acquireCatalogSyncLock(
        {
          lockKey: "catalog:sync-all",
          holderId: lockHolderId,
          ttlSeconds: 1800,
        },
        { logger },
      ),
    startRun: () =>
      startCatalogSyncRun(
        {
          trigger: "catalog.github_webhook_external_worker",
          sourceScope: ["github", "pypi", "oci", "registry"],
        },
        { logger },
      ),
    finishRun: (input) => finishCatalogSyncRun(input, { logger }),
    recordFailures: (input) => recordCatalogSyncFailures(input, { logger }),
    releaseLock: () =>
      releaseCatalogSyncLock(
        {
          lockKey: "catalog:sync-all",
          holderId: lockHolderId,
        },
        { logger },
      ),
    getQueuedDeliveryCount: () => getQueuedGithubWebhookDeliveryCount({ logger }),
    runSync: ({ runId }) =>
      runCatalogIngestion({
        runId,
        sourceTypes: ["github", "pypi", "oci", "registry"],
        githubDiscoveryEnabled: false,
        logger,
      }),
    clearCaches: (changedSlugs) =>
      invalidateChangedSlugs(baseUrl, changedSlugs, Boolean(args["include-admin"])),
    logger,
  });

  console.log(JSON.stringify(response.body, null, 2));
  if (response.status >= 400 || response.status === 207) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
