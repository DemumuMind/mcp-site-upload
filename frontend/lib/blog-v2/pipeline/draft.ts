import fs from "node:fs/promises";
import path from "node:path";
import { buildDraftPostFromResearch, runDeepResearchWorkflow } from "@/lib/blog/research";
import { normalizeBlogSlug, normalizeSlugList, toTitleFromSlug } from "@/lib/blog/slug";
import { saveBlogPostToSupabase } from "@/lib/blog/supabase-store";
import {
  blogV2DraftSchema,
  blogV2GenerateInputSchema,
  blogV2PublishInputSchema,
  type BlogV2Draft,
  type BlogV2GenerateInput,
  type BlogV2PublishResult,
} from "@/lib/blog-v2/pipeline/types";

const blogRoot = path.join(process.cwd(), "content", "blog");
const postsRoot = path.join(blogRoot, "posts");
const topicsPath = path.join(blogRoot, "taxonomy", "topics.json");

type BlogTopicTaxonomyFile = {
  topics: Array<{
    name: string;
    slug: string;
    description: string;
    colorToken?: string;
  }>;
};

function sanitizeLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function toQuoted(value: string): string {
  return `"${value.replaceAll('"', '\\"')}"`;
}

function chooseTitle(input: { title?: string; topic: string }): string {
  const provided = input.title?.trim();
  if (provided) {
    return provided;
  }
  const normalized = toTitleFromSlug(normalizeBlogSlug(input.topic));
  return normalized || "DemumuMind Editorial Draft";
}

function buildExcerpt(topic: string, sourceCount: number): string {
  return `Research-backed article based on ${sourceCount} recent sources about ${topic}.`;
}

function estimateReadTime(text: string): number {
  const words = text.trim().split(/\s+/g).filter(Boolean).length;
  return Math.max(4, Math.ceil(words / 220));
}

function buildMdxFromDraft(input: {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  publishedAt: string;
  readingTime: number;
  researchPacketId: string;
  researchProvider: string;
  researchSourceCount: number;
  bodySections: Array<{ heading: string; paragraphs: string[]; bullets?: string[] }>;
}): string {
  const frontmatter = [
    "---",
    `slug: ${toQuoted(input.slug)}`,
    `title: ${toQuoted(input.title)}`,
    `excerpt: ${toQuoted(input.excerpt)}`,
    `seoTitle: ${toQuoted(input.title)}`,
    `seoDescription: ${toQuoted(input.excerpt)}`,
    `publishedAt: ${toQuoted(input.publishedAt)}`,
    'authorId: "demumumind-editorial"',
    "tags:",
    ...input.tags.map((tag) => `  - ${toQuoted(tag)}`),
    "featured: false",
    `readingTime: ${input.readingTime}`,
    `researchPacketId: ${toQuoted(input.researchPacketId)}`,
    `researchProvider: ${toQuoted(input.researchProvider)}`,
    `researchSourceCount: ${input.researchSourceCount}`,
    "---",
    "",
  ];

  const body: string[] = [];
  for (const section of input.bodySections) {
    body.push(`## ${section.heading}`);
    body.push("");

    for (const paragraph of section.paragraphs) {
      body.push(sanitizeLine(paragraph));
      body.push("");
    }

    if (section.bullets && section.bullets.length > 0) {
      for (const bullet of section.bullets) {
        body.push(`- ${sanitizeLine(bullet)}`);
      }
      body.push("");
    }
  }

  return `${frontmatter.join("\n")}${body.join("\n").trim()}\n`;
}

function buildBodySections(params: {
  topic: string;
  angle?: string;
  packet: Awaited<ReturnType<typeof runDeepResearchWorkflow>>;
}): Array<{ heading: string; paragraphs: string[]; bullets?: string[] }> {
  const sourceBullets = params.packet.sources.map(
    (source) => `${source.title} — ${source.url} (${source.publishedDate.slice(0, 10)})`,
  );

  const findings =
    params.packet.keyPoints.length > 0
      ? params.packet.keyPoints.map(
          (point) =>
            `${point.title}. ${point.summary} Supporting sources: ${point.supportingSourceIds.join(", ")}.`,
        )
      : ["No repeated cross-source signals were detected in this run."];

  return [
    {
      heading: "Research scope",
      paragraphs: [
        `Topic: ${params.topic}. ${params.angle ? `Angle: ${params.angle}.` : ""}`,
        `We constrained evidence to the last ${params.packet.recencyDays} days and passed four verification rounds before drafting.`,
      ],
    },
    {
      heading: "Verified findings",
      paragraphs: findings,
    },
    {
      heading: "Curated fresh sources",
      paragraphs: [
        "Only recent and high-relevance sources are listed. Use these references for deeper implementation decisions.",
      ],
      bullets: sourceBullets,
    },
  ];
}

