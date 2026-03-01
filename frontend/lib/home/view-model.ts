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

export function buildHomePageViewModel({
  locale,
  siteUrl,
  snapshot,
}: BuildHomePageViewModelOptions): HomePageViewModel {
  const authLabels = authTypeLabelByLocale[locale];
  const verificationLabels = verificationLabelByLocale[locale];

  return {
    locale,
    siteUrl,
    metrics: [
      {
        id: "servers",
        label: "Active servers",
        value: snapshot.totalServers,
      },
      {
        id: "tools",
        label: "Published tools",
        value: snapshot.totalTools,
      },
      {
        id: "categories",
        label: "Categories",
        value: snapshot.totalCategories,
      },
    ],
    featuredServers: snapshot.featuredServers.map((server) => ({
      id: server.id,
      name: server.name,
      category: server.category,
      authLabel: authLabels[server.authType],
      toolsCount: server.tools.length,
      verificationLabel: verificationLabels[server.verificationLevel],
    })),
    topCategories: snapshot.categoryEntries.slice(0, 3).map(([label, count]) => ({ label, count })),
    topLanguages: snapshot.languageEntries.slice(0, 3).map(([label, count]) => ({ label, count })),
  };
}
