import { useSyncExternalStore } from "react"

const subscribe = (cb: () => void) => {
  const vv = window.visualViewport
  vv?.addEventListener("resize", cb)
  vv?.addEventListener("scroll", cb)
  return () => {
    vv?.removeEventListener("resize", cb)
    vv?.removeEventListener("scroll", cb)
  }
}

/**
 * Height in px that the on-screen keyboard covers at the bottom of the window.
 * iOS Safari overlays the keyboard without resizing the page; Android resizes it
 * (interactive-widget=resizes-content), so there this stays 0.
 */
export function useKeyboardInset() {
  return useSyncExternalStore(
    subscribe,
    () => {
      const vv = window.visualViewport
      return vv
        ? Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop))
        : 0
    },
    () => 0,
  )
}

/**
 * Marks the page while the on-screen keyboard is open: sets
 * `<html data-keyboard>` and `--keyboard-inset` (px the keyboard covers on iOS),
 * and keeps the focused field in view. Call once at startup.
 */
export function trackKeyboard() {
  const vv = window.visualViewport
  if (!vv) return
  const root = document.documentElement
  // Android resizes the page instead (inset stays 0): compare with the tallest
  // height seen at this width, which resets when the phone rotates.
  let width = 0
  let tallest = 0
  const update = () => {
    if (window.innerWidth !== width) {
      width = window.innerWidth
      tallest = 0
    }
    tallest = Math.max(tallest, window.innerHeight)
    const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
    const open = inset > 80 || window.innerHeight < tallest * 0.75
    root.style.setProperty("--keyboard-inset", `${Math.round(inset)}px`)
    if (open === root.hasAttribute("data-keyboard")) return
    root.toggleAttribute("data-keyboard", open)
    const el = document.activeElement
    if (open && el instanceof HTMLElement && el.matches("input, textarea"))
      requestAnimationFrame(() => el.scrollIntoView({ block: "center" }))
  }
  vv.addEventListener("resize", update)
  update()
}
