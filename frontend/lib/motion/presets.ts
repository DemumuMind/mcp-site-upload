export type MotionIntensity = "low" | "medium" | "hard";

export type HeroMotionPreset = {
  navStagger: number;
  contentStagger: number;
  charStagger: number;
  navDuration: number;
  contentDuration: number;
  charDuration: number;
  parallaxPath: number;
  parallaxCtaX: number;
  parallaxCtaY: number;
};

export type AmbientMotionPreset = {
  pulseDuration: number;
  driftDuration: number;
  panDuration: number;
  shimmerDuration: number;
  floatDuration: number;
  panTranslateX: number;
  floatTranslateY: number;
};

const heroMotionPresets: Record<MotionIntensity, HeroMotionPreset> = {
  low: { navStagger: 56, contentStagger: 110, charStagger: 28, navDuration: 520, contentDuration: 520, charDuration: 560, parallaxPath: 10, parallaxCtaX: 6, parallaxCtaY: 5 },
  medium: { navStagger: 42, contentStagger: 82, charStagger: 22, navDuration: 470, contentDuration: 500, charDuration: 500, parallaxPath: 16, parallaxCtaX: 8, parallaxCtaY: 7 },
  hard: { navStagger: 34, contentStagger: 70, charStagger: 18, navDuration: 420, contentDuration: 460, charDuration: 460, parallaxPath: 20, parallaxCtaX: 10, parallaxCtaY: 8 },
};

const ambientMotionPresets: Record<MotionIntensity, AmbientMotionPreset> = {
  low: { pulseDuration: 2600, driftDuration: 12000, panDuration: 7600, shimmerDuration: 1900, floatDuration: 3600, panTranslateX: 6, floatTranslateY: 6 },
  medium: { pulseDuration: 2200, driftDuration: 9800, panDuration: 6400, shimmerDuration: 1700, floatDuration: 3200, panTranslateX: 10, floatTranslateY: 8 },
  hard: { pulseDuration: 1800, driftDuration: 8200, panDuration: 5400, shimmerDuration: 1500, floatDuration: 2800, panTranslateX: 14, floatTranslateY: 10 },
};

export function getMotionIntensity(): MotionIntensity {
  const raw = process.env.NEXT_PUBLIC_HERO_MOTION_INTENSITY;
  if (raw === "epic") return "medium";
  if (raw === "low" || raw === "medium" || raw === "hard") return raw;
  return "medium";
}

export function getHeroMotionPreset(): HeroMotionPreset {
  return heroMotionPresets[getMotionIntensity()];
}

export function getAmbientMotionPreset(): AmbientMotionPreset {
  return ambientMotionPresets[getMotionIntensity()];
}
