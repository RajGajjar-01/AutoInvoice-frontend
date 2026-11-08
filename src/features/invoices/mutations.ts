import { type QueryKey, useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { ApiError } from "@/client"
import { InvoicesService } from "@/client/sdk.gen"
import type { InvoiceStatus } from "@/client/types.gen"
import { companySettingsQueryOptions } from "@/features/company-settings/queries"
import type { Invoice } from "@/features/invoices/hooks/useInvoices"
import { documentConfigs } from "@/features/invoices/invoice-form/constants"
import { invoicesQueryKeys } from "@/features/invoices/queries"
import useCustomToast from "@/hooks/useCustomToast"
import { haptic } from "@/lib/haptics"
import { fetchInvoicePdf, invoicePdfFilename } from "@/lib/invoicePdf"
import { canShareFiles, downloadFile, shareFile } from "@/lib/share"
import { toWhatsAppNumber, whatsAppChatUrl } from "@/lib/whatsapp"
import { queryClient } from "@/queryClient"
import { getSafeErrorMessage } from "@/utils"

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

/** What a WhatsApp send needs to know about an invoice. */
export type WhatsAppInvoice = {
  id: string
  invoiceNumber?: string | null
  invoice_number?: string | null
  document_type?: string | null
  currency?: string | null
  grandTotal?: number | string | null
  grand_total?: number | string | null
  customer?: { whatsapp?: string | null; phone?: string | null } | null
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
}

function whatsAppDetails(inv: WhatsAppInvoice) {
  const config =
    documentConfigs[
      (inv.document_type ?? "invoice") as keyof typeof documentConfigs
    ] ?? documentConfigs.invoice
  const number = inv.invoiceNumber ?? inv.invoice_number ?? ""
  const currency = inv.currency ?? "INR"
  const total = Number(inv.grandTotal ?? inv.grand_total ?? 0)
  const amount = config.hidePricing
    ? ""
    : ` for ${CURRENCY_SYMBOLS[currency] ?? `${currency} `}${total.toFixed(2)}`
  return {
    title: `${config.singular} ${number}`,
    text: `Hello, please find ${config.singular.toLowerCase()} ${number}${amount} attached. Thank you!`,
    filename: invoicePdfFilename(config.pdfTitle, number),
  }
}

/** The backend wrote these messages for users; other errors stay generic. */
function whatsAppErrorMessage(error: unknown): string {
  if (
    error instanceof ApiError &&
    [422, 502, 503].includes(error.status) &&
    error.body &&
    typeof error.body === "object" &&
    "detail" in error.body &&
    typeof error.body.detail === "string"
  ) {
    return error.body.detail
  }
  return getSafeErrorMessage(error)
}

export const nextStatus = (status: string): InvoiceStatus =>
  status === "paid" ? "unpaid" : status === "unpaid" ? "overdue" : "paid"

/** Status, delete and WhatsApp actions for invoices, with instant UI and rollback on error. */
export function useInvoiceActions() {
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const { data: companySettings } = useQuery(companySettingsQueryOptions())
  // The backend can send by itself only through an OpenWA server.
  const openWaReady = Boolean(
    companySettings?.whatsapp_enabled &&
      companySettings.openwa_api_key_set &&
      companySettings.openwa_session_id_set,
  )

  /**
   * Without OpenWA: phones share the PDF through the share sheet (pick
   * WhatsApp there); desktops open the customer's chat and download the PDF
   * to attach. Call it straight from the click, so the chat window is not
   * blocked as a pop-up.
   */
  const shareOnWhatsAppManually = (inv: WhatsAppInvoice, number: string) => {
    const { title, text, filename } = whatsAppDetails(inv)
    if (canShareFiles()) {
      showSuccessToast("Preparing PDF…")
      fetchInvoicePdf(inv.id, filename)
        .then((file) => shareFile(file, title, text))
        .catch((error: unknown) =>
          showErrorToast(
            error instanceof Error ? error.message : "Could not create the PDF",
          ),
        )
      return
    }
    window.open(whatsAppChatUrl(number, text), "_blank", "noopener")
    fetchInvoicePdf(inv.id, filename)
      .then((file) => {
        downloadFile(file)
        showSuccessToast(
          "WhatsApp is open. Attach the downloaded PDF to the chat.",
        )
      })
      .catch((error: unknown) =>
        showErrorToast(
          error instanceof Error ? error.message : "Could not create the PDF",
        ),
      )
  }

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
    mutationFn: (body: { inv: WhatsAppInvoice; number: string }) =>
      InvoicesService.sendInvoiceWhatsapp({
        id: body.inv.id,
        requestBody: { to_phone: body.number },
      }),
    onSuccess: () => showSuccessToast("Invoice sent via WhatsApp"),
    onError: (error, { inv, number }) => {
      if (error instanceof ApiError && error.status === 503) {
        // OpenWA is not set up after all: offer the manual way. A toast
        // button is a fresh click, so the chat window is not blocked.
        toast("WhatsApp sending is not set up", {
          description: "Send it from your own WhatsApp instead.",
          duration: 15000,
          action: {
            label: "Open WhatsApp",
            onClick: () => shareOnWhatsAppManually(inv, number),
          },
        })
        return
      }
      showErrorToast(whatsAppErrorMessage(error))
    },
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

    sendWhatsApp: (inv: WhatsAppInvoice) => {
      const phone = inv.customer?.whatsapp || inv.customer?.phone
      if (!phone) {
        showErrorToast("No WhatsApp number available for this customer")
        return
      }
      const number = toWhatsAppNumber(phone)
      if (!number) {
        showErrorToast(
          "The customer's phone number is not valid for WhatsApp. Save it with the country code.",
        )
        return
      }
      if (openWaReady) whatsappMutation.mutate({ inv, number })
      else shareOnWhatsAppManually(inv, number)
    },
  }
}
