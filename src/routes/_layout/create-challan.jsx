import { createFileRoute } from "@tanstack/react-router"
import { CreateInvoicePage } from "@/components/Invoice/CreateInvoiceForm"

export const Route = createFileRoute("/_layout/create-challan")({
  component: () => <CreateInvoicePage defaultType="challan" />,
  head: () => ({
    meta: [{ title: "Create Delivery Challan" }],
  }),
})
