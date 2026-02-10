import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

import { normalizeBlogSlug, toTitleFromSlug } from "@/lib/blog/slug";
import type { BlogPost, BlogTag } from "@/lib/blog/types";

const blogContentRoot = path.join(process.cwd(), "content", "blog");
const blogPostsRoot = path.join(blogContentRoot, "posts");
const blogTagsFile = path.join(blogContentRoot, "tags.json");

const blogContentBlockSchema = z.object({
  heading: z.string().trim().min(1),
  paragraphs: z.array(z.string().trim().min(1)).min(1),
  bullets: z.array(z.string().trim().min(1)).optional(),
});

const blogLocaleContentSchema = z.object({
  title: z.string().trim().min(1),
  excerpt: z.string().trim().min(1),
  seoTitle: z.string().trim().min(1),
  seoDescription: z.string().trim().min(1),
  contentBlocks: z.array(blogContentBlockSchema).min(1),
});

const blogPostSchema = z.object({
  slug: z.string().trim().min(1),
  tags: z.array(z.string().trim().min(1)).min(1),
  publishedAt: z.string().trim().min(1),
  updatedAt: z.string().trim().optional(),
  readTimeMinutes: z.number().int().positive().optional(),
  featured: z.boolean().optional(),
  coverImage: z.string().trim().optional(),
  research: z
    .object({
      packetId: z.string().trim().min(1),
      provider: z.string().trim().min(1),
      createdAt: z.string().trim().min(1),
      verifiedAt: z.string().trim().min(1),
      sourceCount: z.number().int().positive(),
      verificationRounds: z
        .array(
          z.object({
            round: z.string().trim().min(1),
            passed: z.boolean(),
            details: z.string().trim().min(1),
          }),
        )
        .min(1),
    })
    .optional(),
  locale: z.object({
    en: blogLocaleContentSchema,
    ru: blogLocaleContentSchema,
  }),
});

const blogTagSchema = z.object({
  slug: z.string().trim().min(1),
  label: z.object({
    en: z.string().trim().min(1),
    ru: z.string().trim().min(1),
  }),
  description: z.object({
    en: z.string().trim().min(1),
    ru: z.string().trim().min(1),
  }),
});

function normalizeValue(value: string): string {
  return normalizeBlogSlug(value);
}

function estimateReadTimeMinutes(post: z.infer<typeof blogPostSchema>): number {
  if (typeof post.readTimeMinutes === "number" && Number.isFinite(post.readTimeMinutes)) {
    return post.readTimeMinutes;
  }

  const allText = post.locale.en.contentBlocks
    .flatMap((block) => [block.heading, ...block.paragraphs, ...(block.bullets ?? [])])
    .join(" ");
  const words = allText.trim().split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 200));
}

function parseJsonFile<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf8");

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    throw new Error(`Invalid JSON in ${filePath}: ${(error as Error).message}`);
  }
}

function readPostsFromDisk(): BlogPost[] {
  if (!fs.existsSync(blogPostsRoot)) {
    throw new Error(`Blog posts directory is missing: ${blogPostsRoot}`);
  }

  const fileNames = fs
    .readdirSync(blogPostsRoot)
    .filter((fileName) => fileName.endsWith(".json"))
    .sort((left, right) => left.localeCompare(right));

  if (fileNames.length === 0) {
    throw new Error(`No blog post files found in ${blogPostsRoot}`);
  }

  return fileNames.map((fileName) => {
    const fullPath = path.join(blogPostsRoot, fileName);
    const raw = parseJsonFile<unknown>(fullPath);
    const parsed = blogPostSchema.parse(raw);
    const fileSlug = fileName.replace(/\.json$/i, "");

    if (normalizeValue(fileSlug) !== normalizeValue(parsed.slug)) {
      throw new Error(
        `Blog post slug mismatch: file "${fileName}" contains slug "${parsed.slug}".`,
      );
    }

    return {
      ...parsed,
      readTimeMinutes: estimateReadTimeMinutes(parsed),
    } satisfies BlogPost;
  });
}

function readTagsFromDisk(): BlogTag[] {
  if (!fs.existsSync(blogTagsFile)) {
    return [];
  }

  const raw = parseJsonFile<unknown>(blogTagsFile);
  const parsed = z.array(blogTagSchema).parse(raw);

  return parsed.map((tag) => ({
    ...tag,
  }));
}

function applyTagCoverage(posts: BlogPost[], tags: BlogTag[]): BlogTag[] {
  const normalizedTagMap = new Map(tags.map((tag) => [normalizeValue(tag.slug), tag]));
  const nextTags = [...tags];

  for (const post of posts) {
    for (const tagSlug of post.tags) {
      const normalizedTagSlug = normalizeValue(tagSlug);

      if (normalizedTagMap.has(normalizedTagSlug)) {
        continue;
      }

      const fallbackTag: BlogTag = {
        slug: tagSlug,
        label: {
          en: toTitleFromSlug(tagSlug),
          ru: toTitleFromSlug(tagSlug),
        },
        description: {
          en: "Automatically generated tag from blog content.",
          ru: "Тег автоматически создан на основе контента блога.",
        },
      };

      normalizedTagMap.set(normalizedTagSlug, fallbackTag);
      nextTags.push(fallbackTag);
    }
  }

  return nextTags;
}

const loadedPosts = readPostsFromDisk().sort(
  (left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime(),
);
const loadedTags = applyTagCoverage(loadedPosts, readTagsFromDisk());

export const blogPosts: readonly BlogPost[] = loadedPosts;
export const blogTags: readonly BlogTag[] = loadedTags;
