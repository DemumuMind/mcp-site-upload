import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createLogger } from "@/lib/api/logger";
import { executeCatalogGithubWebhook } from "@/lib/catalog/github-webhook-core";
import { enqueueCatalogGithubWebhookDelivery } from "@/lib/catalog/core/store.ts";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const logger = createLogger("catalog.github_webhook");
  const body = await request.text();
  const headers = Object.fromEntries(request.headers.entries());

  const response = await executeCatalogGithubWebhook({
    method: request.method,
    secret: process.env.GITHUB_WEBHOOK_SECRET?.trim() || null,
    body,
    headers,
    enqueueDelivery: enqueueCatalogGithubWebhookDelivery,
    logger,
  });

  return NextResponse.json(response.body, { status: response.status });
}
