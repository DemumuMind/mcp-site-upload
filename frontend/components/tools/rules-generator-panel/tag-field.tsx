"use client";

import { type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { normalizeTag } from "@/components/tools/rules-generator-panel/use-rules-generator-controller";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TagFieldProps = {
  label: string;
  tags: string[];
  draft: string;
  placeholder: string;
  onDraftChange: (value: string) => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
};

export function TagField({
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
          onChange={event => onDraftChange(event.target.value)}
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
          tags.map(tag => (
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
