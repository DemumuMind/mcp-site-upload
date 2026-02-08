#!/usr/bin/env node

const argBaseUrl = process.argv[2];
const baseUrlInput = argBaseUrl || process.env.SMOKE_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL;
const allowProtectedMode = String(process.env.SMOKE_ALLOW_PROTECTED || "false").toLowerCase() === "true";

if (!baseUrlInput) {
  console.error(
    "Missing base URL. Usage: npm run smoke:check -- https://your-domain or set SMOKE_BASE_URL",
  );
  process.exit(1);
}

const baseUrl = baseUrlInput.replace(/\/+$/, "");
const healthToken = process.env.SMOKE_HEALTH_TOKEN || process.env.HEALTH_CHECK_CRON_SECRET;

const failures = [];
const protectedStatusAllowed = allowProtectedMode ? [200, 401] : [200];

function buildUrl(pathname) {
  return `${baseUrl}${pathname}`;
}

function logPass(message) {
  console.log(`PASS: ${message}`);
}

function logFail(message) {
  console.error(`FAIL: ${message}`);
  failures.push(message);
}

async function request(pathname, options = {}) {
  const url = buildUrl(pathname);
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "user-agent": "demumumind-mcp-smoke-check/1.0",
      ...(options.headers || {}),
    },
    method: options.method || "GET",
  });

  return response;
}

async function assertStatus(pathname, expectedStatuses, options = {}) {
  try {
    const response = await request(pathname, options);
    if (expectedStatuses.includes(response.status)) {
      logPass(`${pathname} -> ${response.status}`);
      return response;
    }

    logFail(`${pathname} expected ${expectedStatuses.join("/")} got ${response.status}`);
    return response;
  } catch (error) {
    logFail(`${pathname} request failed: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

async function checkCorePages() {
  await assertStatus("/", protectedStatusAllowed);

  const sitemapResponse = await assertStatus("/sitemap.xml", protectedStatusAllowed);
  if (sitemapResponse) {
    if (allowProtectedMode && sitemapResponse.status === 401) {
      console.log("INFO: /sitemap.xml is protected (401); skipping XML content assertions");
    } else {
    const sitemapText = await sitemapResponse.text();
    if (sitemapText.includes("<urlset")) {
      logPass("/sitemap.xml contains <urlset>");
    } else {
      logFail("/sitemap.xml missing <urlset>");
    }

    const serverMatch = sitemapText.match(/<loc>([^<]*\/server\/[^<]+)<\/loc>/);
    if (serverMatch?.[1]) {
      const serverUrl = new URL(serverMatch[1]);
      await assertStatus(serverUrl.pathname, [200]);
    } else {
      console.log("INFO: no /server/[slug] URL found in sitemap; skipping server page check");
    }
    }
  }

  const robotsResponse = await assertStatus("/robots.txt", protectedStatusAllowed);
  if (robotsResponse) {
    if (allowProtectedMode && robotsResponse.status === 401) {
      console.log("INFO: /robots.txt is protected (401); skipping robots content assertions");
    } else {
    const robotsText = await robotsResponse.text();
    if (robotsText.toLowerCase().includes("sitemap:")) {
      logPass("/robots.txt includes sitemap");
    } else {
      logFail("/robots.txt missing sitemap entry");
    }
    }
  }
}

async function checkHealthEndpoint() {
  const unauthorizedExpectedStatuses = allowProtectedMode ? [401, 500, 404] : [401, 500];
  await assertStatus("/api/health-check", unauthorizedExpectedStatuses);

  if (!healthToken) {
    console.log(
      "INFO: SMOKE_HEALTH_TOKEN/HEALTH_CHECK_CRON_SECRET not set; skipping authorized /api/health-check probe",
    );
    return;
  }

  const authorizedExpectedStatuses = allowProtectedMode ? [200, 401, 404] : [200];
  const response = await assertStatus("/api/health-check", authorizedExpectedStatuses, {
    method: "POST",
    headers: {
      authorization: `Bearer ${healthToken}`,
    },
  });

  if (!response) {
    return;
  }

  try {
    const payload = await response.json();
    if (typeof payload === "object" && payload !== null && "summary" in payload) {
      logPass("/api/health-check returned JSON summary");
    } else {
      logFail("/api/health-check response missing expected summary field");
    }
  } catch (error) {
    if (allowProtectedMode && (response.status === 401 || response.status === 404)) {
      console.log(
        "INFO: Authorized health probe did not reach app route in protected mode; skipping JSON assertions",
      );
      return;
    }

    logFail(
      `/api/health-check JSON parse failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

async function main() {
  console.log(`Running smoke checks against ${baseUrl}`);
  if (allowProtectedMode) {
    console.log("INFO: SMOKE_ALLOW_PROTECTED=true (401 responses may be accepted for protected routes)");
  }
  await checkCorePages();
  await checkHealthEndpoint();

  if (failures.length > 0) {
    console.error(`\nSmoke check failed (${failures.length} issue(s)).`);
    process.exit(1);
  }

  console.log("\nSmoke check passed.");
}

main().catch((error) => {
  console.error(`Unhandled smoke-check error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
