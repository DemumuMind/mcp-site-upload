import { z } from "zod";

import type { BlogPost, BlogResearchMetadata } from "@/lib/blog/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

function estimateReadTimeMinutes(post: Pick<BlogPost, "locale">): number {
  const allText = post.locale.en.contentBlocks
    .flatMap((block) => [block.heading, ...block.paragraphs, ...(block.bullets ?? [])])
    .join(" ");
  const words = allText.trim().split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 200));
}

function toBlogPost(row: SupabaseBlogPostRow): BlogPost | null {
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

    if (error || !data) {
      return [];
    }

    return (data as SupabaseBlogPostRow[])
      .map((row) => toBlogPost(row))
      .filter((row): row is BlogPost => Boolean(row));
  } catch {
    return [];
  }
}

export async function saveBlogPostToSupabase(input: PersistedBlogPostInput): Promise<boolean> {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return false;
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

  if (error) {
    throw new Error(`Failed to save post in blog_posts: ${error.message}`);
  }

  return true;
}
