#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const verbose = args.has("--verbose");

const rootDir = process.cwd();
const blogPostsDir = path.join(rootDir, "content", "blog", "posts");
const suffixPattern = /-(\d{9,13})$/;

function log(message, ...extra) {
  console.log(message, ...extra);
}

function toSeriesSlug(slug) {
  return slug.replace(/-\d{9,13}$/, "");
}

function hasTimestampSuffix(slug) {
  return suffixPattern.test(slug);
}

function getSuffixTimestamp(slug) {
  const match = slug.match(suffixPattern);
  if (!match) {
    return 0;
  }

  const value = Number(match[1]);
  return Number.isFinite(value) ? value : 0;
}

function sortByRecency(a, b) {
  const bySuffix = getSuffixTimestamp(b.slug) - getSuffixTimestamp(a.slug);
  if (bySuffix !== 0) {
    return bySuffix;
  }

  return b.slug.localeCompare(a.slug);
}

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJsonFile(filePath, payload) {
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function collectLocalDuplicates() {
  const fileNames = fs
    .readdirSync(blogPostsDir)
    .filter((fileName) => fileName.endsWith(".json"));

  const grouped = new Map();

  for (const fileName of fileNames) {
    const slug = fileName.replace(/\.json$/i, "");
    const seriesSlug = toSeriesSlug(slug);
    const bucket = grouped.get(seriesSlug) ?? [];
    bucket.push({
      name: fileName,
      slug,
      filePath: path.join(blogPostsDir, fileName),
    });
    grouped.set(seriesSlug, bucket);
  }

  return [...grouped.entries()]
    .map(([seriesSlug, items]) => ({
      seriesSlug,
      items,
      timestampedItems: items.filter((item) => hasTimestampSuffix(item.slug)),
    }))
    .filter((group) => group.timestampedItems.length > 1);
}

async function applyLocalCleanup(duplicates) {
  for (const group of duplicates) {
    const sortedTimestamped = [...group.timestampedItems].sort(sortByRecency);
    const latest = sortedTimestamped[0];
    const canonicalName = `${group.seriesSlug}.json`;
    const canonicalPath = path.join(blogPostsDir, canonicalName);

    const payload = readJsonFile(latest.filePath);
    payload.slug = group.seriesSlug;
    writeJsonFile(canonicalPath, payload);

    for (const item of group.timestampedItems) {
      fs.unlinkSync(item.filePath);
    }

    log(
      `local cleaned: ${group.seriesSlug} -> ${canonicalName} (removed ${group.timestampedItems.length} timestamped files)`,
    );
  }
}

function printLocalSummary(duplicates) {
  log(`local duplicate groups: ${duplicates.length}`);
  for (const group of duplicates) {
    log(`  - ${group.seriesSlug}`);
    for (const item of group.timestampedItems.sort(sortByRecency)) {
      log(`      ${item.name}`);
    }
  }
}

async function collectStorageDuplicates(client) {
  const { data, error } = await client.storage.from("blog-automation").list("posts", {
    limit: 5000,
    sortBy: { column: "name", order: "asc" },
  });

  if (error) {
    throw new Error(`storage list failed: ${error.message}`);
  }

  const files = (data ?? []).filter((item) => item.name.endsWith(".json"));
  const grouped = new Map();

  for (const file of files) {
    const slug = file.name.replace(/\.json$/i, "");
    const seriesSlug = toSeriesSlug(slug);
    const bucket = grouped.get(seriesSlug) ?? [];
    bucket.push({
      name: file.name,
      slug,
      objectPath: `posts/${file.name}`,
      updatedAt: file.updated_at ?? "",
      createdAt: file.created_at ?? "",
    });
    grouped.set(seriesSlug, bucket);
  }

  return [...grouped.entries()]
    .map(([seriesSlug, items]) => ({
      seriesSlug,
      items,
      timestampedItems: items.filter((item) => hasTimestampSuffix(item.slug)),
    }))
    .filter((group) => group.timestampedItems.length > 1);
}

async function applyStorageCleanup(client, duplicates) {
  for (const group of duplicates) {
    const sortedTimestamped = [...group.timestampedItems].sort(sortByRecency);
    const latest = sortedTimestamped[0];

    const { data: blob, error: downloadError } = await client.storage
      .from("blog-automation")
      .download(latest.objectPath);

    if (downloadError || !blob) {
      throw new Error(`download failed (${latest.objectPath}): ${downloadError?.message ?? "empty"}`);
    }

    const payload = JSON.parse(await blob.text());
    payload.slug = group.seriesSlug;

    const canonicalObjectPath = `posts/${group.seriesSlug}.json`;
    const { error: uploadError } = await client.storage
      .from("blog-automation")
      .upload(canonicalObjectPath, `${JSON.stringify(payload, null, 2)}\n`, {
        upsert: true,
        contentType: "application/json; charset=utf-8",
      });

    if (uploadError) {
      throw new Error(`upload failed (${canonicalObjectPath}): ${uploadError.message}`);
    }

    const removePaths = group.timestampedItems.map((item) => item.objectPath);
    const { error: removeError } = await client.storage.from("blog-automation").remove(removePaths);
    if (removeError) {
      throw new Error(`remove failed (${group.seriesSlug}): ${removeError.message}`);
    }

    log(
      `storage cleaned: ${group.seriesSlug} -> ${canonicalObjectPath} (removed ${removePaths.length} timestamped objects)`,
    );
  }
}

function printStorageSummary(duplicates) {
  log(`storage duplicate groups: ${duplicates.length}`);
  for (const group of duplicates) {
    log(`  - ${group.seriesSlug}`);
    for (const item of group.timestampedItems.sort(sortByRecency)) {
      log(`      ${item.name}`);
    }
  }
}

async function main() {
  process.loadEnvFile(path.join(rootDir, ".env"));

  const localDuplicates = collectLocalDuplicates();
  printLocalSummary(localDuplicates);

  if (apply && localDuplicates.length > 0) {
    await applyLocalCleanup(localDuplicates);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    log("storage cleanup skipped (missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)");
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const storageDuplicates = await collectStorageDuplicates(supabase);
  printStorageSummary(storageDuplicates);

  if (apply && storageDuplicates.length > 0) {
    await applyStorageCleanup(supabase, storageDuplicates);
  }

  if (!apply) {
    log("dry-run only. Use --apply to execute cleanup.");
  } else {
    log("cleanup completed.");
  }

  if (verbose) {
    log(`apply=${apply}`);
  }
}

main().catch((error) => {
  console.error("blog deduplicate failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
