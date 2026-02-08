import type { Metadata } from "next";

import { BridgePageShell } from "@/components/bridge-page-shell";

export const metadata: Metadata = {
  title: "FAQ - Points",
  description: "How the BridgeMind points and rewards system works.",
};

export default function FaqPointsPage() {
  return (
    <BridgePageShell
      eyebrow="FAQ"
      title="BridgeMind Points"
      description="How points are earned, tracked, and used across BridgeMind programs and community events."
      links={[
        {
          href: "/faq/streaks",
          label: "See streaks FAQ",
          description: "Understand streak logic and gamification rules.",
        },
      ]}
    />
  );
}
