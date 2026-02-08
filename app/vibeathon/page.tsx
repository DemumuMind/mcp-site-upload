import type { Metadata } from "next";

import { BridgePageShell } from "@/components/bridge-page-shell";

export const metadata: Metadata = {
  title: "Vibeathon",
  description: "BridgeMind vibe coding hackathon for agentic coders.",
};

export default function VibeathonPage() {
  return (
    <BridgePageShell
      eyebrow="Community Event"
      title="BridgeMind Vibeathon"
      description="Build with AI coding tools, ship fast, and compete on execution quality in the BridgeMind hackathon."
      links={[
        {
          href: "/vibeathon/leaderboard",
          label: "Vibeathon Leaderboard",
          description: "See current standings, team rankings, and challenge progress.",
        },
      ]}
    />
  );
}
