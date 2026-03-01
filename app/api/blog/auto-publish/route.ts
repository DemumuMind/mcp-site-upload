import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { parseNumber, parseNumberEnv } from "@/lib/api/auth-helpers";
import { withCronAuth } from "@/lib/api/with-auth";
import { runAutoPublishBatch } from "@/lib/blog/auto-publish";
import { isBlogV2Enabled } from "@/lib/blog-v2/flags";
import { BLOG_POSTS_CACHE_TAG } from "@/lib/blog/service";

export const dynamic = "force-dynamic";

const DEFAULT_POSTS_PER_RUN = 1;
const DEFAULT_RECENCY_DAYS = 14;
const DEFAULT_MAX_SOURCES = 6;

async function runAutoPublish(request: NextRequest) {
  if (isBlogV2Enabled()) {
    return NextResponse.json(
      {
        ok: false,
        message: "Auto-publish v1 is disabled while BLOG_V2_ENABLED=true. Use /api/admin/blog-v2/* pipeline.",
      },
      { status: 409 },
    );
  }

  const countFromQuery = request.nextUrl.searchParams.get("count");
  const countFromEnv = parseNumberEnv("BLOG_AUTOPUBLISH_POSTS_PER_RUN", DEFAULT_POSTS_PER_RUN, {
    min: 1,
    max: 8,
  });
  const requestedCount = parseNumber(countFromQuery, countFromEnv, { min: 1, max: 8 });
  const recencyDays = parseNumberEnv("BLOG_AUTOPUBLISH_RECENCY_DAYS", DEFAULT_RECENCY_DAYS, {
    min: 1,
    max: 90,
  });
  const maxSources = parseNumberEnv("BLOG_AUTOPUBLISH_MAX_SOURCES", DEFAULT_MAX_SOURCES, {
    min: 3,
    max: 12,
  });

  const result = await runAutoPublishBatch({
    count: requestedCount,
    recencyDays,
    maxSources,
  });

  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  for (const createdPost of result.created) {
    revalidatePath(`/blog/${createdPost.slug}`);
  }
  revalidateTag(BLOG_POSTS_CACHE_TAG, "max");

  return NextResponse.json(
    {
      ok: result.failedCount === 0,
      ...result,
      settings: {
        recencyDays,
        maxSources,
      },
    },
    { status: result.failedCount === 0 ? 200 : 207 },
  );
}

const handlers = withCronAuth(
  async (request) => runAutoPublish(request),
  ["BLOG_AUTOPUBLISH_CRON_SECRET", "CRON_SECRET"],
  "blog.auto_publish",
);

export const GET = handlers.GET;
export const POST = handlers.POST;
