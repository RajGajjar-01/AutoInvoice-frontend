import { createFileRoute, Outlet } from "@tanstack/react-router"

// Layout wrapper — child routes (/invoice-history/$invoiceId, /invoice-history/) render inside <Outlet />.
// The actual list-page content lives in invoice-history/index.jsx.

export const Route = createFileRoute("/_layout/invoice-history")({
  component: InvoiceHistoryLayout,
})

function InvoiceHistoryLayout() {
  return <Outlet />
}

export default InvoiceHistoryLayout
