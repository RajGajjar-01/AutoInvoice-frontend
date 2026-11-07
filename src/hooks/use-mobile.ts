import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

const PHONE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

// Reads the media query synchronously so phones never flash the desktop layout first.
export function usePhoneLayout() {
  return React.useSyncExternalStore(
    (notify) => {
      const mql = window.matchMedia(PHONE_QUERY)
      mql.addEventListener("change", notify)
      return () => mql.removeEventListener("change", notify)
    },
    () => window.matchMedia(PHONE_QUERY).matches,
    () => false,
  )
}
