import { revalidatePath, revalidateTag, updateTag } from "./next-runtime.ts";
import { CACHE_TAGS } from "./policy.ts";

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

function buildSlugPaths(basePath: "/server" | "/blog", slugs: string[]): string[] {
  return dedupeValues(slugs).map((slug) => `${basePath}/${slug}`);
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
  return {
    origin,
    paths: [
      "/",
      "/catalog",
      "/categories",
      "/how-to-use",
      "/sitemap.xml",
      ...buildSlugPaths("/server", changedSlugs),
      ...(includeAdmin ? ["/admin"] : []),
    ],
    tags: [CACHE_TAGS.catalogServers],
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
  return {
    origin,
    paths: [
      "/blog",
      "/sitemap.xml",
      ...buildSlugPaths("/blog", slugs),
      ...(includeAdmin ? ["/admin/blog"] : []),
    ],
    tags: [CACHE_TAGS.blogPosts],
  };
}

export function invalidateBlogCaches(input: InvalidateBlogCachesInput): void {
  applyInvalidationPlan(buildBlogInvalidationPlan(input));
}

export function buildAdminDashboardInvalidationPlan(origin: MutationOrigin): CacheInvalidationPlan {
  return {
    origin,
    paths: ["/admin"],
    tags: [CACHE_TAGS.adminDashboard],
  };
}

export function invalidateAdminDashboardCaches(origin: MutationOrigin): void {
  applyInvalidationPlan(buildAdminDashboardInvalidationPlan(origin));
}
