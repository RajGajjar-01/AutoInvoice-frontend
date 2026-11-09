import type { Icon as LucideIcon } from "@phosphor-icons/react"
import {
  CheckCircle as CheckCircle2,
  CircleDashed,
  XCircle as CircleX,
} from "@phosphor-icons/react"

export const statusVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  paid: "default",
  unpaid: "secondary",
  overdue: "destructive",
}

export const statusIcon: Record<string, LucideIcon> = {
  paid: CheckCircle2,
  unpaid: CircleDashed,
  overdue: CircleX,
}

export type InvoiceStatusString = "paid" | "unpaid" | "overdue"
