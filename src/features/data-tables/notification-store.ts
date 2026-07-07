import { create } from "zustand"
import { persist } from "zustand/middleware"
import { randomUUID } from "@/lib/uuid"

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface NotificationState {
  notifications: Notification[]
  dismissedReminderIds: string[]
  add: (data: NotificationData) => Notification
  markRead: (id: string) => void
  markAllRead: () => void
  delete: (id: string) => void
  clearAll: () => void
  setNotifications: (notifications: Notification[]) => void
  checkOverdueReminders: (tables: TableWithReminders[]) => void
}

const MAX_NOTIFICATIONS = 200

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      dismissedReminderIds: [],

      add: (data) => {
        const n: Notification = {
          id: randomUUID(),
          title: data.title,
          description: data.description ?? "",
          type: data.type ?? "info",
          read: false,
          createdAt: new Date().toISOString(),
          rowLabel: data.rowLabel,
          tableName: data.tableName,
          tableId: data.tableId,
        }
        set((state) => ({
          notifications: [n, ...state.notifications].slice(
            0,
            MAX_NOTIFICATIONS,
          ),
        }))
        return n
      },

      markRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        })),

      markAllRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      delete: (id) =>
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id)
          const dismissedReminderIds = notification?.reminderId
            ? Array.from(
                new Set([
                  ...state.dismissedReminderIds,
                  notification.reminderId,
                ]),
              )
            : state.dismissedReminderIds

          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            dismissedReminderIds,
          }
        }),

      clearAll: () =>
        set((state) => ({
          notifications: [],
          dismissedReminderIds: Array.from(
            new Set([
              ...state.dismissedReminderIds,
              ...state.notifications
                .map((notification) => notification.reminderId)
                .filter((reminderId): reminderId is string => !!reminderId),
            ]),
          ),
        })),

      setNotifications: (notifications) => set({ notifications }),

      checkOverdueReminders: (tables) => {
        const today = new Date().toISOString().split("T")[0]
        const { dismissedReminderIds, notifications: existing } = get()
        const dismissed = new Set(dismissedReminderIds)
        const knownReminderIds = new Set(
          existing
            .map((notification) => notification.reminderId)
            .filter((reminderId): reminderId is string => !!reminderId),
        )
        const newNotifications: Notification[] = []

        for (const table of tables) {
          for (const reminder of table.reminders ?? []) {
            if (!reminder.date) continue
            if (reminder.date > today) continue
            if (
              dismissed.has(reminder.id) ||
              knownReminderIds.has(reminder.id)
            ) {
              continue
            }

            knownReminderIds.add(reminder.id)
            newNotifications.push({
              id: randomUUID(),
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
            })
          }
        }

        if (newNotifications.length > 0) {
          set((state) => ({
            notifications: [...newNotifications, ...state.notifications].slice(
              0,
              MAX_NOTIFICATIONS,
            ),
          }))
        }
      },
    }),
    {
      name: "autoinvoice-notifications",
      partialize: (state) => ({
        dismissedReminderIds: state.dismissedReminderIds,
        notifications: state.notifications,
      }),
    },
  ),
)
