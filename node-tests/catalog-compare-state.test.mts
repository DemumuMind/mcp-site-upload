import assert from "node:assert/strict";
import test from "node:test";

import * as compareModule from "../frontend/lib/catalog/compare.ts";

const {
  buildCatalogCompareItems,
  createCatalogShortlistItem,
  getCatalogCompareSupportCopy,
  normalizeCatalogShortlistItem,
  shouldEnableCatalogCompare,
} = compareModule;

test("normalizes legacy shortlist entries for compare state", () => {
  const normalized = normalizeCatalogShortlistItem({
    slug: "legacy-server",
    name: "Legacy Server",
    href: "/server/legacy-server",
    description: "Legacy shortlist shape without compare metadata",
    category: "Developer Tools",
    authType: "none",
    verificationLevel: "community",
    toolsCount: 3,
  });

  assert.ok(normalized);
  assert.equal(normalized?.healthStatus, "unknown");
  assert.equal(normalized?.repoUrl, undefined);
  assert.deepEqual(normalized?.tags, []);
});

test("ranks shortlist items for trust plus fit compare state", () => {
  const shortlist = [
    createCatalogShortlistItem({
      id: "a11y",
      name: "A11y MCP Tools",
      slug: "a11y-mcp-tools",
      description: "Accessibility evidence capture and diagnosis",
      serverUrl: "https://example.com/a11y",
      category: "Developer Tools",
      authType: "none",
      tags: ["accessibility", "developer-tools"],
      repoUrl: "https://github.com/example/a11y",
      status: "active",
      verificationLevel: "official",
      healthStatus: "healthy",
      tools: ["scan", "audit", "report", "capture", "diff"],
    }),
    createCatalogShortlistItem({
      id: "memory",
      name: "0gmem",
      slug: "0gmem",
      description: "Long-term memory retrieval for agent workflows",
      serverUrl: "https://example.com/0gmem",
      category: "Search",
      authType: "none",
      tags: ["memory", "search"],
      status: "active",
      verificationLevel: "community",
      healthStatus: "healthy",
      tools: ["retrieve", "memorize", "score", "hydrate"],
    }),
    createCatalogShortlistItem({
      id: "adguard",
      name: "Adguard Home",
      slug: "adguard-home",
      description: "AdGuard Home REST API for infrastructure operations",
      serverUrl: "https://example.com/adguard",
      category: "Developer Tools",
      authType: "api_key",
      tags: ["infra", "operations"],
      repoUrl: "https://github.com/example/adguard",
      status: "active",
      verificationLevel: "community",
      healthStatus: "unknown",
      tools: ["dns", "blocklists", "stats", "clients", "rules"],
    }),
  ];

  const compareItems = buildCatalogCompareItems(shortlist);

  assert.deepEqual(compareItems.map((item) => item.slug), [
    "a11y-mcp-tools",
    "0gmem",
    "adguard-home",
  ]);
  assert.equal(compareItems[0]?.verdict, "Best overall");
  assert.equal(compareItems[0]?.bestUse, "Quick adoption");
  assert.equal(compareItems[1]?.bestUse, "Long memory");
  assert.equal(compareItems[2]?.verdict, "Needs setup");
  assert.equal(compareItems[2]?.bestUse, "Infra control");
  assert.ok(compareItems[0].compareScore > compareItems[1].compareScore);
  assert.ok(compareItems[1].compareScore > compareItems[2].compareScore);
  assert.equal(shouldEnableCatalogCompare(shortlist), true);
  assert.equal(shouldEnableCatalogCompare(shortlist.slice(0, 1)), false);
});

test("returns compact support copy for compare layouts", () => {
  const supportCopy = getCatalogCompareSupportCopy(false);
  const narrowedCopy = getCatalogCompareSupportCopy(true);

  assert.equal(supportCopy.featuredEyebrow, "Featured picks");
  assert.equal(supportCopy.featuredTitle, "Start here");
  assert.equal(
    supportCopy.featuredDescription,
    "Start with proven anchors, then branch into narrower fits from the workspace filters.",
  );
  assert.equal(supportCopy.shortlistEyebrow, "Shortlist");
  assert.equal(supportCopy.shortlistTitle, "Shortlist");
  assert.equal(
    supportCopy.shortlistDescription,
    "Save servers to compare them later.",
  );
  assert.equal(
    narrowedCopy.featuredDescription,
    "Keep one high-trust server in view while narrowing the result set.",
  );
});
