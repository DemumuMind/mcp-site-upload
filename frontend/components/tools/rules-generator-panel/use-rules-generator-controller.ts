"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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

function generateClientId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now()}-${random}`;
}

export function formatTimestamp(isoDate: string): string {
  const parsed = Date.parse(isoDate);
  if (!Number.isFinite(parsed)) return "unknown";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

export function normalizeTag(tag: string): string {
  return tag.trim().replace(/\s+/g, " ");
}

export function useRulesGeneratorController() {
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
    const suggestedIds = suggestions.map(item => item.id).slice(0, 5);
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
    return () => window.clearTimeout(timeoutId);
  }, []);

  function addTag(nextTag: string, currentTags: string[], setTags: (value: string[]) => void) {
    if (currentTags.some(tag => tag.toLowerCase() === nextTag.toLowerCase())) return;
    setTags([...currentTags, nextTag]);
  }

  function removeTag(tagToRemove: string, currentTags: string[], setTags: (value: string[]) => void) {
    setTags(currentTags.filter(tag => tag !== tagToRemove));
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
    setSelectedSkillIds(previous => {
      const baseSelection = manualSkillSelection ? previous : activeSkillIds;
      if (baseSelection.includes(skillId)) return baseSelection.filter(id => id !== skillId);
      return [...baseSelection, skillId];
    });
  }

  function applySuggestions() {
    const suggestedIds = suggestions.map(item => item.id).slice(0, 6);
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
    setGenerationResult(buildRulesArtifacts(item.input));
    toast.success("History item loaded.");
  }

  return {
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
    selectedSkillIds,
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
    allSkillProfiles: ALL_SKILL_PROFILES,
  };
}
