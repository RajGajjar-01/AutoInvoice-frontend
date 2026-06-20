import { Outlet } from "react-router"

// Layout wrapper — child routes (/customers/$customerId, /customers/index) render inside <Outlet />.
// The actual list-page content lives in customers/index.jsx.

function CustomersLayout() {
  return <Outlet />
}

export default CustomersLayout
