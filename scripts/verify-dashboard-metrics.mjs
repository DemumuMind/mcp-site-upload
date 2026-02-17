#!/usr/bin/env node
/**
 * Verify catalog dashboard metrics consistency.
 *
 * Checks:
 * 1) API pagination and aggregate integrity (/api/catalog/search)
 * 2) Catalog page SSR contains expected metric labels/values (/catalog)
 */

const DEFAULT_BASE_URL = "http://localhost:3000";
const FEATURED_LIMIT = 4;
const PAGE_SIZE = 48;

function parseArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}) for ${url}`);
  }
  return res.json();
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}) for ${url}`);
  }
  return res.text();
}

function ensure(condition, message) {
  if (!condition) throw new Error(message);
}

function isGithubRepo(repoUrl) {
  if (!repoUrl) return false;
  try {
    const parsed = new URL(repoUrl);
    return parsed.hostname === "github.com" || parsed.hostname.endsWith(".github.com");
  } catch {
    return String(repoUrl).toLowerCase().includes("github.com/");
  }
}

async function run() {
  const baseUrl = (parseArg("--base-url") ?? process.env.BASE_URL ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
  const firstPageUrl = `${baseUrl}/api/catalog/search?page=1&pageSize=${PAGE_SIZE}`;
  const first = await fetchJson(firstPageUrl);

  ensure(typeof first.total === "number" && first.total >= 0, "API response missing numeric 'total'");
  ensure(typeof first.totalPages === "number" && first.totalPages >= 1, "API response missing numeric 'totalPages'");
  ensure(Array.isArray(first.items), "API response missing 'items' array");

  const allItems = [];
  for (let page = 1; page <= first.totalPages; page += 1) {
    const pageData = page === 1 ? first : await fetchJson(`${baseUrl}/api/catalog/search?page=${page}&pageSize=${PAGE_SIZE}`);
    ensure(Array.isArray(pageData.items), `API page ${page} missing 'items' array`);
    allItems.push(...pageData.items);
  }

  const activeServers = allItems.length;
  const publishedTools = allItems.reduce((sum, item) => sum + (Array.isArray(item.tools) ? item.tools.length : 0), 0);
  const categories = new Set(allItems.map((item) => item.category).filter(Boolean)).size;
  const githubLinked = allItems.reduce((sum, item) => sum + (isGithubRepo(item.repoUrl) ? 1 : 0), 0);
  const githubCoverage = activeServers > 0 ? Math.round((githubLinked / activeServers) * 100) : 0;
  const featured = Math.min(FEATURED_LIMIT, activeServers);

  ensure(first.total === activeServers, `Mismatch: API total=${first.total}, collected=${activeServers}`);
  ensure(first.facets?.categoryEntries?.length === categories, `Mismatch: facets categories=${first.facets?.categoryEntries?.length}, computed=${categories}`);

  const catalogHtml = await fetchText(`${baseUrl}/catalog`);
  const expectedTokens = [
    "Active servers",
    "Published tools",
    "Categories",
    "GitHub linked",
    "GitHub coverage",
    "Featured",
    String(activeServers),
    String(publishedTools),
    String(categories),
    String(githubLinked),
    `${githubCoverage}%`,
    String(featured),
  ];

  for (const token of expectedTokens) {
    ensure(catalogHtml.includes(token), `Catalog page does not include expected token: ${token}`);
  }

  console.log("✅ Dashboard metrics verification passed");
  console.log(
    JSON.stringify(
      {
        baseUrl,
        activeServers,
        publishedTools,
        categories,
        githubLinked,
        githubCoverage: `${githubCoverage}%`,
        featured,
      },
      null,
      2,
    ),
  );
}

run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`❌ Dashboard metrics verification failed: ${message}`);
  process.exit(1);
});

