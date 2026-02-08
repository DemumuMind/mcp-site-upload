import type { Metadata } from "next";

import { BridgePageShell } from "@/components/bridge-page-shell";

export const metadata: Metadata = {
  title: "Careers",
  description: "Job opportunities at BridgeMind.",
};

export default function JobsPage() {
  return (
    <BridgePageShell
      eyebrow="Company"
      title="BridgeMind Careers"
      description="Help shape the future of vibe coding and agentic coding. Explore open roles and team opportunities."
      links={[
        {
          href: "/contact",
          label: "Talk to recruiting",
          description: "Reach out directly if your profile aligns with the mission.",
        },
      ]}
    />
  );
}
