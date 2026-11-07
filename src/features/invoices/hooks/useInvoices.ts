import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useInvoiceActions } from "@/features/invoices/mutations"
import { invoicesListQueryOptions } from "@/features/invoices/queries"

export interface Invoice {
  id: string
  invoiceNumber: string
  invoiceDate?: string
  dueDate?: string | null
  status: string
  grandTotal: number | string
  currency?: string
  createdAt?: string
  customer?: {
    name?: string
    email?: string
    whatsapp?: string
    phone?: string
  }
}

export function useInvoices() {
  const {
    data: invoicesRes,
    isLoading,
    refetch,
  } = useQuery(invoicesListQueryOptions())
  const invoices = (invoicesRes?.data ?? []).filter(
    Boolean,
  ) as unknown as Invoice[]
  const actions = useInvoiceActions()
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null)

  const totalCount = invoices.length
  const paidCount = invoices.filter((i) => i.status === "paid").length
  const unpaidCount = invoices.filter((i) => i.status === "unpaid").length
  const overdueCount = invoices.filter((i) => i.status === "overdue").length
  const totalRevenue = invoices.reduce(
    (s, i) => s + (Number(i.grandTotal) || 0),
    0,
  )
  const outstanding = invoices
    .filter((i) => i.status === "unpaid" || i.status === "overdue")
    .reduce((s, i) => s + (Number(i.grandTotal) || 0), 0)
  const paidRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + (Number(i.grandTotal) || 0), 0)
  const paidPct =
    totalRevenue > 0 ? Math.round((paidRevenue / totalRevenue) * 100) : 0

  const recent = [...invoices]
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
    .slice(0, 5)

  const handleDelete = () => {
    if (!deleteTarget) return
    actions.deleteNow(deleteTarget.id)
    setDeleteTarget(null)
  }

  return {
    invoices,
    isLoading,
    refetch,
    recent,
    totalCount,
    paidCount,
    unpaidCount,
    overdueCount,
    totalRevenue,
    outstanding,
    paidRevenue,
    paidPct,
    deleteTarget,
    setDeleteTarget,
    handleToggleStatus: actions.toggleStatus,
    handleDelete,
    handleWhatsApp: actions.sendWhatsApp,
    setStatus: actions.setStatus,
    deleteWithUndo: actions.deleteWithUndo,
  }
}
