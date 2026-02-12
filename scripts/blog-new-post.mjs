#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);

function readArg(name) {
  const index = args.indexOf(name);
  if (index === -1) {
    return undefined;
  }

  return args[index + 1];
}

function toSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toTitleCase(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function ensureTagCoverage(tagsFilePath, tagSlugs) {
  let tags = [];

  try {
    const raw = await fs.readFile(tagsFilePath, "utf8");
    tags = JSON.parse(raw);
  } catch {
    tags = [];
  }

  const existing = new Set(tags.map((tag) => String(tag.slug).toLowerCase()));

  for (const tagSlug of tagSlugs) {
    const normalized = tagSlug.toLowerCase();
    if (existing.has(normalized)) {
      continue;
    }

    tags.push({
      slug: tagSlug,
      label: {
        en: toTitleCase(tagSlug),
      },
      description: {
        en: "Automatically generated tag from blog content.",
      },
    });
    existing.add(normalized);
  }

  await fs.writeFile(tagsFilePath, `${JSON.stringify(tags, null, 2)}\n`, "utf8");
}

async function main() {
  const inputSlug = readArg("--slug");
  const titleEn = readArg("--title-en") || "New Blog Post";
  const tagsInput = readArg("--tags") || "playbook";

  if (!inputSlug) {
    console.error(
      "Usage: npm run blog:new -- --slug <slug> [--title-en \"...\"] [--tags \"playbook,workflow\"]",
    );
    process.exit(1);
  }

  const slug = toSlug(inputSlug);
  if (!slug) {
    console.error("Invalid slug. Use letters, numbers, spaces, and hyphens.");
    process.exit(1);
  }

  const tagSlugs = [...new Set(tagsInput.split(",").map((tag) => toSlug(tag)).filter(Boolean))];

  if (tagSlugs.length === 0) {
    console.error("At least one valid tag is required.");
    process.exit(1);
  }

  const blogRoot = path.join(process.cwd(), "content", "blog");
  const postsRoot = path.join(blogRoot, "posts");
  const tagsFile = path.join(blogRoot, "tags.json");
  const filePath = path.join(postsRoot, `${slug}.json`);

  await fs.mkdir(postsRoot, { recursive: true });

  try {
    await fs.access(filePath);
    console.error(`Post file already exists: ${filePath}`);
    process.exit(1);
  } catch {
    // file does not exist
  }

  const nowIso = new Date().toISOString();
  const template = {
    slug,
    tags: tagSlugs,
    publishedAt: nowIso,
    updatedAt: nowIso,
    readTimeMinutes: 5,
    featured: false,
    locale: {
      en: {
        title: titleEn,
        excerpt: "Add a short English excerpt for listing cards.",
        seoTitle: titleEn,
        seoDescription: "Add an SEO description in English.",
        contentBlocks: [
          {
            heading: "First section heading",
            paragraphs: ["Write your first paragraph in English."],
            bullets: ["Optional bullet point"],
          },
        ],
      },
    },
  };

  await fs.writeFile(filePath, `${JSON.stringify(template, null, 2)}\n`, "utf8");
  await ensureTagCoverage(tagsFile, tagSlugs);

  console.log(`Created: ${path.relative(process.cwd(), filePath)}`);
  console.log(`Updated tags: ${path.relative(process.cwd(), tagsFile)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
