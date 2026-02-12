"use client";

import { History, Sparkles, Wand2, X } from "lucide-react";
import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { toast } from "sonner";

import { ExportTabs } from "@/components/tools/export-tabs";
import { PresetManager } from "@/components/tools/preset-manager";
import { SkillSelector } from "@/components/tools/skill-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  buildRulesArtifacts,
  type RulesGenerationResult,
  type RulesHistoryItem,
  type RulesPreset,
  type RulesProjectInput,
  type RulesSourceMode,
  type RulesTone,
  suggestSkillProfilesFromDescription,
} from "@/lib/tools/rules-engine";
import { DEFAULT_SKILL_IDS, listSkillProfiles } from "@/lib/tools/skill-profiles";
import {
  appendRulesHistory,
  deleteRulesPreset,
  loadRulesHistory,
  loadRulesPresets,
  upsertRulesPreset,
} from "@/lib/tools/tools-storage";

const ALL_SKILL_PROFILES = listSkillProfiles();

type TagFieldProps = {
  label: string;
  tags: string[];
  draft: string;
  placeholder: string;
  onDraftChange: (value: string) => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
};

function normalizeTag(tag: string): string {
  return tag.trim().replace(/\s+/g, " ");
}

function formatTimestamp(isoDate: string): string {
  const parsed = Date.parse(isoDate);
  if (!Number.isFinite(parsed)) {
    return "unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

function generateClientId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now()}-${random}`;
}

function TagField({
  label,
  tags,
  draft,
  placeholder,
  onDraftChange,
  onAddTag,
  onRemoveTag,
}: TagFieldProps) {
  function commitDraft() {
    const normalized = normalizeTag(draft);
    if (!normalized) {
      return;
    }

    onAddTag(normalized);
    onDraftChange("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitDraft();
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        <Input
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-9 min-w-[12rem] flex-1 border-slate-500/40 bg-slate-900/70"
        />
        <Button type="button" size="sm" variant="outline" onClick={commitDraft}>
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.length === 0 ? (
          <p className="text-xs text-slate-400">No tags yet.</p>
        ) : (
          tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="flex items-center gap-1 border-slate-500/40 bg-slate-900/70 text-slate-200"
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemoveTag(tag)}
                className="rounded p-0.5 text-slate-300 transition hover:bg-slate-700 hover:text-slate-50"
                aria-label={`Remove ${tag}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}

