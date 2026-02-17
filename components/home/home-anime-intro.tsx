"use client";

import { useEffect } from "react";
import anime from "animejs/lib/anime.es.js";

export function HomeAnimeIntro() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    anime.set(".anime-intro", { opacity: 0, translateY: 22 });

    anime.timeline({ easing: "easeOutExpo", duration: 850 })
      .add({
        targets: ".anime-intro",
        opacity: [0, 1],
        translateY: [22, 0],
        delay: anime.stagger(90),
      })
      .add(
        {
          targets: ".anime-cta-primary",
          scale: [0.97, 1.015, 1],
          duration: 700,
          easing: "easeOutElastic(1, .6)",
        },
        "-=420",
      );
  }, []);

  return null;
}
