#!/usr/bin/env node

const DEFAULT_SEARCH_PATH = "/api/catalog/search?page=1&pageSize=1";
const DEFAULT_MIN_TOTAL = 1000;
const DEFAULT_TIMEOUT_MS = 12000;

function parseBoundedInt(raw, fallback, min, max) {
  const parsed = Number.parseInt(String(raw ?? ""), 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(min, Math.min(parsed, max));
}

function parseCliArgs(argv) {
  const output = {
    baseUrl: null,
    minTotal: null,
    searchPath: null,
    timeoutMs: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const nextToken = argv[index + 1];

    if (token === "--base-url" && nextToken) {
      output.baseUrl = nextToken;
      index += 1;
      continue;
    }

    if (token === "--min-total" && nextToken) {
      output.minTotal = nextToken;
      index += 1;
      continue;
    }

    if (token === "--path" && nextToken) {
      output.searchPath = nextToken;
      index += 1;
      continue;
    }

    if (token === "--timeout-ms" && nextToken) {
      output.timeoutMs = nextToken;
      index += 1;
      continue;
    }
  }

  return output;
}

function normalizeBaseUrl(rawValue) {
  const candidate = String(rawValue ?? "").trim();
  if (!candidate) {
    return null;
  }
  return candidate.replace(/\/+$/, "");
}

async function fetchCatalogSearch(url, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        accept: "application/json",
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const cli = parseCliArgs(process.argv.slice(2));
  const baseUrl = normalizeBaseUrl(cli.baseUrl ?? process.env.SMOKE_BASE_URL);
  const minTotal = parseBoundedInt(cli.minTotal ?? process.env.CATALOG_GUARD_MIN_TOTAL, DEFAULT_MIN_TOTAL, 1, 1_000_000);
  const searchPath = String(cli.searchPath ?? process.env.CATALOG_GUARD_SEARCH_PATH ?? DEFAULT_SEARCH_PATH).trim() || DEFAULT_SEARCH_PATH;
  const timeoutMs = parseBoundedInt(cli.timeoutMs ?? process.env.CATALOG_GUARD_TIMEOUT_MS, DEFAULT_TIMEOUT_MS, 1000, 120000);

  if (!baseUrl) {
    throw new Error("Missing base URL. Pass --base-url or set SMOKE_BASE_URL.");
  }

  const requestUrl = new URL(searchPath.startsWith("/") ? `${baseUrl}${searchPath}` : `${baseUrl}/${searchPath}`);
  const response = await fetchCatalogSearch(requestUrl, timeoutMs);
  const responseBody = await response.text();

  if (!response.ok) {
    throw new Error(`Catalog API request failed (${response.status}): ${responseBody.slice(0, 400)}`);
  }

  let payload;
  try {
    payload = JSON.parse(responseBody);
  } catch (error) {
    throw new Error(`Catalog API returned invalid JSON: ${(error instanceof Error ? error.message : String(error))}`);
  }

  const total = Number(payload?.total);
  if (!Number.isFinite(total)) {
    throw new Error("Catalog API response does not include numeric 'total'.");
  }

  console.log("Catalog count guard");
  console.log("-------------------");
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Endpoint: ${requestUrl.pathname}${requestUrl.search}`);
  console.log(`Observed total: ${total}`);
  console.log(`Required minimum: ${minTotal}`);

  if (total < minTotal) {
    throw new Error(
      `Catalog total (${total}) is below minimum threshold (${minTotal}). Check Supabase env, autosync health, and registry ingestion.`,
    );
  }

  console.log("Result: PASS");
}

main().catch((error) => {
  console.error("Catalog count guard failed:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
