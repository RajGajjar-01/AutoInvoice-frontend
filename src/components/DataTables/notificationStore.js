// ─── Notification Store ─────────────────────────────────────────────────────
// Global singleton for all in-app notifications.
// Persisted to localStorage under "autoinvoice-notifications".
//
// Each notification shape:
// {
//   id: string,
//   title: string,
//   description?: string,
//   type: "reminder" | "due_date" | "expiry" | "info",
//   read: boolean,
//   createdAt: string (ISO),
//   rowLabel?: string,
//   tableName?: string,
//   tableId?: string,
// }

const STORAGE_KEY = "autoinvoice-notifications"

function loadNotifications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (_) {
    /* ignore */
  }
  return []
}

function saveNotifications(list) {
  try {
    // Keep only the latest 200
    const trimmed = list.slice(-200)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch (_) {
    /* ignore */
  }
}

function createNotificationStore() {
  let notifications = loadNotifications()
  const listeners = new Set()

  function notify() {
    saveNotifications(notifications)
    for (const fn of listeners) fn([...notifications])
  }

  return {
    /** Subscribe to changes. Returns an unsubscribe function. */
    subscribe(fn) {
      listeners.add(fn)
      fn([...notifications]) // immediately emit current state
      return () => listeners.delete(fn)
    },

    getAll() {
      return [...notifications]
    },

    getUnreadCount() {
      return notifications.filter((n) => !n.read).length
    },

    /**
     * Add a new notification.
     * @param {{ title: string, description?: string, type?: string, rowLabel?: string, tableName?: string, tableId?: string }} data
     */
    add(data) {
      const n = {
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

    markRead(id) {
      notifications = notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      )
      notify()
    },

    markAllRead() {
      notifications = notifications.map((n) => ({ ...n, read: true }))
      notify()
    },

    delete(id) {
      notifications = notifications.filter((n) => n.id !== id)
      notify()
    },

    clearAll() {
      notifications = []
      notify()
    },

    /** Check all tables for overdue reminders and push notifications if not already done. */
    checkOverdueReminders(tables) {
      const today = new Date().toISOString().split("T")[0]
      for (const table of tables) {
        for (const reminder of table.reminders ?? []) {
          if (!reminder.date) continue
          if (reminder.date > today) continue
          // Only create one notification per reminderId
          const alreadyExists = notifications.some(
            (n) => n.reminderId === reminder.id,
          )
          if (alreadyExists) continue
          const n = {
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
