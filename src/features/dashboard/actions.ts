export interface ActionInvoice {
  id: string
  invoiceNumber: string
  document_type?: string
  dueDate?: string | null
  invoiceDate?: string
  status: string
  grandTotal: number | string
  currency?: string
  createdAt?: string
  customer?: { name?: string }
}

export interface ActionItem {
  id: string
  name: string
  stock?: number
  lowStockThreshold?: number
  unit?: string
}

export function getDashboardActions(
  invoices: ActionInvoice[],
  items: ActionItem[],
  now = new Date(),
) {
  // Compare calendar dates in the user's timezone, without parsing UTC midnight.
  const dateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
  const today = dateKey(now)
  const sunday = new Date(now)
  sunday.setDate(sunday.getDate() + ((7 - sunday.getDay()) % 7))
  const weekEnd = dateKey(sunday)
  const outstanding = invoices.filter(
    (invoice) =>
      (!invoice.document_type || invoice.document_type === "invoice") &&
      (invoice.status === "unpaid" || invoice.status === "overdue"),
  )
  const byDueDate = (a: ActionInvoice, b: ActionInvoice) =>
    (a.dueDate || "9999").localeCompare(b.dueDate || "9999") ||
    a.invoiceNumber.localeCompare(b.invoiceNumber)

  return {
    followUps: outstanding
      .filter(
        (invoice) =>
          invoice.status === "overdue" ||
          (!!invoice.dueDate && invoice.dueDate < today),
      )
      .sort(byDueDate),
    dueThisWeek: outstanding
      .filter(
        (invoice) =>
          invoice.status !== "overdue" &&
          !!invoice.dueDate &&
          invoice.dueDate >= today &&
          invoice.dueDate <= weekEnd,
      )
      .sort(byDueDate),
    lowStock: items
      .filter((item) => (item.stock ?? 0) <= (item.lowStockThreshold ?? 5))
      .sort(
        (a, b) =>
          (a.stock ?? 0) - (b.stock ?? 0) || a.name.localeCompare(b.name),
      ),
  }
}
