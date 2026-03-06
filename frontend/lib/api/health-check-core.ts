import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { withRequestCachePolicy } from "../cache/policy.ts";
import type { HealthStatus } from "@/lib/types";

const blockedHostnames = new Set([
  "localhost",
  "localhost.localdomain",
  "0",
  "0.0.0.0",
]);
const blockedHostnameSuffixes = [".localhost", ".local", ".internal", ".home.arpa"];

export type ActiveServerRow = {
  id: string;
  name: string;
  server_url: string | null;
};

export type HealthProbe = {
  id: string;
  name: string;
  healthStatus: HealthStatus;
  healthError: string | null;
};

export type HealthCheckConfig = {
  requestTimeoutMs: number;
  maxErrorLength: number;
  maxProbeAttempts: number;
  retryDelayMs: number;
  probeConcurrency: number;
  updateConcurrency: number;
};

type HealthCheckDeps = {
  getActiveServers: () => Promise<{ ok: true; data: ActiveServerRow[] } | { ok: false; error: string }>;
  updateServer: (probe: HealthProbe, checkedAt: string, sanitizedError: string | null) => Promise<string | null>;
  fetchImpl?: typeof fetch;
  dnsLookup?: typeof lookup;
  nowIso?: () => string;
  delay?: (ms: number) => Promise<void>;
};

type FetchProbeDeps = {
  fetchImpl: typeof fetch;
  isSafeProbeHostname: (hostname: string) => Promise<boolean>;
  requestTimeoutMs: number;
};

function normalizeHostname(hostname: string): string {
  const trimmed = hostname.trim().toLowerCase();
  const noBrackets = trimmed.replace(/^\[/, "").replace(/\]$/, "");
  return noBrackets.endsWith(".") ? noBrackets.slice(0, -1) : noBrackets;
}

function isPrivateIpv4(address: string): boolean {
  const octets = address.split(".").map((part) => Number.parseInt(part, 10));
  if (octets.length !== 4 || octets.some((part) => Number.isNaN(part) || part < 0 || part > 255)) {
    return true;
  }
  const [first, second] = octets;
  if (first === 10) return true;
  if (first === 127) return true;
  if (first === 169 && second === 254) return true;
  if (first === 172 && second >= 16 && second <= 31) return true;
  if (first === 192 && second === 168) return true;
  if (first === 100 && second >= 64 && second <= 127) return true;
  if (first === 198 && (second === 18 || second === 19)) return true;
  if (first === 0 || first >= 224) return true;
  return false;
}

function isRestrictedIpv6(address: string): boolean {
  const normalized = normalizeHostname(address);
  if (normalized === "::" || normalized === "::1") return true;
  if (normalized.startsWith("fe80:")) return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  if (normalized.startsWith("::ffff:")) {
    const mappedIpv4 = normalized.slice("::ffff:".length);
    return isPrivateIpv4(mappedIpv4);
  }
  return false;
}

export function isRestrictedIpAddress(address: string): boolean {
  const normalized = normalizeHostname(address);
  const ipVersion = isIP(normalized);
  if (ipVersion === 4) return isPrivateIpv4(normalized);
  if (ipVersion === 6) return isRestrictedIpv6(normalized);
  return false;
}

export function classifyHttpStatus(statusCode: number): HealthStatus {
  if (statusCode >= 200 && statusCode < 400) {
    return "healthy";
  }
  if (statusCode >= 400 && statusCode < 500) {
    return "degraded";
  }
  return "down";
}

function toErrorText(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return "Unknown probe error";
}

function isRetryableProbeError(error: unknown): boolean {
  return error instanceof Error && (error.name === "AbortError" || error.name === "TypeError");
}

function isBlockedHostname(hostname: string): boolean {
  const normalized = normalizeHostname(hostname);
  if (!normalized) return true;
  if (blockedHostnames.has(normalized)) return true;
  return blockedHostnameSuffixes.some((suffix) => normalized.endsWith(suffix));
}

export async function isSafeProbeHostname(
  hostname: string,
  dnsLookup: typeof lookup = lookup,
): Promise<boolean> {
  const normalized = normalizeHostname(hostname);
  if (!normalized) return false;
  if (isBlockedHostname(normalized)) return false;
  if (isIP(normalized)) {
    return !isRestrictedIpAddress(normalized);
  }
  try {
    const resolved = await dnsLookup(normalized, { all: true, verbatim: true });
    if (resolved.length === 0) {
      return false;
    }
    return resolved.every((record) => !isRestrictedIpAddress(record.address));
  } catch {
    return false;
  }
}

export function parseServerUrl(rawUrl: string): URL | null {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    if (parsed.username || parsed.password) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function fetchProbe(url: URL, deps: FetchProbeDeps): Promise<Response> {
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), deps.requestTimeoutMs);
  try {
    let currentUrl = new URL(url.toString());
    const maxRedirects = 3;
    for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
      const response = await deps.fetchImpl(
        currentUrl.toString(),
        withRequestCachePolicy("operationalProbe", {
          method: "GET",
          redirect: "manual",
          signal: controller.signal,
          headers: { "user-agent": "demumumind-mcp-health-check/1.0" },
        }),
      );

      const location = response.headers.get("location");
      if (!location || response.status < 300 || response.status >= 400) {
        return response;
      }

      if (redirectCount >= maxRedirects) {
        throw new Error("Too many redirects");
      }

      const nextUrl = new URL(location, currentUrl);
      if (nextUrl.protocol !== "http:" && nextUrl.protocol !== "https:") {
        throw new Error("Unsafe redirect protocol");
      }
      if (nextUrl.username || nextUrl.password) {
        throw new Error("Unsafe redirect credentials");
      }
      const safeRedirectHostname = await deps.isSafeProbeHostname(nextUrl.hostname);
      if (!safeRedirectHostname) {
        throw new Error("Unsafe redirect host");
      }
      currentUrl = nextUrl;
    }

    throw new Error("Probe redirect loop");
  } finally {
    clearTimeout(timeoutHandle);
  }
}

