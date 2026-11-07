import type { ComponentType } from "react"
import type { LoaderFunction } from "react-router"

type PageModule = { default: ComponentType; loader?: LoaderFunction }

// One import per page so the router (lazy) and prefetch share the same chunk.
export const pages = {
  admin: () => import("@/routes/_layout/admin"),
  dashboard: () => import("@/routes/_layout/dashboard"),
  insights: () => import("@/routes/_layout/insights"),
  invoices: () => import("@/routes/_layout/invoices"),
  invoiceTemplates: () => import("@/routes/_layout/invoice-templates"),
  notifications: () => import("@/routes/_layout/notifications"),
  profile: () => import("@/routes/_layout/profile"),
  settings: () => import("@/routes/_layout/settings"),
  createInvoice: () => import("@/routes/_layout/create-invoice"),
  createChallan: () => import("@/routes/_layout/create-challan"),
  createProforma: () => import("@/routes/_layout/create-proforma"),
  createQuotation: () => import("@/routes/_layout/create-quotation"),
  customers: () => import("@/routes/_layout/customers/index"),
  customerDetail: () => import("@/routes/_layout/customers.$customerId"),
  items: () => import("@/routes/_layout/items/index"),
  itemDetail: () => import("@/routes/_layout/items.$itemId"),
  invoiceHistory: () => import("@/routes/_layout/invoice-history/index"),
  invoiceDetail: () => import("@/routes/_layout/invoice-history.$invoiceId"),
  dataTables: () => import("@/routes/_layout/data-tables/index"),
  dataTableNew: () => import("@/routes/_layout/data-tables.new"),
  dataTableView: () => import("@/routes/_layout/data-tables.$tableId"),
  templateBuilder: () => import("@/routes/_layout/template-builder"),
  privacyPolicy: () => import("@/routes/privacy-policy"),
  verifyEmail: () => import("@/routes/verify-email"),
  recoverPassword: () => import("@/routes/recover-password"),
  resetPassword: () => import("@/routes/reset-password"),
} satisfies Record<string, () => Promise<PageModule>>

/** Route `lazy` for a page module: its default export plus its loader, if any. */
export const lazyPage = (load: () => Promise<PageModule>) => async () => {
  const m = await load()
  return { Component: m.default, loader: m.loader }
}

// First path segment → page chunk, for prefetch on touch/hover.
const byPath: Record<string, () => Promise<unknown>> = {
  dashboard: pages.dashboard,
  insights: pages.insights,
  invoices: pages.invoices,
  "invoice-templates": pages.invoiceTemplates,
  notifications: pages.notifications,
  profile: pages.profile,
  settings: pages.settings,
  "create-invoice": pages.createInvoice,
  customers: pages.customers,
  items: pages.items,
  "invoice-history": pages.invoiceHistory,
  "data-tables": pages.dataTables,
  "template-builder": pages.templateBuilder,
  admin: pages.admin,
}

/** Starts loading a page's code before the tap finishes. Safe to call many times. */
export function prefetchPage(to: string) {
  byPath[to.split("/")[1]]?.().catch(() => {})
}
