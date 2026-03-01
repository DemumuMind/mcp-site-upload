export type Circle = {
  x: number
  y: number
  translateX: number
  translateY: number
  size: number
  alpha: number
  targetAlpha: number
  dx: number
  dy: number
  magnetism: number
}

export function hexToRgb(hex: string): number[] {
  let normalizedHex = hex.replace("#", "")

  if (normalizedHex.length === 3) {
    normalizedHex = normalizedHex
      .split("")
      .map(char => char + char)
      .join("")
  }

  const hexInt = parseInt(normalizedHex, 16)
  const red = (hexInt >> 16) & 255
  const green = (hexInt >> 8) & 255
  const blue = hexInt & 255
  return [red, green, blue]
}

export function remapValue(
  value: number,
  start1: number,
  end1: number,
  start2: number,
  end2: number
): number {
  const remapped =
    ((value - start1) * (end2 - start2)) / (end1 - start1) + start2
  return remapped > 0 ? remapped : 0
}

export function createCircle(
  width: number,
  height: number,
  size: number
): Circle {
  const x = Math.floor(Math.random() * width)
  const y = Math.floor(Math.random() * height)
  const pSize = Math.floor(Math.random() * 2) + size
  const targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1))
  const dx = (Math.random() - 0.5) * 0.1
  const dy = (Math.random() - 0.5) * 0.1
  const magnetism = 0.1 + Math.random() * 4

  return {
    x,
    y,
    translateX: 0,
    translateY: 0,
    size: pSize,
    alpha: 0,
    targetAlpha,
    dx,
    dy,
    magnetism,
  }
}

export function isOutsideCanvas(
  circle: Circle,
  width: number,
  height: number
): boolean {
  return (
    circle.x < -circle.size ||
    circle.x > width + circle.size ||
    circle.y < -circle.size ||
    circle.y > height + circle.size
  )
}

export function updateCircleAlpha(
  circle: Circle,
  width: number,
  height: number
): void {
  const edge = [
    circle.x + circle.translateX - circle.size,
    width - circle.x - circle.translateX - circle.size,
    circle.y + circle.translateY - circle.size,
    height - circle.y - circle.translateY - circle.size,
  ]
  const closestEdge = edge.reduce((a, b) => Math.min(a, b))
  const remapClosestEdge = parseFloat(remapValue(closestEdge, 0, 20, 0, 1).toFixed(2))

  if (remapClosestEdge > 1) {
    circle.alpha += 0.02
    if (circle.alpha > circle.targetAlpha) {
      circle.alpha = circle.targetAlpha
    }
    return
  }

  circle.alpha = circle.targetAlpha * remapClosestEdge
}
