import type { Metadata } from "next";

import { BridgePageShell } from "@/components/bridge-page-shell";

export const metadata: Metadata = {
  title: "Brand Assets",
  description: "BridgeMind logos and brand guidance for creators.",
};

export default function BrandAssetsPage() {
  return (
    <BridgePageShell
      eyebrow="UGC"
      title="BridgeMind Brand Assets"
      description="Official marks and logos for creators participating in the BridgeMind UGC program."
      links={[
        {
          href: "/ugc",
          label: "Back to UGC program",
          description: "Program details and participation overview.",
        },
      ]}
    />
  );
}
