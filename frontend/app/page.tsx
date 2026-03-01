import { HomePageContent } from "@/components/home/home-page-content";
import { HomePageV3 } from "@/components/home-v3/home-page-v3";
import { PageFrame } from "@/components/page-templates";
import { getCatalogSnapshot } from "@/lib/catalog/snapshot";
import { isHomeRedesignV3Enabled } from "@/lib/design-flags";
import { getHomeContent } from "@/lib/home/content";
import { buildHomePageViewModel } from "@/lib/home/view-model";
import { getLocale } from "@/lib/i18n-server";

export default async function HomePage() {
  const locale = await getLocale();
  const snapshot = await getCatalogSnapshot({ featuredLimit: 4 });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const content = getHomeContent(locale);
  const viewModel = buildHomePageViewModel({
    locale,
    siteUrl,
    snapshot,
  });

  return (
    <PageFrame variant="marketing">
      {isHomeRedesignV3Enabled() ? <HomePageV3 content={content} viewModel={viewModel} /> : <HomePageContent content={content} viewModel={viewModel} />}
    </PageFrame>
  );
}

