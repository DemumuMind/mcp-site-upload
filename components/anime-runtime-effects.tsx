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
      node.style.transform = "translateY(16px)";
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
            translateY: [16, 0],
            delay,
            duration: 620,
            easing: "easeOutExpo",
          });

          observer.unobserve(el);
        }
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
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
          translateY: -6,
          scale: 1.008,
          duration: 280,
          easing: "easeOutQuad",
        });
      };

      const onLeave = () => {
        anime.remove(card);
        anime({
          targets: card,
          translateY: 0,
          scale: 1,
          duration: 260,
          easing: "easeOutQuad",
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
      opacity: [0.76, 1],
      translateY: [10, 0],
      duration: 320,
      easing: "easeOutExpo",
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
      ...pulseTargets.map((el) =>
        anime({ targets: el, opacity: [0.82, 1, 0.82], duration: 3200, easing: "easeInOutSine", loop: true }),
      ),
      ...driftTargets.map((el) =>
        anime({ targets: el, backgroundPosition: ["0px 0px, 0px 0px", "0px 34px, 34px 0px"], duration: 20000, easing: "linear", loop: true }),
      ),
      ...panTargets.map((el) =>
        anime({ targets: el, translateX: [-8, 10, -8], opacity: [0.3, 0.5, 0.3], duration: 11000, easing: "easeInOutSine", loop: true }),
      ),
      ...shimmerTargets.map((el) => {
        el.style.backgroundImage = "linear-gradient(110deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0) 65%)";
        el.style.backgroundSize = "220% 100%";
        return anime({ targets: el, backgroundPosition: ["-220% 0", "220% 0"], duration: 4800, easing: "linear", loop: true });
      }),
      ...floatTargets.map((el) =>
        anime({ targets: el, translateY: [0, -6, 0], duration: 8400, easing: "easeInOutSine", loop: true }),
      ),
    ];

    return () => loops.forEach((instance) => instance.pause());
  }, [pathname]);

  return null;
}
