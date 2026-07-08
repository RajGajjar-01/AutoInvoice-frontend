import type { Notification, TypeConfig } from "./types"
import type { GroupedItem } from "./types"
import { TYPE_CONFIG } from "./constants"

export function getType(t: string): TypeConfig {
  return TYPE_CONFIG[t] ?? TYPE_CONFIG.info
}

export function formatTimeAgo(iso: string | undefined): string {
  if (!iso) return ""
  const diff = Date.now() - new Date(iso).getTime()
  const secs = Math.floor(diff / 1000)
  if (secs < 60) return "just now"
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function formatDateLabel(iso: string | undefined): string {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function groupByDate(items: Notification[]): GroupedItem[] {
  const groups: GroupedItem[] = []
  const seen = new Map<string, number>()

  for (const notification of items) {
    const dateKey = notification.createdAt
      ? notification.createdAt.split("T")[0]
      : "unknown"

    if (!seen.has(dateKey)) {
      seen.set(dateKey, groups.length)
      groups.push({
        dateKey,
        label: formatDateLabel(`${dateKey}T00:00:00`),
        items: [],
      })
    }

    groups[seen.get(dateKey)!].items.push(notification)
  }

  return groups
}
