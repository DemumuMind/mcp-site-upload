import type { Metadata } from "next";

import { BridgePageShell } from "@/components/bridge-page-shell";

export const metadata: Metadata = {
  title: "FAQ - Streaks",
  description: "Streak information and gamification in BridgeMind.",
};

export default function FaqStreaksPage() {
  return (
    <BridgePageShell
      eyebrow="FAQ"
      title="BridgeMind Streaks"
      description="How daily and weekly streaks are calculated, where they reset, and how they contribute to your overall progression."
      links={[
        {
          href: "/faq/points",
          label: "See points FAQ",
          description: "Learn how points are earned and used across the platform.",
        },
      ]}
    />
  );
}
