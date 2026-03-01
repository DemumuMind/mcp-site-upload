"use client";

import { useEffect, useMemo, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

type NumberTickerProps = {
  value: number;
  className?: string;
  duration?: number;
};

export function NumberTicker({ value, className, duration = 900 }: NumberTickerProps) {
  const target = useMemo(() => Math.max(0, Math.floor(value)), [value]);
  const [displayValue, setDisplayValue] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(target * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, prefersReducedMotion]);

  const valueToRender = prefersReducedMotion ? target : displayValue;
  return <span className={cn(className)}>{valueToRender.toLocaleString("en-US")}</span>;
}
