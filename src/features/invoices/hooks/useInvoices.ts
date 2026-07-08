import { useMutation, useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { InvoicesService } from "@/client/sdk.gen"
import type { InvoiceStatus } from "@/client/types.gen"
import {
  invoicesListQueryOptions,
  invoicesQueryKeys,
} from "@/features/invoices/queries"
import useCustomToast from "@/hooks/useCustomToast"
import { queryClient } from "@/queryClient"

export interface Invoice {
  id: string
  invoiceNumber: string
  invoiceDate?: string
  status: string
  grandTotal: number | string
  currency?: string
  createdAt?: string
  customer?: {
    name?: string
    whatsapp?: string
    phone?: string
  }
}

export function useInvoices() {
  const { data: invoicesRes, isLoading } = useQuery(invoicesListQueryOptions())
  const invoices = (invoicesRes?.data ?? []).filter(
    Boolean,
  ) as unknown as Invoice[]
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null)

  const updateInvoiceMutation = useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string
      patch: { status: InvoiceStatus }
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

  const handleToggleStatus = (inv: Invoice) => {
    const next =
      inv.status === "paid"
        ? "unpaid"
        : inv.status === "unpaid"
          ? "overdue"
          : "paid"
    updateInvoiceMutation.mutate({
      id: inv.id,
      patch: { status: next as InvoiceStatus },
    })
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

  return {
    invoices,
    isLoading,
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
    handleToggleStatus,
    handleDelete,
    handleWhatsApp,
  }
}
