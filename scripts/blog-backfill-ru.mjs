#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const BLOG_STORAGE_BUCKET = "blog-automation";
const BLOG_STORAGE_POSTS_PREFIX = "posts";
const BLOG_DISK_POSTS_ROOT = path.join(process.cwd(), "content", "blog", "posts");

function parseArgs(argv) {
  const flags = new Set(argv);
  const limitArg = argv.find((arg) => arg.startsWith("--limit="));
  const parsedLimit = limitArg ? Number.parseInt(limitArg.split("=")[1] ?? "", 10) : 1000;
  const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 5000) : 1000;

  return {
    apply: flags.has("--apply"),
    limit,
  };
}

function getEnv(name) {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

function createSupabaseAdminClientOrNull() {
  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL") || getEnv("SUPABASE_URL");
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function isMissingTableError(message) {
  return (
    message.includes("Could not find the table 'public.blog_posts'") ||
    message.includes('relation "blog_posts" does not exist')
  );
}

function collectRuText(post) {
  const ru = post?.locale?.ru;
  if (!ru) {
    return "";
  }

  const paragraphs = Array.isArray(ru.contentBlocks)
    ? ru.contentBlocks.flatMap((block) => {
        const heading = typeof block?.heading === "string" ? block.heading : "";
        const paras = Array.isArray(block?.paragraphs)
          ? block.paragraphs.filter((item) => typeof item === "string")
          : [];
        return [heading, ...paras];
      })
    : [];

  return [ru.excerpt, ru.seoDescription, ...paragraphs].filter(Boolean).join("\n");
}

function isLegacyAutoPost(post) {
  const provider = post?.research?.provider;
  if (provider !== "exa-search-deep") {
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

function extractSourceIds(value) {
  if (typeof value !== "string") {
    return [];
  }

  const matched = value.match(/src-\d+/gi) ?? [];
  return [...new Set(matched.map((item) => item.toLowerCase()))];
}

function readRecencyDays(post) {
  const ruText = collectRuText(post);
  const match = ruText.match(/последн(?:ие|их)\s+(\d+)\s+дн/iu);
  const parsed = match ? Number.parseInt(match[1], 10) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 14;
}

function resolveSourceCount(post) {
  const explicit = post?.research?.sourceCount;
  if (Number.isFinite(explicit) && explicit > 0) {
    return Math.round(explicit);
  }

  const ruExcerpt = post?.locale?.ru?.excerpt;
  const match = typeof ruExcerpt === "string" ? ruExcerpt.match(/(\d+)\s+актуал/iu) : null;
  const parsed = match ? Number.parseInt(match[1], 10) : Number.NaN;

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function normalizeRuCopy(post) {
  const ru = post?.locale?.ru;
  if (!ru || typeof ru !== "object") {
    return {
      changed: false,
      locale: post.locale,
    };
  }

  const locale = {
    ...post.locale,
    ru: {
      ...ru,
      contentBlocks: Array.isArray(ru.contentBlocks)
        ? ru.contentBlocks.map((block) => ({
            ...block,
            paragraphs: Array.isArray(block?.paragraphs)
              ? block.paragraphs.filter((item) => typeof item === "string")
              : [],
            bullets: Array.isArray(block?.bullets)
              ? block.bullets.filter((item) => typeof item === "string")
              : undefined,
          }))
        : [],
    },
  };

  const nextRu = locale.ru;
  const oldRuSnapshot = JSON.stringify(ru);

  const sourceCount = resolveSourceCount(post);
  nextRu.excerpt = sourceCount
    ? `Материал подготовлен на основе ${sourceCount} актуальных источников с обязательной многоэтапной проверкой.`
    : "Материал подготовлен на основе актуальных источников с обязательной многоэтапной проверкой.";
  nextRu.seoDescription =
    "Статья на основе deep research с проверкой релевантности, свежести, разнообразия доменов и подтверждения сигналов.";

  const recencyDays = readRecencyDays(post);
  const first = nextRu.contentBlocks[0] ?? { heading: "", paragraphs: [] };
  first.heading = "Область исследования";
  first.paragraphs = [
    `Тема материала: ${nextRu.title}.`,
    `Источники отобраны за последние ${recencyDays} дней и прошли многоэтапную верификацию.`,
  ];
  nextRu.contentBlocks[0] = first;

  const second = nextRu.contentBlocks[1] ?? { heading: "", paragraphs: [] };
  second.heading = "Подтверждённые выводы";
  const sourceParagraphs = Array.isArray(second.paragraphs) ? second.paragraphs : [];
  const rewritten = sourceParagraphs.map((paragraph, index) => {
    const ids = extractSourceIds(paragraph);
    if (ids.length === 0) {
      if (/signal\s+\d+/i.test(paragraph) || /repeated in \d+ independent sources/i.test(paragraph)) {
        return `Сигнал ${index + 1}: подтверждён в независимых источниках.`;
      }

      return paragraph;
    }

    return `Сигнал ${index + 1}: подтверждён в независимых источниках (${ids.join(", ")}).`;
  });
  second.paragraphs =
    rewritten.length > 0
      ? rewritten
      : ["Не удалось выделить повторяющиеся подтверждённые сигналы."];
  nextRu.contentBlocks[1] = second;

  const third = nextRu.contentBlocks[2] ?? { heading: "", paragraphs: [] };
  third.heading = "Актуальные источники";
  third.paragraphs = ["Ниже приведены только свежие и релевантные источники."];
  nextRu.contentBlocks[2] = third;

  const changed = JSON.stringify(nextRu) !== oldRuSnapshot;

  return {
    changed,
    locale,
  };
}

async function backfillBlogPostsTable(client, options) {
  const stats = {
    scanned: 0,
    legacy: 0,
    changed: 0,
    applied: 0,
    errors: 0,
    skipped: false,
  };

  const { data, error } = await client
    .from("blog_posts")
    .select("slug, locale, research")
    .order("published_at", { ascending: false })
    .limit(options.limit);

  if (error) {
    if (isMissingTableError(error.message)) {
      stats.skipped = true;
      return stats;
    }

    throw new Error(`Failed to read blog_posts: ${error.message}`);
  }

  const rows = Array.isArray(data) ? data : [];

  for (const row of rows) {
    stats.scanned += 1;

    const post = {
      slug: row.slug,
      locale: row.locale,
      research: row.research,
    };

    if (!isLegacyAutoPost(post)) {
      continue;
    }

    stats.legacy += 1;
    const normalized = normalizeRuCopy(post);
    if (!normalized.changed) {
      continue;
    }

    stats.changed += 1;

    if (!options.apply) {
      continue;
    }

    const { error: updateError } = await client
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

async function backfillBlogPostsStorage(client, options) {
  const stats = {
    scanned: 0,
    legacy: 0,
    changed: 0,
    applied: 0,
    errors: 0,
  };

  const { data: files, error: listError } = await client.storage
    .from(BLOG_STORAGE_BUCKET)
    .list(BLOG_STORAGE_POSTS_PREFIX, {
      limit: options.limit,
      sortBy: {
        column: "name",
        order: "desc",
      },
    });

  if (listError) {
    throw new Error(`Failed to list Supabase Storage posts: ${listError.message}`);
  }

  for (const file of files ?? []) {
    if (!file?.name || !file.name.endsWith(".json")) {
      continue;
    }

    stats.scanned += 1;
    const objectPath = `${BLOG_STORAGE_POSTS_PREFIX}/${file.name}`;

    try {
      const { data, error: downloadError } = await client.storage
        .from(BLOG_STORAGE_BUCKET)
        .download(objectPath);

      if (downloadError || !data) {
        stats.errors += 1;
        continue;
      }

      const rawText = await data.text();
      const post = JSON.parse(rawText);

      if (!isLegacyAutoPost(post)) {
        continue;
      }

      stats.legacy += 1;
      const normalized = normalizeRuCopy(post);
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

      const { error: uploadError } = await client.storage
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

async function backfillBlogPostsDisk(options) {
  const stats = {
    scanned: 0,
    legacy: 0,
    changed: 0,
    applied: 0,
    errors: 0,
    skipped: false,
  };

  try {
    const files = await fs.readdir(BLOG_DISK_POSTS_ROOT, { withFileTypes: true });
    const jsonFiles = files
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .slice(0, options.limit);

    for (const file of jsonFiles) {
      stats.scanned += 1;
      const filePath = path.join(BLOG_DISK_POSTS_ROOT, file.name);

      try {
        const raw = await fs.readFile(filePath, "utf8");
        const post = JSON.parse(raw);

        if (!isLegacyAutoPost(post)) {
          continue;
        }

        stats.legacy += 1;
        const normalized = normalizeRuCopy(post);
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

        await fs.writeFile(filePath, `${JSON.stringify(nextPost, null, 2)}\n`, "utf8");
        stats.applied += 1;
      } catch {
        stats.errors += 1;
      }
    }
  } catch {
    stats.skipped = true;
  }

  return stats;
}

function printStats(label, stats) {
  const base = [
    `[${label}] scanned=${stats.scanned}`,
    `legacy=${stats.legacy}`,
    `changed=${stats.changed}`,
    `applied=${stats.applied}`,
    `errors=${stats.errors}`,
  ];
  if (Object.prototype.hasOwnProperty.call(stats, "skipped")) {
    base.push(`skipped=${stats.skipped ? "yes" : "no"}`);
  }

  console.log(base.join(" "));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const client = createSupabaseAdminClientOrNull();

  console.log(
    options.apply
      ? "Running RU copy backfill in APPLY mode."
      : "Running RU copy backfill in DRY-RUN mode (add --apply to write changes).",
  );

  const tableStats = {
    scanned: 0,
    legacy: 0,
    changed: 0,
    applied: 0,
    errors: 0,
    skipped: true,
  };
  const storageStats = {
    scanned: 0,
    legacy: 0,
    changed: 0,
    applied: 0,
    errors: 0,
    skipped: true,
  };

  if (client) {
    Object.assign(tableStats, await backfillBlogPostsTable(client, options));
    Object.assign(storageStats, await backfillBlogPostsStorage(client, options));
  } else {
    console.log(
      "Supabase admin env is missing. Skipping remote table/storage backfill and continuing with disk posts only.",
    );
  }

  const diskStats = await backfillBlogPostsDisk(options);

  printStats("blog_posts", tableStats);
  printStats("storage", storageStats);
  printStats("disk", diskStats);

  const changed = tableStats.changed + storageStats.changed + diskStats.changed;
  const applied = tableStats.applied + storageStats.applied + diskStats.applied;
  const errors = tableStats.errors + storageStats.errors + diskStats.errors;

  console.log(`Summary: changed=${changed}, applied=${applied}, errors=${errors}`);

  if (errors > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
