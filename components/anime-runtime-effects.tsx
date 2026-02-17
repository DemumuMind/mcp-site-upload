"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import anime from "animejs/lib/anime.es.js";
import { getAmbientMotionPreset, getHeroMotionPreset } from "@/lib/motion/presets";

export function AnimeRuntimeEffects() {
  const pathname = usePathname();
  const [animationsReady, setAnimationsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const markReady = () => setAnimationsReady(true);

    if (document.readyState === "complete") {
      const timeoutId = window.setTimeout(markReady, 120);
      return () => window.clearTimeout(timeoutId);
    }

    window.addEventListener("load", markReady, { once: true });
    return () => window.removeEventListener("load", markReady);
  }, []);

  useEffect(() => {
    if (!animationsReady) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    let observer: IntersectionObserver | null = null;

    const rafA = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (cancelled) return;

        const revealTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-anime='reveal'], .anime-intro"));
        if (revealTargets.length === 0) return;

        observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              const el = entry.target as HTMLElement;
              const delay = Number(el.dataset.animeDelay || 0);

              anime.remove(el);
              anime({
                targets: el,
                opacity: [0, 1],
                translateY: [24, 0],
                scale: [0.96, 1],
                delay,
                duration: 500,
                easing: "easeOutQuart",
              });

              observer?.unobserve(el);
            }
          },
          { threshold: 0.14, rootMargin: "0px 0px -6% 0px" },
        );

        for (const node of revealTargets) observer.observe(node);
      });
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafA);
      observer?.disconnect();
    };
  }, [pathname, animationsReady]);

  useEffect(() => {
    if (!animationsReady) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (pathname !== "/") return;
    const heroMotion = getHeroMotionPreset();

    let cancelled = false;
    let timeline: anime.AnimeTimelineInstance | null = null;
    let hoverAnimation: anime.AnimeInstance | null = null;
    let cleanupCta = () => {};
    let cleanupParallax = () => {};
    let cleanupParallaxRaf = () => {};

    const rafA = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (cancelled) return;

        const nav = document.querySelector<HTMLElement>("[data-anime='home-nav']");
        const navItems = Array.from(document.querySelectorAll<HTMLElement>("[data-anime='home-nav-item']"));
        const eyebrow = document.querySelector<HTMLElement>("[data-anime='hero-eyebrow']");
        const subtitle = document.querySelector<HTMLElement>("[data-anime='hero-subtitle']");
        const actions = document.querySelector<HTMLElement>("[data-anime='hero-actions']");
        const cta = document.querySelector<HTMLElement>("[data-anime='hero-cta-primary']");
        const heroChars = Array.from(document.querySelectorAll<HTMLElement>("[data-anime='hero-char']"));
        const drawPath = document.querySelector<SVGPathElement>("[data-anime='hero-svg-draw']");
        const morphPath = document.querySelector<SVGPathElement>("[data-anime='hero-svg-morph']");

        if (!nav || !eyebrow || !subtitle || !actions || !cta || heroChars.length === 0) return;

        if (drawPath) {
          const length = drawPath.getTotalLength();
          drawPath.style.strokeDasharray = String(length);
          drawPath.style.strokeDashoffset = String(length);
          drawPath.style.opacity = "0";
        }

        if (morphPath) {
          const length = morphPath.getTotalLength();
          morphPath.style.strokeDasharray = String(length);
          morphPath.style.strokeDashoffset = String(length);
          morphPath.style.opacity = "0";
        }

        timeline = anime
          .timeline({
            autoplay: true,
            begin: () => {
              document.body.dataset.homeHeroMotion = "start";
            },
            update: (anim) => {
              if (anim.progress > 65) document.body.dataset.homeHeroMotion = "mid";
            },
            complete: () => {
              document.body.dataset.homeHeroMotion = "done";
            },
          })
          .add({
            targets: nav,
            opacity: [0.28, 1],
            translateY: [-14, 0],
            duration: 520,
            easing: "easeOutExpo",
          })
          .add(
            {
              targets: navItems,
              opacity: [0, 1],
              translateY: [-8, 0],
              delay: anime.stagger(heroMotion.navStagger, { start: 40 }),
              duration: heroMotion.navDuration + 80,
              easing: "cubicBezier(.22,.61,.36,1)",
            },
            "-=360",
          )
          .add(
            {
              targets: [eyebrow, subtitle, actions],
              opacity: [0, 1],
              translateY: [14, 0],
              scale: [0.98, 1],
              delay: anime.stagger(heroMotion.contentStagger, { start: 20 }),
              duration: heroMotion.contentDuration + 60,
              easing: "cubicBezier(.22,.61,.36,1)",
            },
            "-=260",
          )
          .add(
            {
              targets: heroChars,
              opacity: [0, 1],
              translateY: [24, 0],
              scale: [0.95, 1],
              rotate: [0.8, 0],
              delay: anime.stagger(heroMotion.charStagger, { start: 70 }),
              duration: heroMotion.charDuration + 80,
              easing: "easeOutElastic(1, .5)",
            },
            "-=420",
          );

        if (drawPath) {
          timeline.add(
            {
              targets: drawPath,
              opacity: [0, 1],
              strokeDashoffset: [anime.setDashoffset, 0],
              duration: 560,
              easing: "easeOutExpo",
            },
            "-=510",
          );
        }

        if (morphPath) {
          const morphTo = morphPath.dataset.morphTo;
          timeline.add(
            {
              targets: morphPath,
              opacity: [0, 1],
              strokeDashoffset: [anime.setDashoffset, 0],
              duration: 500,
              easing: "easeOutExpo",
            },
            "-=480",
          );

          if (morphTo) {
            timeline.add(
              {
                targets: morphPath,
                d: [{ value: morphTo }],
                duration: 760,
                direction: "alternate",
                loop: 1,
                easing: "cubicBezier(.22,.61,.36,1)",
              },
              "-=120",
            );
          }
        }

        const onHover = () => {
          timeline?.pause();
          hoverAnimation?.pause();
          hoverAnimation = anime({
            targets: cta,
            scale: [1, 1.08, 1.03],
            rotateZ: [0, -1, 0],
            duration: 420,
            easing: "easeOutElastic(1, .5)",
            complete: () => {
              if (timeline && timeline.progress < 100) timeline.play();
            },
          });
        };

        const onLeave = () => {
          hoverAnimation?.pause();
          anime({
            targets: cta,
            scale: 1,
            rotateZ: 0,
            duration: 320,
            easing: "cubicBezier(.22,.61,.36,1)",
          });
        };

        const onClick = () => {
          const burstTargets = [drawPath, morphPath].filter(Boolean);
          anime({
            targets: [cta, ...burstTargets],
            scale: [1, 1.065, 1],
            opacity: [1, 0.78, 1],
            duration: 520,
            easing: "easeOutElastic(1, .5)",
          });

          anime({
            targets: burstTargets,
            translateY: [0, -10, 0],
            duration: 520,
            easing: "cubicBezier(.22,.61,.36,1)",
          });
        };

        cta.addEventListener("mouseenter", onHover);
        cta.addEventListener("mouseleave", onLeave);
        cta.addEventListener("click", onClick);

        cleanupCta = () => {
          cta.removeEventListener("mouseenter", onHover);
          cta.removeEventListener("mouseleave", onLeave);
          cta.removeEventListener("click", onClick);
        };

        const parallaxTargets = [drawPath, morphPath, cta].filter(Boolean) as Element[];
        let targetX = 0;
        let targetY = 0;
        let currentX = 0;
        let currentY = 0;
        let rafId = 0;
        let canParallax = true;
        let perfRafId = 0;
        let perfFrames = 0;
        let perfStart = 0;

        const renderParallax = () => {
          if (!canParallax) {
            rafId = 0;
            return;
          }

          currentX += (targetX - currentX) * 0.16;
          currentY += (targetY - currentY) * 0.16;

          anime.set(parallaxTargets, {
            translateX: (_target: unknown, index: number) =>
              currentX * (index === 2 ? heroMotion.parallaxCtaX * 0.45 : heroMotion.parallaxPath * 0.35),
            translateY: (_target: unknown, index: number) =>
              currentY * (index === 2 ? heroMotion.parallaxCtaY * 0.4 : Math.round(heroMotion.parallaxPath * 0.26)),
          });

          if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
            rafId = window.requestAnimationFrame(renderParallax);
          } else {
            rafId = 0;
          }
        };

        const startPerfWatchdog = () => {
          const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
          const lowCoreCount = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4;
          const lowDeviceMemory =
            "deviceMemory" in navigator &&
            typeof (navigator as Navigator & { deviceMemory?: number }).deviceMemory === "number" &&
            ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 0) <= 4;

          if (coarsePointer || lowCoreCount || lowDeviceMemory) {
            canParallax = false;
            return;
          }

          const tick = (ts: number) => {
            if (!perfStart) perfStart = ts;
            perfFrames += 1;
            const elapsed = ts - perfStart;

            if (elapsed >= 1200) {
              const fps = (perfFrames * 1000) / elapsed;
              if (fps < 45) {
                canParallax = false;
                anime.set(parallaxTargets, { translateX: 0, translateY: 0 });
                if (rafId) {
                  window.cancelAnimationFrame(rafId);
                  rafId = 0;
                }
                return;
              }

              perfStart = ts;
              perfFrames = 0;
            }

            perfRafId = window.requestAnimationFrame(tick);
          };

          perfRafId = window.requestAnimationFrame(tick);
        };

        const onMove = (event: MouseEvent) => {
          if (!canParallax) return;
          targetX = (event.clientX / window.innerWidth - 0.5) * 2;
          targetY = (event.clientY / window.innerHeight - 0.5) * 2;
          if (!rafId) rafId = window.requestAnimationFrame(renderParallax);
        };

        startPerfWatchdog();
        window.addEventListener("mousemove", onMove, { passive: true });
        cleanupParallax = () => window.removeEventListener("mousemove", onMove);
        cleanupParallaxRaf = () => {
          if (rafId) window.cancelAnimationFrame(rafId);
          if (perfRafId) window.cancelAnimationFrame(perfRafId);
          rafId = 0;
          perfRafId = 0;
        };
      });
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafA);
      cleanupCta();
      cleanupParallax();
      cleanupParallaxRaf();
      timeline?.pause();
      hoverAnimation?.pause();
    };
  }, [pathname, animationsReady]);

  useEffect(() => {
    if (!animationsReady) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-anime-hover='card']"));
    const cleanups: Array<() => void> = [];

    for (const card of cards) {
      const onEnter = () => {
        anime.remove(card);
        anime({
          targets: card,
          translateY: -14,
          scale: 1.022,
          rotateZ: 0.35,
          duration: 220,
          easing: "easeOutExpo",
        });
      };

      const onLeave = () => {
        anime.remove(card);
        anime({
          targets: card,
          translateY: 0,
          scale: 1,
          rotateZ: 0,
          duration: 220,
          easing: "easeOutExpo",
        });
      };

      card.addEventListener("mouseenter", onEnter);
      card.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        card.removeEventListener("mouseenter", onEnter);
        card.removeEventListener("mouseleave", onLeave);
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, [pathname, animationsReady]);

  useEffect(() => {
    if (!animationsReady) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const routeContainer = document.querySelector<HTMLElement>("[data-route-container='true']");
    if (!routeContainer) return;

    anime.remove(routeContainer);
    anime({
      targets: routeContainer,
      opacity: [0.52, 1],
      translateY: [30, 0],
      scale: [0.982, 1],
      duration: 260,
      easing: "easeOutQuart",
    });
  }, [pathname, animationsReady]);

  useEffect(() => {
    if (!animationsReady) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    let loops: anime.AnimeInstance[] = [];
    const ambientMotion = getAmbientMotionPreset();
    const disableHeroAmbientFlicker = pathname === "/";

    const rafA = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (cancelled) return;

        const pulseTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-anime='pulse']"));
        const driftTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-anime='grid-drift']"));
        const panTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-anime='pan']"));
        const shimmerTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-anime='shimmer']"));
        const floatTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-anime='float']"));

        loops = [
          ...pulseTargets.flatMap((el) => {
            anime.set(el, { opacity: 0.82, translateY: 0 });
            if (disableHeroAmbientFlicker) return [];
            return [
              anime({
                targets: el,
                translateY: [0, -6, 0],
                duration: ambientMotion.pulseDuration + 700,
                easing: "easeInOutSine",
                loop: true,
              }),
            ];
          }),
          ...driftTargets.flatMap((el) => {
            anime.set(el, { backgroundPosition: "0px 0px, 0px 0px" });
            if (disableHeroAmbientFlicker) return [];
            return [
              anime({
                targets: el,
                backgroundPosition: ["0px 0px, 0px 0px", "0px 54px, 54px 0px"],
                duration: ambientMotion.driftDuration,
                easing: "linear",
                loop: true,
              }),
            ];
          }),
          ...panTargets.flatMap((el) => {
            anime.set(el, { translateX: 0, opacity: 0.1 });
            if (disableHeroAmbientFlicker) return [];
            return [
              anime({
                targets: el,
                translateX: [-ambientMotion.panTranslateX, ambientMotion.panTranslateX, -ambientMotion.panTranslateX],
                opacity: [0.07, 0.18, 0.07],
                duration: ambientMotion.panDuration,
                easing: "easeInOutSine",
                loop: true,
              }),
            ];
          }),
          ...shimmerTargets.flatMap((el) => {
            anime.set(el, {
              backgroundImage: "linear-gradient(110deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.34) 50%, rgba(255,255,255,0) 70%)",
              backgroundSize: "220% 100%",
              backgroundPosition: "-220% 0",
              opacity: disableHeroAmbientFlicker ? 0 : 0.7,
            });
            if (disableHeroAmbientFlicker) return [];
            return [
              anime({
                targets: el,
                backgroundPosition: ["-220% 0", "220% 0"],
                duration: ambientMotion.shimmerDuration,
                easing: "linear",
                loop: true,
              }),
            ];
          }),
          ...floatTargets.map((el) =>
            anime({
              targets: el,
              translateY: [0, -ambientMotion.floatTranslateY, 0],
              duration: ambientMotion.floatDuration,
              easing: "easeInOutQuad",
              loop: true,
            }),
          ),
        ];
      });
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafA);
      loops.forEach((instance) => instance.pause());
    };
  }, [pathname, animationsReady]);

  return null;
}
