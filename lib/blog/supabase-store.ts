import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { BlogPost, BlogResearchMetadata } from "@/lib/blog/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const BLOG_STORAGE_BUCKET = "blog-automation";
const BLOG_STORAGE_POSTS_PREFIX = "posts";

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

const blogLocaleRecordSchema = z.object({
  en: blogLocaleContentSchema,
  ru: blogLocaleContentSchema,
});

const blogResearchSchema = z
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
  .nullable()
  .optional();

const blogPostSchema = z.object({
  slug: z.string().trim().min(1),
  tags: z.array(z.string().trim().min(1)).min(1),
  publishedAt: z.string().trim().min(1),
  updatedAt: z.string().trim().optional(),
  readTimeMinutes: z.number().int().positive().optional(),
  featured: z.boolean().optional(),
  coverImage: z.string().trim().optional(),
  locale: blogLocaleRecordSchema,
  research: blogResearchSchema,
});

type SupabaseBlogPostRow = {
  slug: string;
  tags: string[] | null;
  published_at: string;
  updated_at: string | null;
  read_time_minutes: number | null;
  featured: boolean | null;
  cover_image: string | null;
  locale: unknown;
  research: unknown;
};

export type PersistedBlogPostInput = {
  slug: string;
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  readTimeMinutes: number;
  featured?: boolean;
  coverImage?: string;
  locale: BlogPost["locale"];
  research?: BlogResearchMetadata;
};

export type BlogStorageTarget = "table" | "storage";

function estimateReadTimeMinutes(post: Pick<BlogPost, "locale">): number {
  const allText = post.locale.en.contentBlocks
    .flatMap((block) => [block.heading, ...block.paragraphs, ...(block.bullets ?? [])])
    .join(" ");
  const words = allText.trim().split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 200));
}

function isMissingTableError(message: string): boolean {
  return (
    message.includes("Could not find the table 'public.blog_posts'") ||
    message.includes("relation \"blog_posts\" does not exist")
  );
}

function normalizeStoredBlogPost(post: BlogPost): BlogPost {
  const fallbackReadTime = estimateReadTimeMinutes({
    locale: post.locale,
  });

  return {
    ...post,
    readTimeMinutes:
      typeof post.readTimeMinutes === "number" && Number.isFinite(post.readTimeMinutes)
        ? Math.max(1, post.readTimeMinutes)
        : fallbackReadTime,
  };
}

function fromTableRow(row: SupabaseBlogPostRow): BlogPost | null {
  const parsedLocale = blogLocaleRecordSchema.safeParse(row.locale);
  if (!parsedLocale.success) {
    return null;
  }

  const parsedResearch = blogResearchSchema.safeParse(row.research);
  if (!parsedResearch.success) {
    return null;
  }

  const fallbackReadTime = estimateReadTimeMinutes({
    locale: parsedLocale.data,
  });

  return {
    slug: row.slug,
    tags: Array.isArray(row.tags) ? row.tags.filter(Boolean) : [],
    publishedAt: row.published_at,
    updatedAt: row.updated_at ?? undefined,
    readTimeMinutes:
      typeof row.read_time_minutes === "number" && Number.isFinite(row.read_time_minutes)
        ? Math.max(1, row.read_time_minutes)
        : fallbackReadTime,
    featured: Boolean(row.featured),
    coverImage: row.cover_image ?? undefined,
    locale: parsedLocale.data,
    research: parsedResearch.data ?? undefined,
  };
}

async function blobToText(data: Blob): Promise<string> {
  if (typeof data.text === "function") {
    return data.text();
  }

  const arrayBuffer = await data.arrayBuffer();
  return new TextDecoder().decode(arrayBuffer);
}

async function ensureStorageBucket(adminClient: SupabaseClient): Promise<void> {
  const { data, error } = await adminClient.storage.getBucket(BLOG_STORAGE_BUCKET);

  if (data && !error) {
    return;
  }

  const { error: createError } = await adminClient.storage.createBucket(BLOG_STORAGE_BUCKET, {
    public: false,
    fileSizeLimit: "2MB",
  });

  if (createError && !createError.message.toLowerCase().includes("already exists")) {
    throw new Error(`Failed to create storage bucket ${BLOG_STORAGE_BUCKET}: ${createError.message}`);
  }
}

