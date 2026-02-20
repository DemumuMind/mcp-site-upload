"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type CopyConfigButtonProps = {
  name: string;
  serverUrl: string;
};

export function CopyConfigButton({ name, serverUrl }: CopyConfigButtonProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = JSON.stringify(
    {
      mcpServers: {
        [name]: {
          url: serverUrl,
        },
      },
    },
    null,
    2,
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        className="border-white/15 bg-card/40 text-violet-100"
        onClick={async () => {
          setError(null);
          try {
            await navigator.clipboard.writeText(config);
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
          } catch {
            setError("Clipboard permission blocked. Copy manually.");
          }
        }}
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? "Copied" : "Copy config"}
      </Button>
      {error ? (
        <span role="status" aria-live="polite" className="text-xs text-rose-200">
          {error}
        </span>
      ) : null}
    </div>
  );
}
