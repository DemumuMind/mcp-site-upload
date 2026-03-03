import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

/**
 * Shared SSRF-protection helpers used by health checks, probes, and catalog sync.
 *
 * Consolidated from duplicated logic in:
 *   - app/api/health-check/route.ts
 *   - app/api/server/[slug]/probe/route.ts
 *   - lib/catalog/health.ts
 */

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "0",
  "0.0.0.0",
]);

const BLOCKED_HOSTNAME_SUFFIXES = [".localhost", ".local", ".internal", ".home.arpa"];

/**
 * Strip IPv6 brackets, trailing dots, and lowercase the hostname.
 */
export function normalizeHostname(hostname: string): string {
  const trimmed = hostname.trim().toLowerCase();
  const noBrackets = trimmed.replace(/^\[/, "").replace(/\]$/, "");
  return noBrackets.endsWith(".") ? noBrackets.slice(0, -1) : noBrackets;
}

/**
 * Returns true if the IPv4 address belongs to a private, reserved, or
 * otherwise non-routable range.
 *
 * Covered ranges:
 *   10.0.0.0/8, 127.0.0.0/8, 169.254.0.0/16, 172.16.0.0/12,
 *   192.168.0.0/16, 100.64.0.0/10 (CGNAT), 198.18.0.0/15 (benchmark),
 *   0.0.0.0/8, 224.0.0.0+ (multicast/reserved)
 */
export function isPrivateIpv4(address: string): boolean {
  const octets = address.split(".").map((p) => Number.parseInt(p, 10));
  if (octets.length !== 4 || octets.some((p) => Number.isNaN(p) || p < 0 || p > 255)) {
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

/**
 * Returns true if the IPv6 address is loopback, link-local, ULA, or
 * an IPv4-mapped address pointing to a private IPv4 range.
 */
export function isRestrictedIpv6(address: string): boolean {
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

/**
 * Returns true if the IP address (v4 or v6) is restricted / non-routable.
 * Input is normalized (brackets stripped) before classification.
 */
export function isRestrictedIpAddress(address: string): boolean {
  const normalized = normalizeHostname(address);
  const ipVersion = isIP(normalized);
  if (ipVersion === 4) return isPrivateIpv4(normalized);
  if (ipVersion === 6) return isRestrictedIpv6(normalized);
  return false;
}

/**
 * Returns true if the hostname is on the static blocklist
 * (localhost, .local, .internal, .home.arpa, etc.).
 */
export function isBlockedHostname(hostname: string): boolean {
  const normalized = normalizeHostname(hostname);
  if (!normalized) return true;
  if (BLOCKED_HOSTNAMES.has(normalized)) return true;
  return BLOCKED_HOSTNAME_SUFFIXES.some((suffix) => normalized.endsWith(suffix));
}

/**
 * Returns true if the hostname resolves to a safe (public, routable)
 * address. Checks static blocklist first, then resolves DNS and verifies
 * all returned addresses are non-restricted.
 */
export async function isSafeHostname(hostname: string): Promise<boolean> {
  const normalized = normalizeHostname(hostname);
  if (!normalized) return false;
  if (isBlockedHostname(normalized)) return false;
  if (isIP(normalized)) {
    return !isRestrictedIpAddress(normalized);
  }
  try {
    const resolved = await lookup(normalized, { all: true, verbatim: true });
    if (resolved.length === 0) return false;
    return resolved.every((record) => !isRestrictedIpAddress(record.address));
  } catch {
    return false;
  }
}

/**
 * Parses a raw URL string and returns the URL object if it uses http(s)
 * and has no embedded credentials; null otherwise.
 */
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

/**
 * Full SSRF check: parses the URL, validates protocol/credentials,
 * checks hostname against blocklist, and resolves DNS.
 * Returns true only if the URL is safe to fetch.
 */
export async function isSafeServerUrl(rawUrl: string): Promise<boolean> {
  const parsed = parseServerUrl(rawUrl);
  if (!parsed) return false;
  return isSafeHostname(parsed.hostname);
}
