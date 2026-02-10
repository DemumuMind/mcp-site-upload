#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const args = parseArgs(process.argv.slice(2));
const jsonOutput = args.json === true;
const manifestPath = path.resolve(
  args.manifest || process.env.BACKUP_MANIFEST_PATH || "ops/backup-manifest.json",
);
const maxAgeHours = parsePositiveNumber(
  args["max-age-hours"] || process.env.BACKUP_MAX_AGE_HOURS || "26",
  26,
);
const preferredMethod = normalizeMethod(
  args.method || process.env.BACKUP_REMOTE_CHECK_METHOD || "auto",
);
const region =
  args.region ||
  process.env.BACKUP_REMOTE_S3_REGION ||
  process.env.AWS_REGION ||
  process.env.AWS_DEFAULT_REGION ||
  "us-east-1";
const authHeaderRaw = args["auth-header"] || process.env.BACKUP_REMOTE_AUTH_HEADER || "";
const bearerToken = args["bearer-token"] || process.env.BACKUP_REMOTE_BEARER_TOKEN || "";

const warnings = [];
const failures = [];
const checks = [];
const triedEndpoints = [];
const now = Date.now();

let location = String(args.location || process.env.BACKUP_REMOTE_CHECK_URL || "").trim();

if (!location && fs.existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    location = typeof manifest.backupLocation === "string" ? manifest.backupLocation.trim() : "";
  } catch (error) {
    warnings.push(
      `Could not parse backup manifest (${manifestPath}): ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

if (!location) {
  failures.push(
    "Backup location is not provided. Set --location or BACKUP_REMOTE_CHECK_URL, or keep backupLocation in manifest.",
  );
  finish();
}

const headers = buildHeaders(authHeaderRaw, bearerToken, warnings);
const s3 = parseS3Location(location);

let artifact = null;

if (s3 && (preferredMethod === "auto" || preferredMethod === "aws-cli")) {
  const cliProbe = probeViaAwsCli(s3.bucket, s3.key, region);
  checks.push({
    name: "AWS CLI probe",
    ok: cliProbe.ok,
    details: cliProbe.details,
  });

  if (cliProbe.ok) {
    artifact = {
      method: "aws-cli",
      endpoint: `s3://${s3.bucket}/${s3.key}`,
      statusCode: 200,
      lastModified: cliProbe.lastModified,
      contentLength: cliProbe.contentLength,
    };
  } else {
    warnings.push(cliProbe.details);
  }
}

if (!artifact && (preferredMethod === "auto" || preferredMethod === "http")) {
  const candidates = s3
    ? buildS3HttpCandidates(s3.bucket, s3.key, region)
    : [location];

  for (const endpoint of candidates) {
    const response = await probeViaHttpHead(endpoint, headers);
    triedEndpoints.push({
      endpoint,
      statusCode: response.statusCode,
      ok: response.ok,
      error: response.error || null,
    });

    if (response.ok) {
      artifact = {
        method: "http-head",
        endpoint,
        statusCode: response.statusCode,
        lastModified: response.lastModified,
        contentLength: response.contentLength,
      };
      break;
    }
  }
}

if (!artifact) {
  failures.push("Could not access backup artifact via configured methods.");
  if (triedEndpoints.length > 0) {
    failures.push(
      `Tried endpoints: ${triedEndpoints
        .map((item) => `${item.endpoint} -> ${item.statusCode ?? "ERR"}`)
        .join(" | ")}`,
    );
  }
  finish();
}

checks.push({
  name: "Artifact reachable",
  ok: true,
  details: `${artifact.method} ${artifact.endpoint} status=${artifact.statusCode}`,
});

const parsedLastModified = parseDate(artifact.lastModified);
if (!parsedLastModified) {
  failures.push("Artifact Last-Modified timestamp is missing or invalid.");
} else {
  const ageHours = (now - parsedLastModified.getTime()) / (1000 * 60 * 60);
  const freshEnough = ageHours <= maxAgeHours;

  checks.push({
    name: "Artifact freshness",
    ok: freshEnough,
    details: `age=${ageHours.toFixed(2)}h max=${maxAgeHours}h lastModified=${parsedLastModified.toISOString()}`,
  });

  if (!freshEnough) {
    failures.push(`Backup artifact is too old: ${ageHours.toFixed(2)}h > ${maxAgeHours}h.`);
  }
}

if (artifact.contentLength === null || !Number.isFinite(artifact.contentLength)) {
  warnings.push("Content-Length is unavailable for artifact response.");
} else if (artifact.contentLength <= 0) {
  failures.push(`Content-Length is not positive: ${artifact.contentLength}.`);
} else {
  checks.push({
    name: "Artifact size",
    ok: true,
    details: `${artifact.contentLength} bytes`,
  });
}

