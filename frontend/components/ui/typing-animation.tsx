"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface TypingAnimationProps {
  text: string
  duration?: number
  className?: string
}

function TypingAnimationValue({ text, duration, className }: Required<TypingAnimationProps>) {
  const [displayedText, setDisplayedText] = useState("")
  const [i, setI] = useState(0)

  useEffect(() => {
    if (i >= text.length) {
      return
    }

    const typingEffect = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prevState) => prevState + text.charAt(i))
        setI(i + 1)
      }
    }, duration)

    return () => {
      clearInterval(typingEffect)
    }
  }, [duration, i, text])

  return <span className={cn("font-serif leading-tight font-semibold tracking-tight", className)}>{displayedText}</span>
}

export function TypingAnimation({ text, duration = 100, className }: TypingAnimationProps) {
  return <TypingAnimationValue key={text} text={text} duration={duration} className={className ?? ""} />
}
