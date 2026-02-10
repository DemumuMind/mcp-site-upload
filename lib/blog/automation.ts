import fs from "node:fs/promises";
import path from "node:path";

import {
  buildDraftPostFromResearch,
  type DeepResearchPacket,
  type ResearchVerificationCheck,
} from "@/lib/blog/research";
import { normalizeBlogSlug, normalizeSlugList, toTitleFromSlug } from "@/lib/blog/slug";
import { saveBlogPostToSupabase } from "@/lib/blog/supabase-store";

const blogRoot = path.join(process.cwd(), "content", "blog");
const postsRoot = path.join(blogRoot, "posts");
const researchRoot = path.join(blogRoot, "research");
const tagsPath = path.join(blogRoot, "tags.json");

type BlogTagRecord = {
  slug: string;
  label: {
    en: string;
    ru: string;
  };
  description: {
    en: string;
    ru: string;
  };
};

export type BlogDraftCreationResult = {
  slug: string;
  postPath: string;
  researchPath: string;
  sourceCount: number;
};

export type CreateBlogPostFromResearchInput = {
  packet: DeepResearchPacket;
  slug: string;
  titleEn: string;
  titleRu: string;
  tags: string[];
};

function checkVerification(packetId: string, checks: ResearchVerificationCheck[]) {
  const failedCheck = checks.find((check) => !check.passed);

  if (failedCheck) {
    throw new Error(
      `Research packet ${packetId} failed verification at "${failedCheck.round}": ${failedCheck.details}`,
    );
  }
}

async function ensureBlogDirectories() {
  await fs.mkdir(postsRoot, { recursive: true });
  await fs.mkdir(researchRoot, { recursive: true });
}

async function readTagsFile(): Promise<BlogTagRecord[]> {
  try {
    const raw = await fs.readFile(tagsPath, "utf8");
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as BlogTagRecord[];
  } catch {
    return [];
  }
}

async function writeTagsFile(tags: BlogTagRecord[]) {
  await fs.writeFile(tagsPath, `${JSON.stringify(tags, null, 2)}\n`, "utf8");
}

async function ensureTagCoverage(tagSlugs: string[]) {
  const tags = await readTagsFile();
  const known = new Set(tags.map((tag) => normalizeBlogSlug(tag.slug)));
  let changed = false;

  for (const tagSlug of tagSlugs) {
    const normalized = normalizeBlogSlug(tagSlug);

    if (!normalized || known.has(normalized)) {
      continue;
    }

    tags.push({
      slug: normalized,
      label: {
        en: toTitleFromSlug(normalized),
        ru: toTitleFromSlug(normalized),
      },
      description: {
        en: "Automatically generated tag from deep research workflow.",
        ru: "Тег автоматически создан из workflow deep research.",
      },
    });

    known.add(normalized);
    changed = true;
  }

  if (changed) {
    await writeTagsFile(tags);
  }
}

async function ensurePostDoesNotExist(postPath: string) {
  try {
    await fs.access(postPath);
    throw new Error(`Post with this slug already exists: ${path.basename(postPath)}`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return;
    }

    throw error;
  }
}

async function writeResearchPacket(packet: DeepResearchPacket): Promise<string> {
  const packetFileName = `${normalizeBlogSlug(packet.id) || `research-${Date.now()}`}.json`;
  const packetPath = path.join(researchRoot, packetFileName);

  await fs.writeFile(packetPath, `${JSON.stringify(packet, null, 2)}\n`, "utf8");
  return packetPath;
}

export function parseTagList(value: string): string[] {
  return normalizeSlugList(
    value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  );
}

export async function createBlogPostFromResearch(
  input: CreateBlogPostFromResearchInput,
): Promise<BlogDraftCreationResult> {
  const slug = normalizeBlogSlug(input.slug);
  const titleEn = input.titleEn.trim();
  const titleRu = input.titleRu.trim();
  const tags = normalizeSlugList(input.tags);

  if (!slug) {
    throw new Error("Slug is required.");
  }

  if (!titleEn || !titleRu) {
    throw new Error("Both English and Russian titles are required.");
  }

  if (tags.length === 0) {
    throw new Error("At least one tag is required.");
  }

  checkVerification(input.packet.id, input.packet.verificationChecks);

  const postPath = path.join(postsRoot, `${slug}.json`);
  await ensurePostDoesNotExist(postPath);

  const draft = buildDraftPostFromResearch({
    packet: input.packet,
    slug,
    titleEn,
    titleRu,
    tags,
  });

  const postPayload = {
    ...draft,
    research: {
      packetId: input.packet.id,
      provider: input.packet.provider,
      createdAt: input.packet.createdAt,
      verifiedAt: new Date().toISOString(),
      sourceCount: input.packet.sources.length,
      verificationRounds: input.packet.verificationChecks,
    },
  };
  const runningOnVercel = Boolean(process.env.VERCEL);

  try {
    const storageTarget = await saveBlogPostToSupabase({
      slug,
      tags,
      publishedAt: postPayload.publishedAt,
      updatedAt: postPayload.updatedAt,
      readTimeMinutes: postPayload.readTimeMinutes,
      featured: postPayload.featured,
      locale: postPayload.locale,
      research: postPayload.research,
    });

    if (storageTarget) {
      return {
        slug,
        postPath:
          storageTarget === "table"
            ? `supabase://public.blog_posts/${slug}`
            : `supabase://storage/${slug}`,
        researchPath:
          storageTarget === "table"
            ? `supabase://public.blog_posts/${slug}#research`
            : `supabase://storage/${slug}#research`,
        sourceCount: input.packet.sources.length,
      };
    }
  } catch (error) {
    if (runningOnVercel) {
      throw error;
    }
  }

  if (runningOnVercel) {
    throw new Error(
      "Supabase storage is required for production blog automation. Configure SUPABASE_SERVICE_ROLE_KEY and run blog_posts migration.",
    );
  }

  await ensureBlogDirectories();
  const researchPath = await writeResearchPacket(input.packet);

  try {
    await fs.writeFile(postPath, `${JSON.stringify(postPayload, null, 2)}\n`, "utf8");
    await ensureTagCoverage(tags);
  } catch (error) {
    const errorCode = (error as NodeJS.ErrnoException).code;

    if (errorCode === "EROFS" || errorCode === "EPERM") {
      throw new Error(
        "Current environment is read-only. Run blog automation in a writable environment to persist files.",
      );
    }

    throw error;
  }

  return {
    slug,
    postPath,
    researchPath,
    sourceCount: input.packet.sources.length,
  };
}
