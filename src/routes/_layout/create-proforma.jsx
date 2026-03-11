import { createFileRoute } from "@tanstack/react-router"
import { CreateInvoicePage } from "@/components/Invoice/CreateInvoiceForm"

export const Route = createFileRoute("/_layout/create-proforma")({
  component: () => <CreateInvoicePage defaultType="proforma" />,
  head: () => ({
    meta: [{ title: "Create Proforma Invoice" }],
  }),
})
