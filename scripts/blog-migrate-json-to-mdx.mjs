#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const postsRoot = path.join(repoRoot, "content", "blog", "posts");

function normalizeSlug(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toYamlArray(values) {
  return values.map((value) => `  - "${String(value).replaceAll('"', '\\"')}"`).join("\n");
}

function toIsoDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }
  return date.toISOString();
}

function escapeInline(value) {
  return String(value ?? "").replaceAll('"', '\\"');
}

function blockToMarkdown(block) {
  const lines = [];
  lines.push(`## ${block.heading}`);
  lines.push("");

  for (const paragraph of block.paragraphs ?? []) {
    lines.push(paragraph.trim());
    lines.push("");
  }

  if (Array.isArray(block.bullets) && block.bullets.length > 0) {
    for (const bullet of block.bullets) {
      lines.push(`- ${bullet.trim()}`);
    }
    lines.push("");
  }

  return lines.join("\n").trim();
}

function toMdx(post) {
  const locale = post.locale?.en;
  if (!locale) {
    throw new Error(`Post "${post.slug}" is missing locale.en`);
  }

  const slug = normalizeSlug(post.slug);
  const tags = Array.isArray(post.tags) ? post.tags.map(normalizeSlug).filter(Boolean) : [];
  if (!slug || tags.length === 0) {
    throw new Error(`Post "${post.slug}" has invalid slug/tags`);
  }

  const publishedAt = toIsoDate(post.publishedAt);
  const updatedAt = post.updatedAt ? toIsoDate(post.updatedAt) : null;
  const readingTime = Number.isFinite(post.readTimeMinutes) ? Math.max(1, Math.floor(post.readTimeMinutes)) : 6;

  const frontmatter = [
    "---",
    `slug: "${escapeInline(slug)}"`,
    `title: "${escapeInline(locale.title)}"`,
    `excerpt: "${escapeInline(locale.excerpt)}"`,
    `seoTitle: "${escapeInline(locale.seoTitle || locale.title)}"`,
    `seoDescription: "${escapeInline(locale.seoDescription || locale.excerpt)}"`,
    `publishedAt: "${publishedAt}"`,
    ...(updatedAt ? [`updatedAt: "${updatedAt}"`] : []),
    'authorId: "bridgemind-editorial"',
    "tags:",
    toYamlArray(tags),
    `featured: ${post.featured ? "true" : "false"}`,
    `readingTime: ${readingTime}`,
    ...(post.research?.packetId ? [`researchPacketId: "${escapeInline(post.research.packetId)}"`] : []),
    ...(post.research?.provider ? [`researchProvider: "${escapeInline(post.research.provider)}"`] : []),
    ...(Number.isFinite(post.research?.sourceCount) ? [`researchSourceCount: ${Math.max(1, Math.floor(post.research.sourceCount))}`] : []),
    "---",
    "",
  ].join("\n");

  const body = (locale.contentBlocks ?? []).map(blockToMarkdown).filter(Boolean).join("\n\n");
  return `${frontmatter}${body}\n`;
}

async function run() {
  const files = (await fs.readdir(postsRoot)).filter((file) => file.endsWith(".json")).sort();
  if (files.length === 0) {
    console.log("[blog:migrate-mdx] no JSON posts found");
    return;
  }

  let created = 0;
  for (const file of files) {
    const jsonPath = path.join(postsRoot, file);
    const raw = await fs.readFile(jsonPath, "utf8");
    const post = JSON.parse(raw);
    const slug = normalizeSlug(post.slug || file.replace(/\.json$/i, ""));
    const mdxPath = path.join(postsRoot, `${slug}.mdx`);

    try {
      await fs.access(mdxPath);
      console.log(`[blog:migrate-mdx] skip existing ${path.basename(mdxPath)}`);
      continue;
    } catch {
      // file does not exist
    }

    const mdx = toMdx(post);
    await fs.writeFile(mdxPath, mdx, "utf8");
    created += 1;
    console.log(`[blog:migrate-mdx] created ${path.basename(mdxPath)}`);
  }

  console.log(`[blog:migrate-mdx] done. created=${created} total_json=${files.length}`);
}

run().catch((error) => {
  console.error("[blog:migrate-mdx] failed:", error);
  process.exitCode = 1;
});
