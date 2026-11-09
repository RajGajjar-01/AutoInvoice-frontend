import { CloudSlash as CloudOff, WifiHigh as Wifi } from "@phosphor-icons/react"
import { onlineManager, useIsMutating } from "@tanstack/react-query"
import { useEffect, useRef, useState, useSyncExternalStore } from "react"

// React Query already pauses requests offline and resumes them on reconnect;
// this banner only tells the user that it is happening.
export function OfflineBanner() {
  const online = useSyncExternalStore(
    (cb) => onlineManager.subscribe(cb),
    () => onlineManager.isOnline(),
  )
  const queued = useIsMutating({ predicate: (m) => m.state.isPaused })
  const [showBack, setShowBack] = useState(false)
  const wasOffline = useRef(false)

  useEffect(() => {
    if (!online) {
      wasOffline.current = true
      return
    }
    if (!wasOffline.current) return
    wasOffline.current = false
    setShowBack(true)
    const t = window.setTimeout(() => setShowBack(false), 2500)
    return () => window.clearTimeout(t)
  }, [online])

  if (online && !showBack) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 flex justify-center px-4 md:bottom-4"
    >
      <div
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-lg animate-in ${
          online ? "bg-emerald-600 text-white" : "bg-foreground text-background"
        }`}
      >
        {online ? (
          <>
            <Wifi className="size-4" aria-hidden="true" /> Back online
          </>
        ) : (
          <>
            <CloudOff className="size-4" aria-hidden="true" />
            You're offline
            {queued > 0 &&
              ` · ${queued} change${queued === 1 ? "" : "s"} will send when you reconnect`}
          </>
        )}
      </div>
    </div>
  )
}