function toBlogContentBlocksFromMdx(mdx: string): Array<{ heading: string; paragraphs: string[]; bullets?: string[] }> {
  const lines = mdx.split("\n");
  const blocks: Array<{ heading: string; paragraphs: string[]; bullets?: string[] }> = [];
  let current: { heading: string; paragraphs: string[]; bullets?: string[] } | null = null;
  let inFrontmatter = lines[0]?.trim() === "---";
  const startIndex = inFrontmatter ? 1 : 0;

  const normalizeBlock = (block: { heading: string; paragraphs: string[]; bullets?: string[] }) => {
    const normalizedParagraphs = block.paragraphs
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
    const normalizedBullets = block.bullets?.map((bullet) => bullet.trim()).filter(Boolean);

    return {
      heading: block.heading.trim() || "Section",
      paragraphs:
        normalizedParagraphs.length > 0
          ? normalizedParagraphs
          : normalizedBullets && normalizedBullets.length > 0
            ? ["Summary points are listed below."]
            : ["Research-backed draft generated by the blog v2 pipeline."],
      ...(normalizedBullets && normalizedBullets.length > 0 ? { bullets: normalizedBullets } : {}),
    };
  };

  for (let index = startIndex; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const line = rawLine.trim();

    if (inFrontmatter) {
      if (line === "---") {
        inFrontmatter = false;
      }
      continue;
    }

    if (!line) {
      continue;
    }

    if (line.startsWith("## ")) {
      if (current && (current.paragraphs.length > 0 || (current.bullets?.length ?? 0) > 0)) {
        blocks.push(normalizeBlock(current));
      }
      current = {
        heading: line.replace(/^##\s+/, "").trim() || "Section",
        paragraphs: [],
      };
      continue;
    }

    if (!current) {
      current = {
        heading: "Overview",
        paragraphs: [],
      };
    }

    if (line.startsWith("- ")) {
      current.bullets = current.bullets ?? [];
      current.bullets.push(line.replace(/^-+\s*/, "").trim());
      continue;
    }

    current.paragraphs.push(line);
  }

  if (current && (current.paragraphs.length > 0 || (current.bullets?.length ?? 0) > 0)) {
    blocks.push(normalizeBlock(current));
  }

  if (blocks.length === 0) {
    return [
      {
        heading: "Overview",
        paragraphs: ["Research-backed draft generated by the blog v2 pipeline."],
      },
    ];
  }

  return blocks;
}

async function readTopicTaxonomy(): Promise<BlogTopicTaxonomyFile> {
  try {
    const raw = await fs.readFile(topicsPath, "utf8");
    const parsed = JSON.parse(raw) as BlogTopicTaxonomyFile;
    if (!Array.isArray(parsed.topics)) {
      return { topics: [] };
    }
    return parsed;
  } catch {
    return { topics: [] };
  }
}

async function ensureTopicCoverage(tags: string[]): Promise<void> {
  const normalizedTags = normalizeSlugList(tags);
  const taxonomy = await readTopicTaxonomy();
  const known = new Set(taxonomy.topics.map((topic) => normalizeBlogSlug(topic.slug)));
  let changed = false;

  for (const tag of normalizedTags) {
    if (!tag || known.has(tag)) {
      continue;
    }
    taxonomy.topics.push({
      name: toTitleFromSlug(tag),
      slug: tag,
      description: `Auto-generated topic from blog automation for "${toTitleFromSlug(tag)}".`,
      colorToken: "cyan",
    });
    known.add(tag);
    changed = true;
  }

  if (changed) {
    await fs.mkdir(path.dirname(topicsPath), { recursive: true });
    await fs.writeFile(topicsPath, `${JSON.stringify(taxonomy, null, 2)}\n`, "utf8");
  }
}

async function ensureWriteablePostPath(slug: string, force = false): Promise<string> {
  await fs.mkdir(postsRoot, { recursive: true });
  const filePath = path.join(postsRoot, `${slug}.mdx`);

  if (!force) {
    try {
      await fs.access(filePath);
      throw new Error(`Post already exists for slug "${slug}".`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return filePath;
      }
      throw error;
    }
  }

  return filePath;
}

export async function createBlogV2Draft(input: BlogV2GenerateInput): Promise<BlogV2Draft> {
  const parsedInput = blogV2GenerateInputSchema.parse(input);
  const tags = normalizeSlugList(parsedInput.tags);
  const topic = parsedInput.topic.trim();
  const angle = parsedInput.angle?.trim();
  const slug = normalizeBlogSlug(parsedInput.slug || topic);
  const title = chooseTitle({ title: parsedInput.title, topic });

  if (!slug) {
    throw new Error("Unable to produce a valid slug for this topic.");
  }

  const packet = await runDeepResearchWorkflow({
    topic,
    angle,
    tags,
    recencyDays: parsedInput.recencyDays,
    maxSources: parsedInput.maxSources,
    locale: "en",
  });

  const fallbackDraft = buildDraftPostFromResearch({
    packet,
    slug,
    titleEn: title,
    tags,
  });

  const publishedAt = fallbackDraft.publishedAt;
  const excerpt = buildExcerpt(topic, packet.sources.length);
  const bodySections = buildBodySections({ topic, angle, packet });
  const mdx = buildMdxFromDraft({
    slug,
    title,
    excerpt,
    tags,
    publishedAt,
    readingTime: fallbackDraft.readTimeMinutes,
    researchPacketId: packet.id,
    researchProvider: packet.provider,
    researchSourceCount: packet.sources.length,
    bodySections,
  });

  const draft = blogV2DraftSchema.parse({
    slug,
    title,
    excerpt,
    tags,
    publishedAt,
    readingTime: Math.max(fallbackDraft.readTimeMinutes, estimateReadTime(mdx)),
    researchPacketId: packet.id,
    researchProvider: packet.provider,
    researchSourceCount: packet.sources.length,
    mdx,
    sourceUrls: packet.sources.map((source) => source.url),
    notes: packet.notes,
  });

  return draft;
}

export function previewBlogV2Draft(draft: BlogV2Draft): {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  readingTime: number;
  sourceCount: number;
  previewHeadings: string[];
  firstLines: string[];
} {
  const parsed = blogV2DraftSchema.parse(draft);
  const lines = parsed.mdx.split("\n").filter((line) => line.trim().length > 0);
  const headings = lines
    .filter((line) => line.startsWith("## "))
    .map((line) => line.replace(/^##\s+/, ""))
    .slice(0, 8);

  return {
    slug: parsed.slug,
    title: parsed.title,
    excerpt: parsed.excerpt,
    tags: parsed.tags,
    readingTime: parsed.readingTime,
    sourceCount: parsed.researchSourceCount,
    previewHeadings: headings,
    firstLines: lines.slice(0, 18),
  };
}

export async function publishBlogV2Draft(input: {
  draft: BlogV2Draft;
  force?: boolean;
}): Promise<BlogV2PublishResult> {
  const parsedInput = blogV2PublishInputSchema.parse(input);
  const draft = blogV2DraftSchema.parse(parsedInput.draft);

  const contentBlocks = toBlogContentBlocksFromMdx(draft.mdx);
  const storageTarget = await saveBlogPostToSupabase({
    slug: draft.slug,
    tags: draft.tags,
    publishedAt: draft.publishedAt,
    updatedAt: new Date().toISOString(),
    readTimeMinutes: draft.readingTime,
    featured: false,
    locale: {
      en: {
        title: draft.title,
        excerpt: draft.excerpt,
        seoTitle: draft.title,
        seoDescription: draft.excerpt,
        contentBlocks,
      },
    },
    research: {
      packetId: draft.researchPacketId,
      provider: draft.researchProvider,
      createdAt: draft.publishedAt,
      verifiedAt: new Date().toISOString(),
      sourceCount: draft.researchSourceCount,
      verificationRounds: [
        {
          round: "blog-v2-draft-publish",
          passed: true,
          details: `Published from blog v2 draft (${draft.sourceUrls.length} cited source URLs).`,
        },
      ],
    },
  });

  if (storageTarget) {
    return {
      slug: draft.slug,
      path:
        storageTarget === "table"
          ? `supabase://public.blog_posts/${draft.slug}`
          : `supabase://storage/${draft.slug}`,
      sourceCount: draft.researchSourceCount,
    };
  }

  const runningOnVercel = Boolean(process.env.VERCEL);
  if (runningOnVercel) {
    throw new Error("Supabase storage is required for blog v2 auto-publish in production.");
  }

  const filePath = await ensureWriteablePostPath(draft.slug, parsedInput.force);
  await ensureTopicCoverage(draft.tags);
  await fs.writeFile(filePath, `${draft.mdx.trimEnd()}\n`, "utf8");

  return {
    slug: draft.slug,
    path: filePath,
    sourceCount: draft.researchSourceCount,
  };
}

