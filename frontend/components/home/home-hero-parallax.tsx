"use client";

import { useEffect, useState } from "react";

export function HomeHeroParallax() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function handlePointerMove(event: PointerEvent) {
      const x = (event.clientX / window.innerWidth - 0.5) * 14;
      const y = (event.clientY / window.innerHeight - 0.5) * 10;
      setOffset({ x, y });
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      <div
        className="absolute left-1/2 top-[140px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(247,201,72,0.22),transparent_60%)] blur-2xl"
        style={{ transform: `translate(calc(-50% + ${offset.x}px), ${offset.y}px)` }}
      />
      <div
        className="absolute right-[12%] top-[260px] h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,rgba(247,201,72,0.14),transparent_62%)] blur-2xl"
        style={{ transform: `translate(${-offset.x * 0.4}px, ${-offset.y * 0.45}px)` }}
      />
    </div>
  );
}
