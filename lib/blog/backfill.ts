import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const BLOG_STORAGE_BUCKET = "blog-automation";
const BLOG_STORAGE_POSTS_PREFIX = "posts";
const BACKFILL_RUNS_TABLE = "blog_backfill_runs";

type LegacyPostLike = {
  slug?: string;
  locale?: unknown;
  research?: unknown;
};

type BackfillRow = {
  slug: string;
  locale: unknown;
  research: unknown;
};

export type BlogRuBackfillTargetStats = {
  scanned: number;
  legacy: number;
  changed: number;
  applied: number;
  errors: number;
  skipped: boolean;
};

export type BlogRuBackfillResult = {
  table: BlogRuBackfillTargetStats;
  storage: BlogRuBackfillTargetStats;
  changed: number;
  applied: number;
  errors: number;
};

export type BlogRuBackfillRunStatus = "success" | "partial" | "failed";

export type BlogRuBackfillRunRecord = {
  id: string;
  createdAt: string;
  status: BlogRuBackfillRunStatus;
  apply: boolean;
  scanLimit: number;
  table: BlogRuBackfillTargetStats;
  storage: BlogRuBackfillTargetStats;
  changed: number;
  applied: number;
  errors: number;
  errorMessage?: string;
};

export type BlogRuBackfillRunHistory = {
  available: boolean;
  runs: BlogRuBackfillRunRecord[];
};

type BlogRuBackfillRunPersistInput = {
  apply: boolean;
  limit: number;
  result: BlogRuBackfillResult;
  status?: BlogRuBackfillRunStatus;
  errorMessage?: string;
};

type BlogRuBackfillRunPersistResult = {
  recorded: boolean;
  runId?: string;
};

type RunBlogRuBackfillOptions = {
  apply: boolean;
  limit: number;
};

type NormalizeRuLocaleResult = {
  changed: boolean;
  locale: unknown;
};

