#!/usr/bin/env node

const DEFAULT_REGISTRY_URL = "https://registry.modelcontextprotocol.io/v0.1/servers";
const DEFAULT_PAGE_LIMIT = 100;
const DEFAULT_MAX_PAGES = 120;
const MAX_PAGE_LIMIT = 100;
const MAX_PAGES = 200;
const MAX_RETRIES = 5;

function parseBoundedInt(raw, fallback, min, max) {
  const parsed = Number.parseInt(String(raw ?? ""), 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(min, Math.min(parsed, max));
}

function parseCliArgs(argv) {
  const result = {
    registryUrl: null,
    limit: null,
    pages: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const nextToken = argv[index + 1];

    if (token === "--url" && nextToken) {
      result.registryUrl = nextToken;
      index += 1;
      continue;
    }

    if (token === "--limit" && nextToken) {
      result.limit = nextToken;
      index += 1;
      continue;
    }

    if (token === "--pages" && nextToken) {
      result.pages = nextToken;
      index += 1;
      continue;
    }
  }

  return result;
}

async function fetchPageWithRetry(url) {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
        headers: {
          accept: "application/json",
        },
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`HTTP ${response.status}: ${body.slice(0, 300)}`);
      }

      return await response.json();
    } catch (error) {
      if (attempt === MAX_RETRIES - 1) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
    }
  }

  throw new Error("Unexpected retry loop exit");
}

function toSafeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSlug(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

async function main() {
  const cli = parseCliArgs(process.argv.slice(2));
  const registryUrl = cli.registryUrl?.trim() || process.env.CATALOG_AUTOSYNC_REGISTRY_URL?.trim() || DEFAULT_REGISTRY_URL;
  const pageLimit = parseBoundedInt(
    cli.limit ?? process.env.CATALOG_AUTOSYNC_PAGE_LIMIT,
    DEFAULT_PAGE_LIMIT,
    1,
    MAX_PAGE_LIMIT,
  );
  const maxPages = parseBoundedInt(
    cli.pages ?? process.env.CATALOG_AUTOSYNC_MAX_PAGES,
    DEFAULT_MAX_PAGES,
    1,
    MAX_PAGES,
  );

  let cursor = null;
  let fetchedPages = 0;
  let fetchedRecords = 0;
  let reachedEnd = false;
  const uniqueSlugs = new Set();
  const officialStatusCounts = new Map();

  for (let pageIndex = 0; pageIndex < maxPages; pageIndex += 1) {
    const requestUrl = new URL(registryUrl);
    requestUrl.searchParams.set("limit", String(pageLimit));
    if (cursor) {
      requestUrl.searchParams.set("cursor", cursor);
    }

    const payload = await fetchPageWithRetry(requestUrl);
    const records = Array.isArray(payload?.servers) ? payload.servers : [];

    fetchedPages += 1;
    fetchedRecords += records.length;

    for (const record of records) {
      const registryName = toSafeString(record?.server?.name);
      if (registryName) {
        uniqueSlugs.add(normalizeSlug(registryName.replace(/\//g, "-")));
      }

      const officialStatus =
        toSafeString(record?._meta?.["io.modelcontextprotocol.registry/official"]?.status).toLowerCase() || "<missing>";
      officialStatusCounts.set(officialStatus, (officialStatusCounts.get(officialStatus) ?? 0) + 1);
    }

    const nextCursor = typeof payload?.metadata?.nextCursor === "string" ? payload.metadata.nextCursor : null;
    if (!nextCursor) {
      reachedEnd = true;
      break;
    }
    cursor = nextCursor;
  }

  const isTruncated = !reachedEnd;

  const sortedStatusEntries = [...officialStatusCounts.entries()].sort((left, right) => right[1] - left[1]);

  console.log("");
  console.log("MCP Registry diagnostics");
  console.log("------------------------");
  console.log(`Registry URL: ${registryUrl}`);
  console.log(`Page limit: ${pageLimit}`);
  console.log(`Max pages: ${maxPages}`);
  console.log(`Fetched pages: ${fetchedPages}`);
  console.log(`Fetched records: ${fetchedRecords}`);
  console.log(`Unique slugs: ${uniqueSlugs.size}`);
  console.log(`Reached end: ${reachedEnd ? "yes" : "no"}`);

  if (isTruncated) {
    console.log(
      "Warning: pagination did not reach the end. Increase CATALOG_AUTOSYNC_MAX_PAGES (or --pages) for full coverage.",
    );
  }

  console.log("");
  console.log("Official status distribution:");
  for (const [status, count] of sortedStatusEntries) {
    console.log(`- ${status}: ${count}`);
  }
}

main().catch((error) => {
  console.error("Registry diagnostics failed:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
