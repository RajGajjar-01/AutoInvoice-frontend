import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { customersListQueryOptions } from "@/features/customers/queries"
import {
  invoicesListQueryOptions,
  invoicesStatsQueryOptions,
} from "@/features/invoices/queries"
import useAuth from "@/hooks/useAuth"
import useLocalStorage from "@/hooks/useLocalStorage"

interface Item {
  id: string
  name: string
  stock?: number
  lowStockThreshold?: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  invoiceDate?: string
  status: string
  grandTotal: number | string
  currency?: string
  createdAt?: string
  customer?: { name?: string }
}

export function useDashboard() {
  const { user: currentUser } = useAuth()
  const [items] = useLocalStorage<Item[]>("items", [])

  const { data: statsRes, isLoading: statsLoading } = useQuery(
    invoicesStatsQueryOptions(),
  )
  const { data: invoicesRes, isLoading: invoicesLoading } = useQuery(
    invoicesListQueryOptions(),
  )
  const { data: customersRes, isLoading: customersLoading } = useQuery(
    customersListQueryOptions(),
  )

  const invoices: Invoice[] = (invoicesRes?.data ?? []).filter(
    Boolean,
  ) as unknown as Invoice[]
  const customers = customersRes?.data ?? []

  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const stats = useMemo(() => {
    const overdueCount = invoices.filter((i) => i.status === "overdue").length
    const unpaidCount = invoices.filter((i) => i.status === "unpaid").length
    const inStockItems = items.filter(
      (it) => (it.stock ?? 0) > (it.lowStockThreshold ?? 5),
    ).length
    const lowStockItems = items.filter((it) => {
      const s = it.stock ?? 0
      return s > 0 && s <= (it.lowStockThreshold ?? 5)
    }).length
    const outItems = items.filter((it) => (it.stock ?? 0) === 0).length

    return {
      totalRevenue: Number(statsRes?.total_revenue ?? 0),
      totalInvoices: Number(statsRes?.total_invoices ?? 0),
      paidCount: Number(statsRes?.paid_count ?? 0),
      unpaidCount: Number(statsRes?.unpaid_count ?? unpaidCount),
      overdueCount: Number(statsRes?.overdue_count ?? overdueCount),
      totalCustomers: Number(statsRes?.total_customers ?? 0),
      outstanding: invoices
        .filter((i) => i.status === "unpaid" || i.status === "overdue")
        .reduce((s, i) => s + (Number(i.grandTotal) || 0), 0),
      inStockItems,
      lowStockItems,
      outItems,
      prevRevenue: 0,
      prevMonthCount: 0,
    }
  }, [invoices, items, statsRes])

  const recent = useMemo(
    () =>
      [...invoices]
        .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
        .slice(0, 5),
    [invoices],
  )

  const hour = now.getHours()
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
  const firstName =
    currentUser?.full_name?.split(" ")[0] || currentUser?.email || "there"

  const hasData =
    invoices.length > 0 ||
    Number(statsRes?.total_customers ?? 0) > 0 ||
    items.length > 0
  const isLoading = statsLoading || invoicesLoading || customersLoading

  return {
    stats,
    recent,
    invoices,
    customers,
    items,
    greeting,
    firstName,
    hasData,
    isLoading,
  }
}
