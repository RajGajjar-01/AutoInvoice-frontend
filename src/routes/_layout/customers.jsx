import { createFileRoute, Outlet } from "@tanstack/react-router"

// Layout wrapper — child routes (/customers/$customerId, /customers/index) render inside <Outlet />.
// The actual list-page content lives in customers/index.jsx.

export const Route = createFileRoute("/_layout/customers")({
    component: CustomersLayout,
})

function CustomersLayout() {
    return <Outlet />
}

export default CustomersLayout
