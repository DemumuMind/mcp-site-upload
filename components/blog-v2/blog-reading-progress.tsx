"use client";

import { useEffect, useMemo, useState } from "react";

function getScrollProgress(): number {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return 0;
  }

  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const viewportHeight = window.innerHeight || 0;
  const docHeight = document.documentElement.scrollHeight || 0;
  const scrollable = Math.max(1, docHeight - viewportHeight);
  return Math.max(0, Math.min(100, Math.round((scrollTop / scrollable) * 100)));
}

export function BlogReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function updateProgress() {
      setProgress(getScrollProgress());
    }

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  const width = useMemo(() => `${progress}%`, [progress]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-[57px] z-40 h-[2px] bg-transparent sm:top-[61px]"
    >
      <div
        className="h-full bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 transition-[width] duration-150 ease-out"
        style={{ width }}
      />
    </div>
  );
}


