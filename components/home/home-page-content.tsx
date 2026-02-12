import type { HomeContent } from "@/lib/home/content";
import type { HomePageViewModel } from "@/lib/home/types";
import { FinalCtaSection } from "@/components/home/sections/final-cta-section";
import { HeroSection } from "@/components/home/sections/hero-section";
import { IcpSection } from "@/components/home/sections/icp-section";
import { ProofMetricsSection } from "@/components/home/sections/proof-metrics-section";
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
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "MCP server search and filtering",
      "Authentication and verification badges",
      "Community submission workflow",
      "Server detail pages and configuration references",
    ],
  };

  return (
    <div className="relative isolate w-full overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
      />

      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(10,18,36,0.96),rgba(4,8,20,0.98)),linear-gradient(90deg,rgba(56,189,248,0.08)_1px,transparent_1px),linear-gradient(rgba(56,189,248,0.08)_1px,transparent_1px)] bg-[size:auto,44px_44px,44px_44px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[580px] bg-[radial-gradient(circle_at_30%_10%,rgba(59,130,246,0.30),transparent_45%),radial-gradient(circle_at_70%_15%,rgba(14,165,233,0.15),transparent_40%)]" />

      <HeroSection content={content.hero} />
      <ProofMetricsSection content={content.metrics} metrics={viewModel.metrics} />
      <WorkflowSection content={content.workflows} />
      <TrustSignalsSection
        content={content.trust}
        featuredServers={viewModel.featuredServers}
        topCategories={viewModel.topCategories}
        topLanguages={viewModel.topLanguages}
      />
      <IcpSection content={content.icp} />
      <FinalCtaSection content={content.finalCta} />
    </div>
  );
}
