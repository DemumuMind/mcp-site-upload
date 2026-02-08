import type { Metadata } from "next";

import { BridgePageShell } from "@/components/bridge-page-shell";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Articles on vibe coding, agentic coding, prompt engineering, and AI development best practices.",
};

export default function BlogPage() {
  return (
    <BridgePageShell
      eyebrow="Resources"
      title="BridgeMind Blog"
      description="Insights, tutorials, and playbooks for vibe coding and agentic coding teams."
      links={[
        {
          href: "/research/leaderboards",
          label: "Research Leaderboards",
          description: "Track AI model performance and compare practical coding capabilities.",
        },
        {
          href: "/vibeathon",
          label: "Vibeathon",
          description: "Join the hackathon to test your agentic coding workflow in competition.",
        },
      ]}
    />
  );
}
