import { z } from "zod";

import { normalizeBlogSlug, normalizeSlugList } from "@/lib/blog/slug";

type ExaSearchResult = {
  title: string;
  url: string;
  publishedDate?: string | null;
  author?: string | null;
  text?: string | null;
  summary?: string | null;
};

const exaSearchResponseSchema = z.object({
  requestId: z.string().optional(),
  searchType: z.string().optional(),
  results: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
      publishedDate: z.string().nullable().optional(),
      author: z.string().nullable().optional(),
      text: z.string().nullable().optional(),
      summary: z.string().nullable().optional(),
    }),
  ),
});

export type DeepResearchSource = {
  id: string;
  title: string;
  url: string;
  domain: string;
  publishedDate: string;
  author?: string;
  snippet: string;
  relevanceScore: number;
};

export type ResearchVerificationCheck = {
  round: "relevance" | "freshness" | "diversity" | "corroboration";
  passed: boolean;
  details: string;
};

export type DeepResearchKeyPoint = {
  title: string;
  summary: string;
  supportingSourceIds: string[];
};

export type DeepResearchPacket = {
  id: string;
  topic: string;
  angle?: string;
  tags: string[];
  createdAt: string;
  recencyDays: number;
  maxSources: number;
  query: string;
  additionalQueries: string[];
  provider: "exa-search-deep";
  providerRequestId?: string;
  sources: DeepResearchSource[];
  verificationChecks: ResearchVerificationCheck[];
  keyPoints: DeepResearchKeyPoint[];
  notes: string[];
};

export type DeepResearchInput = {
  topic: string;
  angle?: string;
  tags: string[];
  recencyDays: number;
  maxSources: number;
  locale: "en" | "ru";
};

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "into",
  "your",
  "about",
  "latest",
  "guide",
  "using",
  "update",
  "new",
  "blog",
  "team",
  "process",
  "based",
  "what",
  "when",
  "where",
  "how",
  "это",
  "для",
  "как",
  "что",
  "или",
  "при",
  "после",
  "новые",
  "новый",
  "команда",
  "команд",
  "статья",
  "статьи",
]);

function normalizeValue(value: string): string {
  return value.trim().toLowerCase();
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/gu)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function getDateDaysAgo(days: number): string {
  const now = Date.now();
  const target = now - days * 24 * 60 * 60 * 1000;
  return new Date(target).toISOString();
}

function parseDateOrNull(value?: string | null): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function buildQueries({
  topic,
  angle,
  locale,
}: {
  topic: string;
  angle?: string;
  locale: "en" | "ru";
}): { query: string; additionalQueries: string[] } {
  const normalizedTopic = topic.trim();
  const normalizedAngle = angle?.trim();
  const currentYear = new Date().getUTCFullYear();

  const primaryQuery = normalizedAngle
    ? `${normalizedTopic}: ${normalizedAngle}. Latest updates and verified sources`
    : `${normalizedTopic} latest updates from reliable sources`;

  const additionalQueries = [
    `${normalizedTopic} ${currentYear} latest news`,
    `${normalizedTopic} expert analysis ${currentYear}`,
    normalizedAngle ? `${normalizedTopic} ${normalizedAngle} evidence-based` : "",
    locale === "ru" ? `${normalizedTopic} последние новости ${currentYear}` : "",
  ].filter((queryCandidate) => queryCandidate.length > 0);

  return {
    query: primaryQuery,
    additionalQueries,
  };
}

function getSnippet(result: ExaSearchResult): string {
  const baseText = result.summary || result.text || "";
  const normalized = baseText.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }

  if (normalized.length <= 320) {
    return normalized;
  }

  return `${normalized.slice(0, 317)}...`;
}

