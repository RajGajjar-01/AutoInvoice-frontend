import type { LucideIcon } from "lucide-react"
import { CheckCircle2, CircleDashed, CircleX } from "lucide-react"

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

export function cycleStatus(status: InvoiceStatusString): InvoiceStatusString {
  if (status === "paid") return "unpaid"
  if (status === "unpaid") return "overdue"
  return "paid"
}
