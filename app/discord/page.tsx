import type { Metadata } from "next";
import Link from "next/link";

import { BridgePageShell } from "@/components/bridge-page-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Discord Community",
  description: "Join the BridgeMind developer community for vibe coding and agentic coding.",
};

export default function DiscordPage() {
  return (
    <div className="space-y-4">
      <BridgePageShell
        eyebrow="Community"
        title="BridgeMind Discord"
        description="Join the BridgeMind community to collaborate with vibe coders and agentic coding practitioners."
      />
      <div className="mx-auto w-full max-w-5xl px-4 pb-12 sm:px-6">
        <Button asChild className="bg-blue-500 hover:bg-blue-400">
          <Link href="https://discord.gg/bridgemind" target="_blank" rel="noreferrer">
            Open Discord
          </Link>
        </Button>
      </div>
    </div>
  );
}
