import { createFileRoute } from "@tanstack/react-router"
import { CreateInvoicePage } from "@/components/Invoice/CreateInvoiceForm"

export const Route = createFileRoute("/_layout/create-invoice")({
  component: () => <CreateInvoicePage defaultType="invoice" />,
  validateSearch: (search) => ({
    customerId: search.customerId ? String(search.customerId) : undefined,
    itemId: search.itemId ? String(search.itemId) : undefined,
    type: search.type ? String(search.type) : undefined,
    fromId: search.fromId ? String(search.fromId) : undefined,
    fromType: search.fromType ? String(search.fromType) : undefined,
  }),
  head: () => ({
    meta: [{ title: "Create Invoice" }],
  }),
})
