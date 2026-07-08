import { useQuery } from "@tanstack/react-query"
import { useTheme } from "next-themes"
import { useMemo } from "react"
import { customersListQueryOptions } from "@/features/customers/queries"
import {
  invoicesListQueryOptions,
  invoicesStatsQueryOptions,
} from "@/features/invoices/queries"

function pct(a: number, b: number): number | null {
  if (!b) return null
  return Math.round(((a - b) / b) * 100)
}

function monthLabel(date: Date): string {
  return date.toLocaleString("en-IN", { month: "short" })
}

interface MonthBucket {
  label: string
  start: Date
  end: Date
}

function getLastNMonths(n: number): MonthBucket[] {
  const months: MonthBucket[] = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      label: monthLabel(d),
      start: new Date(d.getFullYear(), d.getMonth(), 1),
      end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
    })
  }
  return months
}

export const INSIGHT_COLORS: Record<string, string> = {
  paid: "hsl(142 71% 45%)",
  unpaid: "hsl(43 96% 56%)",
  overdue: "hsl(0 72% 51%)",
  revenue: "hsl(217 91% 60%)",
}

interface Invoice {
  id: string
  grandTotal?: number
  createdAt?: string
  invoiceDate?: string
  status: "paid" | "unpaid" | "overdue"
  customer?: { name?: string }
}

export interface MonthlyChartData {
  month: string
  revenue: number
  paid: number
  unpaid: number
  overdue: number
}

export interface PieDataItem {
  name: string
  value: number
  color: string
}

export interface TopCustomer {
  name: string
  revenue: number
}

export function useInsights() {
  const { resolvedTheme } = useTheme()

  const { data: invoicesResponse, isLoading } = useQuery(
    invoicesListQueryOptions(),
  )
  useQuery(invoicesStatsQueryOptions())
  useQuery(customersListQueryOptions())

  const invoices: Invoice[] = (invoicesResponse?.data ?? []).filter(
    Boolean,
  ) as unknown as Invoice[]
  const tickColor = resolvedTheme === "dark" ? "#94a3b8" : "#64748b"

  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const sixtyDaysAgo = new Date(now)
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

  const kpis = useMemo(() => {
    const totalRevenue = invoices.reduce(
      (s, i) => s + (Number(i.grandTotal) || 0),
      0,
    )
    const thisMonthInv = invoices.filter(
      (i) => new Date(i.createdAt || i.invoiceDate || "") >= thirtyDaysAgo,
    )
    const prevMonthInv = invoices.filter((i) => {
      const d = new Date(i.createdAt || i.invoiceDate || "")
      return d >= sixtyDaysAgo && d < thirtyDaysAgo
    })
    const thisRevenue = thisMonthInv.reduce(
      (s, i) => s + (Number(i.grandTotal) || 0),
      0,
    )
    const prevRevenue = prevMonthInv.reduce(
      (s, i) => s + (Number(i.grandTotal) || 0),
      0,
    )
    const outstanding = invoices
      .filter((i) => i.status === "unpaid" || i.status === "overdue")
      .reduce((s, i) => s + (Number(i.grandTotal) || 0), 0)
    const overdueAmt = invoices
      .filter((i) => i.status === "overdue")
      .reduce((s, i) => s + (Number(i.grandTotal) || 0), 0)
    const unpaidAmt = invoices
      .filter((i) => i.status === "unpaid")
      .reduce((s, i) => s + (Number(i.grandTotal) || 0), 0)
    const overdueCount = invoices.filter((i) => i.status === "overdue").length
    const unpaidCount = invoices.filter((i) => i.status === "unpaid").length
    const paidCount = invoices.filter((i) => i.status === "paid").length
    const avgInvoice = invoices.length > 0 ? totalRevenue / invoices.length : 0

    return {
      totalRevenue,
      thisRevenue,
      prevRevenue,
      outstanding,
      overdueAmt,
      unpaidAmt,
      overdueCount,
      unpaidCount,
      paidCount,
      avgInvoice,
      revTrend: pct(thisRevenue, prevRevenue),
    }
  }, [invoices, sixtyDaysAgo, thirtyDaysAgo])

  const months = getLastNMonths(6)

  const monthlyChartData: MonthlyChartData[] = useMemo(
    () =>
      months.map(({ label, start, end }) => {
        const bucket = invoices.filter((i) => {
          const d = new Date(i.createdAt || i.invoiceDate || "")
          return d >= start && d <= end
        })
        return {
          month: label,
          revenue: bucket.reduce((s, i) => s + (Number(i.grandTotal) || 0), 0),
          paid: bucket.filter((i) => i.status === "paid").length,
          unpaid: bucket.filter((i) => i.status === "unpaid").length,
          overdue: bucket.filter((i) => i.status === "overdue").length,
        }
      }),
    [invoices, months],
  )

  const pieData: PieDataItem[] = useMemo(
    () =>
      [
        { name: "Paid", value: kpis.paidCount, color: INSIGHT_COLORS.paid },
        {
          name: "Unpaid",
          value: kpis.unpaidCount,
          color: INSIGHT_COLORS.unpaid,
        },
        {
          name: "Overdue",
          value: kpis.overdueCount,
          color: INSIGHT_COLORS.overdue,
        },
      ].filter((d) => d.value > 0),
    [kpis],
  )

  const topCustomers: TopCustomer[] = useMemo(() => {
    const map: Record<string, number> = {}
    for (const inv of invoices) {
      const name = inv.customer?.name || "Unknown"
      map[name] = (map[name] || 0) + (Number(inv.grandTotal) || 0)
    }
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, revenue]) => ({
        name: name.length > 15 ? `${name.slice(0, 13)}…` : name,
        revenue,
      }))
  }, [invoices])

  return {
    invoices,
    isLoading,
    kpis,
    monthlyChartData,
    pieData,
    topCustomers,
    tickColor,
  }
}
