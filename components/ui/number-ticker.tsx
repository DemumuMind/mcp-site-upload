"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type NumberTickerProps = {
  value: number;
  durationMs?: number;
  className?: string;
};

export function NumberTicker({ value, durationMs = 900, className }: NumberTickerProps) {
  const target = useMemo(() => Math.max(0, Math.floor(value)), [value]);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let frameId = 0;

    const tick = (timestamp: number) => {
      const progress = Math.min((timestamp - start) / durationMs, 1);
      const next = Math.round(target * progress);
      setDisplayValue(next);
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [durationMs, target]);

  return <span className={cn("tabular-nums", className)}>{displayValue.toLocaleString("en-US")}</span>;
}
