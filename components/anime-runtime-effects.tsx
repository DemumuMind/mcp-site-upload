"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import anime from "animejs/lib/anime.es.js";

export function AnimeRuntimeEffects() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-anime='reveal'], .anime-intro"));
    if (revealTargets.length === 0) return;

    for (const node of revealTargets) {
      node.style.opacity = "0";
      node.style.transform = "translateY(24px) scale(0.96)";
      node.style.willChange = "opacity, transform";
    }

    const observer = new IntersectionObserver(
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

          observer.unobserve(el);
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" },
    );

    for (const node of revealTargets) observer.observe(node);
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
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
  }, [pathname]);

  useEffect(() => {
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
  }, [pathname]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const pulseTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-anime='pulse']"));
    const driftTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-anime='grid-drift']"));
    const panTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-anime='pan']"));
    const shimmerTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-anime='shimmer']"));
    const floatTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-anime='float']"));

    const loops = [
      ...pulseTargets.map((el) => anime({ targets: el, opacity: [0.62, 1, 0.62], duration: 1400, easing: "easeInOutQuad", loop: true })),
      ...driftTargets.map((el) => anime({ targets: el, backgroundPosition: ["0px 0px, 0px 0px", "0px 54px, 54px 0px"], duration: 6800, easing: "linear", loop: true })),
      ...panTargets.map((el) => anime({ targets: el, translateX: [-40, 40, -40], opacity: [0.15, 0.68, 0.15], duration: 4200, easing: "easeInOutSine", loop: true })),
      ...shimmerTargets.map((el) => {
        el.style.backgroundImage = "linear-gradient(110deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.34) 50%, rgba(255,255,255,0) 70%)";
        el.style.backgroundSize = "220% 100%";
        return anime({ targets: el, backgroundPosition: ["-220% 0", "220% 0"], duration: 1300, easing: "linear", loop: true });
      }),
      ...floatTargets.map((el) => anime({ targets: el, translateY: [0, -18, 0], duration: 2200, easing: "easeInOutSine", loop: true })),
    ];

    return () => loops.forEach((instance) => instance.pause());
  }, [pathname]);

  return null;
}
