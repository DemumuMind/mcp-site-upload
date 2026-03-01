import type { HomeContent } from "@/lib/home/content";
import type { HomePageViewModel } from "@/lib/home/types";
import { FinalCtaSectionV3 } from "@/components/home-v3/sections/final-cta-section-v3";
import { HeroSectionV3 } from "@/components/home-v3/sections/hero-section-v3";
import { IcpUseCasesSectionV3 } from "@/components/home-v3/sections/icp-use-cases-section-v3";
import { TrustProofSectionV3 } from "@/components/home-v3/sections/trust-proof-section-v3";
import { WorkflowSectionV3 } from "@/components/home-v3/sections/workflow-section-v3";

type HomePageV3Props = {
  content: HomeContent;
  viewModel: HomePageViewModel;
};

export function HomePageV3({ content, viewModel }: HomePageV3Props) {
  return (
    <div className="w-full">
      <HeroSectionV3 content={content.hero} workflows={content.workflows} metrics={viewModel.metrics} />
      <TrustProofSectionV3
        content={content.trust}
        featuredServers={viewModel.featuredServers}
        topCategories={viewModel.topCategories}
        topLanguages={viewModel.topLanguages}
      />
      <IcpUseCasesSectionV3 content={content.icp} />
      <WorkflowSectionV3 content={content.workflows} />
      <FinalCtaSectionV3 content={content.finalCta} />
    </div>
  );
}

