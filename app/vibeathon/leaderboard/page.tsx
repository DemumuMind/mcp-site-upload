import type { Metadata } from "next";

import { BridgePageShell } from "@/components/bridge-page-shell";

export const metadata: Metadata = {
  title: "Vibeathon Leaderboard",
  description: "Current hackathon standings and submissions.",
};

export default function VibeathonLeaderboardPage() {
  return (
    <BridgePageShell
      eyebrow="Leaderboard"
      title="Vibeathon Leaderboard"
      description="Track top teams, submissions, and score movement during the active BridgeMind vibeathon."
      links={[
        {
          href: "/vibeathon",
          label: "Back to Vibeathon",
          description: "Open rules, timeline, and entry information.",
        },
      ]}
    />
  );
}
