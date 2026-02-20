"use client"

import { motion, useScroll, useSpring } from "motion/react"
import { cn } from "@/lib/utils"

interface ScrollProgressProps {
  className?: string
}

export function ScrollProgress({ className }: ScrollProgressProps) {
  const { scrollYProgress } = useScroll()

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 origin-left bg-gradient-to-r from-primary via-primary/80 to-accent",
        className,
      )}
      style={{ scaleX }}
    />
  )
}
