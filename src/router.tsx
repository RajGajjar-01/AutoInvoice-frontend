import { createBrowserRouter } from "react-router"
import ErrorComponent from "@/components/Common/ErrorComponent"
import NotFound from "@/components/Common/NotFound"
import ProtectedLayout from "@/components/Common/ProtectedLayout"
import Admin, { loader as adminLoader } from "@/routes/_layout/admin"
import CreateChallanPage from "@/routes/_layout/create-challan"
import CreateInvoicePage from "@/routes/_layout/create-invoice"
import CreateProformaPage from "@/routes/_layout/create-proforma"
import CreateQuotationPage from "@/routes/_layout/create-quotation"
import CustomersLayout from "@/routes/_layout/customers"
import CustomersPage from "@/routes/_layout/customers/index"
import CustomerDetailPage from "@/routes/_layout/customers.$customerId"
import Dashboard from "@/routes/_layout/dashboard"
import DataTablesLayout from "@/routes/_layout/data-tables"
import DataTablesPage, {
  loader as dataTablesLoader,
} from "@/routes/_layout/data-tables/index"
import TableViewPage, {
  loader as tableViewLoader,
} from "@/routes/_layout/data-tables.$tableId"
import CreateTablePageRoute from "@/routes/_layout/data-tables.new"
import InsightsPage from "@/routes/_layout/insights"
import InvoiceHistoryLayout from "@/routes/_layout/invoice-history"
import InvoiceHistoryPage from "@/routes/_layout/invoice-history/index"
import InvoiceDetailPage from "@/routes/_layout/invoice-history.$invoiceId"
import InvoiceTemplatesPage from "@/routes/_layout/invoice-templates"
import InvoicesPage from "@/routes/_layout/invoices"
import ItemsLayout from "@/routes/_layout/items"
import ItemsPage from "@/routes/_layout/items/index"
import ItemDetailPage, {
  loader as itemDetailLoader,
} from "@/routes/_layout/items.$itemId"
import NotificationsPage, {
  loader as notificationsLoader,
} from "@/routes/_layout/notifications"
import AccountPage from "@/routes/_layout/profile"
import UserSettings from "@/routes/_layout/settings"
import TemplateBuilderPage from "@/routes/_layout/template-builder"
import LandingPage from "@/routes/index"
import Login from "@/routes/login"
import RecoverPassword from "@/routes/recover-password"
import ResetPassword, {
  loader as resetPasswordLoader,
} from "@/routes/reset-password"
import SignUp from "@/routes/signup"

export const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorComponent />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <SignUp /> },
      { path: "recover-password", element: <RecoverPassword /> },
      {
        path: "reset-password",
        element: <ResetPassword />,
        loader: resetPasswordLoader,
      },
      {
        element: <ProtectedLayout />,
        children: [
          { path: "admin", element: <Admin />, loader: adminLoader },
          { path: "dashboard", element: <Dashboard /> },
          { path: "insights", element: <InsightsPage /> },
          { path: "invoices", element: <InvoicesPage /> },
          { path: "invoice-templates", element: <InvoiceTemplatesPage /> },
          {
            path: "notifications",
            element: <NotificationsPage />,
            loader: notificationsLoader,
          },
          { path: "profile", element: <AccountPage /> },
          { path: "settings", element: <UserSettings /> },
          { path: "template-builder", element: <TemplateBuilderPage /> },
          { path: "create-challan", element: <CreateChallanPage /> },
          { path: "create-proforma", element: <CreateProformaPage /> },
          { path: "create-quotation", element: <CreateQuotationPage /> },
          { path: "create-invoice", element: <CreateInvoicePage /> },
          {
            path: "customers",
            element: <CustomersLayout />,
            children: [
              { index: true, element: <CustomersPage /> },
              { path: ":customerId", element: <CustomerDetailPage /> },
            ],
          },
          {
            path: "items",
            element: <ItemsLayout />,
            children: [
              { index: true, element: <ItemsPage /> },
              {
                path: ":itemId",
                element: <ItemDetailPage />,
                loader: itemDetailLoader,
              },
            ],
          },
          {
            path: "invoice-history",
            element: <InvoiceHistoryLayout />,
            children: [
              { index: true, element: <InvoiceHistoryPage /> },
              { path: ":invoiceId", element: <InvoiceDetailPage /> },
            ],
          },
          {
            path: "data-tables",
            element: <DataTablesLayout />,
            children: [
              {
                index: true,
                element: <DataTablesPage />,
                loader: dataTablesLoader,
              },
              { path: "new", element: <CreateTablePageRoute /> },
              {
                path: ":tableId",
                element: <TableViewPage />,
                loader: tableViewLoader,
              },
            ],
          },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
])
