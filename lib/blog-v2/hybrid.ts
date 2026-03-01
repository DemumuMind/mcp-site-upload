import {
  getAllBlogV2Posts,
  getBlogV2PostBySlug,
  getBlogV2TagsWithCounts,
  getFeaturedBlogV2Post,
  getRelatedBlogV2Posts,
  type BlogV2TagWithCount,
} from "@/lib/blog-v2/contentlayer";
import type { BlogV2ListItem, BlogV2Post, BlogV2Topic } from "@/lib/blog-v2/types";
import { toTitleFromSlug } from "@/lib/blog/slug";
import {
  getAllBlogPosts as getAllLegacyBlogPosts,
  getBlogPostBySlug as getLegacyBlogPostBySlug,
  getFeaturedPost as getLegacyFeaturedPost,
  getRelatedBlogPosts as getLegacyRelatedPosts,
} from "@/lib/blog/service";
import type { BlogContentBlock, BlogPost as LegacyBlogPost } from "@/lib/blog/types";

function normalizeValue(value: string): string {
  return value.trim().toLowerCase();
}

function toTopic(tag: string): BlogV2Topic {
  const normalized = normalizeValue(tag);
  return {
    slug: normalized,
    name: toTitleFromSlug(normalized) || tag,
    description: `Articles tagged with ${toTitleFromSlug(normalized) || tag}.`,
  };
}

function toBodyRaw(blocks: BlogContentBlock[]): string {
  return blocks
    .map((block) => {
      const lines: string[] = [`## ${block.heading}`];
      for (const paragraph of block.paragraphs) {
        lines.push("", paragraph);
      }
      if (block.bullets && block.bullets.length > 0) {
        lines.push("", ...block.bullets.map((bullet) => `- ${bullet}`));
      }
      return lines.join("\n");
    })
    .join("\n\n");
}

function toBlogV2Post(legacyPost: LegacyBlogPost): BlogV2Post {
  const localized = legacyPost.locale.en;
  const topics = legacyPost.tags.map(toTopic);

  return {
    slug: legacyPost.slug,
    url: `/blog/${legacyPost.slug}`,
    title: localized.title,
    excerpt: localized.excerpt,
    seoTitle: localized.seoTitle,
    seoDescription: localized.seoDescription,
    publishedAt: legacyPost.publishedAt,
    updatedAt: legacyPost.updatedAt,
    authorId: "demumumind-editorial",
    author: null,
    tags: legacyPost.tags,
    topics,
    featured: Boolean(legacyPost.featured),
    coverImage: legacyPost.coverImage,
    readingTimeMinutes: legacyPost.readTimeMinutes,
    bodyCode: "",
    bodyRaw: toBodyRaw(localized.contentBlocks),
    bodyBlocks: localized.contentBlocks,
    researchPacketId: legacyPost.research?.packetId,
    researchProvider: legacyPost.research?.provider,
    researchSourceCount: legacyPost.research?.sourceCount,
  };
}

function toListItem(post: BlogV2Post): BlogV2ListItem {
  const { bodyCode, bodyRaw, bodyBlocks, ...rest } = post;
  void bodyCode;
  void bodyRaw;
  void bodyBlocks;
  return rest;
}

function toSortTimestamp(post: Pick<BlogV2Post, "publishedAt" | "updatedAt">): number {
  const updatedAt = post.updatedAt ? new Date(post.updatedAt).getTime() : Number.NaN;
  if (Number.isFinite(updatedAt)) {
    return updatedAt;
  }
  const publishedAt = new Date(post.publishedAt).getTime();
  return Number.isFinite(publishedAt) ? publishedAt : 0;
}

function mergePosts(primary: BlogV2Post[], secondary: BlogV2Post[]): BlogV2Post[] {
  const map = new Map<string, BlogV2Post>();

  for (const post of secondary) {
    map.set(normalizeValue(post.slug), post);
  }

  for (const post of primary) {
    const key = normalizeValue(post.slug);
    const existing = map.get(key);
    if (!existing || toSortTimestamp(post) >= toSortTimestamp(existing)) {
      map.set(key, post);
    }
  }

  return [...map.values()].sort((left, right) => toSortTimestamp(right) - toSortTimestamp(left));
}

function toTagCounts(posts: BlogV2Post[], contentlayerTags: BlogV2TagWithCount[]): BlogV2TagWithCount[] {
  const fromContentlayer = new Map(contentlayerTags.map((tag) => [normalizeValue(tag.slug), tag]));
  const counters = new Map<string, number>();

  for (const post of posts) {
    for (const tag of post.tags) {
      const key = normalizeValue(tag);
      counters.set(key, (counters.get(key) ?? 0) + 1);
    }
  }

  const merged = [...counters.entries()].map(([slug, count]) => {
    const existing = fromContentlayer.get(slug);
    if (existing) {
      return {
        ...existing,
        count,
      };
    }
    const topic = toTopic(slug);
    return {
      slug: topic.slug,
      name: topic.name,
      description: topic.description,
      colorToken: topic.colorToken,
      count,
    };
  });

  return merged.sort((left, right) => right.count - left.count || left.name.localeCompare(right.name, "en"));
}

export async function getAllBlogV2PostsHybrid(): Promise<BlogV2Post[]> {
  const contentlayerPosts = getAllBlogV2Posts();
  const legacyPosts = (await getAllLegacyBlogPosts()).map(toBlogV2Post);
  return mergePosts(contentlayerPosts, legacyPosts);
}

export async function getAllBlogV2ListItemsHybrid(): Promise<BlogV2ListItem[]> {
  const posts = await getAllBlogV2PostsHybrid();
  return posts.map(toListItem);
}

export async function getBlogV2PostBySlugHybrid(slug: string): Promise<BlogV2Post | null> {
  const fromContentlayer = getBlogV2PostBySlug(slug);
  if (fromContentlayer) {
    return fromContentlayer;
  }
  const fromLegacy = await getLegacyBlogPostBySlug(slug);
  return fromLegacy ? toBlogV2Post(fromLegacy) : null;
}

export async function getFeaturedBlogV2PostHybrid(tag?: string): Promise<BlogV2Post | null> {
  const fromContentlayer = getFeaturedBlogV2Post(tag);
  if (fromContentlayer) {
    return fromContentlayer;
  }
  const fromLegacy = await getLegacyFeaturedPost(tag);
  return fromLegacy ? toBlogV2Post(fromLegacy) : null;
}

export async function getRelatedBlogV2PostsHybrid(slug: string, limit = 3): Promise<BlogV2ListItem[]> {
  const fromContentlayer = getRelatedBlogV2Posts(slug, limit);
  if (fromContentlayer.length > 0) {
    return fromContentlayer;
  }
  const fromLegacy = await getLegacyRelatedPosts(slug, limit);
  return fromLegacy.map((post) => toListItem(toBlogV2Post(post)));
}

export async function getBlogV2TagsWithCountsHybrid(): Promise<BlogV2TagWithCount[]> {
  const posts = await getAllBlogV2PostsHybrid();
  const contentlayerTags = getBlogV2TagsWithCounts();
  return toTagCounts(posts, contentlayerTags);
}

export async function getAllBlogV2SlugsHybrid(): Promise<string[]> {
  const posts = await getAllBlogV2PostsHybrid();
  return posts.map((post) => post.slug);
}

export async function getAllBlogV2SitemapEntriesHybrid(): Promise<Array<Pick<BlogV2ListItem, "slug" | "publishedAt" | "updatedAt">>> {
  const posts = await getAllBlogV2ListItemsHybrid();
  return posts.map((post) => ({
    slug: post.slug,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
  }));
}

