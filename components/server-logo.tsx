"use client";

import { useMemo, useState } from "react";

import { getServerLogoCandidates, resolveLogoFallbackTheme, resolveLogoStyle } from "@/lib/server-logo";
import type { McpServer } from "@/lib/types";
import { cn } from "@/lib/utils";

type ServerLogoProps = {
  mcpServer: Pick<McpServer, "slug" | "name" | "repoUrl" | "serverUrl">;
  className?: string;
  imageClassName?: string;
  symbolClassName?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
};

export function ServerLogo({
  mcpServer,
  className,
  imageClassName,
  symbolClassName,
  showWordmark = false,
  wordmarkClassName,
}: ServerLogoProps) {
  const logoStyle = useMemo(
    () => resolveLogoStyle({ slug: mcpServer.slug, name: mcpServer.name }),
    [mcpServer.name, mcpServer.slug],
  );
  const fallbackTheme = useMemo(
    () => resolveLogoFallbackTheme({ slug: mcpServer.slug, name: mcpServer.name }),
    [mcpServer.name, mcpServer.slug],
  );
  const candidates = useMemo(() => getServerLogoCandidates(mcpServer), [mcpServer]);
  const candidatesKey = useMemo(() => candidates.join("|"), [candidates]);
  const [logoIndexByKey, setLogoIndexByKey] = useState<Record<string, number>>({});
  const logoIndex = logoIndexByKey[candidatesKey] ?? 0;

  const activeLogo = candidates[logoIndex] ?? null;
  const hasImageLogo = Boolean(activeLogo);

  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={cn(
          "inline-flex items-center justify-center overflow-hidden rounded-2xl",
          hasImageLogo
            ? "border border-white/55 bg-white/85 shadow-[0_10px_24px_rgba(15,23,42,0.12)]"
            : cn(
                "border border-white/20 bg-gradient-to-br shadow-[0_14px_28px_rgba(2,6,23,0.3)]",
                fallbackTheme.containerClassName,
              ),
          className,
        )}
      >
        {hasImageLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activeLogo}
            alt={`${mcpServer.name} logo`}
            loading="lazy"
            decoding="async"
            className={cn("h-full w-full object-contain p-2", imageClassName)}
            onError={() =>
              setLogoIndexByKey((current) => ({
                ...current,
                [candidatesKey]: (current[candidatesKey] ?? 0) + 1,
              }))
            }
          />
        ) : (
          <span
            className={cn(
              "select-none font-black tracking-tight drop-shadow-[0_2px_8px_rgba(2,6,23,0.45)]",
              fallbackTheme.symbolClassName,
              logoStyle.symbolClassName,
              symbolClassName,
            )}
          >
            {logoStyle.symbol}
          </span>
        )}
      </div>

      {showWordmark && logoStyle.wordmark ? (
        <p className={cn("mt-2 text-sm font-bold tracking-tight", logoStyle.wordmarkClassName, wordmarkClassName)}>
          {logoStyle.wordmark}
        </p>
      ) : null}
    </div>
  );
}
