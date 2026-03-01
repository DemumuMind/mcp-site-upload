import type { Locale } from "@/lib/i18n";
export type BlogContentBlock = {
    heading: string;
    paragraphs: string[];
    bullets?: string[];
};
export type BlogLocaleContent = {
    title: string;
    excerpt: string;
    seoTitle: string;
    seoDescription: string;
    contentBlocks: BlogContentBlock[];
};
export type BlogResearchVerificationRound = {
    round: string;
    passed: boolean;
    details: string;
};
export type BlogResearchMetadata = {
    packetId: string;
    provider: string;
    createdAt: string;
    verifiedAt: string;
    sourceCount: number;
    verificationRounds: BlogResearchVerificationRound[];
};
export type BlogPost = {
    slug: string;
    tags: string[];
    publishedAt: string;
    updatedAt?: string;
    readTimeMinutes: number;
    featured?: boolean;
    coverImage?: string;
    research?: BlogResearchMetadata;
    locale: Record<Locale, BlogLocaleContent>;
};
export type BlogTag = {
    slug: string;
    label: Record<Locale, string>;
    description: Record<Locale, string>;
};
