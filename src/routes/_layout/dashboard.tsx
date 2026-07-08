import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CircleDashed,
  CircleX,
  FilePlus,
  FileText,
  Package,
  PackagePlus,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react"
import { useMemo } from "react"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DashboardSkeleton } from "@/features/dashboard/components/DashboardSkeleton"
import { KpiCard } from "@/features/dashboard/components/KpiCard"
import { useDashboard } from "@/features/dashboard/hooks/useDashboard"
import { QuickActionRow } from "@/features/invoices/components/QuickActionRow"
import { StatusBadge } from "@/features/invoices/components/StatusBadge"
import { fmtShort } from "@/features/invoices/utils"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

function build30DayData(
  invoices: { invoiceDate?: string; grandTotal: number | string; status: string }[],
) {
  const days: { label: string; revenue: number }[] = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    const revenue = invoices
      .filter(
        (inv) =>
          inv.invoiceDate === key && inv.status === "paid",
      )
      .reduce((s, inv) => s + (Number(inv.grandTotal) || 0), 0)
    days.push({ label, revenue })
  }
  return days
}

function Dashboard() {
  useDocumentTitle("Dashboard")
  const {
    stats,
    recent,
    invoices,
    items,
    greeting,
    firstName,
    hasData,
    isLoading,
  } = useDashboard()

  const chartData = useMemo(() => build30DayData(invoices), [invoices])
  const hasChartData = chartData.some((d) => d.revenue > 0)

  if (isLoading) return <DashboardSkeleton />

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between animate-in">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {greeting}, {firstName}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {hasData
              ? "Here's your business overview for today."
              : "Welcome to AutoInvoice. Load demo data from Settings → Demo Data to get started."}
          </p>
        </div>
        <Link to="/create-invoice">
          <Button>
            <FilePlus className="mr-2 h-4 w-4" /> New Invoice
          </Button>
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in animate-in-delay-1">
        <KpiCard
          icon={TrendingUp}
          title="Total Revenue"
          value={fmtShort(stats.totalRevenue)}
          sub="all invoices"
          iconClass="bg-emerald-500/10 text-emerald-500"
          valueClass="text-emerald-600 dark:text-emerald-400"
        />
        <KpiCard
          icon={FileText}
          title="Total Invoices"
          value={stats.totalInvoices}
          sub={`${stats.paidCount} paid`}
          iconClass="bg-primary/10 text-primary"
        />
        <KpiCard
          icon={Users}
          title="Customers"
          value={stats.totalCustomers}
          sub="active"
          iconClass="bg-blue-500/10 text-blue-500"
        />
        <KpiCard
          icon={Package}
          title="Items in Stock"
          value={stats.inStockItems}
          sub={
            stats.outItems > 0
              ? `${stats.outItems} out of stock`
              : stats.lowStockItems > 0
                ? `${stats.lowStockItems} running low`
                : `of ${items.length} total`
          }
          iconClass="bg-violet-500/10 text-violet-500"
          valueClass={stats.outItems > 0 ? "text-destructive" : ""}
        />
      </div>

      {/* Revenue sparkline */}
      <Card className="animate-in animate-in-delay-1">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Revenue — Last 30 Days</CardTitle>
              <CardDescription className="text-xs">
                Paid invoices only
              </CardDescription>
            </div>
            <Link to="/insights">
              <Button variant="ghost" size="sm" className="text-primary gap-1 text-xs">
                Full Insights <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {hasChartData ? (
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  interval={6}
                />
                <Tooltip
                  formatter={(v: number) => [fmtShort(v), "Revenue"]}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    color: "var(--foreground)",
                  }}
                  cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                />
                <Bar
                  dataKey="revenue"
                  fill="var(--primary)"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[100px] text-xs text-muted-foreground">
              No paid invoices in the last 30 days
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent invoices + right col */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start animate-in animate-in-delay-2">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base">Recent Invoices</CardTitle>
              <CardDescription className="text-xs">
                Your last 5 invoices
              </CardDescription>
            </div>
            <Link to="/invoices">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary gap-1 text-xs"
              >
                Manage All <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-semibold mb-1">No invoices yet</h3>
                <p className="text-xs text-muted-foreground mb-4 max-w-xs">
                  Load demo data from Settings to populate a working demo.
                </p>
                <Link to="/create-invoice">
                  <Button size="sm">
                    <FilePlus className="mr-2 h-3.5 w-3.5" /> Create Invoice
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.map((inv) => (
                    <TableRow
                      key={inv.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-mono text-sm font-medium">
                        <Link
                          to={`/invoice-history/${inv.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {inv.invoiceNumber}
                          <p className="text-xs text-muted-foreground font-sans font-normal mt-0.5">
                            {inv.invoiceDate || "—"}
                          </p>
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">
                        <Link
                          to={`/invoice-history/${inv.id}`}
                          className="block hover:text-primary transition-colors"
                        >
                          {inv.customer?.name || "—"}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right font-medium text-sm">
                        <Link
                          to={`/invoice-history/${inv.id}`}
                          className="block hover:text-primary transition-colors"
                        >
                          {fmtShort(inv.grandTotal, inv.currency)}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={inv.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          {hasData && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Receivables</CardTitle>
                <CardDescription className="text-xs">
                  Pending amounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <CircleDashed className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-muted-foreground">Unpaid</span>
                    <Badge variant="secondary" className="text-xs">
                      {stats.unpaidCount}
                    </Badge>
                  </div>
                  <span className="font-medium">
                    {fmtShort(
                      invoices
                        .filter((i) => i.status === "unpaid")
                        .reduce((s, i) => s + (Number(i.grandTotal) || 0), 0),
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <CircleX className="h-3.5 w-3.5 text-destructive" />
                    <span className="text-muted-foreground">Overdue</span>
                    <Badge variant="destructive" className="text-xs">
                      {stats.overdueCount}
                    </Badge>
                  </div>
                  <span className="font-medium text-destructive">
                    {fmtShort(
                      invoices
                        .filter((i) => i.status === "overdue")
                        .reduce((s, i) => s + (Number(i.grandTotal) || 0), 0),
                    )}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm font-bold">
                  <span>Total Outstanding</span>
                  <span className="text-primary">
                    {fmtShort(stats.outstanding)}
                  </span>
                </div>
                {stats.overdueCount > 0 && (
                  <div className="flex items-center gap-2 rounded-lg bg-destructive/5 border border-destructive/20 px-3 py-2 mt-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                    <p className="text-xs text-destructive">
                      {stats.overdueCount} invoice
                      {stats.overdueCount !== 1 ? "s" : ""} past due
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-1">
              <QuickActionRow
                icon={FilePlus}
                iconClass="bg-primary/10 text-primary"
                title="Create Invoice"
                description="Generate a new professional invoice"
                to="/create-invoice"
              />
              <QuickActionRow
                icon={UserPlus}
                iconClass="bg-blue-500/10 text-blue-500"
                title="Add Customer"
                description="Register a new customer or supplier"
                to="/customers"
              />
              <QuickActionRow
                icon={PackagePlus}
                iconClass="bg-violet-500/10 text-violet-500"
                title="Add Item"
                description="Add a product or service to inventory"
                to="/items"
              />
            </CardContent>
          </Card>

          {(stats.lowStockItems > 0 || stats.outItems > 0) && (
            <Card className="border-amber-500/30">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <CardTitle className="text-base text-amber-600 dark:text-amber-400">
                    Stock Alert
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {stats.outItems > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Out of stock</span>
                    <Badge variant="destructive" className="text-xs">
                      {stats.outItems} items
                    </Badge>
                  </div>
                )}
                {stats.lowStockItems > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Running low</span>
                    <Badge
                      variant="outline"
                      className="text-xs border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    >
                      {stats.lowStockItems} items
                    </Badge>
                  </div>
                )}
                <Link to="/items">
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    <BarChart3 className="mr-2 h-3.5 w-3.5" /> View Inventory
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
