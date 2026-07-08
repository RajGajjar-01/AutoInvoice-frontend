import type { LucideIcon } from "lucide-react"
import type { Notification } from "@/features/data-tables/notification-store"

export type { Notification }

export interface TypeConfig {
  label: string
  Icon: LucideIcon
  color: string
  bg: string
}

export interface GroupedItem {
  dateKey: string
  label: string
  items: Notification[]
}
