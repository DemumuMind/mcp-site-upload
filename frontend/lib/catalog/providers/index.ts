import type { CatalogProvider, CatalogProviderSeed } from "../core/types.ts";
import { createGitHubCatalogProvider } from "./github.ts";
import { createNpmCatalogProvider } from "./npm.ts";
import { createRegistryCatalogProvider } from "./registry.ts";
import { createSmitheryCatalogProvider } from "./smithery.ts";
import { createOciProvider } from "./oci.ts";
import { createPypiProvider } from "./pypi.ts";

export type ProviderRegistryOptions = {
  github?: {
    maxPages?: number;
    discoveryEnabled?: boolean;
    baselinePublishedSlugs?: string[];
    minStaleBaselineRatio?: number;
    maxStaleMarkRatio?: number;
    readmeFetchLimit?: number;
    seeds?: CatalogProviderSeed[];
  };
  enrichmentSeeds?: CatalogProviderSeed[];
};

export function createCatalogProviderRegistry(options: ProviderRegistryOptions = {}): CatalogProvider[] {
  return [
    createGitHubCatalogProvider(options.github),
    createSmitheryCatalogProvider(),
    createNpmCatalogProvider(),
    createPypiProvider(options.enrichmentSeeds ?? []),
    createOciProvider(options.enrichmentSeeds ?? []),
    createRegistryCatalogProvider({ seeds: options.enrichmentSeeds ?? [] }),
  ];
}
