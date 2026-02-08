import type { Metadata } from "next";

import { BridgePageShell } from "@/components/bridge-page-shell";

export const metadata: Metadata = {
  title: "Research Leaderboards",
  description: "AI model performance comparisons and rankings for coding workflows.",
};

export default function ResearchLeaderboardsPage() {
  return (
    <BridgePageShell
      eyebrow="Research"
      title="BridgeMind Research Leaderboards"
      description="Benchmark AI models and coding assistants across tasks that matter for production delivery."
      links={[
        {
          href: "/blog",
          label: "Read methodology updates",
          description: "See benchmark methodology notes and release updates in the BridgeMind blog.",
        },
      ]}
    />
  );
}
