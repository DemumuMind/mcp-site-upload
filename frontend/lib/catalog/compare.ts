import type { AuthType, HealthStatus, McpServer, VerificationLevel } from "@/lib/types";

export type CatalogShortlistItem = {
  slug: string;
  name: string;
  href: string;
  description: string;
  category: string;
  authType: AuthType;
  verificationLevel: VerificationLevel;
  toolsCount: number;
  healthStatus: HealthStatus;
  repoUrl?: string;
  tags: string[];
};

export type CatalogCompareItem = CatalogShortlistItem & {
  trustScore: number;
  compareScore: number;
  bestUse: string;
  verdict: string;
};

export type CatalogCompareSupportCopy = {
  featuredEyebrow: string;
  featuredTitle: string;
  featuredDescription: string;
  shortlistEyebrow: string;
  shortlistTitle: string;
  shortlistDescription: string;
};

export type CatalogCompareReadinessCopy = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
};

export function shouldEnableCatalogCompare(items: CatalogShortlistItem[]): boolean {
  return items.length >= 2;
}

export function getCatalogCompareSupportCopy(hasActiveFilters: boolean): CatalogCompareSupportCopy {
  return {
    featuredEyebrow: "Featured picks",
    featuredTitle: "Start here",
    featuredDescription: hasActiveFilters
      ? "Keep one high-trust server in view while narrowing the result set."
      : "Start with proven anchors, then branch into narrower fits from the workspace filters.",
    shortlistEyebrow: "Shortlist",
    shortlistTitle: "Shortlist",
    shortlistDescription: "Save servers to compare them later.",
  };
}

export function getCatalogCompareReadinessCopy(shortlistCount: number): CatalogCompareReadinessCopy {
  if (shortlistCount >= 2) {
    return {
      eyebrow: "Compare threshold reached",
      title: "Open compare",
      description: "The right rail is now expanded into an active compare workspace instead of a passive shortlist tile.",
      ctaLabel: `Compare (${shortlistCount})`,
    };
  }

  return {
    eyebrow: "Compare ready",
    title: "Save 2 servers",
    description: "The right rail turns into an active compare workspace once your shortlist reaches two servers.",
    ctaLabel: `Compare (${shortlistCount})`,
  };
}

export function buildCatalogComparePreview(servers: McpServer[]): CatalogCompareItem[] {
  return buildCatalogCompareItems(servers.map(createCatalogShortlistItem)).slice(0, 3);
}

export function createCatalogShortlistItem(server: McpServer): CatalogShortlistItem {
  return {
    slug: server.slug,
    name: server.name,
    href: `/server/${server.slug}`,
    description: server.description,
    category: server.category,
    authType: server.authType,
    verificationLevel: server.verificationLevel,
    toolsCount: server.tools.length,
    healthStatus: server.healthStatus ?? "unknown",
    repoUrl: server.repoUrl,
    tags: server.tags.filter(Boolean),
  };
}

export function normalizeCatalogShortlistItem(value: unknown): CatalogShortlistItem | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const candidate = value as Partial<CatalogShortlistItem>;
  if (
    typeof candidate.slug !== "string" ||
    typeof candidate.name !== "string" ||
    typeof candidate.href !== "string" ||
    typeof candidate.description !== "string" ||
    typeof candidate.category !== "string" ||
    typeof candidate.toolsCount !== "number" ||
    !isAuthType(candidate.authType) ||
    !isVerificationLevel(candidate.verificationLevel)
  ) {
    return null;
  }

  return {
    slug: candidate.slug,
    name: candidate.name,
    href: candidate.href,
    description: candidate.description,
    category: candidate.category,
    authType: candidate.authType,
    verificationLevel: candidate.verificationLevel,
    toolsCount: candidate.toolsCount,
    healthStatus: isHealthStatus(candidate.healthStatus) ? candidate.healthStatus : "unknown",
    repoUrl: typeof candidate.repoUrl === "string" ? candidate.repoUrl : undefined,
    tags: Array.isArray(candidate.tags) ? candidate.tags.filter((tag): tag is string => typeof tag === "string") : [],
  };
}

export function buildCatalogCompareItems(items: CatalogShortlistItem[]): CatalogCompareItem[] {
  return [...items]
    .map((item) => {
      const trustScore = getTrustScore(item);
      return {
        ...item,
        trustScore: Number(trustScore.toFixed(2)),
        compareScore: Number(getCompareScore(item, trustScore).toFixed(2)),
        bestUse: getBestUse(item),
        verdict: "Strong niche",
      };
    })
    .sort((left, right) => {
      if (right.compareScore === left.compareScore) {
        return left.name.localeCompare(right.name);
      }

      return right.compareScore - left.compareScore;
    })
    .map((item, index) => ({
      ...item,
      verdict: getVerdict(item, index),
    }));
}

function getTrustScore(item: CatalogShortlistItem): number {
  const verificationScore = {
    official: 3.5,
    partner: 2.4,
    community: 1.6,
  }[item.verificationLevel];

  const healthScore = {
    healthy: 1.2,
    unknown: 0.6,
    degraded: 0.25,
    down: 0,
  }[item.healthStatus];

  return verificationScore + healthScore + (item.repoUrl ? 0.8 : 0);
}

function getCompareScore(item: CatalogShortlistItem, trustScore: number): number {
  const authScore = {
    none: 1,
    oauth: 0.55,
    api_key: 0.15,
  }[item.authType];

  const toolsScore = Math.min(item.toolsCount / 5, 1);
  const categoryScore = getCategoryFitScore(item);

  return trustScore * 1.4 + authScore + toolsScore + categoryScore;
}

function getCategoryFitScore(item: CatalogShortlistItem): number {
  const text = `${item.name} ${item.description} ${item.tags.join(" ")}`.toLowerCase();

  if (text.includes("memory")) {
    return 0.75;
  }
  if (item.authType === "api_key") {
    return 0.35;
  }
  if (item.category === "Developer Tools") {
    return 0.55;
  }
  if (item.category === "Search") {
    return 0.6;
  }

  return 0.45;
}

function getBestUse(item: CatalogShortlistItem): string {
  const text = `${item.name} ${item.description} ${item.tags.join(" ")}`.toLowerCase();

  if (text.includes("memory")) {
    return "Long memory";
  }
  if (item.authType === "api_key") {
    return "Infra control";
  }
  if (item.category === "Developer Tools" && item.authType === "none" && item.healthStatus === "healthy") {
    return "Quick adoption";
  }
  if (item.category === "Search") {
    return "Research flows";
  }

  return "Team fit";
}

function getVerdict(item: CatalogShortlistItem, index: number): string {
  if (index === 0) {
    return "Best overall";
  }
  if (item.authType === "api_key" || item.healthStatus === "unknown" || item.healthStatus === "degraded" || item.healthStatus === "down") {
    return "Needs setup";
  }
  if (index === 1) {
    return "Strong alternative";
  }

  return "Strong niche";
}

function isAuthType(value: unknown): value is AuthType {
  return value === "none" || value === "oauth" || value === "api_key";
}

function isVerificationLevel(value: unknown): value is VerificationLevel {
  return value === "community" || value === "partner" || value === "official";
}

function isHealthStatus(value: unknown): value is HealthStatus {
  return value === "healthy" || value === "unknown" || value === "degraded" || value === "down";
}
