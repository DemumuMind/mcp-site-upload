import { isIP } from "node:net";
import { lookup } from "node:dns/promises";
import { withRequestCachePolicy } from "./cache/policy.ts";

const INTERNAL_UI_PROBE_HEADER = "x-demumumind-probe-ui";
const INTERNAL_UI_PROBE_VALUE = "1";
const REQUEST_TIMEOUT_MS = 8000;

type ServerProbeDeps = {
  expectedProbeSecret: string | null;
  providedBearerToken: string | null;
  hasValidBearerToken: boolean;
  hasUiProbeHeader: boolean;
  slug: string;
  getServerBySlug: (slug: string) => Promise<{ serverUrl: string } | null>;
  fetchImpl?: typeof fetch;
  dnsLookup?: typeof lookup;
  now?: () => number;
};

function isUnsafeIpv4(ipv4: string): boolean {
  if (
    ipv4.startsWith("10.") ||
    ipv4.startsWith("127.") ||
    ipv4.startsWith("192.168.") ||
    ipv4.startsWith("169.254.")
  ) {
    return true;
  }

  const octets = ipv4.split(".").map((chunk) => Number.parseInt(chunk, 10));
  if (octets.length !== 4 || octets.some((chunk) => !Number.isFinite(chunk))) {
    return true;
  }

  const [first, second] = octets;
  return first === 172 && second >= 16 && second <= 31;
}

export function isUnsafeHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local")) return true;
  const ipVersion = isIP(h);
  if (ipVersion === 4 && isUnsafeIpv4(h)) {
    return true;
  }
  if (ipVersion === 6 && (h === "::1" || h.startsWith("fe80:") || h.startsWith("fc") || h.startsWith("fd"))) {
    return true;
  }
  return false;
}

export async function resolvesToUnsafeAddress(
  hostname: string,
  dnsLookup: typeof lookup = lookup,
): Promise<boolean> {
  const normalizedHostname = hostname.trim().toLowerCase();
  if (!normalizedHostname) {
    return true;
  }
  if (isIP(normalizedHostname)) {
    return isUnsafeHost(normalizedHostname);
  }
  try {
    const records = await dnsLookup(normalizedHostname, { all: true, verbatim: true });
    if (records.length === 0) {
      return true;
    }
    return records.some((record) => isUnsafeHost(record.address));
  } catch {
    return true;
  }
}

async function probeUrl(
  targetUrl: URL,
  fetchImpl: typeof fetch,
  now: () => number,
): Promise<{ status: number; body: Record<string, unknown> }> {
  const startedAt = now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetchImpl(
      targetUrl.toString(),
      withRequestCachePolicy("operationalProbe", {
        method: "GET",
        signal: controller.signal,
        redirect: "manual",
        headers: { "user-agent": "demumumind-mcp-connection-test/1.0" },
      }),
    );
    return {
      status: 200,
      body: {
        ok: response.ok,
        status: response.status,
        latencyMs: now() - startedAt,
      },
    };
  } catch (error) {
    return {
      status: 502,
      body: {
        ok: false,
        error: error instanceof Error ? error.message : "Request failed",
        latencyMs: now() - startedAt,
      },
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function executeServerProbe(
  deps: ServerProbeDeps,
): Promise<{ status: number; body: Record<string, unknown> }> {
  if (deps.expectedProbeSecret && !deps.hasValidBearerToken && !deps.hasUiProbeHeader) {
    return {
      status: 401,
      body: { ok: false, error: "Unauthorized" },
    };
  }

  const server = await deps.getServerBySlug(deps.slug);
  if (!server) {
    return {
      status: 404,
      body: { ok: false, error: "Server not found" },
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(server.serverUrl);
  } catch {
    return {
      status: 400,
      body: { ok: false, error: "Invalid server URL" },
    };
  }

  if (!["http:", "https:"].includes(parsed.protocol) || isUnsafeHost(parsed.hostname)) {
    return {
      status: 400,
      body: { ok: false, error: "Unsafe server URL host" },
    };
  }

  const dnsLookup = deps.dnsLookup ?? lookup;
  if (await resolvesToUnsafeAddress(parsed.hostname, dnsLookup)) {
    return {
      status: 400,
      body: { ok: false, error: "Unsafe server URL host" },
    };
  }

  return probeUrl(parsed, deps.fetchImpl ?? fetch, deps.now ?? Date.now);
}

export const SERVER_PROBE_UI_HEADER = INTERNAL_UI_PROBE_HEADER;
export const SERVER_PROBE_UI_VALUE = INTERNAL_UI_PROBE_VALUE;
