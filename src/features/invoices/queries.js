import { queryOptions } from "@tanstack/react-query"
import { InvoicesService } from "@/client/sdk.gen"
import { adaptCustomerToUi } from "@/features/customers/queries"

export const invoicesQueryKeys = {
  all: ["invoices"],
  list: (params) => [...invoicesQueryKeys.all, "list", params ?? {}],
  detail: (invoiceId) => [...invoicesQueryKeys.all, "detail", invoiceId],
  stats: () => [...invoicesQueryKeys.all, "stats"],
}

export const adaptInvoiceToUi = (inv) => {
  if (!inv) return inv
  return {
    ...inv,
    invoiceNumber: inv.invoiceNumber ?? inv.invoice_number,
    invoiceDate: inv.invoiceDate ?? inv.invoice_date,
    dueDate: inv.dueDate ?? inv.due_date,
    grandTotal: inv.grandTotal ?? inv.grand_total,
    totalTax: inv.totalTax ?? inv.total_tax,
    paymentTerms: inv.paymentTerms ?? inv.payment_terms,
    createdAt: inv.createdAt ?? inv.created_at,
    updatedAt: inv.updatedAt ?? inv.updated_at,
    customerId: inv.customerId ?? inv.customer_id,
    customer: inv.customer ? adaptCustomerToUi(inv.customer) : inv.customer,
  }
}

export const invoicesListQueryOptions = (params) =>
  queryOptions({
    queryKey: invoicesQueryKeys.list(params),
    queryFn: async () => {
      const res = await InvoicesService.readInvoices({
        skip: params?.skip ?? 0,
        limit: params?.limit ?? 200,
        status: params?.status ?? undefined,
      })

      return {
        ...res,
        data: (res.data ?? []).map(adaptInvoiceToUi),
      }
    },
  })

export const invoiceDetailQueryOptions = (invoiceId) =>
  queryOptions({
    queryKey: invoicesQueryKeys.detail(invoiceId),
    queryFn: async () => {
      const inv = await InvoicesService.readInvoice({ id: invoiceId })
      return adaptInvoiceToUi(inv)
    },
    enabled: !!invoiceId,
  })

export const invoicesStatsQueryOptions = () =>
  queryOptions({
    queryKey: invoicesQueryKeys.stats(),
    queryFn: async () => {
      return InvoicesService.getDashboardStats()
    },
  })
