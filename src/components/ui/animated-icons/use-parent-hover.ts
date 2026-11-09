import type { useAnimation } from "motion/react"
import { type RefObject, useEffect } from "react"

// Plays the icon when its whole link/button/menu row is hovered or clicked, not just the glyph.
export function useParentHover(
  ref: RefObject<HTMLElement | null>,
  controls: ReturnType<typeof useAnimation>,
) {
  useEffect(() => {
    const row = ref.current?.closest("a,button,[role=menuitem]")
    if (!row) return
    const play = () => controls.start("animate")
    const reset = () => controls.start("normal")
    row.addEventListener("mouseenter", play)
    row.addEventListener("click", play)
    row.addEventListener("mouseleave", reset)
    return () => {
      row.removeEventListener("mouseenter", play)
      row.removeEventListener("click", play)
      row.removeEventListener("mouseleave", reset)
    }
  }, [ref, controls])
}
