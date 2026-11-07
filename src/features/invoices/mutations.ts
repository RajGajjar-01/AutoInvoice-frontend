import { type QueryKey, useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { InvoicesService } from "@/client/sdk.gen"
import type { InvoiceStatus } from "@/client/types.gen"
import type { Invoice } from "@/features/invoices/hooks/useInvoices"
import { invoicesQueryKeys } from "@/features/invoices/queries"
import useCustomToast from "@/hooks/useCustomToast"
import { haptic } from "@/lib/haptics"
import { queryClient } from "@/queryClient"

const listsFilter = { queryKey: [...invoicesQueryKeys.all, "list"] }
type ListData = { data: Invoice[] }
type Snapshot = [QueryKey, unknown][]

// Changes every cached invoice list at once and returns the old data for rollback.
function patchLists(fn: (list: Invoice[]) => Invoice[]): Snapshot {
  const snapshot = queryClient.getQueriesData(listsFilter)
  queryClient.setQueriesData<ListData>(listsFilter, (old) =>
    old ? { ...old, data: fn(old.data) } : old,
  )
  return snapshot
}

function restore(snapshot: Snapshot) {
  for (const [key, data] of snapshot) queryClient.setQueryData(key, data)
}

const refreshInvoices = () =>
  queryClient.invalidateQueries({ queryKey: invoicesQueryKeys.all })

export const nextStatus = (status: string): InvoiceStatus =>
  status === "paid" ? "unpaid" : status === "unpaid" ? "overdue" : "paid"

/** Status, delete and WhatsApp actions for invoices, with instant UI and rollback on error. */
export function useInvoiceActions() {
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: InvoiceStatus }) =>
      InvoicesService.updateInvoice({ id, requestBody: { status } }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries(listsFilter)
      const detailKey = invoicesQueryKeys.detail(id)
      const detail = queryClient.getQueryData(detailKey)
      queryClient.setQueryData(detailKey, (old: object | undefined) =>
        old ? { ...old, status } : old,
      )
      return {
        snapshot: [
          ...patchLists((list) =>
            list.map((i) => (i.id === id ? { ...i, status } : i)),
          ),
          [detailKey, detail],
        ] as Snapshot,
      }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx) restore(ctx.snapshot)
      haptic("warning")
      showErrorToast("Could not change the status. It is back as it was.")
    },
    onSettled: refreshInvoices,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => InvoicesService.deleteInvoice({ id }),
    onMutate: async (id) => {
      await queryClient.cancelQueries(listsFilter)
      patchLists((list) => list.filter((i) => i.id !== id))
    },
    // The refetch in onSettled brings a failed delete back into the list.
    onError: () => showErrorToast("Could not delete the invoice"),
    onSettled: refreshInvoices,
  })

  const whatsappMutation = useMutation({
    mutationFn: (body: { id: string; to_phone: string }) =>
      InvoicesService.sendInvoiceWhatsapp({
        id: body.id,
        requestBody: { to_phone: body.to_phone },
      }),
    onSuccess: () => showSuccessToast("Invoice sent via WhatsApp"),
    onError: () => showErrorToast("Failed to send via WhatsApp"),
  })

  const setStatus = (inv: Pick<Invoice, "id">, status: InvoiceStatus) => {
    haptic(status === "paid" ? "success" : "light")
    statusMutation.mutate({ id: inv.id, status })
  }

  return {
    setStatus,
    toggleStatus: (inv: { id: string; status?: string | null }) =>
      setStatus(inv, nextStatus(inv.status ?? "unpaid")),

    /** Deletes now. Use after a confirm dialog. */
    deleteNow: (id: string, opts?: { onSuccess?: () => void }) => {
      deleteMutation.mutate(id, opts)
      showSuccessToast("Invoice deleted")
    },

    /** Hides the row now and deletes after 5 s unless the user taps Undo. */
    deleteWithUndo: (inv: Invoice) => {
      haptic("warning")
      const snapshot = patchLists((list) => list.filter((i) => i.id !== inv.id))
      // shortcut: closing the tab inside the 5 s window cancels the delete; fine for an undo window.
      const timer = window.setTimeout(() => deleteMutation.mutate(inv.id), 5000)
      toast(`Invoice ${inv.invoiceNumber} deleted`, {
        duration: 5000,
        action: {
          label: "Undo",
          onClick: () => {
            window.clearTimeout(timer)
            restore(snapshot)
          },
        },
      })
    },

    sendWhatsApp: (inv: {
      id: string
      customer?: { whatsapp?: string | null; phone?: string | null } | null
    }) => {
      const phone = inv.customer?.whatsapp || inv.customer?.phone
      if (!phone) {
        showErrorToast("No WhatsApp number available for this customer")
        return
      }
      whatsappMutation.mutate({ id: inv.id, to_phone: phone })
    },
  }
}
