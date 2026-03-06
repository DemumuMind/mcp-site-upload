import type { AutoPublishBatchResult } from "./auto-publish";

type AutoPublishCoreDeps = {
  isBlogV2Enabled: () => boolean;
  parseCountFromQuery: () => string | null;
  parsePostsPerRunFromEnv: () => number;
  parseRequestedCount: (value: string | null, fallback: number) => number;
  parseRecencyDaysFromEnv: () => number;
  parseMaxSourcesFromEnv: () => number;
  runBatch: (input: {
    count: number;
    recencyDays: number;
    maxSources: number;
  }) => Promise<AutoPublishBatchResult>;
  clearCaches: (result: AutoPublishBatchResult) => Promise<void>;
};

const BLOG_V1_DISABLED_MESSAGE =
  "Auto-publish v1 is disabled while BLOG_V2_ENABLED=true. Use /api/admin/blog-v2/* pipeline.";

function createAutoPublishErrorBody(error: string, code: "disabled" | "internal_error") {
  return {
    ok: false as const,
    error,
    code,
  };
}

export async function executeBlogAutoPublish(
  deps: AutoPublishCoreDeps,
): Promise<{ status: number; body: Record<string, unknown> }> {
  if (deps.isBlogV2Enabled()) {
    return {
      status: 409,
      body: createAutoPublishErrorBody(BLOG_V1_DISABLED_MESSAGE, "disabled"),
    };
  }

  const countFromEnv = deps.parsePostsPerRunFromEnv();
  const requestedCount = deps.parseRequestedCount(deps.parseCountFromQuery(), countFromEnv);
  const recencyDays = deps.parseRecencyDaysFromEnv();
  const maxSources = deps.parseMaxSourcesFromEnv();

  try {
    const result = await deps.runBatch({
      count: requestedCount,
      recencyDays,
      maxSources,
    });

    await deps.clearCaches(result);

    return {
      status: result.failedCount === 0 ? 200 : 207,
      body: {
        ok: result.failedCount === 0,
        ...result,
        settings: {
          recencyDays,
          maxSources,
        },
      },
    };
  } catch {
    return {
      status: 500,
      body: createAutoPublishErrorBody("Blog auto-publish failed.", "internal_error"),
    };
  }
}
