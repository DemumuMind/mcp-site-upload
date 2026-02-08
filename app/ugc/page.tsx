import type { Metadata } from "next";

import { BridgePageShell } from "@/components/bridge-page-shell";

export const metadata: Metadata = {
  title: "UGC Program",
  description: "BridgeMind user-generated content and creator program.",
};

export default function UgcPage() {
  return (
    <BridgePageShell
      eyebrow="Creator Program"
      title="BridgeMind UGC Program"
      description="Create educational content around vibe coding and agentic coding workflows and participate in the BridgeMind creator ecosystem."
      links={[
        {
          href: "/ugc/brand-assets",
          label: "Brand assets",
          description: "Download logos, marks, and creator-safe visual assets.",
        },
      ]}
    />
  );
}
