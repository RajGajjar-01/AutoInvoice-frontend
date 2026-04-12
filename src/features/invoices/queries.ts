import { queryOptions } from "@tanstack/react-query"
import { InvoicesService } from "@/client/sdk.gen"
import type {
  InvoicePublic,
  InvoiceStatus,
  InvoiceWithCustomer,
} from "@/client/types.gen"
import { adaptCustomerToUi } from "@/features/customers/queries"

interface InvoiceListParams {
  skip?: number
  limit?: number
  status?: InvoiceStatus
}

export const invoicesQueryKeys = {
  all: ["invoices"],
  list: (params?: InvoiceListParams) => [
    ...invoicesQueryKeys.all,
    "list",
    params ?? {},
  ],
  detail: (invoiceId: string) => [
    ...invoicesQueryKeys.all,
    "detail",
    invoiceId,
  ],
  stats: () => [...invoicesQueryKeys.all, "stats"],
}

export const adaptInvoiceToUi = (
  inv: InvoicePublic | InvoiceWithCustomer | null | undefined,
) => {
  if (!inv) return inv
  const hasCustomer = "customer" in inv && inv.customer
  return {
    ...inv,
    invoiceNumber: inv.invoice_number,
    invoiceDate: inv.invoice_date,
    dueDate: inv.due_date,
    grandTotal: inv.grand_total,
    totalTax: inv.total_tax,
    paymentTerms: inv.payment_terms,
    createdAt: inv.created_at,
    updatedAt: inv.updated_at,
    customerId: inv.customer_id,
    customer: hasCustomer
      ? adaptCustomerToUi((inv as InvoiceWithCustomer).customer)
      : undefined,
  }
}

export const invoicesListQueryOptions = (params?: InvoiceListParams) =>
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

export const invoiceDetailQueryOptions = (invoiceId: string | undefined) =>
  queryOptions({
    queryKey: invoicesQueryKeys.detail(invoiceId ?? ""),
    queryFn: async () => {
      const inv = await InvoicesService.readInvoice({ id: invoiceId! })
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
