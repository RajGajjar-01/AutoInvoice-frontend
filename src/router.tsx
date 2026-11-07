import { createBrowserRouter } from "react-router"
import ErrorComponent from "@/components/Common/ErrorComponent"
import MinimalLayout from "@/components/Common/MinimalLayout"
import NotFound from "@/components/Common/NotFound"
import ProtectedLayout from "@/components/Common/ProtectedLayout"
import CustomersLayout from "@/routes/_layout/customers"
import DataTablesLayout from "@/routes/_layout/data-tables"
import InvoiceHistoryLayout from "@/routes/_layout/invoice-history"
import ItemsLayout from "@/routes/_layout/items"
import LandingPage from "@/routes/index"
import Login from "@/routes/login"
import { lazyPage, pages } from "@/routes/pages"
import SignUp from "@/routes/signup"

export const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorComponent />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "landing", element: <LandingPage /> },
      { path: "login", element: <Login /> },
      { path: "privacy-policy", lazy: lazyPage(pages.privacyPolicy) },
      { path: "signup", element: <SignUp /> },
      { path: "verify-email", lazy: lazyPage(pages.verifyEmail) },
      { path: "recover-password", lazy: lazyPage(pages.recoverPassword) },
      { path: "reset-password", lazy: lazyPage(pages.resetPassword) },
      {
        element: <ProtectedLayout />,
        children: [
          { path: "admin", lazy: lazyPage(pages.admin) },
          { path: "dashboard", lazy: lazyPage(pages.dashboard) },
          { path: "insights", lazy: lazyPage(pages.insights) },
          { path: "invoices", lazy: lazyPage(pages.invoices) },
          {
            path: "invoice-templates",
            lazy: lazyPage(pages.invoiceTemplates),
          },
          { path: "notifications", lazy: lazyPage(pages.notifications) },
          { path: "profile", lazy: lazyPage(pages.profile) },
          { path: "settings", lazy: lazyPage(pages.settings) },
          { path: "create-invoice", lazy: lazyPage(pages.createInvoice) },
          { path: "create-challan", lazy: lazyPage(pages.createChallan) },
          { path: "create-proforma", lazy: lazyPage(pages.createProforma) },
          {
            path: "create-quotation",
            lazy: lazyPage(pages.createQuotation),
          },
          {
            path: "customers",
            element: <CustomersLayout />,
            children: [
              { index: true, lazy: lazyPage(pages.customers) },
              { path: ":customerId", lazy: lazyPage(pages.customerDetail) },
            ],
          },
          {
            path: "items",
            element: <ItemsLayout />,
            children: [
              { index: true, lazy: lazyPage(pages.items) },
              { path: ":itemId", lazy: lazyPage(pages.itemDetail) },
            ],
          },
          {
            path: "invoice-history",
            element: <InvoiceHistoryLayout />,
            children: [
              { index: true, lazy: lazyPage(pages.invoiceHistory) },
              { path: ":invoiceId", lazy: lazyPage(pages.invoiceDetail) },
            ],
          },
          {
            path: "data-tables",
            element: <DataTablesLayout />,
            children: [
              { index: true, lazy: lazyPage(pages.dataTables) },
              { path: "new", lazy: lazyPage(pages.dataTableNew) },
              { path: ":tableId", lazy: lazyPage(pages.dataTableView) },
            ],
          },
        ],
      },
      {
        element: <MinimalLayout />,
        children: [
          {
            path: "template-builder",
            lazy: lazyPage(pages.templateBuilder),
          },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
])
