import { Outlet } from "react-router"

// This file is now a pure layout wrapper so that child routes
// (/new, /$tableId, /index) can render inside <Outlet />.
// The actual list-page content lives in data-tables/index.jsx.

function DataTablesLayout() {
  return <Outlet />
}

export default DataTablesLayout
