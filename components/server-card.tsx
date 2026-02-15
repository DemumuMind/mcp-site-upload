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

type ServerCardProps = {
  mcpServer: McpServer;
  viewMode?: ServerCardViewMode;
  score?: number;
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
  official: "from-orange-500/18 via-rose-500/12 to-amber-500/18",
  partner: "from-sky-500/18 via-blue-500/12 to-indigo-500/18",
  community: "from-emerald-500/16 via-cyan-500/12 to-blue-500/18",
};

function getRatingValue(mcpServer: McpServer, score?: number): number {
  const fallbackScore = 2.1 + mcpServer.tools.length / 13;
  const normalized = (score ?? fallbackScore) / 1.4;
  return Math.max(1, Math.min(5, Number(normalized.toFixed(1))));
}

export function ServerCard({ mcpServer, viewMode = "grid", score }: ServerCardProps) {
  const locale = useLocale();
  const [saved, setSaved] = useState(false);
  const rating = useMemo(() => getRatingValue(mcpServer, score), [mcpServer, score]);
  const verificationLabel = verificationLabelByLevel[mcpServer.verificationLevel];
  const accessLabel = accessLabelByAuthType[mcpServer.authType];

  return (
    <Card
      className={cn(
        "flex h-full flex-col overflow-hidden border-white/10 bg-indigo-950/88 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.95)] transition duration-200 hover:border-blue-400/45 hover:shadow-[0_24px_45px_-30px_rgba(59,130,246,0.45)]",
        viewMode === "list" && "md:grid md:grid-cols-[220px_1fr]",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden border-b border-white/10 bg-gradient-to-br p-3",
          accentClassByLevel[mcpServer.verificationLevel],
          viewMode === "grid" ? "h-36" : "h-32 md:h-full md:border-r md:border-b-0",
        )}
      >
        <div className="absolute -right-8 -bottom-10 size-32 rounded-full bg-white/8 blur-[1px]" />
        <div className="relative flex h-full flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <Badge className="border border-white/15 bg-indigo-950/70 text-[11px] font-medium text-violet-100 shadow-none">
              {tr(locale, verificationLabel, verificationLabel)}
            </Badge>

            <button
              type="button"
              aria-label={tr(locale, "Save card", "Save card")}
              className={cn(
                "inline-flex size-7 items-center justify-center rounded-md border border-white/15 bg-indigo-950/70 text-violet-300 transition hover:text-rose-400",
                saved && "text-rose-400",
              )}
              onClick={() => setSaved((isSaved) => !isSaved)}
            >
              <Heart className={cn("size-3.5", saved && "fill-current")} />
            </button>
          </div>

          <div className="mt-auto flex items-center justify-center pb-1 text-center">
            <ServerLogo
              mcpServer={mcpServer}
              className="size-18"
              imageSizes="72px"
              imageClassName="h-full w-full object-contain p-2"
              symbolClassName="text-4xl leading-none"
              showWordmark
              wordmarkClassName="text-violet-50"
            />
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <CardHeader className="space-y-2 pb-3">
          <CardTitle className="min-h-[2.75rem] text-base leading-tight text-violet-50 sm:text-lg">
            <Link className="line-clamp-2 transition hover:text-cyan-300" href={`/server/${mcpServer.slug}`}>
              {mcpServer.name}
            </Link>
          </CardTitle>

          <p className="text-xs text-violet-300">
            {tr(locale, "by", "by")} {mcpServer.maintainer?.name ?? mcpServer.name}
          </p>

          <p className="line-clamp-3 text-sm leading-6 text-violet-200">{mcpServer.description}</p>
        </CardHeader>

        <CardContent className="space-y-3 pt-0">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-500/15 px-2 py-1 text-xs font-medium text-amber-200">
              <Star className="size-3.5 fill-current" />
              {rating.toFixed(1)}
            </div>

            <Badge variant="secondary" className="border border-blue-400/30 bg-blue-500/15 text-[11px] font-semibold text-blue-200">
              {tr(locale, accessLabel, accessLabel)}
            </Badge>
          </div>

          <div className="flex items-center justify-between gap-2 text-xs text-violet-300">
            <span className="truncate">{mcpServer.category}</span>
            <span className="inline-flex shrink-0 items-center gap-1">
              <Wrench className="size-3.5" />
              {tr(locale, `${mcpServer.tools.length} tools`, `${mcpServer.tools.length} tools`)}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {mcpServer.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="rounded-full border border-white/12 bg-indigo-900/80 px-2 py-0.5 text-xs text-violet-200">
                {tag}
              </span>
            ))}
            {mcpServer.tags.length > 2 ? (
              <span className="rounded-full border border-white/12 bg-indigo-900/80 px-2 py-0.5 text-xs text-violet-200">
                +{mcpServer.tags.length - 2}
              </span>
            ) : null}
          </div>
        </CardContent>

        <CardFooter className="mt-auto border-t border-white/10 bg-indigo-950/70 p-3">
          <Button asChild variant="outline" className="w-full border-white/15 bg-indigo-900/80 text-violet-50 hover:bg-indigo-800">
            <Link href={`/server/${mcpServer.slug}`}>{tr(locale, "View details", "View details")}</Link>
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
