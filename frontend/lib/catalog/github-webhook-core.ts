import { createHmac, timingSafeEqual } from "node:crypto";
import { normalizeRepositoryUrl } from "./core/normalize.ts";

type GitHubWebhookHeaders = Record<string, string | undefined>;

type GitHubWebhookDeps = {
  method: string;
  secret: string | null;
  body: string;
  headers: GitHubWebhookHeaders;
  enqueueDelivery: (input: {
    deliveryId: string;
    eventType: string;
    repoFullName: string | null;
    repoUrl: string | null;
    repoUrlNormalized: string | null;
    payload: unknown;
  }) => Promise<{ duplicate: boolean }>;
  logger: {
    info: (event: string, details?: Record<string, unknown>) => void;
    warn: (event: string, details?: Record<string, unknown>) => void;
    error: (event: string, details?: Record<string, unknown>) => void;
  };
};

function getHeader(headers: GitHubWebhookHeaders, name: string): string | null {
  return headers[name] ?? headers[name.toLowerCase()] ?? null;
}

function hasValidSignature(secret: string, body: string, providedSignature: string | null): boolean {
  if (!providedSignature || !providedSignature.startsWith("sha256=")) {
    return false;
  }
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  const provided = providedSignature.slice("sha256=".length);
  if (provided.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

export async function executeCatalogGithubWebhook(
  deps: GitHubWebhookDeps,
): Promise<{ status: number; body: Record<string, unknown> }> {
  if (deps.method !== "POST") {
    return {
      status: 405,
      body: {
        ok: false,
        error: "Method not allowed.",
      },
    };
  }

  if (!deps.secret) {
    deps.logger.error("catalog.github_webhook.secret_missing");
    return {
      status: 503,
      body: {
        ok: false,
        error: "GitHub webhook secret is not configured.",
      },
    };
  }

  const eventType = getHeader(deps.headers, "x-github-event");
  const deliveryId = getHeader(deps.headers, "x-github-delivery");
  const signature = getHeader(deps.headers, "x-hub-signature-256");

  if (!eventType || !deliveryId) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "Missing required GitHub webhook headers.",
      },
    };
  }

  if (!hasValidSignature(deps.secret, deps.body, signature)) {
    deps.logger.warn("catalog.github_webhook.signature_invalid", {
      deliveryId,
      eventType,
    });
    return {
      status: 401,
      body: {
        ok: false,
        error: "Invalid GitHub webhook signature.",
      },
    };
  }

  if (!["push", "release", "repository"].includes(eventType)) {
    return {
      status: 202,
      body: {
        ok: true,
        queued: false,
        ignored: true,
        eventType,
      },
    };
  }

  let payload: unknown;
  try {
    payload = JSON.parse(deps.body);
  } catch {
    return {
      status: 400,
      body: {
        ok: false,
        error: "Invalid JSON payload.",
      },
    };
  }

  const repo = payload && typeof payload === "object"
    ? (payload as { repository?: { full_name?: string; html_url?: string } }).repository
    : undefined;
  const repoUrl = repo?.html_url ?? null;
  const repoUrlNormalized = normalizeRepositoryUrl(repoUrl).normalized;
  const enqueueResult = await deps.enqueueDelivery({
    deliveryId,
    eventType,
    repoFullName: repo?.full_name ?? null,
    repoUrl,
    repoUrlNormalized,
    payload,
  });

  deps.logger.info("catalog.github_webhook.accepted", {
    deliveryId,
    eventType,
    repoUrlNormalized,
    duplicate: enqueueResult.duplicate,
  });

  return {
    status: 202,
    body: {
      ok: true,
      queued: !enqueueResult.duplicate,
      duplicate: enqueueResult.duplicate,
      eventType,
      deliveryId,
      repoUrlNormalized,
    },
  };
}
