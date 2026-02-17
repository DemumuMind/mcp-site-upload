"use client";

import { useEffect, useRef } from "react";

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
};

type Ribbon = {
  baseY: number;
  amplitude: number;
  speed: number;
  phase: number;
  thickness: number;
  alpha: number;
};

export function HomeCinematicBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const element = canvas;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    const context = ctx;

    const sparks: Spark[] = [];
    const ribbons: Ribbon[] = [];

    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let running = true;
    let prevTs = 0;
    let elapsed = 0;

    const targetFps = 45;
    const frameStep = 1000 / targetFps;

    function resetScene() {
      sparks.length = 0;
      ribbons.length = 0;

      const sparkCount = Math.max(70, Math.floor(width / 14));
      for (let i = 0; i < sparkCount; i += 1) {
        sparks.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.28,
          vy: -0.12 - Math.random() * 0.34,
          r: 0.7 + Math.random() * 2.8,
          alpha: 0.14 + Math.random() * 0.4,
        });
      }

      for (let i = 0; i < 4; i += 1) {
        ribbons.push({
          baseY: height * (0.22 + i * 0.15),
          amplitude: 18 + i * 8,
          speed: 0.28 + i * 0.06,
          phase: Math.random() * Math.PI * 2,
          thickness: 1.2 + i * 0.4,
          alpha: 0.08 + i * 0.02,
        });
      }
    }

    function resize() {
      const rect = element.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 1.6);

      element.width = Math.max(1, Math.floor(width * dpr));
      element.height = Math.max(1, Math.floor(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      resetScene();
    }

    function drawBackdrop(timeSec: number) {
      const grad = context.createRadialGradient(width * 0.5, height * 0.22, 40, width * 0.5, height * 0.22, width * 0.65);
      grad.addColorStop(0, "rgba(247,201,72,0.26)");
      grad.addColorStop(0.5, "rgba(247,201,72,0.08)");
      grad.addColorStop(1, "rgba(247,201,72,0)");
      context.fillStyle = grad;
      context.fillRect(0, 0, width, height);

      const beamX = ((timeSec * 170) % (width + 520)) - 260;
      const beam = context.createLinearGradient(beamX - 200, 0, beamX + 200, 0);
      beam.addColorStop(0, "rgba(247,201,72,0)");
      beam.addColorStop(0.48, "rgba(247,201,72,0.14)");
      beam.addColorStop(0.52, "rgba(255,230,150,0.2)");
      beam.addColorStop(1, "rgba(247,201,72,0)");
      context.fillStyle = beam;
      context.fillRect(0, 0, width, height);
    }

    function drawRibbons(timeSec: number) {
      for (const ribbon of ribbons) {
        context.beginPath();
        for (let x = 0; x <= width; x += 10) {
          const wave = Math.sin(x * 0.008 + timeSec * ribbon.speed + ribbon.phase) * ribbon.amplitude;
          const y = ribbon.baseY + wave;
          if (x === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }

        context.strokeStyle = `rgba(247,201,72,${ribbon.alpha})`;
        context.lineWidth = ribbon.thickness;
        context.shadowBlur = 14;
        context.shadowColor = "rgba(247,201,72,0.2)";
        context.stroke();
      }

      context.shadowBlur = 0;
    }

    function drawSparks() {
      for (const spark of sparks) {
        spark.x += spark.vx;
        spark.y += spark.vy;

        if (spark.y < -12) {
          spark.y = height + 8;
          spark.x = Math.random() * width;
        }
        if (spark.x < -12) spark.x = width + 12;
        if (spark.x > width + 12) spark.x = -12;

        context.beginPath();
        context.fillStyle = `rgba(247,201,72,${spark.alpha})`;
        context.arc(spark.x, spark.y, spark.r, 0, Math.PI * 2);
        context.fill();
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

      context.clearRect(0, 0, width, height);
      drawBackdrop(timeSec);

      context.globalCompositeOperation = "screen";
      drawRibbons(timeSec);
      drawSparks();
      context.globalCompositeOperation = "source-over";

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
  }, []);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[980px] overflow-hidden">
      <canvas ref={canvasRef} className="h-full w-full opacity-[0.96] mix-blend-screen" aria-hidden />
    </div>
  );
}
