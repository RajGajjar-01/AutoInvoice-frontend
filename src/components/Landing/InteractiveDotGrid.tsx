import { useEffect, useRef } from "react"

const SPACING = 28
const BASE_RADIUS = 0.75
const MAX_RADIUS = 2.5
const INFLUENCE_RADIUS = 160
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.trim().replace("#", "")
  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0] + cleaned[0], 16)
    const g = parseInt(cleaned[1] + cleaned[1], 16)
    const b = parseInt(cleaned[2] + cleaned[2], 16)
    return { r, g, b }
  }
  if (cleaned.length === 6) {
    const r = parseInt(cleaned.substring(0, 2), 16)
    const g = parseInt(cleaned.substring(2, 4), 16)
    const b = parseInt(cleaned.substring(4, 6), 16)
    return { r, g, b }
  }
  return null
}

export function InteractiveDotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    const ctx = canvas?.getContext("2d")
    if (!canvas || !parent || !ctx) return

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches

    let width = 0
    let height = 0
    let mouseX = Number.NEGATIVE_INFINITY
    let mouseY = Number.NEGATIVE_INFINITY
    let rafId = 0

    const draw = () => {
      rafId = 0
      const isDark = document.documentElement.classList.contains("dark")
      const baseAlpha = isDark ? 0.13 : 0.09

      let primaryColor = "37, 99, 235"
      try {
        const primaryHex =
          getComputedStyle(canvas).getPropertyValue("--primary") || "#2563eb"
        const rgb = hexToRgb(primaryHex)
        if (rgb) {
          primaryColor = `${rgb.r}, ${rgb.g}, ${rgb.b}`
        }
      } catch (_e) {
        // Fallback to default primary
      }

      ctx.clearRect(0, 0, width, height)

      for (let y = SPACING / 2; y < height; y += SPACING) {
        for (let x = SPACING / 2; x < width; x += SPACING) {
          const dist = Math.hypot(x - mouseX, y - mouseY)
          const proximity = Math.max(0, 1 - dist / INFLUENCE_RADIUS)
          const radius = BASE_RADIUS + (MAX_RADIUS - BASE_RADIUS) * proximity
          const alpha = baseAlpha + (0.5 - baseAlpha) * proximity

          ctx.beginPath()
          ctx.arc(x, y, radius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${primaryColor}, ${alpha})`
          ctx.fill()
        }
      }
    }

    const scheduleDraw = () => {
      if (rafId) return
      rafId = requestAnimationFrame(draw)
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = parent.clientWidth
      height = parent.clientHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      draw()
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
      if (!prefersReducedMotion) scheduleDraw()
    }

    const handleMouseLeave = () => {
      mouseX = Number.NEGATIVE_INFINITY
      mouseY = Number.NEGATIVE_INFINITY
      if (!prefersReducedMotion) scheduleDraw()
    }

    resize()
    window.addEventListener("resize", resize)
    parent.addEventListener("mousemove", handleMouseMove)
    parent.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      window.removeEventListener("resize", resize)
      parent.removeEventListener("mousemove", handleMouseMove)
      parent.removeEventListener("mouseleave", handleMouseLeave)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 -z-10"
    />
  )
}
