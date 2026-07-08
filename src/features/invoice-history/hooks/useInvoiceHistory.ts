import { useMutation, useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { InvoicesService } from "@/client/sdk.gen"
import { cycleStatus } from "@/features/invoices/constants"
import {
  invoicesListQueryOptions,
  invoicesQueryKeys,
} from "@/features/invoices/queries"
import useCustomToast from "@/hooks/useCustomToast"
import { queryClient } from "@/queryClient"

interface Invoice {
  id: string
  invoiceNumber: string
  invoiceDate?: string
  dueDate?: string
  currency?: string
  status: "paid" | "unpaid" | "overdue"
  grandTotal?: number
  createdAt?: string
  customer?: { name?: string; email?: string; phone?: string }
}

export function useInvoiceHistory() {
  const { data: invoicesRes } = useQuery(invoicesListQueryOptions())
  const invoices = (invoicesRes?.data ?? []) as Invoice[]
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<string>("newest")
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null)

  const updateInvoiceMutation = useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string
      patch: Partial<Invoice>
    }) => InvoicesService.updateInvoice({ id, requestBody: patch }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: invoicesQueryKeys.all })
    },
  })

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: string) => InvoicesService.deleteInvoice({ id }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: invoicesQueryKeys.all })
      showSuccessToast("Invoice deleted")
    },
  })

  const sendWhatsappMutation = useMutation({
    mutationFn: (body: { id: string; to_phone: string }) =>
      InvoicesService.sendInvoiceWhatsapp({
        id: body.id,
        requestBody: { to_phone: body.to_phone },
      }),
    onSuccess: () => showSuccessToast("Invoice sent via WhatsApp"),
    onError: () => showErrorToast("Failed to send via WhatsApp"),
  })

  const totalRevenue = invoices.reduce(
    (s, i) => s + (Number(i.grandTotal) || 0),
    0,
  )
  const outstanding = invoices
    .filter((i) => i.status === "unpaid" || i.status === "overdue")
    .reduce((s, i) => s + (Number(i.grandTotal) || 0), 0)
  const overdueCount = invoices.filter((i) => i.status === "overdue").length

  const filtered = useMemo(() => {
    let list = [...invoices]
    if (statusFilter !== "all")
      list = list.filter((i) => i.status === statusFilter)
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (i) =>
          i.invoiceNumber?.toLowerCase().includes(q) ||
          i.customer?.name?.toLowerCase().includes(q) ||
          i.customer?.email?.toLowerCase().includes(q) ||
          i.customer?.phone?.toLowerCase().includes(q) ||
          String(i.grandTotal).includes(q),
      )
    }
    list.sort((a, b) => {
      const aDate = a.createdAt || a.invoiceDate || ""
      const bDate = b.createdAt || b.invoiceDate || ""
      return sortOrder === "newest"
        ? bDate.localeCompare(aDate)
        : aDate.localeCompare(bDate)
    })
    return list
  }, [invoices, search, statusFilter, sortOrder])

  const handleToggleStatus = (inv: Invoice) => {
    const next = cycleStatus(inv.status)
    updateInvoiceMutation.mutate({ id: inv.id, patch: { status: next } })
    showSuccessToast(`Status changed to ${next}`)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteInvoiceMutation.mutate(deleteTarget.id)
    setDeleteTarget(null)
  }

  const handleWhatsApp = (inv: Invoice) => {
    const phone =
      (inv as any).customer?.whatsapp || (inv as any).customer?.phone
    if (!phone) {
      showErrorToast("No WhatsApp number available")
      return
    }
    sendWhatsappMutation.mutate({ id: inv.id, to_phone: phone })
  }

  const hasSearch = search.trim() !== "" || statusFilter !== "all"

  return {
    invoices,
    filtered,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sortOrder,
    setSortOrder,
    deleteTarget,
    setDeleteTarget,
    hasSearch,
    totalRevenue,
    outstanding,
    overdueCount,
    handleToggleStatus,
    handleDelete,
    handleWhatsApp,
  }
}