async function mapWithConcurrency<TInput, TOutput>(
  items: readonly TInput[],
  concurrency: number,
  mapper: (item: TInput) => Promise<TOutput>,
): Promise<TOutput[]> {
  if (items.length === 0) return [];
  const boundedConcurrency = Math.max(1, Math.min(concurrency, items.length));
  const results = new Array<TOutput>(items.length);
  let nextIndex = 0;
  async function worker() {
    while (true) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      if (currentIndex >= items.length) return;
      results[currentIndex] = await mapper(items[currentIndex]);
    }
  }
  await Promise.all(Array.from({ length: boundedConcurrency }, () => worker()));
  return results;
}

function sanitizeError(error: string | null, maxErrorLength: number): string | null {
  if (!error) return null;
  return error.length > maxErrorLength ? error.slice(0, maxErrorLength) : error;
}

async function probeServer(
  row: ActiveServerRow,
  config: HealthCheckConfig,
  fetchImpl: typeof fetch,
  dnsLookup: typeof lookup,
  delay: (ms: number) => Promise<void>,
): Promise<HealthProbe> {
  const serverUrl = row.server_url?.trim();
  if (!serverUrl) {
    return { id: row.id, name: row.name, healthStatus: "unknown", healthError: "Missing server URL" };
  }
  const parsedServerUrl = parseServerUrl(serverUrl);
  if (!parsedServerUrl) {
    return { id: row.id, name: row.name, healthStatus: "unknown", healthError: "Invalid server URL" };
  }
  const safeHostname = await isSafeProbeHostname(parsedServerUrl.hostname, dnsLookup);
  if (!safeHostname) {
    return { id: row.id, name: row.name, healthStatus: "unknown", healthError: "Unsafe server URL host" };
  }
  let lastError: string | null = null;
  for (let attempt = 1; attempt <= config.maxProbeAttempts; attempt += 1) {
    try {
      const response = await fetchProbe(parsedServerUrl, {
        fetchImpl,
        isSafeProbeHostname: (hostname) => isSafeProbeHostname(hostname, dnsLookup),
        requestTimeoutMs: config.requestTimeoutMs,
      });
      if (response.ok) {
        return { id: row.id, name: row.name, healthStatus: classifyHttpStatus(response.status), healthError: null };
      }
      const statusHealth = classifyHttpStatus(response.status);
      const statusError = `HTTP ${response.status}`;
      if (response.status >= 500 && attempt < config.maxProbeAttempts) {
        lastError = statusError;
        await delay(config.retryDelayMs * attempt);
        continue;
      }
      return { id: row.id, name: row.name, healthStatus: statusHealth, healthError: statusError };
    } catch (error) {
      lastError = toErrorText(error);
      if (attempt < config.maxProbeAttempts && isRetryableProbeError(error)) {
        await delay(config.retryDelayMs * attempt);
        continue;
      }
      return { id: row.id, name: row.name, healthStatus: "unknown", healthError: lastError };
    }
  }
  return { id: row.id, name: row.name, healthStatus: "unknown", healthError: lastError || "Unknown probe error" };
}

export async function executeHealthCheck(
  config: HealthCheckConfig,
  deps: HealthCheckDeps,
): Promise<{ status: number; body: Record<string, unknown> }> {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const dnsLookup = deps.dnsLookup ?? lookup;
  const nowIso = deps.nowIso ?? (() => new Date().toISOString());
  const delay = deps.delay ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));

  const activeServersResult = await deps.getActiveServers();
  if (!activeServersResult.ok) {
    return {
      status: 500,
      body: {
        ok: false,
        error: activeServersResult.error,
      },
    };
  }

  const activeServers = activeServersResult.data;
  if (activeServers.length === 0) {
    return {
      status: 200,
      body: {
        ok: true,
        checkedAt: nowIso(),
        total: 0,
        summary: { healthy: 0, degraded: 0, down: 0, unknown: 0 },
        updateErrors: [],
      },
    };
  }

  const probeResults = await mapWithConcurrency(activeServers, config.probeConcurrency, async (row) =>
    probeServer(row, config, fetchImpl, dnsLookup, delay),
  );
  const checkedAt = nowIso();
  const summary: Record<HealthStatus, number> = { healthy: 0, degraded: 0, down: 0, unknown: 0 };
  for (const result of probeResults) {
    summary[result.healthStatus] += 1;
  }

  const updateErrors = (
    await mapWithConcurrency(probeResults, config.updateConcurrency, async (result) =>
      deps.updateServer(result, checkedAt, sanitizeError(result.healthError, config.maxErrorLength)),
    )
  ).filter((value): value is string => value !== null);

  return {
    status: 200,
    body: {
      ok: updateErrors.length === 0,
      checkedAt,
      total: probeResults.length,
      summary,
      updateErrors,
    },
  };
}
