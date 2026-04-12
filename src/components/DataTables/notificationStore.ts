// ─── Notification Store ─────────────────────────────────────────────────────
// Global singleton for all in-app notifications.
// Persisted to localStorage under "autoinvoice-notifications".

export interface Notification {
  id: string
  title: string
  description?: string
  type: "reminder" | "due_date" | "expiry" | "info"
  read: boolean
  createdAt: string
  rowLabel?: string
  tableName?: string
  tableId?: string
  reminderId?: string
}

type NotificationListener = (notifications: Notification[]) => void

interface NotificationData {
  title: string
  description?: string
  type?: "reminder" | "due_date" | "expiry" | "info"
  rowLabel?: string
  tableName?: string
  tableId?: string
}

interface TableWithReminders {
  id: string
  name: string
  reminders?: Array<{
    id: string
    date?: string
    title: string
    description?: string
    rowLabel?: string
  }>
}

const STORAGE_KEY = "autoinvoice-notifications"

function loadNotifications(): Notification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return []
}

function saveNotifications(list: Notification[]) {
  try {
    const trimmed = list.slice(-200)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch {
    /* ignore */
  }
}

function createNotificationStore() {
  let notifications: Notification[] = loadNotifications()
  const listeners = new Set<NotificationListener>()

  function notify() {
    saveNotifications(notifications)
    for (const fn of listeners) fn([...notifications])
  }

  return {
    subscribe(fn: NotificationListener) {
      listeners.add(fn)
      fn([...notifications])
      return () => listeners.delete(fn)
    },

    getAll(): Notification[] {
      return [...notifications]
    },

    getUnreadCount(): number {
      return notifications.filter((n) => !n.read).length
    },

    add(data: NotificationData): Notification {
      const n: Notification = {
        id: crypto.randomUUID(),
        title: data.title,
        description: data.description ?? "",
        type: data.type ?? "info",
        read: false,
        createdAt: new Date().toISOString(),
        rowLabel: data.rowLabel,
        tableName: data.tableName,
        tableId: data.tableId,
      }
      notifications = [n, ...notifications]
      notify()
      return n
    },

    markRead(id: string) {
      notifications = notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      )
      notify()
    },

    markAllRead() {
      notifications = notifications.map((n) => ({ ...n, read: true }))
      notify()
    },

    delete(id: string) {
      notifications = notifications.filter((n) => n.id !== id)
      notify()
    },

    clearAll() {
      notifications = []
      notify()
    },

    checkOverdueReminders(tables: TableWithReminders[]) {
      const today = new Date().toISOString().split("T")[0]
      for (const table of tables) {
        for (const reminder of table.reminders ?? []) {
          if (!reminder.date) continue
          if (reminder.date > today) continue
          const alreadyExists = notifications.some(
            (n) => n.reminderId === reminder.id,
          )
          if (alreadyExists) continue
          const n: Notification = {
            id: crypto.randomUUID(),
            reminderId: reminder.id,
            title: reminder.title,
            description: reminder.description
              ? `${reminder.description} — Table: ${table.name}`
              : `Table: ${table.name}`,
            type: "reminder",
            read: false,
            createdAt: new Date().toISOString(),
            rowLabel: reminder.rowLabel ?? "",
            tableName: table.name,
            tableId: table.id,
          }
          notifications = [n, ...notifications]
        }
      }
      notify()
    },
  }
}

export const notificationStore = createNotificationStore()
