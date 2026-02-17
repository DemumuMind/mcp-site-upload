"use client";

import { useEffect, useRef } from "react";

type Comet = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  len: number;
  alpha: number;
};

type Orb = {
  radius: number;
  speed: number;
  phase: number;
  size: number;
  alpha: number;
};

type IntensityPreset = {
  fps: number;
  comets: number;
  orbs: number;
  maxDpr: number;
  glow: number;
  wrapperHeightClass: string;
};

const intensityPresets: Record<"low" | "medium" | "epic", IntensityPreset> = {
  low: { fps: 28, comets: 20, orbs: 3, maxDpr: 1.1, glow: 0.14, wrapperHeightClass: "h-[760px]" },
  medium: { fps: 36, comets: 32, orbs: 4, maxDpr: 1.35, glow: 0.2, wrapperHeightClass: "h-[900px]" },
  epic: { fps: 48, comets: 46, orbs: 5, maxDpr: 1.55, glow: 0.26, wrapperHeightClass: "h-[1080px]" },
};

function getIntensityPreset(value?: string): IntensityPreset {
  if (value === "low" || value === "medium" || value === "epic") return intensityPresets[value];
  return intensityPresets.epic;
}

export function HomeCinematicBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const preset = getIntensityPreset(process.env.NEXT_PUBLIC_HERO_ANIMATION_INTENSITY);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const element = canvas;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;
    const ctx = context;

    const comets: Comet[] = [];
    const orbs: Orb[] = [];

    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let prevTs = 0;
    let elapsed = 0;
    let running = true;

    const frameStep = 1000 / preset.fps;

    function resetScene() {
      comets.length = 0;
      orbs.length = 0;

      for (let i = 0; i < preset.comets; i += 1) {
        comets.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: 0.2 + Math.random() * 0.55,
          vy: -0.04 - Math.random() * 0.22,
          len: 18 + Math.random() * 52,
          alpha: 0.08 + Math.random() * 0.22,
        });
      }

      for (let i = 0; i < preset.orbs; i += 1) {
        orbs.push({
          radius: width * (0.14 + i * 0.07),
          speed: 0.18 + i * 0.06,
          phase: Math.random() * Math.PI * 2,
          size: 26 + i * 7,
          alpha: 0.14 + i * 0.03,
        });
      }
    }

    function resize() {
      const rect = element.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, preset.maxDpr);

      element.width = Math.max(1, Math.floor(width * dpr));
      element.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      resetScene();
    }

    function drawBackdrop(timeSec: number) {
      const horizon = ctx.createLinearGradient(0, 0, 0, height);
      horizon.addColorStop(0, "rgba(247,201,72,0.35)");
      horizon.addColorStop(0.44, "rgba(247,201,72,0.09)");
      horizon.addColorStop(1, "rgba(247,201,72,0)");
      ctx.fillStyle = horizon;
      ctx.fillRect(0, 0, width, height);

      const pulse = 0.5 + Math.sin(timeSec * 1.4) * 0.5;
      const halo = ctx.createRadialGradient(width * 0.5, height * 0.26, 10, width * 0.5, height * 0.26, width * 0.62);
      halo.addColorStop(0, `rgba(255,220,110,${preset.glow * (0.9 + pulse * 0.4)})`);
      halo.addColorStop(1, "rgba(247,201,72,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, width, height);
    }

    function drawOrbiters(timeSec: number) {
      const cx = width * 0.5;
      const cy = height * 0.36;

      for (const orb of orbs) {
        const x = cx + Math.cos(timeSec * orb.speed + orb.phase) * orb.radius;
        const y = cy + Math.sin(timeSec * orb.speed * 1.1 + orb.phase) * (orb.radius * 0.24);

        const g = ctx.createRadialGradient(x, y, 0, x, y, orb.size);
        g.addColorStop(0, `rgba(255,225,128,${orb.alpha})`);
        g.addColorStop(1, "rgba(255,225,128,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, orb.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawComets() {
      for (const c of comets) {
        c.x += c.vx;
        c.y += c.vy;

        if (c.x > width + c.len) {
          c.x = -c.len;
          c.y = Math.random() * height;
        }
        if (c.y < -30) c.y = height + 20;

        const x2 = c.x - c.len;
        const y2 = c.y + c.len * 0.18;

        const streak = ctx.createLinearGradient(c.x, c.y, x2, y2);
        streak.addColorStop(0, `rgba(255,226,132,${c.alpha})`);
        streak.addColorStop(1, "rgba(255,226,132,0)");

        ctx.strokeStyle = streak;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }

    function drawFrame(ts: number) {
      if (!running) return;
      if (!prevTs) prevTs = ts;

      const delta = ts - prevTs;
      if (delta < frameStep) {
        raf = window.requestAnimationFrame(drawFrame);
        return;
      }

      prevTs = ts;
      elapsed += delta;
      const timeSec = elapsed / 1000;

      ctx.clearRect(0, 0, width, height);
      drawBackdrop(timeSec);

      ctx.globalCompositeOperation = "screen";
      drawOrbiters(timeSec);
      drawComets();
      ctx.globalCompositeOperation = "source-over";

      raf = window.requestAnimationFrame(drawFrame);
    }

    function onVisibilityChange() {
      running = !document.hidden;
      if (running) {
        prevTs = 0;
        raf = window.requestAnimationFrame(drawFrame);
      } else if (raf) {
        window.cancelAnimationFrame(raf);
      }
    }

    resize();
    raf = window.requestAnimationFrame(drawFrame);

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      running = false;
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [preset]);

  return (
    <div className={`pointer-events-none absolute inset-x-0 top-0 -z-10 overflow-hidden ${preset.wrapperHeightClass}`}>
      <canvas ref={canvasRef} className="h-full w-full opacity-[0.98]" aria-hidden />
    </div>
  );
}
