import type { HomeContent } from "@/lib/home/content";
import type { HomePageViewModel } from "@/lib/home/types";
import { FinalCtaSection } from "@/components/home/sections/final-cta-section";
import { HeroSection } from "@/components/home/sections/hero-section";
import { IcpSection } from "@/components/home/sections/icp-section";
import { LogoCloudSection } from "@/components/home/sections/logo-cloud-section";
import { ComparisonSection } from "@/components/home/sections/comparison-section";
import { ProofMetricsSection } from "@/components/home/sections/proof-metrics-section";
import { ProductProofSection } from "@/components/home/sections/product-proof-section";
import { ShowcaseSection } from "@/components/home/sections/showcase-section";
import { TrustSignalsSection } from "@/components/home/sections/trust-signals-section";
import { WorkflowSection } from "@/components/home/sections/workflow-section";

type HomePageContentProps = {
  content: HomeContent;
  viewModel: HomePageViewModel;
};

export function HomePageContent({ content, viewModel }: HomePageContentProps) {
  const softwareApplicationJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "DemumuMind MCP",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: viewModel.siteUrl,
    description:
      "A community-curated catalog where users can discover, evaluate, and submit MCP servers for AI agents.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "MCP server search and filtering",
      "Authentication and verification badges",
      "Community submission workflow",
      "Server detail pages and configuration references",
    ],
  };

  return (
    <div className="w-full">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }} />

      <HeroSection content={content.hero} />
      <LogoCloudSection content={content.logoCloud} />
      <ProofMetricsSection content={content.metrics} metrics={viewModel.metrics} />
      <ComparisonSection content={content.comparison} />
      <WorkflowSection content={content.workflows} />
      <TrustSignalsSection
        content={content.trust}
        featuredServers={viewModel.featuredServers}
        topCategories={viewModel.topCategories}
        topLanguages={viewModel.topLanguages}
      />
      <ShowcaseSection content={content.showcases} />
      <ProductProofSection content={content.productProof} />
      <IcpSection content={content.icp} />
      <FinalCtaSection content={content.finalCta} />
    </div>
  );
}
