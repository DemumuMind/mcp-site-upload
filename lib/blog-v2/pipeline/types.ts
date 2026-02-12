import { z } from "zod";

export const blogV2GenerateInputSchema = z.object({
  topic: z.string().trim().min(3),
  angle: z.string().trim().max(400).optional(),
  slug: z.string().trim().min(3).optional(),
  title: z.string().trim().min(3).optional(),
  tags: z.array(z.string().trim().min(1)).min(1),
  recencyDays: z.number().int().min(1).max(180).default(30),
  maxSources: z.number().int().min(3).max(12).default(6),
});

export type BlogV2GenerateInput = z.infer<typeof blogV2GenerateInputSchema>;

export const blogV2DraftSchema = z.object({
  slug: z.string().trim().min(3),
  title: z.string().trim().min(3),
  excerpt: z.string().trim().min(10),
  tags: z.array(z.string().trim().min(1)).min(1),
  publishedAt: z.string().datetime(),
  readingTime: z.number().int().min(1),
  researchPacketId: z.string().trim().min(1),
  researchProvider: z.string().trim().min(1),
  researchSourceCount: z.number().int().min(1),
  mdx: z.string().trim().min(10),
  sourceUrls: z.array(z.string().url()).min(1),
  notes: z.array(z.string()).min(1),
});

export type BlogV2Draft = z.infer<typeof blogV2DraftSchema>;

export const blogV2PublishInputSchema = z.object({
  draft: blogV2DraftSchema,
  force: z.boolean().optional(),
});

export type BlogV2PublishInput = z.infer<typeof blogV2PublishInputSchema>;

export type BlogV2PublishResult = {
  slug: string;
  path: string;
  sourceCount: number;
};
