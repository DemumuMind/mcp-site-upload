import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    readiness: "ready",
    liveness: "alive",
    planVersion: "v2",
    checkedAt: new Date().toISOString(),
  });
}
