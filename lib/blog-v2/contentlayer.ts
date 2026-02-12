import { allBlogAuthors, allBlogPosts, allBlogTopics } from "contentlayer/generated";
import type { BlogV2Author, BlogV2ListItem, BlogV2Post, BlogV2Topic } from "@/lib/blog-v2/types";

function normalizeSlug(value: string): string {
  return value.trim().toLowerCase();
}

function toTimestamp(post: { publishedAt: string; updatedAt?: string }): number {
  const updatedAt = post.updatedAt ? new Date(post.updatedAt).getTime() : Number.NaN;
  if (Number.isFinite(updatedAt)) {
    return updatedAt;
  }
  const publishedAt = new Date(post.publishedAt).getTime();
  if (Number.isFinite(publishedAt)) {
    return publishedAt;
  }
  return 0;
}

function sortByRecency(left: { publishedAt: string; updatedAt?: string }, right: { publishedAt: string; updatedAt?: string }): number {
  return toTimestamp(right) - toTimestamp(left);
}

function getTopicIndex(): Map<string, BlogV2Topic> {
  const topicDocument = allBlogTopics[0];
  const map = new Map<string, BlogV2Topic>();

  for (const topic of topicDocument?.topics ?? []) {
    map.set(normalizeSlug(topic.slug), {
      name: topic.name,
      slug: topic.slug,
      description: topic.description,
      colorToken: topic.colorToken || undefined,
    });
  }

  return map;
}

function getAuthorIndex(): Map<string, BlogV2Author> {
  const map = new Map<string, BlogV2Author>();

  for (const author of allBlogAuthors) {
    map.set(normalizeSlug(author.id), {
      id: author.id,
      name: author.name,
      role: author.role,
      bio: author.bio,
      avatar: author.avatar || undefined,
      xUrl: author.xUrl || undefined,
      linkedinUrl: author.linkedinUrl || undefined,
    });
  }

  return map;
}

function toPost(post: (typeof allBlogPosts)[number], topicsMap: Map<string, BlogV2Topic>, authorsMap: Map<string, BlogV2Author>): BlogV2Post {
  const topics = post.tags
    .map((tag) => topicsMap.get(normalizeSlug(tag)))
    .filter((topic): topic is BlogV2Topic => Boolean(topic));

  const author = authorsMap.get(normalizeSlug(post.authorId)) ?? null;

  return {
    slug: post.slugNormalized,
    url: post.url,
    title: post.title,
    excerpt: post.excerpt,
    seoTitle: post.seoTitle ?? post.title,
    seoDescription: post.seoDescription ?? post.excerpt,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt || undefined,
    authorId: post.authorId,
    author,
    tags: post.tags,
    topics,
    series: post.series || undefined,
    featured: Boolean(post.featured),
    coverImage: post.coverImage || undefined,
    canonicalUrl: post.canonicalUrl || undefined,
    readingTimeMinutes: post.readingTimeMinutes,
    bodyCode: post.body.code,
    bodyRaw: post.body.raw,
    researchPacketId: post.researchPacketId || undefined,
    researchProvider: post.researchProvider || undefined,
    researchSourceCount:
      typeof post.researchSourceCount === "number" ? post.researchSourceCount : undefined,
  };
}

export function getBlogV2Topics(): BlogV2Topic[] {
  return [...getTopicIndex().values()].sort((left, right) =>
    left.name.localeCompare(right.name, "en", { sensitivity: "base" }),
  );
}

export function getAllBlogV2Posts(): BlogV2Post[] {
  const topicsMap = getTopicIndex();
  const authorsMap = getAuthorIndex();

  return allBlogPosts
    .filter((post) => !post.draft)
    .map((post) => toPost(post, topicsMap, authorsMap))
    .sort(sortByRecency);
}

export function getBlogV2PostBySlug(slug: string): BlogV2Post | null {
  const normalizedSlug = normalizeSlug(slug);
  const post = getAllBlogV2Posts().find((entry) => normalizeSlug(entry.slug) === normalizedSlug);
  return post ?? null;
}

export function getFeaturedBlogV2Post(tag?: string): BlogV2Post | null {
  const normalizedTag = tag ? normalizeSlug(tag) : null;
  const posts = normalizedTag
    ? getAllBlogV2Posts().filter((post) => post.tags.some((postTag) => normalizeSlug(postTag) === normalizedTag))
    : getAllBlogV2Posts();

  if (posts.length === 0) {
    return null;
  }

  return posts.find((post) => post.featured) ?? posts[0] ?? null;
}

export function getRelatedBlogV2Posts(slug: string, limit = 3): BlogV2ListItem[] {
  const source = getBlogV2PostBySlug(slug);
  if (!source) {
    return [];
  }

  const sourceTags = new Set(source.tags.map(normalizeSlug));
  const related = getAllBlogV2Posts()
    .filter((post) => post.slug !== source.slug)
    .map((post) => ({
      post,
      score: post.tags.reduce((acc, tag) => acc + (sourceTags.has(normalizeSlug(tag)) ? 1 : 0), 0),
    }))
    .sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }
      return sortByRecency(left.post, right.post);
    })
    .slice(0, Math.max(0, limit))
    .map((entry) => toListItem(entry.post));

  return related;
}

export function getBlogV2TagsWithCounts(): Array<{
  slug: string;
  name: string;
  description: string;
  colorToken?: string;
  count: number;
}> {
  const posts = getAllBlogV2Posts();
  const topics = getBlogV2Topics();
  const counters = new Map<string, number>();

  for (const post of posts) {
    for (const tag of post.tags) {
      const key = normalizeSlug(tag);
      counters.set(key, (counters.get(key) ?? 0) + 1);
    }
  }

  return topics
    .map((topic) => ({
      slug: topic.slug,
      name: topic.name,
      description: topic.description,
      colorToken: topic.colorToken,
      count: counters.get(normalizeSlug(topic.slug)) ?? 0,
    }))
    .filter((topic) => topic.count > 0)
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name, "en"));
}

export function toListItem(post: BlogV2Post): BlogV2ListItem {
  const { bodyCode, bodyRaw, ...listItem } = post;
  void bodyCode;
  void bodyRaw;
  return listItem;
}

export function getAllBlogV2ListItems(): BlogV2ListItem[] {
  return getAllBlogV2Posts().map(toListItem);
}
