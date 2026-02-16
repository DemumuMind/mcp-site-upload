"use client";

import { useEffect, useRef, useState } from "react";

type CountUpValueProps = {
  end: number;
  durationMs?: number;
};

export function CountUpValue({ end, durationMs = 1200 }: CountUpValueProps) {
  const [value, setValue] = useState(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return end;
    }
    return 0;
  });
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

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
  }, [durationMs, end]);

  return <span ref={ref}>{value.toLocaleString()}</span>;
}