async function readStoragePosts(client: SupabaseClient): Promise<BlogPost[]> {
  const { data: files, error: listError } = await client.storage
    .from(BLOG_STORAGE_BUCKET)
    .list(BLOG_STORAGE_POSTS_PREFIX, {
      limit: 1000,
      sortBy: {
        column: "name",
        order: "desc",
      },
    });

  if (listError || !files) {
    return [];
  }

  const loadedPosts: BlogPost[] = [];

  for (const file of files) {
    if (!file.name.endsWith(".json")) {
      continue;
    }

    const objectPath = `${BLOG_STORAGE_POSTS_PREFIX}/${file.name}`;
    const { data, error } = await client.storage.from(BLOG_STORAGE_BUCKET).download(objectPath);

    if (error || !data) {
      continue;
    }

    try {
      const text = await blobToText(data);
      const parsed = blogPostSchema.safeParse(JSON.parse(text));

      if (!parsed.success) {
        continue;
      }

      loadedPosts.push(normalizeStoredBlogPost(parsed.data as BlogPost));
    } catch {
      // Ignore malformed objects and keep the feed resilient.
    }
  }

  return loadedPosts;
}

function mergePostsBySlug(primary: BlogPost[], secondary: BlogPost[]): BlogPost[] {
  const map = new Map<string, BlogPost>();

  for (const post of secondary) {
    map.set(post.slug.trim().toLowerCase(), post);
  }

  for (const post of primary) {
    map.set(post.slug.trim().toLowerCase(), post);
  }

  return [...map.values()].sort(
    (left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime(),
  );
}

export async function getBlogPostsFromSupabase(): Promise<BlogPost[]> {
  const supabaseClient = createSupabaseServerClient() ?? createSupabaseAdminClient();

  if (!supabaseClient) {
    return [];
  }

  try {
    const { data, error } = await supabaseClient
      .from("blog_posts")
      .select(
        "slug, tags, published_at, updated_at, read_time_minutes, featured, cover_image, locale, research",
      )
      .order("published_at", { ascending: false });

    if (error) {
      if (isMissingTableError(error.message)) {
        return readStoragePosts(supabaseClient);
      }

      return [];
    }

    const tablePosts = (data as SupabaseBlogPostRow[])
      .map((row) => fromTableRow(row))
      .filter((row): row is BlogPost => Boolean(row));
    const storagePosts = await readStoragePosts(supabaseClient);

    return mergePostsBySlug(tablePosts, storagePosts);
  } catch {
    return [];
  }
}

async function savePostToStorage(
  adminClient: SupabaseClient,
  input: PersistedBlogPostInput,
): Promise<void> {
  await ensureStorageBucket(adminClient);

  const payload: BlogPost = normalizeStoredBlogPost({
    slug: input.slug,
    tags: input.tags,
    publishedAt: input.publishedAt,
    updatedAt: input.updatedAt ?? input.publishedAt,
    readTimeMinutes: input.readTimeMinutes,
    featured: Boolean(input.featured),
    coverImage: input.coverImage ?? undefined,
    locale: input.locale,
    research: input.research,
  });

  const objectPath = `${BLOG_STORAGE_POSTS_PREFIX}/${input.slug}.json`;
  const { error } = await adminClient.storage.from(BLOG_STORAGE_BUCKET).upload(
    objectPath,
    JSON.stringify(payload, null, 2),
    {
      contentType: "application/json; charset=utf-8",
      upsert: false,
    },
  );

  if (error) {
    throw new Error(`Failed to save post in Supabase Storage: ${error.message}`);
  }
}

export async function saveBlogPostToSupabase(
  input: PersistedBlogPostInput,
): Promise<BlogStorageTarget | null> {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return null;
  }

  const { error } = await adminClient.from("blog_posts").insert({
    slug: input.slug,
    tags: input.tags,
    published_at: input.publishedAt,
    updated_at: input.updatedAt ?? input.publishedAt,
    read_time_minutes: Math.max(1, Math.round(input.readTimeMinutes)),
    featured: Boolean(input.featured),
    cover_image: input.coverImage ?? null,
    locale: input.locale,
    research: input.research ?? null,
  });

  if (!error) {
    return "table";
  }

  if (!isMissingTableError(error.message)) {
    throw new Error(`Failed to save post in blog_posts: ${error.message}`);
  }

  await savePostToStorage(adminClient, input);
  return "storage";
}
