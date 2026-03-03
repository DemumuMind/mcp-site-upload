import { extractBearerToken, validateCronToken } from "@/lib/api/auth-helpers";
import { isSafeHostname, parseServerUrl } from "@/lib/api/network-safety";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerBySlug } from "@/lib/servers";

export const dynamic = "force-dynamic";

const INTERNAL_UI_PROBE_HEADER = "x-demumumind-probe-ui";
const INTERNAL_UI_PROBE_VALUE = "1";

function hasUiProbeHeader(request: NextRequest): boolean {
  return request.headers.get(INTERNAL_UI_PROBE_HEADER)?.trim() === INTERNAL_UI_PROBE_VALUE;
}

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const expectedProbeSecret = process.env.SERVER_PROBE_SECRET?.trim();
  if (expectedProbeSecret) {
    const providedToken = extractBearerToken(request);
    const hasValidBearerToken = Boolean(providedToken && validateCronToken(providedToken, expectedProbeSecret));
    if (!hasValidBearerToken && !hasUiProbeHeader(request)) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  const { slug } = await context.params;
  const server = await getServerBySlug(slug);
  if (!server) {
    return NextResponse.json({ ok: false, error: "Server not found" }, { status: 404 });
  }
  const parsed = parseServerUrl(server.serverUrl);
  if (!parsed) {
    return NextResponse.json({ ok: false, error: "Invalid server URL" }, { status: 400 });
  }
  const safeHostname = await isSafeHostname(parsed.hostname);
  if (!safeHostname) {
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
