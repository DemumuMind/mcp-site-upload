import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { extractBearerToken, validateCronToken } from "@/lib/api/auth-helpers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerBySlug } from "@/lib/servers";

export const dynamic = "force-dynamic";

function isUnsafeHost(hostname: string): boolean {
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

async function resolvesToUnsafeAddress(hostname: string): Promise<boolean> {
  const normalizedHostname = hostname.trim().toLowerCase();
  if (!normalizedHostname) {
    return true;
  }
  if (isIP(normalizedHostname)) {
    return isUnsafeHost(normalizedHostname);
  }
  try {
    const records = await lookup(normalizedHostname, { all: true, verbatim: true });
    if (records.length === 0) {
      return true;
    }
    return records.some((record) => isUnsafeHost(record.address));
  } catch {
    return true;
  }
}

function isUnsafeIpv4(ipv4: string): boolean {
  if (ipv4.startsWith("10.") || ipv4.startsWith("127.") || ipv4.startsWith("192.168.") || ipv4.startsWith("169.254.")) {
    return true;
  }

  const octets = ipv4.split(".").map((chunk) => Number.parseInt(chunk, 10));
  if (octets.length !== 4 || octets.some((chunk) => !Number.isFinite(chunk))) {
    return true;
  }

  const [first, second] = octets;
  return first === 172 && second >= 16 && second <= 31;
}

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const expectedProbeSecret = process.env.SERVER_PROBE_SECRET?.trim();
  if (expectedProbeSecret) {
    const providedToken = extractBearerToken(request);
    if (!providedToken || !validateCronToken(providedToken, expectedProbeSecret)) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  const { slug } = await context.params;
  const server = await getServerBySlug(slug);
  if (!server) {
    return NextResponse.json({ ok: false, error: "Server not found" }, { status: 404 });
  }
  let parsed: URL;
  try {
    parsed = new URL(server.serverUrl);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid server URL" }, { status: 400 });
  }
  if (!["http:", "https:"].includes(parsed.protocol) || isUnsafeHost(parsed.hostname)) {
    return NextResponse.json({ ok: false, error: "Unsafe server URL host" }, { status: 400 });
  }
  if (await resolvesToUnsafeAddress(parsed.hostname)) {
    return NextResponse.json({ ok: false, error: "Unsafe server URL host" }, { status: 400 });
  }

  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(parsed.toString(), {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
      redirect: "manual",
      headers: { "user-agent": "demumumind-mcp-connection-test/1.0" },
    });
    return NextResponse.json({
      ok: response.ok,
      status: response.status,
      latencyMs: Date.now() - startedAt,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Request failed",
        latencyMs: Date.now() - startedAt,
      },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
