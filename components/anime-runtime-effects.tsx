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
            translateY: [28, 0],
            scale: [0.96, 1],
            delay,
            duration: 520,
            easing: "easeOutQuart",
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
          translateY: -12,
          scale: 1.02,
          rotateZ: 0.25,
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
      opacity: [0.58, 1],
      translateY: [24, 0],
      scale: [0.985, 1],
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
      ...pulseTargets.map((el) =>
        anime({ targets: el, opacity: [0.7, 1, 0.7], duration: 1800, easing: "easeInOutQuad", loop: true }),
      ),
      ...driftTargets.map((el) =>
        anime({ targets: el, backgroundPosition: ["0px 0px, 0px 0px", "0px 40px, 40px 0px"], duration: 9000, easing: "linear", loop: true }),
      ),
      ...panTargets.map((el) =>
        anime({ targets: el, translateX: [-28, 28, -28], opacity: [0.22, 0.62, 0.22], duration: 5200, easing: "easeInOutSine", loop: true }),
      ),
      ...shimmerTargets.map((el) => {
        el.style.backgroundImage = "linear-gradient(110deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0) 65%)";
        el.style.backgroundSize = "220% 100%";
        return anime({ targets: el, backgroundPosition: ["-220% 0", "220% 0"], duration: 1800, easing: "linear", loop: true });
      }),
      ...floatTargets.map((el) =>
        anime({ targets: el, translateY: [0, -16, 0], duration: 2600, easing: "easeInOutSine", loop: true }),
      ),
    ];

    return () => loops.forEach((instance) => instance.pause());
  }, [pathname]);

  return null;
}
