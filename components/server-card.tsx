"use client";

import Link from "next/link";
import { useMemo } from "react";
import { GitCompareArrows, Heart, Star } from "lucide-react";

import { useLocale } from "@/components/locale-provider";
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
  isSaved?: boolean;
  isCompared?: boolean;
  onToggleSaved?: (serverId: string) => void;
  onToggleCompared?: (serverId: string) => void;
};

type LogoStyle = {
  symbol: string;
  symbolClassName: string;
  wordmark?: string;
  wordmarkClassName?: string;
};

const verificationLabelByLevel: Record<VerificationLevel, { en: string; ru: string }> = {
  official: { en: "Official MCP", ru: "Официальный MCP" },
  partner: { en: "Partner MCP", ru: "Партнерский MCP" },
  community: { en: "Community MCP", ru: "Community MCP" },
};

const accessLabelByAuthType: Record<AuthType, { en: string; ru: string }> = {
  none: { en: "Free", ru: "Бесплатно" },
  oauth: { en: "Freemium", ru: "Freemium" },
  api_key: { en: "Paid", ru: "Платно" },
};

const accentClassByLevel: Record<VerificationLevel, string> = {
  official: "from-orange-50 via-rose-50 to-orange-100",
  partner: "from-sky-50 via-blue-50 to-indigo-100",
  community: "from-emerald-50 via-cyan-50 to-sky-100",
};

const logoStyleBySlug: Record<string, LogoStyle> = {
  linear: {
    symbol: "◩",
    symbolClassName: "text-slate-900",
    wordmark: "Linear",
    wordmarkClassName: "text-slate-900",
  },
  github: {
    symbol: "◉",
    symbolClassName: "text-slate-900",
    wordmark: "GitHub",
    wordmarkClassName: "text-slate-900",
  },
  figma: {
    symbol: "⬣",
    symbolClassName: "text-fuchsia-500",
    wordmark: "Figma",
    wordmarkClassName: "text-slate-900",
  },
  sentry: {
    symbol: "⟟",
    symbolClassName: "text-slate-900",
    wordmark: "Sentry",
    wordmarkClassName: "text-slate-900",
  },
  slack: {
    symbol: "✶",
    symbolClassName: "text-violet-500",
    wordmark: "Slack",
    wordmarkClassName: "text-slate-900",
  },
  postgres: {
    symbol: "◍",
    symbolClassName: "text-sky-600",
    wordmark: "Postgres",
    wordmarkClassName: "text-slate-900",
  },
};

function getInitials(name: string): string {
  const words = name
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);

  if (words.length === 0) {
    return "MCP";
  }

  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function resolveLogoStyle(mcpServer: McpServer): LogoStyle {
  const predefined = logoStyleBySlug[mcpServer.slug];

  if (predefined) {
    return predefined;
  }

  return {
    symbol: getInitials(mcpServer.name),
    symbolClassName: "text-slate-900",
  };
}

function getProductBadge(mcpServer: McpServer): { en: string; ru: string } {
  const loweredCategory = mcpServer.category.toLowerCase();

  if (loweredCategory.includes("model")) {
    return { en: "AI Models", ru: "AI Models" };
  }

  if (loweredCategory.includes("agent")) {
    return { en: "AI Agents", ru: "AI Agents" };
  }

  return { en: "MCPs", ru: "MCPs" };
}

function getRatingValue(mcpServer: McpServer, score?: number): number {
  const fallbackScore = 2.1 + mcpServer.tools.length / 13;
  const normalized = (score ?? fallbackScore) / 1.4;

  return Math.max(1, Math.min(5, Number(normalized.toFixed(1))));
}

