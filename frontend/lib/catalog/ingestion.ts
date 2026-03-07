import { runCatalogIngestionPipeline } from "./core/pipeline.ts";
import {
  backfillLegacyServerSources,
  createCatalogIngestionStore,
  loadCatalogEnrichmentSeeds,
  loadPendingGithubWebhookSeeds,
  markGithubWebhookDeliveriesProcessed,
} from "./core/store.ts";
import type { CatalogPipelineResult, CatalogPipelineLogger, CatalogSourceType } from "./core/types.ts";
import { createCatalogProviderRegistry } from "./providers/index.ts";

export type CatalogSyncResult = CatalogPipelineResult & {
  sourceTypes: CatalogSourceType[];
};

type RunCatalogIngestionOptions = {
  runId?: string | null;
  sourceTypes: CatalogSourceType[];
  githubMaxPages?: number;
  githubDiscoveryEnabled?: boolean;
  logger?: CatalogPipelineLogger;
};

const noopLogger: CatalogPipelineLogger = {
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined,
};

function parseRatioEnv(name: string, fallback: number): number {
  const rawValue = process.env[name]?.trim();
  if (!rawValue) {
    return fallback;
  }
  const parsed = Number(rawValue);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function runCatalogIngestion(options: RunCatalogIngestionOptions): Promise<CatalogSyncResult> {
  const store = createCatalogIngestionStore();
  const logger = options.logger ?? noopLogger;
  await backfillLegacyServerSources();
  const enrichmentSeeds =
    options.sourceTypes.includes("pypi") || options.sourceTypes.includes("oci") || options.sourceTypes.includes("registry")
      ? await loadCatalogEnrichmentSeeds()
      : [];
  const githubWebhookSeeds =
    options.sourceTypes.includes("github")
      ? await loadPendingGithubWebhookSeeds()
      : [];
  const githubBaseline =
    options.sourceTypes.includes("github")
      ? (await store.loadAutoManagedRecords("github")).map((row) => row.slug)
      : [];

  const providers = createCatalogProviderRegistry({
    github: {
      maxPages: options.githubMaxPages,
      discoveryEnabled: options.githubDiscoveryEnabled ?? true,
      baselinePublishedSlugs: githubBaseline,
      minStaleBaselineRatio: parseRatioEnv("CATALOG_AUTOSYNC_MIN_STALE_BASELINE_RATIO", 0.7),
      maxStaleMarkRatio: parseRatioEnv("CATALOG_AUTOSYNC_MAX_STALE_MARK_RATIO", 0.15),
      readmeFetchLimit: parseRatioEnv("CATALOG_GITHUB_README_ENRICH_LIMIT", 40),
      seeds: githubWebhookSeeds,
    },
    enrichmentSeeds: [...enrichmentSeeds, ...githubWebhookSeeds],
  });

  const result = await runCatalogIngestionPipeline({
    runId: options.runId ?? null,
    providers,
    store,
    sourceTypes: options.sourceTypes,
    logger,
  });

  if (options.sourceTypes.includes("github") && (result.sources.github?.failed ?? 0) === 0) {
    await markGithubWebhookDeliveriesProcessed(
      githubWebhookSeeds.map((seed) => seed.deliveryId),
      options.runId ?? null,
    );
  }

  return {
    ...result,
    sourceTypes: options.sourceTypes,
  };
}
