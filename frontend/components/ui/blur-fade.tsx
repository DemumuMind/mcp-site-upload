"use client"

import { useMemo, useRef } from "react"
import { useInView } from "motion/react"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

type InViewMargin = NonNullable<Parameters<typeof useInView>[1]>["margin"]

interface BlurFadeProps {
  children: React.ReactNode
  className?: string
  variant?: unknown
  duration?: number
  delay?: number
  yOffset?: number
  inView?: boolean
  inViewMargin?: InViewMargin
  blur?: string
}

export function BlurFade({
  children,
  className,
  variant,
  duration = 0.4,
  delay = 0,
  yOffset = 6,
  inView = false,
  inViewMargin = "-50px",
  blur = "6px",
}: BlurFadeProps) {
  void variant
  const ref = useRef<HTMLDivElement | null>(null)
  const inViewDetected = useInView(ref, { once: true, margin: inViewMargin })
  const prefersReducedMotion = usePrefersReducedMotion()
  const isVisible = prefersReducedMotion || !inView || inViewDetected

  const style = useMemo<React.CSSProperties>(
    () => ({
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "translateY(0)" : `translateY(${yOffset}px)`,
      filter: isVisible ? "blur(0px)" : `blur(${blur})`,
      transitionProperty: "opacity, transform, filter",
      transitionDuration: prefersReducedMotion ? "0ms" : `${duration}s`,
      transitionTimingFunction: "var(--motion-ease-emphasis)",
      transitionDelay: `${0.04 + delay}s`,
      willChange: "opacity, transform, filter",
    }),
    [blur, delay, duration, isVisible, prefersReducedMotion, yOffset],
  )

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  )
}