finish({
  location,
  method: artifact.method,
  endpoint: artifact.endpoint,
  statusCode: artifact.statusCode,
  lastModified: artifact.lastModified || null,
  contentLength: artifact.contentLength,
  triedEndpoints,
});

function finish(extra = {}) {
  const report = {
    checkedAt: new Date().toISOString(),
    manifestPath,
    location,
    preferredMethod,
    maxAgeHours,
    region,
    ok: failures.length === 0,
    failures,
    warnings,
    checks,
    ...extra,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`Remote backup verification for ${location}`);
    for (const check of checks) {
      const marker = check.ok ? "PASS" : "FAIL";
      console.log(`${marker} ${check.name}: ${check.details}`);
    }
    for (const warning of warnings) {
      console.log(`WARN ${warning}`);
    }
    for (const failure of failures) {
      console.error(`FAIL ${failure}`);
    }
    console.log(
      `Summary: ${checks.filter((item) => item.ok).length}/${checks.length} checks passed, ${failures.length} failure(s).`,
    );
  }

  process.exit(failures.length === 0 ? 0 : 1);
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

function parsePositiveNumber(value, fallback) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function normalizeMethod(value) {
  const normalized = String(value || "auto").trim().toLowerCase();
  if (normalized === "http" || normalized === "aws-cli" || normalized === "auto") {
    return normalized;
  }
  return "auto";
}

function parseS3Location(value) {
  const match = String(value).trim().match(/^s3:\/\/([^/]+)\/(.+)$/i);
  if (!match) {
    return null;
  }

  return {
    bucket: match[1],
    key: match[2],
  };
}

function encodeS3Key(key) {
  return key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function buildS3HttpCandidates(bucket, key, region) {
  const encodedKey = encodeS3Key(key);
  const candidates = new Set();

  candidates.add(`https://${bucket}.s3.amazonaws.com/${encodedKey}`);
  candidates.add(`https://s3.amazonaws.com/${bucket}/${encodedKey}`);

  if (region) {
    candidates.add(`https://${bucket}.s3.${region}.amazonaws.com/${encodedKey}`);
    candidates.add(`https://s3.${region}.amazonaws.com/${bucket}/${encodedKey}`);
  }

  return [...candidates];
}

function buildHeaders(authHeaderRawValue, bearer, warningList) {
  const headers = {
    "user-agent": "demumumind-mcp-backup-verify-remote/1.0",
  };

  if (bearer) {
    headers.authorization = `Bearer ${bearer}`;
  }

  if (!authHeaderRawValue) {
    return headers;
  }

  const splitIndex = authHeaderRawValue.indexOf(":");
  if (splitIndex <= 0) {
    warningList.push(
      "BACKUP_REMOTE_AUTH_HEADER must be formatted as 'Header-Name: value'. Header was ignored.",
    );
    return headers;
  }

  const name = authHeaderRawValue.slice(0, splitIndex).trim();
  const value = authHeaderRawValue.slice(splitIndex + 1).trim();

  if (!name || !value) {
    warningList.push(
      "BACKUP_REMOTE_AUTH_HEADER is incomplete. Header was ignored.",
    );
    return headers;
  }

  headers[name.toLowerCase()] = value;
  return headers;
}

async function probeViaHttpHead(endpoint, headers) {
  try {
    const response = await fetch(endpoint, {
      method: "HEAD",
      redirect: "manual",
      headers,
    });

    const contentLengthRaw = response.headers.get("content-length");
    const contentLength = contentLengthRaw ? Number(contentLengthRaw) : null;

    return {
      ok: response.status >= 200 && response.status < 300,
      statusCode: response.status,
      lastModified: response.headers.get("last-modified"),
      contentLength: Number.isFinite(contentLength) ? contentLength : null,
      error: null,
    };
  } catch (error) {
    return {
      ok: false,
      statusCode: null,
      lastModified: null,
      contentLength: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function probeViaAwsCli(bucket, key, region) {
  try {
    const cliArgs = ["s3api", "head-object", "--bucket", bucket, "--key", key, "--output", "json"];
    if (region) {
      cliArgs.push("--region", region);
    }

    const stdout = execFileSync("aws", cliArgs, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    const payload = JSON.parse(stdout);
    const contentLength = Number(payload.ContentLength);

    return {
      ok: true,
      details: `aws s3api head-object succeeded for s3://${bucket}/${key}`,
      lastModified: payload.LastModified || null,
      contentLength: Number.isFinite(contentLength) ? contentLength : null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      details: `aws s3api head-object failed: ${message}`,
      lastModified: null,
      contentLength: null,
    };
  }
}

function parseDate(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}
