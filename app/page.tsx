import { HomePageContent } from "@/components/home/home-page-content";
import { PageFrame } from "@/components/page-templates";
import { getCatalogSnapshot } from "@/lib/catalog/snapshot";
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
      <HomePageContent content={content} viewModel={viewModel} />
    </PageFrame>
  );
}