export function ServerCard({
  mcpServer,
  viewMode = "grid",
  score,
  isSaved = false,
  isCompared = false,
  onToggleSaved,
  onToggleCompared,
}: ServerCardProps) {
  const locale = useLocale();

  const rating = useMemo(() => getRatingValue(mcpServer, score), [mcpServer, score]);
  const logoStyle = useMemo(() => resolveLogoStyle(mcpServer), [mcpServer]);
  const productBadge = useMemo(() => getProductBadge(mcpServer), [mcpServer]);
  const verificationLabel = verificationLabelByLevel[mcpServer.verificationLevel];
  const accessLabel = accessLabelByAuthType[mcpServer.authType];

  return (
    <Card
      className={cn(
        "overflow-hidden border-white/10 bg-slate-900/75 shadow-[0_0_0_1px_rgba(148,163,184,0.08)] transition duration-200 hover:border-cyan-400/35",
        viewMode === "list" && "md:grid md:grid-cols-[250px_1fr]",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden border-b border-white/10 bg-gradient-to-br p-3",
          accentClassByLevel[mcpServer.verificationLevel],
          viewMode === "grid" ? "h-44" : "md:h-full md:border-r md:border-b-0",
        )}
      >
        <div className="absolute -right-10 -bottom-12 size-36 rounded-full bg-white/55 blur-[1px]" />
        <div className="relative flex h-full flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <Badge className="border border-white/70 bg-white/85 text-[11px] font-medium text-slate-700 shadow-none">
              {tr(locale, verificationLabel.en, verificationLabel.ru)}
            </Badge>

            <div className="flex items-center gap-1.5">
              <Badge className="border border-white/70 bg-white/85 text-[11px] font-medium text-blue-700 shadow-none">
                {tr(locale, productBadge.en, productBadge.ru)}
              </Badge>
              <button
                type="button"
                aria-label={tr(locale, "Save card", "Сохранить карточку")}
                className={cn(
                  "inline-flex size-7 items-center justify-center rounded-md border border-slate-200/80 bg-white/90 text-slate-500 transition hover:text-rose-500",
                  isSaved && "text-rose-500",
                )}
                onClick={() => onToggleSaved?.(mcpServer.id)}
              >
                <Heart className={cn("size-3.5", isSaved && "fill-current")} />
              </button>
              <button
                type="button"
                aria-label={tr(locale, "Add to compare", "Добавить в сравнение")}
                className={cn(
                  "inline-flex size-7 items-center justify-center rounded-md border border-slate-200/80 bg-white/90 text-slate-500 transition hover:text-blue-600",
                  isCompared && "text-blue-600",
                )}
                onClick={() => onToggleCompared?.(mcpServer.id)}
              >
                <GitCompareArrows className={cn("size-3.5", isCompared && "stroke-[2.8]")} />
              </button>
            </div>
          </div>

          <div className="mt-auto flex flex-col items-center justify-center pb-2 text-center">
            <p className={cn("text-5xl leading-none font-black tracking-tight", logoStyle.symbolClassName)}>
              {logoStyle.symbol}
            </p>
            {logoStyle.wordmark ? (
              <p className={cn("mt-2 text-sm font-bold tracking-tight", logoStyle.wordmarkClassName)}>
                {logoStyle.wordmark}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <CardHeader className="space-y-2 pb-2">
          <CardTitle className="text-lg leading-tight text-slate-100">
            <Link className="transition hover:text-cyan-200" href={`/server/${mcpServer.slug}`}>
              {mcpServer.name}
            </Link>
          </CardTitle>
          <p className="text-xs text-slate-400">
            {tr(locale, "by", "от")} {mcpServer.maintainer?.name ?? mcpServer.name}
          </p>
          <p className="line-clamp-2 text-sm text-slate-300">{mcpServer.description}</p>
        </CardHeader>

        <CardContent className="space-y-3 pt-0">
          <div className="flex flex-wrap gap-1.5">
            {mcpServer.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/15 bg-slate-800/80 px-2 py-0.5 text-xs text-slate-300"
              >
                {tag}
              </span>
            ))}
            {mcpServer.tags.length > 3 ? (
              <span className="rounded-full border border-white/15 bg-slate-800/80 px-2 py-0.5 text-xs text-slate-300">
                +{mcpServer.tags.length - 3}
              </span>
            ) : null}
          </div>

          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-200">
              <Star className="size-3.5 fill-current" />
              {rating.toFixed(1)}
            </div>
            <span className="text-sm font-semibold text-cyan-200">
              {tr(locale, accessLabel.en, accessLabel.ru)}
            </span>
          </div>
        </CardContent>

        <CardFooter className="mt-auto border-t border-white/10 bg-slate-900/90 p-3">
          <Button
            asChild
            variant="outline"
            className="w-full border-white/15 bg-slate-950/70 text-slate-100 hover:bg-slate-900"
          >
            <Link href={`/server/${mcpServer.slug}`}>
              {tr(locale, "View Details", "Подробнее")}
            </Link>
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