export function RulesGeneratorPanel() {
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [stackTags, setStackTags] = useState<string[]>([]);
  const [stackDraft, setStackDraft] = useState("");
  const [constraintTags, setConstraintTags] = useState<string[]>([]);
  const [constraintDraft, setConstraintDraft] = useState("");
  const [tone, setTone] = useState<RulesTone>("balanced");
  const [sourceMode, setSourceMode] = useState<RulesSourceMode>("fresh");
  const [existingRulesText, setExistingRulesText] = useState("");
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([...DEFAULT_SKILL_IDS]);
  const [manualSkillSelection, setManualSkillSelection] = useState(false);
  const [generationResult, setGenerationResult] = useState<RulesGenerationResult | null>(null);
  const [presets, setPresets] = useState<RulesPreset[]>([]);
  const [historyItems, setHistoryItems] = useState<RulesHistoryItem[]>([]);

  const suggestions = useMemo(
    () => suggestSkillProfilesFromDescription(projectDescription, 6),
    [projectDescription],
  );
  const autoSelectedSkillIds = useMemo(() => {
    const suggestedIds = suggestions.map((item) => item.id).slice(0, 5);
    return suggestedIds.length > 0 ? suggestedIds : [...DEFAULT_SKILL_IDS];
  }, [suggestions]);
  const activeSkillIds = manualSkillSelection ? selectedSkillIds : autoSelectedSkillIds;

  const canGenerate = projectDescription.trim().length > 0;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const loadedPresets = loadRulesPresets();
      const loadedHistory = loadRulesHistory();

      setPresets(loadedPresets.items);
      setHistoryItems(loadedHistory.items);

      if (loadedPresets.recoveredFromCorruption || loadedHistory.recoveredFromCorruption) {
        toast.warning("Stored tools history was corrupted and has been reset.");
      }
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  function addTag(nextTag: string, currentTags: string[], setTags: (value: string[]) => void) {
    if (currentTags.some((tag) => tag.toLowerCase() === nextTag.toLowerCase())) {
      return;
    }

    setTags([...currentTags, nextTag]);
  }

  function removeTag(tagToRemove: string, currentTags: string[], setTags: (value: string[]) => void) {
    setTags(currentTags.filter((tag) => tag !== tagToRemove));
  }

  function currentInput(): RulesProjectInput {
    return {
      projectName: projectName.trim(),
      description: projectDescription.trim(),
      stack: stackTags,
      constraints: constraintTags,
      tone,
      sourceMode,
      existingRulesText,
      skills: activeSkillIds,
    };
  }

  function loadInput(input: RulesProjectInput) {
    setProjectName(input.projectName);
    setProjectDescription(input.description);
    setStackTags(input.stack);
    setConstraintTags(input.constraints);
    setTone(input.tone);
    setSourceMode(input.sourceMode);
    setExistingRulesText(input.existingRulesText ?? "");
    setSelectedSkillIds([...input.skills]);
    setManualSkillSelection(true);
  }

  function toggleSkill(skillId: string) {
    setManualSkillSelection(true);
    setSelectedSkillIds((previous) => {
      const baseSelection = manualSkillSelection ? previous : activeSkillIds;
      if (baseSelection.includes(skillId)) {
        return baseSelection.filter((id) => id !== skillId);
      }

      return [...baseSelection, skillId];
    });
  }

  function applySuggestions() {
    const suggestedIds = suggestions.map((item) => item.id).slice(0, 6);
    setManualSkillSelection(true);
    setSelectedSkillIds(suggestedIds.length > 0 ? suggestedIds : [...DEFAULT_SKILL_IDS]);
  }

  function handleGenerateRules() {
    if (!canGenerate) {
      toast.error("Project description is required.");
      return;
    }

    const input = currentInput();
    const result = buildRulesArtifacts(input);
    setGenerationResult(result);

    const historyItem: RulesHistoryItem = {
      id: generateClientId("history"),
      createdAt: new Date().toISOString(),
      input,
      artifacts: result.artifacts,
    };

    const nextHistory = appendRulesHistory(historyItem);
    setHistoryItems(nextHistory);
    toast.success("Rules generated.");
  }

  function handleSavePreset(presetName: string) {
    if (!canGenerate) {
      toast.error("Fill project description before saving presets.");
      return;
    }

    const preset: RulesPreset = {
      id: generateClientId("preset"),
      name: presetName,
      createdAt: new Date().toISOString(),
      input: currentInput(),
    };

    const nextPresets = upsertRulesPreset(preset);
    setPresets(nextPresets);
    toast.success("Preset saved.");
  }

  function handleLoadPreset(preset: RulesPreset) {
    loadInput(preset.input);
    toast.success(`Preset "${preset.name}" loaded.`);
  }

  function handleDeletePreset(presetId: string) {
    const nextPresets = deleteRulesPreset(presetId);
    setPresets(nextPresets);
    toast.success("Preset deleted.");
  }

  function handleLoadHistory(item: RulesHistoryItem) {
    loadInput(item.input);
    const regenerated = buildRulesArtifacts(item.input);
    setGenerationResult(regenerated);
    toast.success("History item loaded.");
  }

  return (
    <Card className="gap-4 border-slate-500/30 bg-slate-950/70 shadow-[0_14px_34px_rgba(4,8,20,0.45)] backdrop-blur-md">
      <CardHeader className="space-y-3 pb-0">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xl text-slate-50">Rules Generator</CardTitle>
          <Badge variant="outline" className="border-blue-400/40 bg-blue-500/10 text-blue-200">
            advanced
          </Badge>
        </div>
        <CardDescription className="text-slate-300">
          Build AGENTS.md, .cursorrules, and Copilot instructions from structured project input.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="rules-project-name">Project name</Label>
          <Input
            id="rules-project-name"
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
            placeholder="DemumuMind MCP"
            className="border-slate-500/40 bg-slate-900/70"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rules-project-description">Project description</Label>
          <Textarea
            id="rules-project-description"
            value={projectDescription}
            onChange={(event) => setProjectDescription(event.target.value)}
            rows={5}
            placeholder="Describe architecture, quality gates, and delivery constraints..."
            className="border-slate-500/40 bg-slate-900/70 text-slate-100 placeholder:text-slate-400"
          />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <TagField
            label="Stack tags"
            tags={stackTags}
            draft={stackDraft}
            placeholder="Next.js, TypeScript, Supabase..."
            onDraftChange={setStackDraft}
            onAddTag={(tag) => addTag(tag, stackTags, setStackTags)}
            onRemoveTag={(tag) => removeTag(tag, stackTags, setStackTags)}
          />
          <TagField
            label="Constraints"
            tags={constraintTags}
            draft={constraintDraft}
            placeholder="Strict lint, Playwright checks, no schema changes..."
            onDraftChange={setConstraintDraft}
            onAddTag={(tag) => addTag(tag, constraintTags, setConstraintTags)}
            onRemoveTag={(tag) => removeTag(tag, constraintTags, setConstraintTags)}
          />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="rules-tone">Delivery tone</Label>
            <Select value={tone} onValueChange={(value) => setTone(value as RulesTone)}>
              <SelectTrigger id="rules-tone" className="w-full border-slate-500/40 bg-slate-900/70">
                <SelectValue placeholder="Choose tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strict">Strict</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="lean">Lean</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Source policy</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                size="sm"
                variant={sourceMode === "fresh" ? "default" : "outline"}
                onClick={() => setSourceMode("fresh")}
              >
                From scratch
              </Button>
              <Button
                type="button"
                size="sm"
                variant={sourceMode === "merge" ? "default" : "outline"}
                onClick={() => setSourceMode("merge")}
              >
                Merge mode
              </Button>
            </div>
          </div>
        </div>

        {sourceMode === "merge" ? (
          <div className="space-y-2">
            <Label htmlFor="existing-rules">Existing rules context (optional)</Label>
            <Textarea
              id="existing-rules"
              value={existingRulesText}
              onChange={(event) => setExistingRulesText(event.target.value)}
              rows={4}
              placeholder="Paste current AGENTS.md or policy snippets..."
              className="border-slate-500/40 bg-slate-900/70 text-slate-100 placeholder:text-slate-400"
            />
          </div>
        ) : null}

        <div className="space-y-2 rounded-xl border border-slate-500/30 bg-slate-950/60 p-3">
          <p className="text-sm font-semibold text-slate-100">Auto-detected skill signals</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <Badge
                key={suggestion.id}
                variant="outline"
                className="border-slate-500/40 bg-slate-900/70 text-slate-200"
                title={suggestion.reason}
              >
                {suggestion.title}
              </Badge>
            ))}
          </div>
        </div>

        <SkillSelector
          allSkills={ALL_SKILL_PROFILES}
          selectedSkillIds={activeSkillIds}
          suggestions={suggestions}
          onToggleSkill={toggleSkill}
          onUseSuggestions={applySuggestions}
        />

        <PresetManager
          presets={presets}
          canSave={canGenerate}
          onSavePreset={handleSavePreset}
          onLoadPreset={handleLoadPreset}
          onDeletePreset={handleDeletePreset}
        />

        <Button type="button" className="w-full" onClick={handleGenerateRules} disabled={!canGenerate}>
          <Wand2 className="size-4" />
          Generate Rules
        </Button>

        {generationResult?.warnings.length ? (
          <div className="space-y-1 rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-xs text-amber-100">
            {generationResult.warnings.map((warning) => (
              <p key={warning}>{warning}</p>
            ))}
          </div>
        ) : null}

        {generationResult ? <ExportTabs artifacts={generationResult.artifacts} /> : null}

        <div className="space-y-3 rounded-xl border border-slate-500/30 bg-slate-950/60 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-100">Generation History</p>
            <Badge variant="outline" className="border-slate-500/40 bg-slate-900/70 text-slate-200">
              {historyItems.length}
            </Badge>
          </div>

          <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
            {historyItems.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-600/40 px-3 py-2 text-xs text-slate-400">
                No generations yet.
              </p>
            ) : (
              historyItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleLoadHistory(item)}
                  className="flex w-full items-start justify-between gap-3 rounded-lg border border-slate-500/20 bg-slate-900/40 p-2 text-left hover:border-slate-400/40"
                >
                  <span className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-100">
                      {item.input.projectName || "Untitled project"}
                    </p>
                    <p className="line-clamp-1 text-xs text-slate-400">{item.input.description}</p>
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">
                    <History className="mb-1 ml-auto size-3.5" />
                    {formatTimestamp(item.createdAt)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-blue-400/30 bg-blue-500/10 px-3 py-2 text-xs text-blue-100">
          <p className="flex items-center gap-1.5 font-medium">
            <Sparkles className="size-3.5" />
            Expert mode active
          </p>
          <p className="mt-1 text-blue-100/90">
            Presets and generation history are saved locally in your browser only.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
