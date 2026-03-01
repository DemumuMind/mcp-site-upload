import {
  defineDocumentType,
  defineNestedType,
  makeSource,
} from "contentlayer2/source-files";

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function estimateReadTimeFromRaw(raw: string): number {
  const words = raw.trim().split(/\s+/g).filter(Boolean).length;
  return Math.max(3, Math.ceil(words / 220));
}

export const BlogPost = defineDocumentType(() => ({
  name: "BlogPost",
  filePathPattern: "blog/posts/*.mdx",
  contentType: "mdx",
  fields: {
    slug: { type: "string", required: true },
    title: { type: "string", required: true },
    excerpt: { type: "string", required: true },
    seoTitle: { type: "string", required: false },
    seoDescription: { type: "string", required: false },
    publishedAt: { type: "date", required: true },
    updatedAt: { type: "date", required: false },
    authorId: { type: "string", required: true },
    tags: { type: "list", of: { type: "string" }, required: true },
    series: { type: "string", required: false },
    featured: { type: "boolean", required: false, default: false },
    coverImage: { type: "string", required: false },
    canonicalUrl: { type: "string", required: false },
    draft: { type: "boolean", required: false, default: false },
    readingTime: { type: "number", required: false },
    researchPacketId: { type: "string", required: false },
    researchProvider: { type: "string", required: false },
    researchSourceCount: { type: "number", required: false },
  },
  computedFields: {
    slugNormalized: {
      type: "string",
      resolve: (post) => normalizeSlug(post.slug),
    },
    url: {
      type: "string",
      resolve: (post) => `/blog/${normalizeSlug(post.slug)}`,
    },
    readingTimeMinutes: {
      type: "number",
      resolve: (post) => {
        if (typeof post.readingTime === "number" && Number.isFinite(post.readingTime)) {
          return Math.max(1, Math.floor(post.readingTime));
        }
        return estimateReadTimeFromRaw(post.body.raw);
      },
    },
  },
}));

export const BlogAuthor = defineDocumentType(() => ({
  name: "BlogAuthor",
  filePathPattern: "blog/authors/*.json",
  contentType: "data",
  fields: {
    id: { type: "string", required: true },
    name: { type: "string", required: true },
    role: { type: "string", required: true },
    bio: { type: "string", required: true },
    avatar: { type: "string", required: false },
    xUrl: { type: "string", required: false },
    linkedinUrl: { type: "string", required: false },
  },
}));

const BlogTopicItem = defineNestedType(() => ({
  name: "BlogTopicItem",
  fields: {
    name: { type: "string", required: true },
    slug: { type: "string", required: true },
    description: { type: "string", required: true },
    colorToken: { type: "string", required: false },
  },
}));

export const BlogTopic = defineDocumentType(() => ({
  name: "BlogTopic",
  filePathPattern: "blog/taxonomy/*.json",
  contentType: "data",
  fields: {
    topics: {
      type: "list",
      required: true,
      of: BlogTopicItem,
    },
  },
}));

export default makeSource({
  contentDirPath: "content",
  contentDirInclude: ["blog/posts", "blog/authors", "blog/taxonomy"],
  contentDirExclude: [
    "blog/posts/catalog-patterns-from-discovery-to-reuse.json",
    "blog/posts/cost-governance-in-agentic-engineering-workflows.json",
    "blog/posts/mcp-overview-choosing-the-right-integration-surface.json",
    "blog/posts/mcp-setup-playbook-production-teams.json",
    "blog/posts/safe-rollout-checklist-for-mcp-launches.json",
    "blog/posts/verification-loop-for-agentic-coding-teams.json",
  ],
  documentTypes: [BlogPost, BlogAuthor, BlogTopic],
  disableImportAliasWarning: true,
});
