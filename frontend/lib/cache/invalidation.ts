import { revalidatePath, revalidateTag, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/policy";

type MutationOrigin = "action" | "route";

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

function invalidateTag(tag: string, origin: MutationOrigin): void {
  if (origin === "action") {
    updateTag(tag);
    return;
  }

  revalidateTag(tag, "max");
}

export function invalidateCatalogCaches({
  origin,
  changedSlugs = [],
  includeAdmin = false,
}: InvalidateCatalogCachesInput): void {
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/categories");
  revalidatePath("/how-to-use");
  revalidatePath("/sitemap.xml");

  for (const slug of changedSlugs) {
    revalidatePath(`/server/${slug}`);
  }

  if (includeAdmin) {
    revalidatePath("/admin");
  }

  invalidateTag(CACHE_TAGS.catalogServers, origin);
}

export function invalidateBlogCaches({
  origin,
  slugs = [],
  includeAdmin = false,
}: InvalidateBlogCachesInput): void {
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");

  for (const slug of slugs) {
    revalidatePath(`/blog/${slug}`);
  }

  if (includeAdmin) {
    revalidatePath("/admin/blog");
  }

  invalidateTag(CACHE_TAGS.blogPosts, origin);
}

export function invalidateAdminDashboardCaches(origin: MutationOrigin): void {
  revalidatePath("/admin");
  invalidateTag(CACHE_TAGS.adminDashboard, origin);
}
