import { Outlet } from "react-router"

// Layout wrapper — child routes (/invoice-history/$invoiceId, /invoice-history/) render inside <Outlet />.
// The actual list-page content lives in invoice-history/index.jsx.

function InvoiceHistoryLayout() {
  return <Outlet />
}

export default InvoiceHistoryLayout
