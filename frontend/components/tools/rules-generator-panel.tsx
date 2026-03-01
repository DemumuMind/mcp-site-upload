"use client";

import { History, Sparkles, Wand2, X } from "lucide-react";
import { type KeyboardEvent } from "react";

import { ExportTabs } from "@/components/tools/export-tabs";
import { PresetManager } from "@/components/tools/preset-manager";
import {
  formatTimestamp,
  normalizeTag,
  useRulesGeneratorController,
} from "@/components/tools/rules-generator-panel/use-rules-generator-controller";
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
import type { RulesTone } from "@/lib/tools/rules-engine";

type TagFieldProps = {
  label: string;
  tags: string[];
  draft: string;
  placeholder: string;
  onDraftChange: (value: string) => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
};

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
    if (!normalized) return;
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
          className="h-9 min-w-[12rem] flex-1 border-border bg-muted/50"
        />
        <Button type="button" size="sm" variant="outline" onClick={commitDraft}>
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.length === 0 ? (
          <p className="text-xs text-muted-foreground">No tags yet.</p>
        ) : (
          tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="flex items-center gap-1 border-border bg-muted/50 text-foreground"
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemoveTag(tag)}
                className="rounded p-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
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
  const {
    projectName,
    setProjectName,
    projectDescription,
    setProjectDescription,
    stackTags,
    setStackTags,
    stackDraft,
    setStackDraft,
    constraintTags,
    setConstraintTags,
    constraintDraft,
    setConstraintDraft,
    tone,
    setTone,
    sourceMode,
    setSourceMode,
    existingRulesText,
    setExistingRulesText,
    activeSkillIds,
    suggestions,
    generationResult,
    presets,
    historyItems,
    canGenerate,
    addTag,
    removeTag,
    toggleSkill,
    applySuggestions,
    handleGenerateRules,
    handleSavePreset,
    handleLoadPreset,
    handleDeletePreset,
    handleLoadHistory,
    allSkillProfiles,
  } = useRulesGeneratorController();

  return (
    <Card className="gap-4 border-border bg-card shadow-[0_14px_34px_rgba(4,8,20,0.45)] backdrop-blur-md">
      <CardHeader className="space-y-3 pb-0">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xl text-foreground">Rules Generator</CardTitle>
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
            advanced
          </Badge>
        </div>
        <CardDescription className="text-muted-foreground">
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
            className="border-border bg-muted/50"
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
            className="border-border bg-muted/50 text-foreground placeholder:text-muted-foreground"
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
              <SelectTrigger id="rules-tone" className="w-full border-border bg-muted/50">
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
              className="border-border bg-muted/50 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        ) : null}

        <div className="space-y-2 rounded-xl border border-border bg-card p-3">
          <p className="text-sm font-semibold text-foreground">Auto-detected skill signals</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <Badge
                key={suggestion.id}
                variant="outline"
                className="border-border bg-muted/50 text-foreground"
                title={suggestion.reason}
              >
                {suggestion.title}
              </Badge>
            ))}
          </div>
        </div>

        <SkillSelector
          allSkills={allSkillProfiles}
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

        <div className="space-y-3 rounded-xl border border-border bg-card p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">Generation History</p>
            <Badge variant="outline" className="border-border bg-muted/50 text-foreground">
              {historyItems.length}
            </Badge>
          </div>

          <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
            {historyItems.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border/70 px-3 py-2 text-xs text-muted-foreground">
                No generations yet.
              </p>
            ) : (
              historyItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleLoadHistory(item)}
                  className="flex w-full items-start justify-between gap-3 rounded-lg border border-border/70 bg-muted/40 p-2 text-left hover:border-border"
                >
                  <span className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.input.projectName || "Untitled project"}
                    </p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">{item.input.description}</p>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    <History className="mb-1 ml-auto size-3.5" />
                    {formatTimestamp(item.createdAt)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-foreground">
          <p className="flex items-center gap-1.5 font-medium">
            <Sparkles className="size-3.5" />
            Expert mode active
          </p>
          <p className="mt-1 text-foreground/90">
            Presets and generation history are saved locally in your browser only.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
