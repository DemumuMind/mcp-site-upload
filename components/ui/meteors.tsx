"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface MeteorsProps {
  number?: number
  minDelay?: number
  maxDelay?: number
  minDuration?: number
  maxDuration?: number
  angle?: number
  className?: string
}

function seededUnit(seed: number): number {
  const value = Math.sin(seed) * 10000
  return value - Math.floor(value)
}

export const Meteors = ({
  number = 20,
  minDelay = 0.2,
  maxDelay = 1.2,
  minDuration = 2,
  maxDuration = 10,
  angle = 215,
  className,
}: MeteorsProps) => {
  const width = typeof window === "undefined" ? 1200 : window.innerWidth
  const delayRange = Math.max(0.01, maxDelay - minDelay)
  const durationRange = Math.max(0.01, maxDuration - minDuration)

  return (
    <>
      {Array.from({ length: number }).map((_, idx) => {
        const leftSeed = seededUnit(idx + angle)
        const delaySeed = seededUnit(idx + number + minDelay)
        const durationSeed = seededUnit(idx + number + maxDuration)

        const style: React.CSSProperties & Record<"--angle", string> = {
          "--angle": `${-angle}deg`,
          top: "-5%",
          left: `calc(0% + ${Math.floor(leftSeed * width)}px)`,
          animationDelay: `${(delaySeed * delayRange + minDelay).toFixed(2)}s`,
          animationDuration: `${(durationSeed * durationRange + minDuration).toFixed(2)}s`,
        }

        return (
          <span
            key={`${idx}-${angle}`}
            style={style}
            className={cn(
              "animate-meteor pointer-events-none absolute size-0.5 rotate-[var(--angle)] rounded-full bg-zinc-500 shadow-[0_0_0_1px_#ffffff10]",
              className
            )}
          >
            <div className="pointer-events-none absolute top-1/2 -z-10 h-px w-[50px] -translate-y-1/2 bg-gradient-to-r from-zinc-500 to-transparent" />
          </span>
        )
      })}
    </>
  )
}
