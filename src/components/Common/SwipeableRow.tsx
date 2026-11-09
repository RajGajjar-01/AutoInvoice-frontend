import type { Icon as LucideIcon } from "@phosphor-icons/react"
import { type ReactNode, useEffect, useRef, useState } from "react"
import { haptic } from "@/lib/haptics"
import { cn } from "@/lib/utils"

export interface SwipeAction {
  label: string
  icon: LucideIcon
  className: string
  onAction: () => void
}

const ACTION_WIDTH = 76
const FULL_SWIPE = 0.55 // share of the row width that runs the first action

interface SwipeableRowProps {
  /** Shown when the row moves right. The first one runs on a full swipe. */
  startActions?: SwipeAction[]
  /** Shown when the row moves left. The first one runs on a full swipe. */
  endActions?: SwipeAction[]
  children: ReactNode
  className?: string
}

/**
 * Touch-only swipe to reveal row actions. Mouse and keyboard users keep the
 * row's own menu, so every action here must also be in that menu.
 */
export function SwipeableRow({
  startActions = [],
  endActions = [],
  children,
  className,
}: SwipeableRowProps) {
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number; base: number; axis?: "x" | "y" }>(
    null,
  )
  const swiped = useRef(false)
  const armed = useRef(false)
  const [dx, setDx] = useState(0)
  const [dragging, setDragging] = useState(false)

  // Any tap outside closes an open row.
  useEffect(() => {
    if (dx === 0 || dragging) return
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setDx(0)
    }
    document.addEventListener("pointerdown", close)
    return () => document.removeEventListener("pointerdown", close)
  }, [dx, dragging])

  const width = () => ref.current?.offsetWidth ?? 360

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "touch") return
    drag.current = { x: e.clientX, y: e.clientY, base: dx }
    swiped.current = false
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    const mx = e.clientX - d.x
    const my = e.clientY - d.y
    if (!d.axis) {
      if (Math.abs(mx) < 8 && Math.abs(my) < 8) return
      d.axis = Math.abs(mx) > Math.abs(my) ? "x" : "y"
      if (d.axis === "x") {
        ref.current?.setPointerCapture(e.pointerId)
        setDragging(true)
      }
    }
    if (d.axis !== "x") return
    swiped.current = true
    let next = d.base + mx
    if (next > 0 && !startActions.length) next = 0
    if (next < 0 && !endActions.length) next = 0
    const full = Math.abs(next) > width() * FULL_SWIPE
    if (full !== armed.current) {
      armed.current = full
      if (full) haptic("light")
    }
    setDx(next)
  }

  const onPointerUp = () => {
    const d = drag.current
    drag.current = null
    setDragging(false)
    if (d?.axis !== "x") return
    armed.current = false
    const actions = dx > 0 ? startActions : endActions
    const open = actions.length * ACTION_WIDTH
    if (Math.abs(dx) > width() * FULL_SWIPE) {
      setDx(0)
      actions[0]?.onAction()
    } else {
      setDx(Math.abs(dx) > open / 2 ? Math.sign(dx) * open : 0)
    }
  }

  const run = (a: SwipeAction) => {
    setDx(0)
    a.onAction()
  }

  const renderActions = (actions: SwipeAction[], side: "start" | "end") => (
    <div
      className={cn(
        "absolute inset-y-0 flex",
        side === "start" ? "left-0" : "right-0 flex-row-reverse",
      )}
      aria-hidden={dx === 0}
    >
      {actions.map((a) => (
        <button
          key={a.label}
          type="button"
          tabIndex={-1}
          onClick={() => run(a)}
          className={cn(
            "flex flex-col items-center justify-center gap-1 text-xs font-semibold text-white",
            a.className,
          )}
          style={{ width: ACTION_WIDTH }}
        >
          <a.icon className="size-5" aria-hidden="true" />
          {a.label}
        </button>
      ))}
    </div>
  )

  return (
    <div
      ref={ref}
      className={cn("relative touch-pan-y overflow-hidden", className)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClickCapture={(e) => {
        // A swipe ends with a click on the row; do not follow its link.
        if (swiped.current) {
          e.preventDefault()
          e.stopPropagation()
          swiped.current = false
        }
      }}
    >
      {dx > 0 && renderActions(startActions, "start")}
      {dx < 0 && renderActions(endActions, "end")}
      <div
        className={cn(
          "relative bg-card",
          !dragging &&
            "transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
        )}
        style={{ transform: `translateX(${dx}px)` }}
      >
        {children}
      </div>
    </div>
  )
}
