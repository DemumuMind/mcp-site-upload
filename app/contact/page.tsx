import type { Metadata } from "next";
import Link from "next/link";

import { BridgePageShell } from "@/components/bridge-page-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the BridgeMind team.",
};

export default function ContactPage() {
  return (
    <div className="space-y-4">
      <BridgePageShell
        eyebrow="Company"
        title="Contact BridgeMind"
        description="Questions about memberships, partnerships, and enterprise collaboration? Reach the team directly."
      />
      <div className="mx-auto w-full max-w-5xl px-4 pb-12 sm:px-6">
        <Button asChild className="bg-blue-500 hover:bg-blue-400">
          <Link href="mailto:hello@bridgemind.ai">hello@bridgemind.ai</Link>
        </Button>
      </div>
    </div>
  );
}
