"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type GridPatternProps = {
  className?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  strokeDasharray?: string;
};

export function GridPattern({
  className,
  width = 32,
  height = 32,
  x = 0,
  y = 0,
  strokeDasharray = "0",
}: GridPatternProps) {
  const style: CSSProperties = {
    "--grid-width": `${width}px`,
    "--grid-height": `${height}px`,
    "--grid-x": `${x}px`,
    "--grid-y": `${y}px`,
    "--grid-dash": strokeDasharray,
  } as CSSProperties;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0",
        "[background-size:var(--grid-width)_var(--grid-height)]",
        "[background-position:var(--grid-x)_var(--grid-y)]",
        "[background-image:linear-gradient(to_right,hsl(var(--grid-line)/0.12)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--grid-line)/0.12)_1px,transparent_1px)]",
        className,
      )}
      style={style}
    />
  );
}
