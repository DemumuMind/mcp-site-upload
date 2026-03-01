"use client";

import { Copy, Eraser, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  estimateTokensByModel,
  getTokenModelById,
  type TokenEstimate,
  type TokenModelId,
  TOKEN_MODEL_OPTIONS,
} from "@/lib/tools/token-estimator";

function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

type MetricTileProps = {
  label: string;
  value: string;
  muted?: boolean;
};

function MetricTile({ label, value, muted = false }: MetricTileProps) {
  return (
    <div className="rounded-xl border border-slate-600/40 bg-slate-900/60 px-3 py-2">
      <p className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${muted ? "text-slate-300" : "text-slate-100"}`}>{value}</p>
    </div>
  );
}

export function TokenCalculatorPanel() {
  const [modelId, setModelId] = useState<TokenModelId>("gpt-4.1");
  const [promptInput, setPromptInput] = useState("");
  const [estimate, setEstimate] = useState<TokenEstimate>({
    tokens: 0,
    words: 0,
    characters: 0,
    confidence: "high",
    note: "Start typing to estimate token usage.",
    encoding: getTokenModelById("gpt-4.1").encoding,
  });

  const selectedModel = useMemo(() => getTokenModelById(modelId), [modelId]);

  useEffect(() => {
    let disposed = false;

    void estimateTokensByModel(promptInput, modelId)
      .then((nextEstimate) => {
        if (disposed) {
          return;
        }
        setEstimate(nextEstimate);
      })
      .catch(() => {
        if (disposed) {
          return;
        }

        setEstimate({
          tokens: 0,
          words: promptInput.trim() ? promptInput.trim().split(/\s+/).length : 0,
          characters: promptInput.length,
          confidence: "medium",
          note: "Unable to estimate tokens right now.",
          encoding: selectedModel.encoding,
        });
      });

    return () => {
      disposed = true;
    };
  }, [modelId, promptInput, selectedModel.encoding]);

  async function handleCopyPrompt() {
    if (!promptInput) {
      return;
    }

    try {
      await navigator.clipboard.writeText(promptInput);
      toast.success("Prompt copied.");
    } catch {
      toast.error("Unable to copy prompt.");
    }
  }

  function handleClearPrompt() {
    setPromptInput("");
  }

  return (
    <Card className="gap-4 border-slate-500/30 bg-slate-950/70 shadow-[0_14px_34px_rgba(4,8,20,0.45)] backdrop-blur-md">
      <CardHeader className="space-y-3 pb-0">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xl text-slate-50">LLM Token Calculator</CardTitle>
          <Badge variant="outline" className="border-slate-500/40 bg-slate-900/70 text-slate-200">
            {selectedModel.encoding}
          </Badge>
        </div>
        <CardDescription className="text-slate-300">
          Estimate prompt size with model-aware tokenization and quick complexity signals.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="token-model-select">Model</Label>
          <Select value={modelId} onValueChange={(value) => setModelId(value as TokenModelId)}>
            <SelectTrigger id="token-model-select" className="w-full border-slate-500/40 bg-slate-900/70">
              <SelectValue placeholder="Choose model" />
            </SelectTrigger>
            <SelectContent>
              {TOKEN_MODEL_OPTIONS.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-400">
            {selectedModel.details} Context window: {formatNumber(selectedModel.contextWindow)} tokens.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="token-prompt-input">Prompt text</Label>
          <Textarea
            id="token-prompt-input"
            value={promptInput}
            onChange={(event) => setPromptInput(event.target.value)}
            rows={9}
            placeholder="Paste or write your prompt..."
            className="border-slate-500/40 bg-slate-900/70 text-slate-100 placeholder:text-slate-400"
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <MetricTile label="Estimated tokens" value={formatNumber(estimate.tokens)} />
          <MetricTile label="Words" value={formatNumber(estimate.words)} muted />
          <MetricTile label="Characters" value={formatNumber(estimate.characters)} muted />
          <MetricTile
            label="Confidence"
            value={estimate.confidence === "high" ? "High (tokenizer)" : "Medium (fallback)"}
            muted={estimate.confidence !== "high"}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-600/30 bg-slate-900/40 px-3 py-2">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            {promptInput.length > 0 ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : null}
            <span>{estimate.note}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" size="sm" variant="outline" onClick={handleCopyPrompt} disabled={!promptInput}>
              <Copy className="size-3.5" />
              Copy
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={handleClearPrompt} disabled={!promptInput}>
              <Eraser className="size-3.5" />
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
