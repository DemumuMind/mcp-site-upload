"use client";

import Link from "next/link";
import { useMemo } from "react";
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

type ServerCardProps = {
  mcpServer: McpServer;
  viewMode?: ServerCardViewMode;
  score?: number;
  trustScore?: number;
  isSaved?: boolean;
  onToggleSave?: (server: McpServer) => void;
};

const verificationLabelByLevel: Record<VerificationLevel, string> = {
  official: "Official MCP",
  partner: "Partner MCP",
  community: "Community MCP",
};

const accessLabelByAuthType: Record<AuthType, string> = {
  none: "Free",
  oauth: "Freemium",
  api_key: "Paid",
};

const accentClassByLevel: Record<VerificationLevel, string> = {
  official: "from-orange-500/18 via-rose-500/10 to-amber-500/18",
  partner: "from-primary/18 via-primary/8 to-cyan-500/18",
  community: "from-emerald-500/18 via-emerald-500/10 to-sky-500/18",
};

function getRatingValue(mcpServer: McpServer, score?: number): number {
  const fallbackScore = 2.1 + mcpServer.tools.length / 13;
  const normalized = (score ?? fallbackScore) / 1.4;
  return Math.max(1, Math.min(5, Number(normalized.toFixed(1))));
}

export function ServerCard({
  mcpServer,
  viewMode = "grid",
  score,
  trustScore,
  isSaved = false,
  onToggleSave,
}: ServerCardProps) {
  const locale = useLocale();
  const rating = useMemo(() => getRatingValue(mcpServer, score), [mcpServer, score]);
  const verificationLabel = verificationLabelByLevel[mcpServer.verificationLevel];
  const accessLabel = accessLabelByAuthType[mcpServer.authType];

  return (
    <Card
      data-anime-hover="card"
      data-catalog-card={mcpServer.slug}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[1.6rem] border-border/70 bg-[linear-gradient(180deg,hsl(var(--surface-1))/0.95,hsl(var(--background))/0.98)] shadow-[0_18px_48px_-32px_hsl(var(--foreground)/0.7)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-[0_26px_60px_-34px_hsl(var(--foreground)/0.7)]",
        viewMode === "list" && "lg:grid lg:grid-cols-[220px_1fr]",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden border-b border-border/60 bg-gradient-to-br p-4",
          accentClassByLevel[mcpServer.verificationLevel],
          viewMode === "grid" ? "min-h-36" : "lg:min-h-full lg:border-r lg:border-b-0",
        )}
      >
        <div className="absolute -right-10 -bottom-12 size-28 rounded-full bg-background/60 blur-md" />
        <div className="relative flex h-full flex-col">
          <div className="flex items-start justify-between gap-2">
            <Badge className="rounded-full border-border/70 bg-background/80 px-2.5 py-1 text-[10px] text-foreground">
              {tr(locale, verificationLabel, verificationLabel)}
            </Badge>
            <button
              type="button"
              aria-label={tr(locale, "Save card", "Save card")}
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-full border border-border/70 bg-background/80 text-muted-foreground transition hover:border-rose-300/40 hover:text-rose-400",
                isSaved && "border-rose-300/40 text-rose-400",
              )}
              onClick={() => onToggleSave?.(mcpServer)}
            >
              <Heart className={cn("size-4", isSaved && "fill-current")} />
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center pb-2 text-center">
            <ServerLogo
              mcpServer={mcpServer}
              className="size-18 sm:size-20"
              imageSizes="80px"
              imageClassName="h-full w-full object-contain p-2"
              symbolClassName="text-4xl leading-none"
              showWordmark
              wordmarkClassName="text-foreground text-sm sm:text-base"
            />
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <CardHeader className="space-y-3 pb-3">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span>{tr(locale, "by", "by")} {mcpServer.maintainer?.name ?? mcpServer.name}</span>
            {isSaved ? (
              <span className="rounded-full border border-rose-300/35 bg-rose-500/10 px-2 py-0.5 text-rose-300">
                {tr(locale, "Saved", "Saved")}
              </span>
            ) : null}
          </div>

          <CardTitle className="min-h-[2.6rem] text-lg leading-tight text-foreground">
            <Link
              className="line-clamp-2 transition group-hover:text-primary hover:text-primary"
              href={`/server/${mcpServer.slug}`}
            >
              {mcpServer.name}
            </Link>
          </CardTitle>

          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
            {mcpServer.description}
          </p>
        </CardHeader>

        <CardContent className="space-y-3 pt-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-500/15 px-2.5 py-1 text-[11px] font-medium text-amber-200">
              <Star className="size-3.5 fill-current" />
              {rating.toFixed(1)}
            </span>
            <span className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-medium text-emerald-200">
              {tr(locale, "Trust", "Trust")} {typeof trustScore === "number" ? trustScore.toFixed(1) : "--"}
            </span>
            <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px]">
              {tr(locale, accessLabel, accessLabel)}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="truncate">{mcpServer.category}</span>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border/70 px-2.5 py-1">
              <Wrench className="size-3.5" />
              {tr(locale, `${mcpServer.tools.length} tools`, `${mcpServer.tools.length} tools`)}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {mcpServer.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border/70 bg-transparent px-2.5 py-1 text-[11px] text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
            {mcpServer.tags.length > 3 ? (
              <span className="rounded-full border border-border/70 bg-transparent px-2.5 py-1 text-[11px] text-muted-foreground">
                +{mcpServer.tags.length - 3}
              </span>
            ) : null}
          </div>
        </CardContent>

        <CardFooter className="mt-auto border-t border-border/60 p-4">
          <Button asChild variant="outline" className="w-full rounded-xl">
            <Link href={`/server/${mcpServer.slug}`}>{tr(locale, "View details", "View details")}</Link>
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
