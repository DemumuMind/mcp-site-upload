import { timingSafeEqual } from "node:crypto";

import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { BLOG_POSTS_CACHE_TAG } from "@/lib/blog/service";
import { runAutoPublishBatch } from "@/lib/blog/auto-publish";

export const dynamic = "force-dynamic";

const DEFAULT_POSTS_PER_RUN = 1;
const DEFAULT_RECENCY_DAYS = 14;
const DEFAULT_MAX_SOURCES = 6;

type NumberEnvOptions = {
  min: number;
  max: number;
};

function parseNumber(value: string | null | undefined, fallback: number, options: NumberEnvOptions) {
  const raw = value?.trim();

  if (!raw) {
    return fallback;
  }

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  if (parsed < options.min || parsed > options.max) {
    return fallback;
  }

  return parsed;
}

function parseNumberEnv(envName: string, fallback: number, options: NumberEnvOptions) {
  return parseNumber(process.env[envName], fallback, options);
}

function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

function getExpectedCronToken(): string | null {
  return process.env.BLOG_AUTOPUBLISH_CRON_SECRET || process.env.CRON_SECRET || null;
}

function isValidCronToken(providedToken: string, expectedToken: string): boolean {
  const provided = Buffer.from(providedToken);
  const expected = Buffer.from(expectedToken);

  if (provided.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(provided, expected);
}

async function runAutoPublish(request: NextRequest) {
  const expectedToken = getExpectedCronToken();

  if (!expectedToken) {
    return NextResponse.json(
      {
        ok: false,
        message: "Missing cron secret. Set BLOG_AUTOPUBLISH_CRON_SECRET or CRON_SECRET.",
      },
      { status: 500 },
    );
  }

  const providedToken = extractBearerToken(request);
  if (!providedToken || !isValidCronToken(providedToken, expectedToken)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
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

export async function GET(request: NextRequest) {
  return runAutoPublish(request);
}

export async function POST(request: NextRequest) {
  return runAutoPublish(request);
}
