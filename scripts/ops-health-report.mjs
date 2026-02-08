#!/usr/bin/env node

const args = parseArgs(process.argv.slice(2));
const baseUrlInput =
  args["base-url"] || process.env.SMOKE_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL;
const jsonOutput = args.json === true;
const healthToken =
  args["health-token"] || process.env.SMOKE_HEALTH_TOKEN || process.env.HEALTH_CHECK_CRON_SECRET;

if (!baseUrlInput) {
  printAndExit("Missing base URL. Use --base-url or set SMOKE_BASE_URL/NEXT_PUBLIC_SITE_URL.", 1);
}

const baseUrl = baseUrlInput.replace(/\/+$/, "");

async function run() {
  const checks = [];
  checks.push(await checkEndpoint("/", [200], "Home page"));
  checks.push(await checkEndpoint("/sitemap.xml", [200], "Sitemap"));
  checks.push(await checkEndpoint("/robots.txt", [200], "Robots"));
  checks.push(
    await checkEndpoint("/api/health-check", [401, 500], "Health check unauthorized contract"),
  );

  if (healthToken) {
    checks.push(
      await checkEndpoint("/api/health-check", [200], "Health check authorized probe", {
        method: "POST",
        headers: {
          authorization: `Bearer ${healthToken}`,
        },
      }),
    );
  }

  const failedChecks = checks.filter((check) => !check.ok);
  const report = {
    checkedAt: new Date().toISOString(),
    baseUrl,
    total: checks.length,
    failed: failedChecks.length,
    ok: failedChecks.length === 0,
    checks,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`Health report for ${baseUrl}`);
    for (const check of checks) {
      const statusPart = check.status === null ? "n/a" : String(check.status);
      const marker = check.ok ? "PASS" : "FAIL";
      console.log(`${marker} ${check.name} (${check.path}) status=${statusPart} durationMs=${check.durationMs}`);
      if (check.error) {
        console.log(`  error: ${check.error}`);
      }
    }
    console.log(`Summary: ${report.total - report.failed}/${report.total} checks passed.`);
  }

  process.exit(report.ok ? 0 : 1);
}

run().catch((error) => {
  printAndExit(
    `Unhandled ops-health-report error: ${error instanceof Error ? error.message : String(error)}`,
    1,
  );
});

async function checkEndpoint(path, expectedStatuses, name, options = {}) {
  const startedAt = Date.now();

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: options.method || "GET",
      redirect: "follow",
      headers: {
        "user-agent": "demumumind-mcp-ops-health-report/1.0",
        ...(options.headers || {}),
      },
    });

    const durationMs = Date.now() - startedAt;
    const ok = expectedStatuses.includes(response.status);

    return {
      name,
      path,
      status: response.status,
      expectedStatuses,
      durationMs,
      ok,
      error: ok ? null : `Expected ${expectedStatuses.join("/")} got ${response.status}`,
    };
  } catch (error) {
    return {
      name,
      path,
      status: null,
      expectedStatuses,
      durationMs: Date.now() - startedAt,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];

    if (!next || next.startsWith("--")) {
      parsed[key] = true;
      continue;
    }

    parsed[key] = next;
    index += 1;
  }

  return parsed;
}

function printAndExit(message, code) {
  if (code === 0) {
    console.log(message);
  } else {
    console.error(message);
  }
  process.exit(code);
}
