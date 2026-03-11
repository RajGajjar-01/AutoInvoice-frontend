import { createFileRoute } from "@tanstack/react-router"
import { CreateInvoicePage } from "@/components/Invoice/CreateInvoiceForm"

export const Route = createFileRoute("/_layout/create-quotation")({
  component: () => <CreateInvoicePage defaultType="quotation" />,
  head: () => ({
    meta: [{ title: "Create Quotation" }],
  }),
})
