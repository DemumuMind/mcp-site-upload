"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
};

export function HomeCinematicBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const element = canvas;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const context = ctx;

    const particles: Particle[] = [];
    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    function resize() {
      const rect = element.getBoundingClientRect();
      width = Math.floor(rect.width);
      height = Math.floor(rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      element.width = Math.max(1, Math.floor(width * dpr));
      element.height = Math.max(1, Math.floor(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const targetCount = Math.max(30, Math.floor(width / 36));
      particles.length = 0;
      for (let i = 0; i < targetCount; i += 1) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.22,
          vy: -0.1 - Math.random() * 0.24,
          r: 0.7 + Math.random() * 1.9,
          alpha: 0.12 + Math.random() * 0.42,
        });
      }
    }

    const start = performance.now();

    function draw(now: number) {
      const t = (now - start) / 1000;
      context.clearRect(0, 0, width, height);

      const grad = context.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "rgba(247,201,72,0.14)");
      grad.addColorStop(0.45, "rgba(247,201,72,0.03)");
      grad.addColorStop(1, "rgba(247,201,72,0)");
      context.fillStyle = grad;
      context.fillRect(0, 0, width, height);

      const sweepX = ((t * 90) % (width + 260)) - 130;
      const sweep = context.createLinearGradient(sweepX - 140, 0, sweepX + 140, 0);
      sweep.addColorStop(0, "rgba(247,201,72,0)");
      sweep.addColorStop(0.5, "rgba(247,201,72,0.09)");
      sweep.addColorStop(1, "rgba(247,201,72,0)");
      context.fillStyle = sweep;
      context.fillRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < -10) {
          p.y = height + 6;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        context.beginPath();
        context.fillStyle = `rgba(247,201,72,${p.alpha})`;
        context.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        context.fill();
      }

      raf = window.requestAnimationFrame(draw);
    }

    resize();
    raf = window.requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[760px] overflow-hidden">
      <canvas ref={canvasRef} className="h-full w-full opacity-90" aria-hidden />
    </div>
  );
}
