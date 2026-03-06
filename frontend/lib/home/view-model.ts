import type { CatalogSnapshot } from "@/lib/catalog/snapshot";
import type { Locale } from "@/lib/i18n";
import type { AuthType, VerificationLevel } from "@/lib/types";
import type { HomePageViewModel } from "@/lib/home/types";

const authTypeLabelByLocale: Record<Locale, Record<AuthType, string>> = {
  en: {
    none: "Open",
    api_key: "API Key",
    oauth: "OAuth",
  },
};

const verificationLabelByLocale: Record<Locale, Record<VerificationLevel, string>> = {
  en: {
    community: "Community",
    partner: "Partner",
    official: "Official",
  },
};

type BuildHomePageViewModelOptions = {
  locale: Locale;
  siteUrl: string;
  snapshot: CatalogSnapshot;
};

const fallbackMetrics = {
  totalServers: 248,
  totalTools: 1836,
  totalCategories: 18,
};

const fallbackFeaturedServers = [
  {
    id: "fallback-github",
    name: "GitHub MCP",
    category: "Developer Tools",
    authLabel: "OAuth",
    verificationLabel: "Official",
    toolsCount: 18,
  },
  {
    id: "fallback-postgres",
    name: "Postgres MCP",
    category: "Databases",
    authLabel: "API Key",
    verificationLabel: "Partner",
    toolsCount: 11,
  },
  {
    id: "fallback-playwright",
    name: "Playwright MCP",
    category: "Developer Tools",
    authLabel: "Open",
    verificationLabel: "Community",
    toolsCount: 9,
  },
] as const;

const fallbackTopCategories = [
  { label: "Developer Tools", count: 94 },
  { label: "Databases", count: 48 },
  { label: "Automation", count: 37 },
] as const;

const fallbackTopLanguages = [
  { label: "TypeScript", count: 96 },
  { label: "Python", count: 71 },
  { label: "Go", count: 28 },
] as const;

export function buildHomePageViewModel({
  locale,
  siteUrl,
  snapshot,
}: BuildHomePageViewModelOptions): HomePageViewModel {
  const authLabels = authTypeLabelByLocale[locale];
  const verificationLabels = verificationLabelByLocale[locale];
  const hasLiveCatalogData = snapshot.totalServers > 0;

  const metrics = hasLiveCatalogData
    ? [
        {
          id: "servers" as const,
          label: "Active servers",
          value: snapshot.totalServers,
        },
        {
          id: "tools" as const,
          label: "Published tools",
          value: snapshot.totalTools,
        },
        {
          id: "categories" as const,
          label: "Categories",
          value: snapshot.totalCategories,
        },
      ]
    : [
        {
          id: "servers" as const,
          label: "Active servers",
          value: fallbackMetrics.totalServers,
        },
        {
          id: "tools" as const,
          label: "Published tools",
          value: fallbackMetrics.totalTools,
        },
        {
          id: "categories" as const,
          label: "Categories",
          value: fallbackMetrics.totalCategories,
        },
      ];

  const featuredServers = hasLiveCatalogData
    ? snapshot.featuredServers.map((server) => ({
        id: server.id,
        name: server.name,
        category: server.category,
        authLabel: authLabels[server.authType],
        toolsCount: server.tools.length,
        verificationLabel: verificationLabels[server.verificationLevel],
      }))
    : [...fallbackFeaturedServers];

  const topCategories = (hasLiveCatalogData
    ? snapshot.categoryEntries.slice(0, 3).map(([label, count]) => ({ label, count }))
    : [...fallbackTopCategories]);
  const topLanguages = (hasLiveCatalogData
    ? snapshot.languageEntries.slice(0, 3).map(([label, count]) => ({ label, count }))
    : [...fallbackTopLanguages]);

  return {
    locale,
    siteUrl,
    metrics,
    featuredServers,
    topCategories,
    topLanguages,
  };
}