function calculateRelevanceScore(
  source: Pick<DeepResearchSource, "title" | "snippet" | "publishedDate">,
  queryTokens: string[],
): number {
  const haystackTitle = normalizeValue(source.title);
  const haystackSnippet = normalizeValue(source.snippet);

  let tokenScore = 0;
  for (const token of queryTokens) {
    if (haystackTitle.includes(token)) {
      tokenScore += 3;
      continue;
    }

    if (haystackSnippet.includes(token)) {
      tokenScore += 1;
    }
  }

  const publishedAt = parseDateOrNull(source.publishedDate);
  const freshnessBonus = publishedAt
    ? Math.max(0, 15 - Math.floor((Date.now() - publishedAt.getTime()) / (1000 * 60 * 60 * 24 * 2)))
    : 0;

  return tokenScore + freshnessBonus;
}

function pickEssentialSources(candidates: DeepResearchSource[], maxSources: number): DeepResearchSource[] {
  const sorted = [...candidates].sort((left, right) => right.relevanceScore - left.relevanceScore);
  const domainCounters = new Map<string, number>();
  const essential: DeepResearchSource[] = [];

  for (const source of sorted) {
    const domainCount = domainCounters.get(source.domain) ?? 0;

    if (source.relevanceScore < 5) {
      continue;
    }

    if (domainCount >= 2) {
      continue;
    }

    essential.push(source);
    domainCounters.set(source.domain, domainCount + 1);

    if (essential.length >= maxSources) {
      break;
    }
  }

  return essential;
}

function verifyCorroboration(sources: DeepResearchSource[]): {
  passed: boolean;
  details: string;
  keyPoints: DeepResearchKeyPoint[];
} {
  const tokenToSources = new Map<string, Set<string>>();

  for (const source of sources) {
    const tokens = tokenize(`${source.title} ${source.snippet}`);
    for (const token of tokens) {
      const current = tokenToSources.get(token) ?? new Set<string>();
      current.add(source.id);
      tokenToSources.set(token, current);
    }
  }

  const corroboratedTokens = [...tokenToSources.entries()]
    .filter(([, sourceIds]) => sourceIds.size >= 2)
    .sort((left, right) => right[1].size - left[1].size)
    .slice(0, 5);

  const keyPoints: DeepResearchKeyPoint[] = corroboratedTokens.map(([token, sourceIds], index) => ({
    title: `Signal ${index + 1}: ${token}`,
    summary: `Repeated in ${sourceIds.size} independent sources.`,
    supportingSourceIds: [...sourceIds],
  }));

  if (keyPoints.length < 2) {
    return {
      passed: false,
      details: "Cross-source corroboration is insufficient (fewer than 2 repeated signals).",
      keyPoints,
    };
  }

  return {
    passed: true,
    details: `Corroboration passed with ${keyPoints.length} repeated signals.`,
    keyPoints,
  };
}