function createEmptyStats(skipped = false): BlogRuBackfillTargetStats {
  return {
    scanned: 0,
    legacy: 0,
    changed: 0,
    applied: 0,
    errors: 0,
    skipped,
  };
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMissingBlogPostsTableError(message: string): boolean {
  return (
    message.includes("Could not find the table 'public.blog_posts'") ||
    message.includes('relation "blog_posts" does not exist')
  );
}

function isMissingBackfillRunsTableError(message: string): boolean {
  return (
    message.includes("Could not find the table 'public.blog_backfill_runs'") ||
    message.includes('relation "blog_backfill_runs" does not exist')
  );
}

function toBackfillRunStatus(result: BlogRuBackfillResult, errorMessage?: string): BlogRuBackfillRunStatus {
  if (errorMessage) {
    return "failed";
  }

  if (result.errors > 0) {
    return result.applied > 0 || result.changed > 0 ? "partial" : "failed";
  }

  return "success";
}

function clampLimit(limit: number): number {
  return Math.max(1, Math.min(limit, 5000));
}

function toFiniteNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function toBackfillTargetStats(value: unknown): BlogRuBackfillTargetStats {
  if (!isObjectRecord(value)) {
    return createEmptyStats(true);
  }

  const stats: BlogRuBackfillTargetStats = {
    scanned: toFiniteNumber(value.scanned),
    legacy: toFiniteNumber(value.legacy),
    changed: toFiniteNumber(value.changed),
    applied: toFiniteNumber(value.applied),
    errors: toFiniteNumber(value.errors),
    skipped: value.skipped === true,
  };

  return {
    scanned: Math.max(0, stats.scanned),
    legacy: Math.max(0, stats.legacy),
    changed: Math.max(0, stats.changed),
    applied: Math.max(0, stats.applied),
    errors: Math.max(0, stats.errors),
    skipped: stats.skipped,
  };
}

function toBackfillRunRecord(row: Record<string, unknown>): BlogRuBackfillRunRecord | null {
  const id = typeof row.id === "string" ? row.id : "";
  const createdAt = typeof row.created_at === "string" ? row.created_at : "";
  if (!id || !createdAt) {
    return null;
  }

  const rawStatus = typeof row.status === "string" ? row.status : "failed";
  const status: BlogRuBackfillRunStatus =
    rawStatus === "success" || rawStatus === "partial" || rawStatus === "failed" ? rawStatus : "failed";

  const apply = row.apply === true;
  const scanLimit = Math.max(1, toFiniteNumber(row.scan_limit, 1));

  const table = toBackfillTargetStats(row.table_stats);
  const storage = toBackfillTargetStats(row.storage_stats);
  const changed = Math.max(0, toFiniteNumber(row.changed_total));
  const applied = Math.max(0, toFiniteNumber(row.applied_total));
  const errors = Math.max(0, toFiniteNumber(row.error_total));
  const errorMessage = typeof row.error_message === "string" && row.error_message.trim() ? row.error_message : undefined;

  return {
    id,
    createdAt,
    status,
    apply,
    scanLimit,
    table,
    storage,
    changed,
    applied,
    errors,
    errorMessage,
  };
}

function shouldSkipBackfillRunsTable(error: PostgrestError): boolean {
  return isMissingBackfillRunsTableError(error.message);
}

function collectRuText(post: LegacyPostLike): string {
  if (!isObjectRecord(post.locale)) {
    return "";
  }

  const ru = post.locale.ru;
  if (!isObjectRecord(ru)) {
    return "";
  }

  const excerpt = typeof ru.excerpt === "string" ? ru.excerpt : "";
  const seoDescription = typeof ru.seoDescription === "string" ? ru.seoDescription : "";
  const contentBlocks = Array.isArray(ru.contentBlocks) ? ru.contentBlocks : [];

  const blockText = contentBlocks
    .flatMap((block) => {
      if (!isObjectRecord(block)) {
        return [];
      }

      const heading = typeof block.heading === "string" ? block.heading : "";
      const paragraphs = Array.isArray(block.paragraphs)
        ? block.paragraphs.filter((item): item is string => typeof item === "string")
        : [];

      return [heading, ...paragraphs];
    })
    .filter(Boolean)
    .join("\n");

  return [excerpt, seoDescription, blockText].filter(Boolean).join("\n");
}

function hasDeepResearchProvider(post: LegacyPostLike): boolean {
  if (!isObjectRecord(post.research)) {
    return false;
  }

  return post.research.provider === "exa-search-deep";
}

function isLegacyAutoPost(post: LegacyPostLike): boolean {
  if (!hasDeepResearchProvider(post)) {
    return false;
  }

  const ruText = collectRuText(post);
  if (!ruText) {
    return false;
  }

  return /(по теме:|signal\s+\d+|supporting sources|repeated in \d+ independent sources|тема:\s|deep research по теме|подтверждающие источники)/i.test(
    ruText,
  );
}

function extractSourceIds(value: string): string[] {
  const matched = value.match(/src-\d+/gi) ?? [];
  return [...new Set(matched.map((item) => item.toLowerCase()))];
}

function parseRecencyDays(ruText: string): number {
  const match = ruText.match(/последн(?:ие|их)\s+(\d+)\s+дн/iu);
  const parsed = match ? Number.parseInt(match[1], 10) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 14;
}

function resolveSourceCount(localeRu: Record<string, unknown>): number | null {
  const excerpt = typeof localeRu.excerpt === "string" ? localeRu.excerpt : "";
  const match = excerpt.match(/(\d+)\s+актуал/iu);
  const parsed = match ? Number.parseInt(match[1], 10) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function normalizeRuLocale(locale: unknown): NormalizeRuLocaleResult {
  if (!isObjectRecord(locale) || !isObjectRecord(locale.ru)) {
    return {
      changed: false,
      locale,
    };
  }

  const currentLocale = locale as Record<string, unknown>;
  const currentRu = currentLocale.ru as Record<string, unknown>;
  const baseline = JSON.stringify(currentRu);

  const nextLocale = JSON.parse(JSON.stringify(currentLocale)) as Record<string, unknown>;
  const nextRu = nextLocale.ru as Record<string, unknown>;

  const titleRu = typeof nextRu.title === "string" ? nextRu.title : "Материал";
  const sourceCount = resolveSourceCount(currentRu);
  const recencyDays = parseRecencyDays(collectRuText({ locale: currentLocale }));

  nextRu.excerpt = sourceCount
    ? `Материал подготовлен на основе ${sourceCount} актуальных источников с обязательной многоэтапной проверкой.`
    : "Материал подготовлен на основе актуальных источников с обязательной многоэтапной проверкой.";
  nextRu.seoDescription =
    "Статья на основе deep research с проверкой релевантности, свежести, разнообразия доменов и подтверждения сигналов.";

  const contentBlocks: Array<Record<string, unknown>> = Array.isArray(nextRu.contentBlocks)
    ? nextRu.contentBlocks.map((block) => {
        if (isObjectRecord(block)) {
          return {
            ...block,
            paragraphs: Array.isArray(block.paragraphs)
              ? block.paragraphs.filter((item): item is string => typeof item === "string")
              : [],
            bullets: Array.isArray(block.bullets)
              ? block.bullets.filter((item): item is string => typeof item === "string")
              : undefined,
          };
        }

        return { heading: "", paragraphs: [] as string[] };
      })
    : [];

  const first = isObjectRecord(contentBlocks[0]) ? (contentBlocks[0] as Record<string, unknown>) : {};
  first.heading = "Область исследования";
  first.paragraphs = [
    `Тема материала: ${titleRu}.`,
    `Источники отобраны за последние ${recencyDays} дней и прошли многоэтапную верификацию.`,
  ];
  contentBlocks[0] = first;

  const second = isObjectRecord(contentBlocks[1]) ? (contentBlocks[1] as Record<string, unknown>) : {};
  second.heading = "Подтверждённые выводы";
  const secondParagraphs = Array.isArray(second.paragraphs)
    ? second.paragraphs.filter((item): item is string => typeof item === "string")
    : [];

  const normalizedSignals = secondParagraphs.map((paragraph, index) => {
    const sourceIds = extractSourceIds(paragraph);
    if (sourceIds.length > 0) {
      return `Сигнал ${index + 1}: подтверждён в независимых источниках (${sourceIds.join(", ")}).`;
    }

    if (/signal\s+\d+/i.test(paragraph) || /repeated in \d+ independent sources/i.test(paragraph)) {
      return `Сигнал ${index + 1}: подтверждён в независимых источниках.`;
    }

    return paragraph;
  });

  second.paragraphs =
    normalizedSignals.length > 0
      ? normalizedSignals
      : ["Не удалось выделить повторяющиеся подтверждённые сигналы."];
  contentBlocks[1] = second;

  const third = isObjectRecord(contentBlocks[2]) ? (contentBlocks[2] as Record<string, unknown>) : {};
  third.heading = "Актуальные источники";
  third.paragraphs = ["Ниже приведены только свежие и релевантные источники."];
  contentBlocks[2] = third;

  nextRu.contentBlocks = contentBlocks;

  return {
    changed: JSON.stringify(nextRu) !== baseline,
    locale: nextLocale,
  };
}

async function runTableBackfill(
  adminClient: SupabaseClient,
  options: RunBlogRuBackfillOptions,
): Promise<BlogRuBackfillTargetStats> {
  const stats = createEmptyStats(false);

  const { data, error } = await adminClient
    .from("blog_posts")
    .select("slug, locale, research")
    .order("published_at", { ascending: false })
    .limit(options.limit);

  if (error) {
    if (isMissingBlogPostsTableError(error.message)) {
      return createEmptyStats(true);
    }

    throw new Error(`Failed to read blog_posts: ${error.message}`);
  }

  const rows = Array.isArray(data) ? (data as BackfillRow[]) : [];

  for (const row of rows) {
    stats.scanned += 1;

    const post: LegacyPostLike = {
      slug: row.slug,
      locale: row.locale,
      research: row.research,
    };

    if (!isLegacyAutoPost(post)) {
      continue;
    }

    stats.legacy += 1;
    const normalized = normalizeRuLocale(row.locale);
    if (!normalized.changed) {
      continue;
    }

    stats.changed += 1;

    if (!options.apply) {
      continue;
    }

    const { error: updateError } = await adminClient
      .from("blog_posts")
      .update({
        locale: normalized.locale,
        updated_at: new Date().toISOString(),
      })
      .eq("slug", row.slug)
      .limit(1);

    if (updateError) {
      stats.errors += 1;
      continue;
    }

    stats.applied += 1;
  }

  return stats;
}

async function runStorageBackfill(
  adminClient: SupabaseClient,
  options: RunBlogRuBackfillOptions,
): Promise<BlogRuBackfillTargetStats> {
  const stats = createEmptyStats(false);

  const { data: files, error: listError } = await adminClient.storage
    .from(BLOG_STORAGE_BUCKET)
    .list(BLOG_STORAGE_POSTS_PREFIX, {
      limit: options.limit,
      sortBy: {
        column: "name",
        order: "desc",
      },
    });

  if (listError) {
    return createEmptyStats(true);
  }

  for (const file of files ?? []) {
    if (!file?.name || !file.name.endsWith(".json")) {
      continue;
    }

    stats.scanned += 1;
    const objectPath = `${BLOG_STORAGE_POSTS_PREFIX}/${file.name}`;

    try {
      const { data, error: downloadError } = await adminClient.storage
        .from(BLOG_STORAGE_BUCKET)
        .download(objectPath);

      if (downloadError || !data) {
        stats.errors += 1;
        continue;
      }

      const rawText = await data.text();
      const post = JSON.parse(rawText) as LegacyPostLike;

      if (!isLegacyAutoPost(post)) {
        continue;
      }

      stats.legacy += 1;
      const normalized = normalizeRuLocale(post.locale);
      if (!normalized.changed) {
        continue;
      }

      stats.changed += 1;

      if (!options.apply) {
        continue;
      }

      const nextPost = {
        ...post,
        locale: normalized.locale,
        updatedAt: new Date().toISOString(),
      };

      const { error: uploadError } = await adminClient.storage
        .from(BLOG_STORAGE_BUCKET)
        .upload(objectPath, JSON.stringify(nextPost, null, 2), {
          contentType: "application/json; charset=utf-8",
          upsert: true,
        });

      if (uploadError) {
        stats.errors += 1;
        continue;
      }

      stats.applied += 1;
    } catch {
      stats.errors += 1;
    }
  }

  return stats;
}

export async function runBlogRuBackfill(options: RunBlogRuBackfillOptions): Promise<BlogRuBackfillResult> {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    throw new Error(
      "Supabase admin configuration is missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  const limit = clampLimit(options.limit);
  const normalizedOptions: RunBlogRuBackfillOptions = {
    ...options,
    limit,
  };

  const table = await runTableBackfill(adminClient, normalizedOptions);
  const storage = await runStorageBackfill(adminClient, normalizedOptions);

  return {
    table,
    storage,
    changed: table.changed + storage.changed,
    applied: table.applied + storage.applied,
    errors: table.errors + storage.errors,
  };
}

export async function persistBlogRuBackfillRun(
  input: BlogRuBackfillRunPersistInput,
): Promise<BlogRuBackfillRunPersistResult> {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return { recorded: false };
  }

  const status = input.status ?? toBackfillRunStatus(input.result, input.errorMessage);
  const limit = clampLimit(input.limit);
  const runPayload = {
    status,
    apply: input.apply,
    scan_limit: limit,
    table_stats: input.result.table,
    storage_stats: input.result.storage,
    changed_total: input.result.changed,
    applied_total: input.result.applied,
    error_total: input.result.errors,
    error_message: input.errorMessage ?? null,
  };

  const { data, error } = await adminClient
    .from(BACKFILL_RUNS_TABLE)
    .insert(runPayload)
    .select("id")
    .single();

  if (error) {
    if (shouldSkipBackfillRunsTable(error)) {
      return { recorded: false };
    }

    throw new Error(`Failed to persist backfill run: ${error.message}`);
  }

  const runId = isObjectRecord(data) && typeof data.id === "string" ? data.id : undefined;
  return {
    recorded: true,
    runId,
  };
}

export async function getRecentBlogRuBackfillRuns(limit = 8): Promise<BlogRuBackfillRunHistory> {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return {
      available: false,
      runs: [],
    };
  }

  const safeLimit = Math.max(1, Math.min(limit, 50));
  const { data, error } = await adminClient
    .from(BACKFILL_RUNS_TABLE)
    .select(
      "id, created_at, status, apply, scan_limit, table_stats, storage_stats, changed_total, applied_total, error_total, error_message",
    )
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) {
    if (shouldSkipBackfillRunsTable(error)) {
      return {
        available: false,
        runs: [],
      };
    }

    throw new Error(`Failed to read backfill history: ${error.message}`);
  }

  const runs = Array.isArray(data)
    ? data
        .map((row) => toBackfillRunRecord(isObjectRecord(row) ? row : {}))
        .filter((row): row is BlogRuBackfillRunRecord => Boolean(row))
    : [];

  return {
    available: true,
    runs,
  };
}
