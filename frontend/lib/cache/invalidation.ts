import { revalidatePath, revalidateTag, updateTag } from "./next-runtime.ts";
import { getInvalidationPolicy, getServerDataTag } from "./policy.ts";

export type MutationOrigin = "action" | "route";

export type CacheInvalidationPlan = {
  origin: MutationOrigin;
  paths: string[];
  tags: string[];
};

type InvalidationRuntime = {
  revalidatePath: (path: string) => void;
  revalidateTag: (tag: string, profile: "max") => void;
  updateTag: (tag: string) => void;
};

type InvalidateCatalogCachesInput = {
  origin: MutationOrigin;
  changedSlugs?: string[];
  includeAdmin?: boolean;
};

type InvalidateBlogCachesInput = {
  origin: MutationOrigin;
  slugs?: string[];
  includeAdmin?: boolean;
};

const defaultInvalidationRuntime: InvalidationRuntime = {
  revalidatePath,
  revalidateTag,
  updateTag,
};

function dedupeValues(values: string[]): string[] {
  const uniqueValues = new Set<string>();

  for (const value of values) {
    const normalizedValue = value.trim();
    if (normalizedValue.length === 0) {
      continue;
    }
    uniqueValues.add(normalizedValue);
  }

  return [...uniqueValues];
}

function buildEntityPaths(entityPathPrefix: string | undefined, slugs: string[]): string[] {
  if (!entityPathPrefix) {
    return [];
  }

  return dedupeValues(slugs).map((slug) => `${entityPathPrefix}${slug}`);
}

export function applyInvalidationPlan(
  plan: CacheInvalidationPlan,
  runtime: InvalidationRuntime = defaultInvalidationRuntime,
): void {
  for (const path of dedupeValues(plan.paths)) {
    runtime.revalidatePath(path);
  }

  for (const tag of dedupeValues(plan.tags)) {
    if (plan.origin === "action") {
      runtime.updateTag(tag);
      continue;
    }

    runtime.revalidateTag(tag, "max");
  }
}

export function buildCatalogInvalidationPlan({
  origin,
  changedSlugs = [],
  includeAdmin = false,
}: InvalidateCatalogCachesInput): CacheInvalidationPlan {
  const policy = getInvalidationPolicy("catalog");

  return {
    origin,
    paths: [
      ...policy.basePaths,
      ...buildEntityPaths(policy.entityPathPrefix, changedSlugs),
      ...(includeAdmin && policy.adminPath ? [policy.adminPath] : []),
    ],
    tags: [getServerDataTag(policy.serverDataPolicyKey)],
  };
}

export function invalidateCatalogCaches(input: InvalidateCatalogCachesInput): void {
  applyInvalidationPlan(buildCatalogInvalidationPlan(input));
}

export function buildBlogInvalidationPlan({
  origin,
  slugs = [],
  includeAdmin = false,
}: InvalidateBlogCachesInput): CacheInvalidationPlan {
  const policy = getInvalidationPolicy("blog");

  return {
    origin,
    paths: [
      ...policy.basePaths,
      ...buildEntityPaths(policy.entityPathPrefix, slugs),
      ...(includeAdmin && policy.adminPath ? [policy.adminPath] : []),
    ],
    tags: [getServerDataTag(policy.serverDataPolicyKey)],
  };
}

export function invalidateBlogCaches(input: InvalidateBlogCachesInput): void {
  applyInvalidationPlan(buildBlogInvalidationPlan(input));
}

export function buildAdminDashboardInvalidationPlan(origin: MutationOrigin): CacheInvalidationPlan {
  const policy = getInvalidationPolicy("adminDashboard");

  return {
    origin,
    paths: [...policy.basePaths],
    tags: [getServerDataTag(policy.serverDataPolicyKey)],
  };
}

export function invalidateAdminDashboardCaches(origin: MutationOrigin): void {
  applyInvalidationPlan(buildAdminDashboardInvalidationPlan(origin));
}
