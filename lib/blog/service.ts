import { unstable_cache } from "next/cache";

import { blogPosts as diskBlogPosts, blogTags as diskBlogTags } from "@/lib/blog/content";
import { getBlogPostsFromSupabase } from "@/lib/blog/supabase-store";
import type { BlogPost, BlogTag } from "@/lib/blog/types";
import { normalizeBlogSlug, toTitleFromSlug } from "@/lib/blog/slug";

export const BLOG_POSTS_CACHE_TAG = "blog-posts";
export const BLOG_POSTS_REVALIDATE_SECONDS = 300;

type BlogSnapshot = {
  posts: BlogPost[];
  tags: BlogTag[];
};

function sortByPublishedDesc(a: BlogPost, b: BlogPost): number {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

function normalizeValue(value: string): string {
  return value.trim().toLowerCase();
}

function mergePosts(diskPosts: BlogPost[], databasePosts: BlogPost[]): BlogPost[] {
  const postMap = new Map<string, BlogPost>();

  for (const post of diskPosts) {
    postMap.set(normalizeBlogSlug(post.slug), post);
  }

  for (const post of databasePosts) {
    postMap.set(normalizeBlogSlug(post.slug), post);
  }

  return [...postMap.values()].sort(sortByPublishedDesc);
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

async function buildBlogSnapshot(): Promise<BlogSnapshot> {
  const databasePosts = await getBlogPostsFromSupabase();
  const posts = mergePosts([...diskBlogPosts], databasePosts);
  const tags = applyTagCoverage(posts, [...diskBlogTags]);

  return {
    posts,
    tags,
  };
}

const getCachedBlogSnapshot = unstable_cache(async () => buildBlogSnapshot(), ["blog-snapshot"], {
  revalidate: BLOG_POSTS_REVALIDATE_SECONDS,
  tags: [BLOG_POSTS_CACHE_TAG],
});

async function getBlogSnapshot(): Promise<BlogSnapshot> {
  return getCachedBlogSnapshot();
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const snapshot = await getBlogSnapshot();
  return [...snapshot.posts];
}

export async function getAllBlogSlugs(): Promise<string[]> {
  const posts = await getAllBlogPosts();
  return posts.map((post) => post.slug);
}

export async function getAllBlogTags(): Promise<BlogTag[]> {
  const snapshot = await getBlogSnapshot();
  return [...snapshot.tags];
}

export async function getBlogTagBySlug(slug: string): Promise<BlogTag | null> {
  const normalizedSlug = normalizeValue(slug);
  const tags = await getAllBlogTags();
  const match = tags.find((tag) => normalizeValue(tag.slug) === normalizedSlug);
  return match ?? null;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const normalizedSlug = normalizeValue(slug);
  const posts = await getAllBlogPosts();
  const match = posts.find((post) => normalizeValue(post.slug) === normalizedSlug);
  return match ?? null;
}

export async function getBlogPostsByTag(tag: string): Promise<BlogPost[]> {
  const normalizedTag = normalizeValue(tag);

  if (!normalizedTag) {
    return getAllBlogPosts();
  }

  const posts = await getAllBlogPosts();
  return posts.filter((post) => post.tags.some((postTag) => normalizeValue(postTag) === normalizedTag));
}

export async function getFeaturedPost(tag?: string): Promise<BlogPost | null> {
  const sourcePosts = tag ? await getBlogPostsByTag(tag) : await getAllBlogPosts();

  if (sourcePosts.length === 0) {
    return null;
  }

  return sourcePosts.find((post) => post.featured) ?? sourcePosts[0] ?? null;
}

export async function getRelatedBlogPosts(slug: string, limit = 3): Promise<BlogPost[]> {
  const sourcePost = await getBlogPostBySlug(slug);

  if (!sourcePost) {
    return [];
  }

  const sourceTags = new Set(sourcePost.tags.map((tag) => normalizeValue(tag)));
  const posts = await getAllBlogPosts();

  return posts
    .filter((post) => post.slug !== sourcePost.slug)
    .map((post) => {
      const sharedTagsCount = post.tags.reduce((count, tag) => {
        if (sourceTags.has(normalizeValue(tag))) {
          return count + 1;
        }

        return count;
      }, 0);

      return {
        post,
        sharedTagsCount,
      };
    })
    .sort((left, right) => {
      if (left.sharedTagsCount !== right.sharedTagsCount) {
        return right.sharedTagsCount - left.sharedTagsCount;
      }

      return sortByPublishedDesc(left.post, right.post);
    })
    .slice(0, Math.max(limit, 0))
    .map((item) => item.post);
}
