import { Bell, Calendar, Clock, Info } from "lucide-react"
import type { TypeConfig } from "./types"

export const TYPE_CONFIG: Record<string, TypeConfig> = {
  reminder: {
    label: "Reminder",
    Icon: Bell,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  due_date: {
    label: "Due Date",
    Icon: Calendar,
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-950/40",
  },
  expiry: {
    label: "Expiry",
    Icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/40",
  },
  info: {
    label: "Info",
    Icon: Info,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
}

export const TYPE_KEYS = Object.keys(TYPE_CONFIG)

export const QUICK_FILTERS = ["all", "unread", "history"] as const
export type TabValue = (typeof QUICK_FILTERS)[number]
