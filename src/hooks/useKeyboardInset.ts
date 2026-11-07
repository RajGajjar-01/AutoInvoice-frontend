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
