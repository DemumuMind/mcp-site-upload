"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Heart, Star, Wrench } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { ServerLogo } from "@/components/server-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { tr } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { AuthType, McpServer, VerificationLevel } from "@/lib/types";

type ServerCardViewMode = "grid" | "list";
type ServerCardProps = { mcpServer: McpServer; viewMode?: ServerCardViewMode; score?: number; trustScore?: number; };

const verificationLabelByLevel: Record<VerificationLevel, string> = { official: "Official MCP", partner: "Partner MCP", community: "Community MCP" };
const accessLabelByAuthType: Record<AuthType, string> = { none: "Free", oauth: "Freemium", api_key: "Paid" };
const accentClassByLevel: Record<VerificationLevel, string> = { official: "from-orange-500/18 via-rose-500/12 to-amber-500/18", partner: "from-primary/20 via-primary/10 to-accent/20", community: "from-accent/20 via-accent/10 to-primary/20" };
function getRatingValue(mcpServer: McpServer, score?: number): number { const fallbackScore = 2.1 + mcpServer.tools.length / 13; const normalized = (score ?? fallbackScore) / 1.4; return Math.max(1, Math.min(5, Number(normalized.toFixed(1)))); }

export function ServerCard({ mcpServer, viewMode = "grid", score, trustScore }: ServerCardProps) {
  const locale = useLocale();
  const [saved, setSaved] = useState(false);
  const rating = useMemo(() => getRatingValue(mcpServer, score), [mcpServer, score]);
  const verificationLabel = verificationLabelByLevel[mcpServer.verificationLevel];
  const accessLabel = accessLabelByAuthType[mcpServer.authType];

  return (
    <Card data-anime-hover="card" className={cn("group flex h-full flex-col overflow-hidden border-border/60 bg-background/72 transition-colors duration-200 ease-out hover:border-primary/45", viewMode === "list" && "md:grid md:grid-cols-[200px_1fr]") }>
      <div className={cn("relative overflow-hidden border-b border-border/60 bg-gradient-to-br p-3", accentClassByLevel[mcpServer.verificationLevel], viewMode === "grid" ? "h-28 sm:h-32" : "h-28 md:h-full md:border-r md:border-b-0")}>
        <div className="absolute -right-8 -bottom-10 size-24 rounded-full bg-card/70 blur-[1px]" />
        <div className="relative flex h-full flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <Badge className="border-border/70 bg-background/80 text-[10px] text-foreground">{tr(locale, verificationLabel, verificationLabel)}</Badge>
            <button type="button" aria-label={tr(locale, "Save card", "Save card")} className={cn("touch-hitbox inline-flex size-7 items-center justify-center border border-border/70 bg-background/80 text-muted-foreground transition hover:text-destructive", saved && "text-destructive")} onClick={() => setSaved((isSaved) => !isSaved)}><Heart className={cn("size-3.5", saved && "fill-current")} /></button>
          </div>
          <div className="mt-auto flex items-center justify-center pb-1 text-center">
            <ServerLogo mcpServer={mcpServer} className="size-14 sm:size-16" imageSizes="64px" imageClassName="h-full w-full object-contain p-2" symbolClassName="text-3xl leading-none" showWordmark wordmarkClassName="text-foreground text-sm sm:text-base" />
          </div>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <CardHeader className="space-y-2 pb-2 sm:pb-3">
          <CardTitle className="min-h-[2.2rem] text-base leading-tight text-foreground sm:min-h-[2.75rem] sm:text-lg"><Link className="line-clamp-2 transition group-hover:text-primary hover:text-primary" href={`/server/${mcpServer.slug}`}>{mcpServer.name}</Link></CardTitle>
          <p className="hidden text-xs text-muted-foreground sm:block">{tr(locale, "by", "by")} {mcpServer.maintainer?.name ?? mcpServer.name}</p>
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground sm:line-clamp-3">{mcpServer.description}</p>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1 border border-amber-300/30 bg-amber-500/15 px-2 py-1 text-xs font-medium text-amber-200"><Star className="size-3.5 fill-current" />{rating.toFixed(1)}</div>
            <span className="inline-flex items-center border border-emerald-400/30 bg-emerald-500/15 px-2 py-1 text-[11px] font-medium text-emerald-200">{tr(locale, "Trust", "Trust")} {typeof trustScore === "number" ? trustScore.toFixed(1) : "--"}</span>
            <Badge variant="secondary" className="text-[10px]">{tr(locale, accessLabel, accessLabel)}</Badge>
          </div>
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground"><span className="truncate">{mcpServer.category}</span><span className="inline-flex shrink-0 items-center gap-1"><Wrench className="size-3.5" />{tr(locale, `${mcpServer.tools.length} tools`, `${mcpServer.tools.length} tools`)}</span></div>
          <div className="hidden flex-wrap gap-1.5 sm:flex">{mcpServer.tags.slice(0, 2).map((tag) => <span key={tag} className="border border-border/70 bg-transparent px-2 py-0.5 text-xs text-muted-foreground">{tag}</span>)}{mcpServer.tags.length > 2 ? <span className="border border-border/70 bg-transparent px-2 py-0.5 text-xs text-muted-foreground">+{mcpServer.tags.length - 2}</span> : null}</div>
        </CardContent>
        <CardFooter className="mt-auto border-t border-border/60 p-3"><Button asChild variant="outline" className="w-full"><Link href={`/server/${mcpServer.slug}`}>{tr(locale, "View details", "View details")}</Link></Button></CardFooter>
      </div>
    </Card>
  );
}
