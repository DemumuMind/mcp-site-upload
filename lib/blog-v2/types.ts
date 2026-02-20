export type BlogV2Topic = {
  name: string;
  slug: string;
  description: string;
  colorToken?: string;
};

export type BlogV2Author = {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar?: string;
  xUrl?: string;
  linkedinUrl?: string;
};

export type BlogV2Post = {
  slug: string;
  url: string;
  title: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  publishedAt: string;
  updatedAt?: string;
  authorId: string;
  author: BlogV2Author | null;
  tags: string[];
  topics: BlogV2Topic[];
  series?: string;
  featured: boolean;
  coverImage?: string;
  canonicalUrl?: string;
  readingTimeMinutes: number;
  bodyCode: string;
  bodyRaw: string;
  bodyBlocks?: Array<{
    heading: string;
    paragraphs: string[];
    bullets?: string[];
  }>;
  researchPacketId?: string;
  researchProvider?: string;
  researchSourceCount?: number;
};

export type BlogV2ListItem = Omit<BlogV2Post, "bodyCode" | "bodyRaw">;
