"use client"

import React, { ReactNode, useEffect, useRef } from "react"

export interface CoolParticleOptions {
  particle?: string
  size?: number
  particleCount?: number
  speedHorz?: number
  speedUp?: number
}

interface CoolParticle {
  element: HTMLElement
  left: number
  size: number
  top: number
  direction: number
  speedHorz: number
  speedUp: number
  spinSpeed: number
  spinVal: number
}

const getContainer = () => {
  const id = "_coolMode_effect"
  const existingContainer = document.getElementById(id)
  if (existingContainer) return existingContainer

  const container = document.createElement("div")
  container.setAttribute("id", id)
  container.setAttribute(
    "style",
    "overflow:hidden; position:fixed; height:100%; top:0; left:0; right:0; bottom:0; pointer-events:none; z-index:2147483647"
  )
  document.body.appendChild(container)
  return container
}

export const CoolMode: React.FC<{ children: ReactNode; options?: CoolParticleOptions }> = ({ children, options }) => {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current
    const container = getContainer()
    const particles: CoolParticle[] = []
    let autoAddParticle = false
    let mouseX = 0
    let mouseY = 0

    function generateParticle() {
      const size = options?.size || [15, 20, 25, 35][Math.floor(Math.random() * 4)]
      const speedHorz = options?.speedHorz || Math.random() * 10
      const speedUp = options?.speedUp || Math.random() * 25
      const spinVal = Math.random() * 360
      const spinSpeed = Math.random() * 35 * (Math.random() <= 0.5 ? -1 : 1)
      const top = mouseY - size / 2
      const left = mouseX - size / 2
      const direction = Math.random() <= 0.5 ? -1 : 1

      const particle = document.createElement("div")
      const svgNS = "http://www.w3.org/2000/svg"
      const circleSVG = document.createElementNS(svgNS, "svg")
      const circle = document.createElementNS(svgNS, "circle")
      circle.setAttributeNS(null, "cx", (size / 2).toString())
      circle.setAttributeNS(null, "cy", (size / 2).toString())
      circle.setAttributeNS(null, "r", (size / 2).toString())
      circle.setAttributeNS(null, "fill", `hsl(${38 + Math.random() * 20}, 90%, 60%)`) // Amber shades

      circleSVG.appendChild(circle)
      circleSVG.setAttribute("width", size.toString())
      circleSVG.setAttribute("height", size.toString())
      particle.appendChild(circleSVG)

      particle.style.position = "absolute"
      particle.style.transform = `translate3d(${left}px, ${top}px, 0px) rotate(${spinVal}deg)`
      container.appendChild(particle)

      particles.push({
        element: particle,
        left,
        size,
        top,
        direction,
        speedHorz,
        speedUp,
        spinSpeed,
        spinVal,
      })
    }

    function loop() {
      if (autoAddParticle && particles.length < 45) generateParticle()

      particles.forEach((p, i) => {
        p.left = p.left - p.speedHorz * p.direction
        p.top = p.top - p.speedUp
        p.speedUp = Math.min(p.size, p.speedUp - 1)
        p.spinVal = p.spinVal + p.spinSpeed

        if (p.top >= window.innerHeight + p.size) {
          p.element.remove()
          particles.splice(i, 1)
        } else {
          p.element.style.transform = `translate3d(${p.left}px, ${p.top}px, 0px) rotate(${p.spinVal}deg)`
        }
      })
      requestAnimationFrame(loop)
    }

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if ("touches" in e) {
        mouseX = e.touches[0].clientX
        mouseY = e.touches[0].clientY
      } else {
        mouseX = e.clientX
        mouseY = e.clientY
      }
    }

    const handleDown = (e: MouseEvent | TouchEvent) => {
      handleMove(e)
      autoAddParticle = true
    }

    const handleUp = () => autoAddParticle = false

    element.addEventListener("mousemove", handleMove)
    element.addEventListener("mousedown", handleDown)
    element.addEventListener("mouseup", handleUp)
    element.addEventListener("mouseleave", handleUp)

    const animationId = requestAnimationFrame(loop)

    return () => {
      element.removeEventListener("mousemove", handleMove)
      element.removeEventListener("mousedown", handleDown)
      element.removeEventListener("mouseup", handleUp)
      element.removeEventListener("mouseleave", handleUp)
      cancelAnimationFrame(animationId)
    }
  }, [options])

  return <span ref={ref} className="inline-block">{children}</span>
}
