import { NextResponse, type NextRequest } from "next/server";
import { parseNumber, parseNumberEnv } from "@/lib/api/auth-helpers";
import { withCronAuth } from "@/lib/api/with-auth";
import { invalidateBlogCaches } from "@/lib/cache/invalidation";
import { runAutoPublishBatch } from "@/lib/blog/auto-publish";
import { executeBlogAutoPublish } from "@/lib/blog/auto-publish-core";
import { isBlogV2Enabled } from "@/lib/blog-v2/flags";

export const dynamic = "force-dynamic";

const DEFAULT_POSTS_PER_RUN = 1;
const DEFAULT_RECENCY_DAYS = 14;
const DEFAULT_MAX_SOURCES = 6;
const BLOG_V1_SUNSET_RFC3339 = "2026-06-05T00:00:00.000Z";

function withDeprecationHeaders(response: NextResponse): NextResponse {
  response.headers.set("Deprecation", "true");
  response.headers.set("Sunset", new Date(BLOG_V1_SUNSET_RFC3339).toUTCString());
  response.headers.set("Link", '</api/admin/blog-v2/generate>; rel="successor-version"');
  return response;
}

const handlers = withCronAuth(
  async (request: NextRequest) => {
    const response = await executeBlogAutoPublish({
      isBlogV2Enabled,
      parseCountFromQuery: () => request.nextUrl.searchParams.get("count"),
      parsePostsPerRunFromEnv: () =>
        parseNumberEnv("BLOG_AUTOPUBLISH_POSTS_PER_RUN", DEFAULT_POSTS_PER_RUN, {
          min: 1,
          max: 8,
        }),
      parseRequestedCount: (value, fallback) => parseNumber(value, fallback, { min: 1, max: 8 }),
      parseRecencyDaysFromEnv: () =>
        parseNumberEnv("BLOG_AUTOPUBLISH_RECENCY_DAYS", DEFAULT_RECENCY_DAYS, {
          min: 1,
          max: 90,
        }),
      parseMaxSourcesFromEnv: () =>
        parseNumberEnv("BLOG_AUTOPUBLISH_MAX_SOURCES", DEFAULT_MAX_SOURCES, {
          min: 3,
          max: 12,
        }),
      runBatch: runAutoPublishBatch,
      clearCaches: async (result) => {
        invalidateBlogCaches({
          origin: "route",
          slugs: result.created.map((createdPost) => createdPost.slug),
        });
      },
    });

    return withDeprecationHeaders(NextResponse.json(response.body, { status: response.status }));
  },
  ["BLOG_AUTOPUBLISH_CRON_SECRET", "CRON_SECRET"],
  "blog.auto_publish",
);

export const GET = handlers.GET;
export const POST = handlers.POST;
