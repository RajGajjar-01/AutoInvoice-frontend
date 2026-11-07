import { useQueryClient } from "@tanstack/react-query"
import { RefreshCw } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { haptic } from "@/lib/haptics"

const TRIGGER = 64
const MAX = 96

/**
 * Pull down at the top of the page to refetch every query on screen.
 * The page's own native pull-to-reload is off (overscroll-behavior-y: none on body).
 */
export function PullToRefresh() {
  const queryClient = useQueryClient()
  const [pull, setPull] = useState(0)
  const [busy, setBusy] = useState(false)
  const start = useRef<{ x: number; y: number; active?: boolean }>(null)
  const pullRef = useRef(0)

  useEffect(() => {
    const set = (v: number) => {
      pullRef.current = v
      setPull(v)
    }
    const onStart = (e: TouchEvent) => {
      const open = document.querySelector('[role="dialog"], [role="menu"]')
      start.current =
        window.scrollY <= 0 && !busy && !open
          ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
          : null
    }
    const onMove = (e: TouchEvent) => {
      const s = start.current
      if (!s) return
      const dx = e.touches[0].clientX - s.x
      const dy = e.touches[0].clientY - s.y
      if (!s.active) {
        // Only a clear downward pull starts it; sideways goes to swipe rows.
        if (dy < 10 || Math.abs(dx) > dy) {
          if (Math.abs(dx) > 10 || dy < -10) start.current = null
          return
        }
        s.active = true
      }
      if (e.cancelable) e.preventDefault()
      const next = Math.min(MAX, Math.max(0, dy * 0.5))
      if (next >= TRIGGER && pullRef.current < TRIGGER) haptic("light")
      set(next)
    }
    const onEnd = async () => {
      const wasActive = start.current?.active
      start.current = null
      if (!wasActive) return
      if (pullRef.current < TRIGGER) return set(0)
      setBusy(true)
      set(TRIGGER)
      try {
        await queryClient.refetchQueries({ type: "active" })
      } finally {
        setBusy(false)
        set(0)
      }
    }
    window.addEventListener("touchstart", onStart, { passive: true })
    window.addEventListener("touchmove", onMove, { passive: false })
    window.addEventListener("touchend", onEnd)
    window.addEventListener("touchcancel", onEnd)
    return () => {
      window.removeEventListener("touchstart", onStart)
      window.removeEventListener("touchmove", onMove)
      window.removeEventListener("touchend", onEnd)
      window.removeEventListener("touchcancel", onEnd)
    }
  }, [busy, queryClient])

  if (pull === 0 && !busy) return null
  return (
    <div
      role="status"
      aria-label={busy ? "Refreshing" : "Pull to refresh"}
      className="pointer-events-none fixed inset-x-0 top-[calc(4.5rem+env(safe-area-inset-top))] z-40 flex justify-center md:hidden"
      style={{
        transform: `translateY(${pull - TRIGGER}px)`,
        opacity: Math.min(1, pull / TRIGGER),
      }}
    >
      <span className="grid size-10 place-items-center rounded-full border bg-card shadow-md">
        <RefreshCw
          className={`size-5 text-primary ${busy ? "animate-spin" : ""}`}
          style={busy ? undefined : { transform: `rotate(${pull * 4}deg)` }}
          aria-hidden="true"
        />
      </span>
    </div>
  )
}
