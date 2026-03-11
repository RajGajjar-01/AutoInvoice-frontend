import { createFileRoute, Link } from "@tanstack/react-router"
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  CircleDashed,
  CircleX,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  LineChart as LineChartIcon,
  Users,
  FileText,
} from "lucide-react"
import { useMemo } from "react"
import { useTheme } from "next-themes"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import useLocalStorage from "@/hooks/useLocalStorage"

export const Route = createFileRoute("/_layout/insights")({
  component: InsightsPage,
  head: () => ({
    meta: [{ title: "Insights" }],
  }),
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCurrencySymbol(currency) {
  if (currency === "INR") return "₹"
  if (currency === "USD") return "$"
  if (currency === "EUR") return "€"
  if (currency === "GBP") return "£"
  return currency || "₹"
}

function fmt(num, currency) {
  const cs = getCurrencySymbol(currency)
  return `${cs}${Number(num || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

function pct(a, b) {
  if (!b) return null
  return Math.round(((a - b) / b) * 100)
}

function monthLabel(date) {
  return date.toLocaleString("en-IN", { month: "short" })
}

function getLastNMonths(n) {
  const months = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const start = new Date(d.getFullYear(), d.getMonth(), 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
    months.push({ label: monthLabel(d), start, end })
  }
  return months
}

// ─── Chart colour tokens ───────────────────────────────────────────────────────

const COLORS = {
  paid: "hsl(142 71% 45%)",
  unpaid: "hsl(43 96% 56%)",
  overdue: "hsl(0 72% 51%)",
  revenue: "hsl(217 91% 60%)",
}

// ─── Custom Tooltips ──────────────────────────────────────────────────────────

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md text-popover-foreground">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  )
}

function VolumeTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md text-popover-foreground">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, title, value, sub, trend, trendUp, iconClass, valueClass }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`rounded-lg p-2 ${iconClass}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueClass ?? ""}`}>{value}</div>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {trend !== null && trend !== undefined && (
            <Badge
              variant={trendUp ? "default" : "destructive"}
              className="text-xs font-medium gap-0.5 px-1.5"
            >
              {trendUp ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
              {Math.abs(trend)}%
            </Badge>
          )}
          {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
        </div>
      </CardContent>
    </Card>
  )
}

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="rounded-lg bg-primary/10 p-2 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  )
}

function EmptyInsights() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-6">
      <div className="rounded-full bg-muted p-6">
        <LineChartIcon className="h-10 w-10 text-muted-foreground" />
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">No financial data yet</h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Create your first invoice or load demo data from Settings to see insights here.
        </p>
      </div>
      <div className="flex gap-3">
        <Link to="/create-invoice">
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Create Document
          </Button>
        </Link>
        <Link to="/settings">
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            Load Demo Data
          </Button>
        </Link>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

function InsightsPage() {
  const [invoices] = useLocalStorage("invoices", [])
  const { resolvedTheme } = useTheme()

  // SVG fill attributes don't resolve CSS custom properties (particularly oklch-based
  // vars used in this project), so we supply explicit hex colours from the resolved theme.
  const tickColor = resolvedTheme === "dark" ? "#94a3b8" : "#64748b"

  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const sixtyDaysAgo = new Date(now)
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

  // ── Core KPIs ────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const totalRevenue = invoices.reduce((s, i) => s + (Number(i.grandTotal) || 0), 0)

    const thisMonthInv = invoices.filter((i) => new Date(i.createdAt || i.invoiceDate) >= thirtyDaysAgo)
    const prevMonthInv = invoices.filter((i) => {
      const d = new Date(i.createdAt || i.invoiceDate)
      return d >= sixtyDaysAgo && d < thirtyDaysAgo
    })
    const thisRevenue = thisMonthInv.reduce((s, i) => s + (Number(i.grandTotal) || 0), 0)
    const prevRevenue = prevMonthInv.reduce((s, i) => s + (Number(i.grandTotal) || 0), 0)

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
      totalRevenue, thisRevenue, prevRevenue,
      outstanding, overdueAmt, unpaidAmt,
      overdueCount, unpaidCount, paidCount,
      avgInvoice,
      revTrend: pct(thisRevenue, prevRevenue),
    }
  }, [invoices])

  // ── Monthly chart data (last 6 months) ────────────────────────────────────
  const months = getLastNMonths(6)
  const monthlyChartData = useMemo(() => {
    return months.map(({ label, start, end }) => {
      const bucket = invoices.filter((i) => {
        const d = new Date(i.createdAt || i.invoiceDate)
        return d >= start && d <= end
      })
      return {
        month: label,
        revenue: bucket.reduce((s, i) => s + (Number(i.grandTotal) || 0), 0),
        paid: bucket.filter((i) => i.status === "paid").length,
        unpaid: bucket.filter((i) => i.status === "unpaid").length,
        overdue: bucket.filter((i) => i.status === "overdue").length,
      }
    })
  }, [invoices])

  // ── Invoice status pie data ───────────────────────────────────────────────
  const pieData = useMemo(() => {
    return [
      { name: "Paid", value: kpis.paidCount, color: COLORS.paid },
      { name: "Unpaid", value: kpis.unpaidCount, color: COLORS.unpaid },
      { name: "Overdue", value: kpis.overdueCount, color: COLORS.overdue },
    ].filter((d) => d.value > 0)
  }, [kpis])

  // ── Top 5 customers by revenue ────────────────────────────────────────────
  const topCustomers = useMemo(() => {
    const map = {}
    for (const inv of invoices) {
      const name = inv.customer?.name || "Unknown"
      map[name] = (map[name] || 0) + (Number(inv.grandTotal) || 0)
    }
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, revenue]) => ({ name: name.length > 15 ? `${name.slice(0, 13)}…` : name, revenue }))
  }, [invoices])

  if (!invoices.length) return <EmptyInsights />

  // Tooltip content style (uses explicit hex so it works regardless of CSS var format)
  const tooltipContentStyle = {
    borderRadius: "8px",
    fontSize: "12px",
    border: "1px solid",
    borderColor: resolvedTheme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    background: resolvedTheme === "dark" ? "#1e1e1e" : "#ffffff",
    color: resolvedTheme === "dark" ? "#f8fafc" : "#0f172a",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  }

  return (
    <div className="flex flex-col gap-8">

      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Financial overview, revenue trends, and collection analytics.
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={IndianRupee}
          title="Total Revenue"
          value={fmt(kpis.totalRevenue)}
          sub="all invoices"
          iconClass="bg-emerald-500/10 text-emerald-500"
          valueClass="text-emerald-600 dark:text-emerald-400"
        />
        <KpiCard
          icon={TrendingUp}
          title="This Month"
          value={fmt(kpis.thisRevenue)}
          sub={kpis.prevRevenue > 0 ? "vs last 30 days" : "last 30 days"}
          trend={kpis.revTrend}
          trendUp={(kpis.revTrend ?? 0) >= 0}
          iconClass="bg-blue-500/10 text-blue-500"
          valueClass="text-blue-600 dark:text-blue-400"
        />
        <KpiCard
          icon={CircleDashed}
          title="Outstanding"
          value={fmt(kpis.outstanding)}
          sub={`${kpis.unpaidCount + kpis.overdueCount} invoices pending`}
          iconClass={kpis.overdueCount > 0 ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-500"}
          valueClass={kpis.overdueCount > 0 ? "text-destructive" : "text-amber-600 dark:text-amber-400"}
        />
        <KpiCard
          icon={BarChart3}
          title="Avg Invoice"
          value={fmt(kpis.avgInvoice)}
          sub={`across ${invoices.length} invoice${invoices.length !== 1 ? "s" : ""}`}
          iconClass="bg-violet-500/10 text-violet-500"
        />
      </div>

      {/* ── Revenue Trend + Invoice Status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Area Chart – Revenue Trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <SectionHeader
              icon={TrendingUp}
              title="Revenue Trend"
              description="Monthly revenue for the last 6 months"
            />
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.revenue} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={COLORS.revenue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: tickColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: tickColor }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => fmt(v)}
                  width={70}
                />
                <Tooltip content={<RevenueTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke={COLORS.revenue}
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                  dot={{ r: 3, fill: COLORS.revenue, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Donut Chart – Invoice Status */}
        <Card>
          <CardHeader className="pb-2">
            <SectionHeader
              icon={FileText}
              title="Invoice Status"
              description="Distribution by payment status"
            />
          </CardHeader>
          <CardContent className="pt-0 flex flex-col items-center gap-4">
            {pieData.length > 0 ? (
              <>
                {/* overflow:visible lets the Recharts tooltip escape the SVG bounds */}
                <div style={{ width: "100%", height: 200, overflow: "visible" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 16, right: 16, bottom: 16, left: 16 }}>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [
                          `${value} invoice${value !== 1 ? "s" : ""}`,
                          name,
                        ]}
                        contentStyle={tooltipContentStyle}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-1.5 w-full text-sm">
                  {pieData.map((d) => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                        <span className="text-muted-foreground">{d.name}</span>
                      </div>
                      <span className="font-medium">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground py-8">No invoices yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Receivables Detail ── */}
      {(kpis.unpaidCount > 0 || kpis.overdueCount > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader
              icon={CircleDashed}
              title="Receivables Breakdown"
              description="Pending amounts by status"
            />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Unpaid */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <CircleDashed className="h-4 w-4 text-amber-500" />
                  <span className="text-muted-foreground font-medium">Unpaid</span>
                  <Badge variant="secondary" className="text-xs ml-auto">{kpis.unpaidCount}</Badge>
                </div>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{fmt(kpis.unpaidAmt)}</p>
                <p className="text-xs text-muted-foreground">awaiting payment</p>
              </div>

              <div className="hidden sm:flex items-center justify-center">
                <Separator orientation="vertical" className="h-16" />
              </div>

              {/* Overdue */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <CircleX className="h-4 w-4 text-destructive" />
                  <span className="text-muted-foreground font-medium">Overdue</span>
                  <Badge variant="destructive" className="text-xs ml-auto">{kpis.overdueCount}</Badge>
                </div>
                <p className="text-2xl font-bold text-destructive">{fmt(kpis.overdueAmt)}</p>
                <p className="text-xs text-muted-foreground">past due date</p>
                {kpis.overdueCount > 0 && (
                  <div className="flex items-center gap-1.5 rounded-md bg-destructive/5 border border-destructive/20 px-2.5 py-1.5 mt-1">
                    <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />
                    <p className="text-xs text-destructive">Follow up required</p>
                  </div>
                )}
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>Total Outstanding</span>
              <span className="text-primary text-lg">{fmt(kpis.outstanding)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Top Customers + Monthly Volume ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Customers – horizontal bar */}
        <Card>
          <CardHeader className="pb-2">
            <SectionHeader
              icon={Users}
              title="Top Customers"
              description="By total invoice value (top 5)"
            />
          </CardHeader>
          <CardContent className="pt-0">
            {topCustomers.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  layout="vertical"
                  data={topCustomers}
                  margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: tickColor }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => fmt(v)}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: tickColor }}
                    axisLine={false}
                    tickLine={false}
                    width={90}
                  />
                  <Tooltip content={<RevenueTooltip />} />
                  <Bar dataKey="revenue" name="Revenue" fill={COLORS.revenue} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">No customer data</p>
            )}
          </CardContent>
        </Card>

        {/* Monthly Invoice Volume – grouped bar */}
        <Card>
          <CardHeader className="pb-2">
            <SectionHeader
              icon={BarChart3}
              title="Monthly Volume"
              description="Invoice count by status (last 6 months)"
            />
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={monthlyChartData}
                margin={{ top: 0, right: 8, left: -20, bottom: 0 }}
                barSize={12}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: tickColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: tickColor }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<VolumeTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="paid" name="Paid" fill={COLORS.paid} radius={[2, 2, 0, 0]} />
                <Bar dataKey="unpaid" name="Unpaid" fill={COLORS.unpaid} radius={[2, 2, 0, 0]} />
                <Bar dataKey="overdue" name="Overdue" fill={COLORS.overdue} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default InsightsPage
