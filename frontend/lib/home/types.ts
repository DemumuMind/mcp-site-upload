import type { Locale } from "@/lib/i18n";

export type HomeMetric = {
  id: "servers" | "tools" | "categories";
  label: string;
  value: number;
};

export type HomeFeaturedServer = {
  id: string;
  name: string;
  category: string;
  authLabel: string;
  toolsCount: number;
  verificationLabel: string;
};

export type HomeFacetEntry = {
  label: string;
  count: number;
};

export type HomePageViewModel = {
  locale: Locale;
  siteUrl: string;
  metrics: HomeMetric[];
  featuredServers: HomeFeaturedServer[];
  topCategories: HomeFacetEntry[];
  topLanguages: HomeFacetEntry[];
};
