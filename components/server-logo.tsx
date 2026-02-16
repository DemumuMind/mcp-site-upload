"use client";
import Image from "next/image";
import { useMemo, useState } from "react";
import { getServerLogoCandidates, resolveLogoFallbackTheme, resolveLogoStyle } from "@/lib/server-logo";
import type { McpServer } from "@/lib/types";
import { cn } from "@/lib/utils";
type ServerLogoProps = {
    mcpServer: Pick<McpServer, "slug" | "name" | "repoUrl" | "serverUrl">;
    className?: string;
    imageClassName?: string;
    imageSizes?: string;
    symbolClassName?: string;
    showWordmark?: boolean;
    wordmarkClassName?: string;
};
export function ServerLogo({ mcpServer, className, imageClassName, imageSizes = "72px", symbolClassName, showWordmark = false, wordmarkClassName, }: ServerLogoProps) {
    const logoStyle = useMemo(() => resolveLogoStyle({ slug: mcpServer.slug, name: mcpServer.name }), [mcpServer.name, mcpServer.slug]);
    const fallbackTheme = useMemo(() => resolveLogoFallbackTheme({ slug: mcpServer.slug, name: mcpServer.name }), [mcpServer.name, mcpServer.slug]);
    const candidates = useMemo(() => getServerLogoCandidates(mcpServer), [mcpServer]);
    const candidatesKey = useMemo(() => candidates.join("|"), [candidates]);
    const [fallbackState, setFallbackState] = useState<{
        key: string;
        index: number;
    }>({
        key: "",
        index: 0,
    });
    const logoIndex = fallbackState.key === candidatesKey ? fallbackState.index : 0;
    const activeLogo = candidates[logoIndex] ?? null;
    const hasImageLogo = Boolean(activeLogo);
    return (<div className="flex flex-col items-center text-center">
      <div className={cn("relative inline-flex items-center justify-center overflow-hidden rounded-2xl", hasImageLogo
            ? "border border-blacksmith bg-card shadow-[0_12px_28px_rgba(2,6,23,0.55)] backdrop-blur-[2px]"
            : cn("border border-blacksmith bg-gradient-to-br shadow-[0_14px_28px_rgba(2,6,23,0.3)]", fallbackTheme.containerClassName), className)}>
        {hasImageLogo ? (
        <Image src={activeLogo} alt={`${mcpServer.name} logo`} fill sizes={imageSizes} className={cn("h-full w-full object-contain p-2 drop-shadow-[0_6px_12px_rgba(2,6,23,0.4)]", imageClassName)} referrerPolicy="no-referrer" onError={() => setFallbackState((current) => current.key === candidatesKey
                ? { key: candidatesKey, index: current.index + 1 }
                : { key: candidatesKey, index: 1 })}/>) : (<span className={cn("select-none font-black tracking-tight drop-shadow-[0_2px_8px_rgba(2,6,23,0.45)]", fallbackTheme.symbolClassName, logoStyle.symbolClassName, symbolClassName)}>
            {logoStyle.symbol}
          </span>)}
      </div>

      {showWordmark && logoStyle.wordmark ? (<p className={cn("mt-2 text-sm font-bold tracking-tight", logoStyle.wordmarkClassName, wordmarkClassName)}>
          {logoStyle.wordmark}
        </p>) : null}
    </div>);
}

