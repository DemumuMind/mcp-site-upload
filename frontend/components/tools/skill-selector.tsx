"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SkillSuggestion } from "@/lib/tools/rules-engine";
import type { SkillProfile } from "@/lib/tools/skill-profiles";

type SkillSelectorProps = {
  allSkills: SkillProfile[];
  selectedSkillIds: string[];
  suggestions: SkillSuggestion[];
  onToggleSkill: (skillId: string) => void;
  onUseSuggestions: () => void;
};

export function SkillSelector({
  allSkills,
  selectedSkillIds,
  suggestions,
  onToggleSkill,
  onUseSuggestions,
}: SkillSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const suggestedIds = useMemo(() => new Set(suggestions.map((item) => item.id)), [suggestions]);

  const filteredSkills = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return allSkills;
    }

    return allSkills.filter((skill) => {
      if (skill.title.toLowerCase().includes(normalizedQuery)) {
        return true;
      }

      if (skill.id.toLowerCase().includes(normalizedQuery)) {
        return true;
      }

      return skill.keywords.some((keyword) => keyword.toLowerCase().includes(normalizedQuery));
    });
  }, [allSkills, searchQuery]);

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">Skill Selector</p>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-border bg-muted/50 text-foreground">
            {selectedSkillIds.length} selected
          </Badge>
          <Button type="button" size="xs" variant="outline" onClick={onUseSuggestions}>
            Use suggestions
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search skills..."
          className="h-9 border-border bg-muted/50 pr-3 pl-8"
        />
      </div>

      <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
        {filteredSkills.map((skill) => {
          const checked = selectedSkillIds.includes(skill.id);
          const isSuggested = suggestedIds.has(skill.id);
          return (
            <label
              key={skill.id}
              className="flex cursor-pointer items-start gap-2 rounded-lg border border-border/70 bg-muted/40 p-2 hover:border-border"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggleSkill(skill.id)}
                className="mt-0.5 size-4 rounded border-border bg-muted/50 text-primary focus:ring-2 focus:ring-primary/50"
              />
              <span className="min-w-0 space-y-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{skill.title}</span>
                  {isSuggested ? (
                    <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                      suggested
                    </Badge>
                  ) : null}
                </span>
                <span className="block text-xs leading-relaxed text-muted-foreground">{skill.summary}</span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
