import { extractBearerToken, validateCronToken } from "@/lib/api/auth-helpers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerBySlug } from "@/lib/servers";
import { executeServerProbe, SERVER_PROBE_UI_HEADER, SERVER_PROBE_UI_VALUE } from "@/lib/server-probe-core";

export const dynamic = "force-dynamic";

function hasUiProbeHeader(request: NextRequest): boolean {
  return request.headers.get(SERVER_PROBE_UI_HEADER)?.trim() === SERVER_PROBE_UI_VALUE;
}

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const expectedProbeSecret = process.env.SERVER_PROBE_SECRET?.trim() || null;
  const providedToken = extractBearerToken(request);
  const hasValidBearerToken = Boolean(
    expectedProbeSecret && providedToken && validateCronToken(providedToken, expectedProbeSecret),
  );
  const { slug } = await context.params;

  const response = await executeServerProbe({
    expectedProbeSecret,
    providedBearerToken: providedToken,
    hasValidBearerToken,
    hasUiProbeHeader: hasUiProbeHeader(request),
    slug,
    getServerBySlug: async (serverSlug) => {
      const server = await getServerBySlug(serverSlug);
      return server ? { serverUrl: server.serverUrl } : null;
    },
  });

  return NextResponse.json(response.body, { status: response.status });
}
