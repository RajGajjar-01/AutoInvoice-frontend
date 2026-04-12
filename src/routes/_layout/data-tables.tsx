import { createFileRoute, Outlet } from "@tanstack/react-router"

// This file is now a pure layout wrapper so that child routes
// (/new, /$tableId, /index) can render inside <Outlet />.
// The actual list-page content lives in data-tables/index.jsx.

export const Route = createFileRoute("/_layout/data-tables")({
  component: DataTablesLayout,
})

function DataTablesLayout() {
  return <Outlet />
}

export default DataTablesLayout
