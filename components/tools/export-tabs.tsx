"use client";

import { Copy, Download } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { GeneratedArtifact, RulesOutputFormat } from "@/lib/tools/rules-engine";

type ExportTabsProps = {
  artifacts: GeneratedArtifact[];
};

function triggerDownload(content: string, fileName: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();

  URL.revokeObjectURL(url);
}

function asTabLabel(format: RulesOutputFormat): string {
  if (format === "agents") {
    return "AGENTS.md";
  }
  if (format === "cursor") {
    return ".cursorrules";
  }
  return "Copilot";
}

export function ExportTabs({ artifacts }: ExportTabsProps) {
  const [activeFormat, setActiveFormat] = useState<RulesOutputFormat>(artifacts[0]?.format ?? "agents");

  const artifactByFormat = useMemo(() => {
    const map = new Map<RulesOutputFormat, GeneratedArtifact>();
    for (const artifact of artifacts) {
      map.set(artifact.format, artifact);
    }
    return map;
  }, [artifacts]);

  const activeArtifact = artifactByFormat.get(activeFormat) ?? artifacts[0];
  const resolvedActiveFormat = activeArtifact?.format ?? activeFormat;

  async function handleCopy() {
    if (!activeArtifact) {
      return;
    }

    try {
      await navigator.clipboard.writeText(activeArtifact.content);
      toast.success(`${activeArtifact.title} copied.`);
    } catch {
      toast.error("Unable to copy generated rules.");
    }
  }

  function handleDownload() {
    if (!activeArtifact) {
      return;
    }

    triggerDownload(activeArtifact.content, activeArtifact.fileName);
    toast.success(`${activeArtifact.fileName} downloaded.`);
  }

  if (!activeArtifact) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-500/30 bg-slate-950/60 p-3">
      <div className="flex flex-wrap gap-2">
        {artifacts.map((artifact) => (
          <Button
            key={artifact.format}
            type="button"
            size="sm"
            variant={resolvedActiveFormat === artifact.format ? "default" : "outline"}
            onClick={() => setActiveFormat(artifact.format)}
          >
            {asTabLabel(artifact.format)}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="outline" onClick={handleCopy}>
          <Copy className="size-3.5" />
          Copy
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={handleDownload}>
          <Download className="size-3.5" />
          Download
        </Button>
      </div>

      <pre className="max-h-[24rem] overflow-auto rounded-lg border border-slate-500/30 bg-slate-900/70 p-3 text-xs leading-relaxed text-slate-100">
        <code>{activeArtifact.content}</code>
      </pre>
    </div>
  );
}