async function searchWithExa({
  query,
  additionalQueries,
  startPublishedDate,
  maxCandidates,
}: {
  query: string;
  additionalQueries: string[];
  startPublishedDate: string;
  maxCandidates: number;
}) {
  const exaApiKey = process.env.EXA_API_KEY?.trim();

  if (!exaApiKey) {
    throw new Error(
      "EXA_API_KEY is not configured. Add EXA_API_KEY to environment variables for deep research.",
    );
  }

  const response = await fetch("https://api.exa.ai/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": exaApiKey,
    },
    body: JSON.stringify({
      query,
      additionalQueries,
      type: "deep",
      numResults: maxCandidates,
      startPublishedDate,
      endPublishedDate: new Date().toISOString(),
      contents: {
        text: true,
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Exa search failed (${response.status}): ${errorText}`);
  }

  const payload = exaSearchResponseSchema.parse(await response.json());
  return payload;
}

function estimateReadTimeMinutes(textBlocks: string[]): number {
  const words = textBlocks
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(3, Math.ceil(words / 220));
}

export async function runDeepResearchWorkflow(input: DeepResearchInput): Promise<DeepResearchPacket> {
  const topic = input.topic.trim();
  const angle = input.angle?.trim();
  const recencyDays = Math.max(1, Math.min(input.recencyDays, 180));
  const maxSources = Math.max(3, Math.min(input.maxSources, 12));
  const tags = normalizeSlugList(input.tags);

  if (!topic) {
    throw new Error("Topic is required for deep research.");
  }

  const querySet = buildQueries({ topic, angle, locale: input.locale });
  const queryTokens = tokenize(`${topic} ${angle ?? ""} ${tags.join(" ")}`);
  const startPublishedDate = getDateDaysAgo(recencyDays);
  const maxCandidates = Math.max(maxSources * 4, 12);

  const exaPayload = await searchWithExa({
    query: querySet.query,
    additionalQueries: querySet.additionalQueries,
    startPublishedDate,
    maxCandidates,
  });

  const dedupeByUrl = new Set<string>();
  const candidates: DeepResearchSource[] = [];

  for (const [index, result] of exaPayload.results.entries()) {
    const url = result.url?.trim();
    const title = result.title?.trim();
    const publishedAt = parseDateOrNull(result.publishedDate);

    if (!url || !title || !publishedAt) {
      continue;
    }

    const normalizedDate = publishedAt.toISOString();
    if (normalizedDate < startPublishedDate) {
      continue;
    }

    if (dedupeByUrl.has(url)) {
      continue;
    }

    let domain = "";
    try {
      domain = new URL(url).hostname.replace(/^www\./, "");
    } catch {
      continue;
    }

    dedupeByUrl.add(url);

    const source: DeepResearchSource = {
      id: `src-${index + 1}`,
      title,
      url,
      domain,
      publishedDate: normalizedDate,
      author: result.author ?? undefined,
      snippet: getSnippet(result),
      relevanceScore: 0,
    };

    source.relevanceScore = calculateRelevanceScore(source, queryTokens);
    candidates.push(source);
  }

  const selectedSources = pickEssentialSources(candidates, maxSources);
  const averageRelevanceScore =
    selectedSources.reduce((acc, source) => acc + source.relevanceScore, 0) /
    Math.max(1, selectedSources.length);

  const relevanceCheck: ResearchVerificationCheck = {
    round: "relevance",
    passed: selectedSources.length >= 3 && averageRelevanceScore >= 6,
    details:
      selectedSources.length >= 3 && averageRelevanceScore >= 6
        ? `Selected ${selectedSources.length} essential sources (avg relevance ${averageRelevanceScore.toFixed(1)}).`
        : `Relevance gate failed: ${selectedSources.length} sources with avg relevance ${averageRelevanceScore.toFixed(1)}.`,
  };

  const freshnessPass = selectedSources.every((source) => source.publishedDate >= startPublishedDate);
  const freshnessCheck: ResearchVerificationCheck = {
    round: "freshness",
    passed: freshnessPass,
    details: freshnessPass
      ? `All selected sources are within the last ${recencyDays} days.`
      : "Some selected sources are older than the allowed freshness window.",
  };

  const uniqueDomainsCount = new Set(selectedSources.map((source) => source.domain)).size;
  const diversityCheck: ResearchVerificationCheck = {
    round: "diversity",
    passed: uniqueDomainsCount >= 3,
    details:
      uniqueDomainsCount >= 3
        ? `Domain diversity passed (${uniqueDomainsCount} unique domains).`
        : `Domain diversity failed (${uniqueDomainsCount} unique domains, minimum is 3).`,
  };

  const corroboration = verifyCorroboration(selectedSources);
  const corroborationCheck: ResearchVerificationCheck = {
    round: "corroboration",
    passed: corroboration.passed,
    details: corroboration.details,
  };

  const verificationChecks = [relevanceCheck, freshnessCheck, diversityCheck, corroborationCheck];
  const failedCheck = verificationChecks.find((check) => !check.passed);
  if (failedCheck) {
    throw new Error(`Deep research verification failed at "${failedCheck.round}": ${failedCheck.details}`);
  }

  const packetSlug = normalizeBlogSlug(topic) || "research";
  const packetId = `${packetSlug}-${Date.now()}`;

  return {
    id: packetId,
    topic,
    angle,
    tags,
    createdAt: new Date().toISOString(),
    recencyDays,
    maxSources,
    query: querySet.query,
    additionalQueries: querySet.additionalQueries,
    provider: "exa-search-deep",
    providerRequestId: exaPayload.requestId,
    sources: selectedSources,
    verificationChecks,
    keyPoints: corroboration.keyPoints,
    notes: [
      "Only fresh sources from the configured recency window are allowed.",
      "Only high-relevance sources are selected after scoring and domain balancing.",
      "Multi-round verification (relevance, freshness, diversity, corroboration) is mandatory.",
    ],
  };
}

export function buildDraftPostFromResearch({
  packet,
  slug,
  titleEn,
  titleRu,
  tags,
}: {
  packet: DeepResearchPacket;
  slug: string;
  titleEn: string;
  titleRu: string;
  tags: string[];
}) {
  const normalizedSlug = normalizeBlogSlug(slug);
  const normalizedTags = normalizeSlugList(tags);

  if (!normalizedSlug) {
    throw new Error("Post slug is invalid.");
  }

  if (normalizedTags.length === 0) {
    throw new Error("At least one tag is required.");
  }

  const keyPointLinesEn = packet.keyPoints.map(
    (point) => `${point.title}. ${point.summary} Supporting sources: ${point.supportingSourceIds.join(", ")}.`,
  );
  const keyPointLinesRu = packet.keyPoints.map(
    (point) => `${point.title}. ${point.summary} Подтверждающие источники: ${point.supportingSourceIds.join(", ")}.`,
  );

  const sourceBullets = packet.sources.map(
    (source) => `${source.title} — ${source.url} (${source.publishedDate.slice(0, 10)})`,
  );

  const paragraphSample = [
    `Topic: ${packet.topic}. ${packet.angle ? `Angle: ${packet.angle}.` : ""}`,
    `Sources were selected from the last ${packet.recencyDays} days and validated through multi-round checks.`,
    ...keyPointLinesEn,
  ];

  const readTimeMinutes = estimateReadTimeMinutes(paragraphSample);

  return {
    slug: normalizedSlug,
    tags: normalizedTags,
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    readTimeMinutes,
    featured: false,
    locale: {
      en: {
        title: titleEn,
        excerpt: `Research-backed article based on ${packet.sources.length} recent sources about ${packet.topic}.`,
        seoTitle: titleEn,
        seoDescription: `Deep research-based article on ${packet.topic} with verified, recent web sources.`,
        contentBlocks: [
          {
            heading: "Research scope",
            paragraphs: [
              `Topic: ${packet.topic}. ${packet.angle ? `Angle: ${packet.angle}.` : ""}`,
              `Sources were selected from the last ${packet.recencyDays} days and validated through multi-round checks.`,
            ],
          },
          {
            heading: "Verified findings",
            paragraphs: keyPointLinesEn.length > 0 ? keyPointLinesEn : ["No recurring signals were extracted."],
          },
          {
            heading: "Curated fresh sources",
            paragraphs: ["Only recent and high-relevance sources are included below."],
            bullets: sourceBullets,
          },
        ],
      },
      ru: {
        title: titleRu,
        excerpt: `Материал подготовлен на основе ${packet.sources.length} актуальных источников по теме: ${packet.topic}.`,
        seoTitle: titleRu,
        seoDescription: `Статья на основе deep research по теме ${packet.topic} с многоэтапной проверкой источников.`,
        contentBlocks: [
          {
            heading: "Область исследования",
            paragraphs: [
              `Тема: ${packet.topic}. ${packet.angle ? `Фокус: ${packet.angle}.` : ""}`,
              `Источники отобраны за последние ${packet.recencyDays} дней и прошли многоэтапную верификацию.`,
            ],
          },
          {
            heading: "Подтверждённые выводы",
            paragraphs:
              keyPointLinesRu.length > 0
                ? keyPointLinesRu
                : ["Не удалось выделить повторяющиеся подтверждённые сигналы."],
          },
          {
            heading: "Актуальные источники",
            paragraphs: ["Ниже приведены только свежие и релевантные источники."],
            bullets: sourceBullets,
          },
        ],
      },
    },
  };
}
