import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

import { executeCatalogGithubWebhook } from "../frontend/lib/catalog/github-webhook-core.ts";

function sign(secret: string, body: string): string {
  return `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
}

test("github webhook core validates signature and enqueues a delivery", async () => {
  const body = JSON.stringify({
    repository: {
      full_name: "example/example-mcp",
      html_url: "https://github.com/example/example-mcp",
    },
  });

  let queued: Record<string, unknown> | null = null;

  const response = await executeCatalogGithubWebhook({
    method: "POST",
    secret: "top-secret",
    body,
    headers: {
      "x-github-event": "push",
      "x-github-delivery": "delivery-1",
      "x-hub-signature-256": sign("top-secret", body),
    },
    enqueueDelivery: async (input) => {
      queued = input;
      return { duplicate: false };
    },
    logger: {
      info: () => undefined,
      warn: () => undefined,
      error: () => undefined,
    },
  });

  assert.equal(response.status, 202);
  assert.equal((queued as { deliveryId?: string } | null)?.deliveryId, "delivery-1");
  assert.equal((queued as { repoUrlNormalized?: string } | null)?.repoUrlNormalized, "github.com/example/example-mcp");
});

test("github webhook core rejects invalid signatures", async () => {
  const body = JSON.stringify({
    repository: {
      full_name: "example/example-mcp",
      html_url: "https://github.com/example/example-mcp",
    },
  });

  const response = await executeCatalogGithubWebhook({
    method: "POST",
    secret: "top-secret",
    body,
    headers: {
      "x-github-event": "push",
      "x-github-delivery": "delivery-1",
      "x-hub-signature-256": sign("wrong-secret", body),
    },
    enqueueDelivery: async () => ({ duplicate: false }),
    logger: {
      info: () => undefined,
      warn: () => undefined,
      error: () => undefined,
    },
  });

  assert.equal(response.status, 401);
});

test("github webhook core treats duplicate deliveries as accepted without requeueing", async () => {
  const body = JSON.stringify({
    repository: {
      full_name: "example/example-mcp",
      html_url: "https://github.com/example/example-mcp",
    },
  });

  let enqueueCount = 0;
  const response = await executeCatalogGithubWebhook({
    method: "POST",
    secret: "top-secret",
    body,
    headers: {
      "x-github-event": "release",
      "x-github-delivery": "delivery-1",
      "x-hub-signature-256": sign("top-secret", body),
    },
    enqueueDelivery: async () => {
      enqueueCount += 1;
      return { duplicate: true };
    },
    logger: {
      info: () => undefined,
      warn: () => undefined,
      error: () => undefined,
    },
  });

  assert.equal(response.status, 202);
  assert.equal(enqueueCount, 1);
  assert.equal(response.body.duplicate, true);
});
