"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type CountUpValueProps = {
  end: number;
  durationMs?: number;
};

export function CountUpValue({ end, durationMs = 1200 }: CountUpValueProps) {
  const [value, setValue] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (prefersReducedMotion) {
      return;
    }

    let raf = 0;
    let startedAt = 0;
    let hasStarted = false;

    const observer = new IntersectionObserver(
      (entries) => {
        if (hasStarted) return;
        if (!entries[0]?.isIntersecting) return;

        hasStarted = true;
        observer.disconnect();

        function tick(timestamp: number) {
          if (!startedAt) startedAt = timestamp;
          const progress = Math.min((timestamp - startedAt) / durationMs, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setValue(Math.round(end * eased));
          if (progress < 1) raf = window.requestAnimationFrame(tick);
        }

        raf = window.requestAnimationFrame(tick);
      },
      { threshold: 0.35 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [durationMs, end, prefersReducedMotion]);

  const renderedValue = prefersReducedMotion ? end : value;

  return <span ref={ref}>{renderedValue.toLocaleString()}</span>;
}
