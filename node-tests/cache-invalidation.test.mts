import assert from "node:assert/strict";
import test from "node:test";

import {
  applyInvalidationPlan,
  buildAdminDashboardInvalidationPlan,
  buildBlogInvalidationPlan,
  buildCatalogInvalidationPlan,
} from "../frontend/lib/cache/invalidation.ts";

test("catalog invalidation plan covers catalog pages, changed server slugs, and admin optionally", () => {
  const plan = buildCatalogInvalidationPlan({
    origin: "route",
    changedSlugs: [" github ", "postgres", "github", ""],
    includeAdmin: true,
  });

  assert.deepEqual(plan, {
    origin: "route",
    paths: [
      "/",
      "/catalog",
      "/categories",
      "/how-to-use",
      "/sitemap.xml",
      "/server/github",
      "/server/postgres",
      "/admin",
    ],
    tags: ["catalog-servers"],
  });
});

test("blog invalidation plan covers listing, sitemap, changed posts, and admin optionally", () => {
  const plan = buildBlogInvalidationPlan({
    origin: "action",
    slugs: ["alpha", " beta ", "alpha"],
    includeAdmin: true,
  });

  assert.deepEqual(plan, {
    origin: "action",
    paths: [
      "/blog",
      "/sitemap.xml",
      "/blog/alpha",
      "/blog/beta",
      "/admin/blog",
    ],
    tags: ["blog-posts"],
  });
});

test("admin dashboard invalidation plan is minimal and deterministic", () => {
  assert.deepEqual(buildAdminDashboardInvalidationPlan("route"), {
    origin: "route",
    paths: ["/admin"],
    tags: ["admin-dashboard"],
  });
});

test("route-origin invalidation revalidates unique paths and tags", () => {
  const revalidatedPaths: string[] = [];
  const revalidatedTags: Array<[string, "max"]> = [];
  const updatedTags: string[] = [];

  applyInvalidationPlan(
    {
      origin: "route",
      paths: ["/catalog", "/catalog", "/server/github"],
      tags: ["catalog-servers", "catalog-servers"],
    },
    {
      revalidatePath: (path) => revalidatedPaths.push(path),
      revalidateTag: (tag, profile) => revalidatedTags.push([tag, profile]),
      updateTag: (tag) => updatedTags.push(tag),
    },
  );

  assert.deepEqual(revalidatedPaths, ["/catalog", "/server/github"]);
  assert.deepEqual(revalidatedTags, [["catalog-servers", "max"]]);
  assert.deepEqual(updatedTags, []);
});

test("action-origin invalidation updates tags instead of revalidating tags", () => {
  const revalidatedPaths: string[] = [];
  const revalidatedTags: Array<[string, "max"]> = [];
  const updatedTags: string[] = [];

  applyInvalidationPlan(
    {
      origin: "action",
      paths: ["/blog", "/blog"],
      tags: ["blog-posts", "blog-posts"],
    },
    {
      revalidatePath: (path) => revalidatedPaths.push(path),
      revalidateTag: (tag, profile) => revalidatedTags.push([tag, profile]),
      updateTag: (tag) => updatedTags.push(tag),
    },
  );

  assert.deepEqual(revalidatedPaths, ["/blog"]);
  assert.deepEqual(revalidatedTags, []);
  assert.deepEqual(updatedTags, ["blog-posts"]);
});
