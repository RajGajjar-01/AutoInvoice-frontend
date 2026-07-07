import { useCallback, useEffect, useRef, useState } from "react"

function getStoredValue<T>(key: string, defaultValue: T): T {
  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() =>
    getStoredValue(key, defaultValue),
  )
  const isInternalUpdate = useRef(false)

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const newValue = value instanceof Function ? value(storedValue) : value

        // Set the flag to true so our own effect doesn't re-trigger a state update
        isInternalUpdate.current = true

        setStoredValue(newValue)
        window.localStorage.setItem(key, JSON.stringify(newValue))

        // Notify other instances in THIS tab
        window.dispatchEvent(
          new CustomEvent("local-storage-change", {
            detail: { key, value: newValue },
          }),
        )
      } catch (error) {
        console.error("Local Storage Error:", error)
      }
    },
    [key, storedValue],
  )

  useEffect(() => {
    // Sync with other instances/tabs
    const handler = (e: CustomEvent<{ key: string; value: T }>) => {
      // Check if it's the right key
      if (e.detail?.key !== key) return

      // If this event was triggered by our own setValue, skip it
      if (isInternalUpdate.current) {
        isInternalUpdate.current = false
        return
      }

      // Otherwise, update state from the event detail (avoiding another localStorage read)
      if (e.detail && "value" in e.detail) {
        setStoredValue(e.detail.value)
      } else {
        // Fallback for native storage events from other tabs
        setStoredValue(getStoredValue(key, defaultValue))
      }
    }

    // Custom event for same-tab sync
    window.addEventListener("local-storage-change", handler as EventListener)
    // Native event for other-tab sync
    window.addEventListener("storage", (e: StorageEvent) => {
      if (e.key === key) {
        setStoredValue(getStoredValue(key, defaultValue))
      }
    })

    return () => {
      window.removeEventListener(
        "local-storage-change",
        handler as EventListener,
      )
      window.removeEventListener("storage", handler as EventListener)
    }
  }, [key, defaultValue])

  return [storedValue, setValue]
}

export default useLocalStorage
