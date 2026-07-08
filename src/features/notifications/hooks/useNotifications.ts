import { useCallback, useMemo, useState } from "react"
import { useShallow } from "zustand/react/shallow"
import { useNotificationStore } from "@/features/data-tables/notification-store"
import type { TabValue } from "@/features/notifications/constants"
import type { Notification } from "@/features/notifications/types"

export function useNotifications() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [tab, setTab] = useState<TabValue>("all")

  const { clearAll, deleteNotification, markAllRead, markRead, notifications } =
    useNotificationStore(
      useShallow((state) => ({
        clearAll: state.clearAll,
        deleteNotification: state.delete,
        markAllRead: state.markAllRead,
        markRead: state.markRead,
        notifications: state.notifications,
      })),
    )

  const totalCount = notifications.length
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  )
  const readCount = totalCount - unreadCount

  const unread = useMemo(
    () => notifications.filter((n) => !n.read),
    [notifications],
  )
  const read = useMemo(
    () => notifications.filter((n) => n.read),
    [notifications],
  )

  const query = search.trim().toLowerCase()

  const matchesSearch = useCallback(
    (notification: Notification) =>
      !query ||
      notification.title.toLowerCase().includes(query) ||
      notification.description?.toLowerCase().includes(query) ||
      notification.tableName?.toLowerCase().includes(query) ||
      notification.rowLabel?.toLowerCase().includes(query),
    [query],
  )

  const matchesType = useCallback(
    (notification: Notification) =>
      !typeFilter || notification.type === typeFilter,
    [typeFilter],
  )

  const filtered = useMemo(
    () => notifications.filter((n) => matchesSearch(n) && matchesType(n)),
    [notifications, matchesSearch, matchesType],
  )

  const filteredUnread = useMemo(
    () => unread.filter((n) => matchesSearch(n) && matchesType(n)),
    [unread, matchesSearch, matchesType],
  )

  const filteredRead = useMemo(
    () => read.filter((n) => matchesSearch(n) && matchesType(n)),
    [read, matchesSearch, matchesType],
  )

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const n of notifications) {
      counts[n.type] = (counts[n.type] || 0) + 1
    }
    return counts
  }, [notifications])

  return {
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    tab,
    setTab,
    notifications,
    totalCount,
    unreadCount,
    readCount,
    unread,
    read,
    filtered,
    filteredUnread,
    filteredRead,
    typeCounts,
    markRead,
    markAllRead,
    deleteNotification,
    clearAll,
  }
}
