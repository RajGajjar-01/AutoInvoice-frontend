import { createFileRoute, Link } from "@tanstack/react-router"
import {
  FileText,
  Users,
  Package,
  FilePlus,
  UserPlus,
  PackagePlus,
  History,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  CircleDashed,
  CircleX,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  LineChart,
} from "lucide-react"
import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import useLocalStorage from "@/hooks/useLocalStorage"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/dashboard")({
  component: Dashboard,
  head: () => ({
    meta: [{ title: "Dashboard" }],
  }),
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pct(a, b) {
  if (!b) return 0
  return Math.round(((a - b) / b) * 100)
}

const statusVariant = {
  paid: "default",
  unpaid: "secondary",
  overdue: "destructive",
}
const statusIcon = {
  paid: CheckCircle2,
  unpaid: CircleDashed,
  overdue: CircleX,
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
        <div className="flex items-center gap-1.5 mt-1.5">
          {trend !== undefined && (
            <Badge
              variant={trendUp ? "default" : "destructive"}
              className="text-xs font-medium gap-0.5 px-1.5"
            >
              {trendUp
                ? <TrendingUp className="h-2.5 w-2.5" />
                : <TrendingDown className="h-2.5 w-2.5" />}
              {Math.abs(trend)}%
            </Badge>
          )}
          {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
        </div>
      </CardContent>
    </Card>
  )
}

function QuickActionRow({ icon: Icon, iconClass, title, description, to }) {
  return (
    <Link to={to} className="group">
      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer">
        <div className={`rounded-lg p-2 shrink-0 ${iconClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
      </div>
    </Link>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

function Dashboard() {
  const { user: currentUser } = useAuth()
  const [invoices] = useLocalStorage("invoices", [])
  const [customers] = useLocalStorage("customers", [])
  const [items] = useLocalStorage("items", [])

  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const sixtyDaysAgo = new Date(now)
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

  const stats = useMemo(() => {
    const thisMonthInv = invoices.filter((i) => {
      const d = new Date(i.createdAt || i.invoiceDate)
      return d >= thirtyDaysAgo
    })
    const prevMonthInv = invoices.filter((i) => {
      const d = new Date(i.createdAt || i.invoiceDate)
      return d >= sixtyDaysAgo && d < thirtyDaysAgo
    })

    const totalInvoices = invoices.length
    const thisMonthCount = thisMonthInv.length
    const prevMonthCount = prevMonthInv.length
    const overdueCount = invoices.filter((i) => i.status === "overdue").length

    const totalCustomers = customers.filter(
      (c) => c.partyType === "customer" || c.partyType === "both"
    ).length

    const inStockItems = items.filter((it) => (it.stock ?? 0) > (it.lowStockThreshold ?? 5)).length
    const lowStockItems = items.filter((it) => {
      const s = it.stock ?? 0
      return s > 0 && s <= (it.lowStockThreshold ?? 5)
    }).length
    const outItems = items.filter((it) => (it.stock ?? 0) === 0).length

    return {
      totalInvoices, thisMonthCount, prevMonthCount, overdueCount,
      totalCustomers, inStockItems, lowStockItems, outItems,
    }
  }, [invoices, customers, items])

  const recent = useMemo(
    () =>
      [...invoices]
        .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
        .slice(0, 5),
    [invoices],
  )

  const countTrend = pct(stats.thisMonthCount, stats.prevMonthCount)

  const hour = now.getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
  const firstName = currentUser?.full_name?.split(" ")[0] || currentUser?.email || "there"
  const hasData = invoices.length > 0 || customers.length > 0 || items.length > 0

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting}, {firstName}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {hasData
              ? "Here's what's happening with your business today."
              : "Welcome to UnifiedDesk. Load demo data from Settings → Demo Data to get started."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/insights">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <LineChart className="h-3.5 w-3.5" />
              Insights
            </Button>
          </Link>
          <Link to="/create-invoice">
            <Button>
              <FilePlus className="mr-2 h-4 w-4" />
              New Document
            </Button>
          </Link>
        </div>
      </div>

      {/* ── KPI Cards – no money figures ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          icon={FileText}
          title="Total Invoices"
          value={stats.totalInvoices}
          sub={stats.prevMonthCount > 0 ? "vs last 30 days" : "all time"}
          trend={stats.prevMonthCount > 0 ? countTrend : undefined}
          trendUp={countTrend >= 0}
          iconClass="bg-primary/10 text-primary"
        />
        <KpiCard
          icon={Users}
          title="Active Customers"
          value={stats.totalCustomers}
          sub={`${customers.length} total parties`}
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
                : `of ${items.length} total items`
          }
          iconClass="bg-violet-500/10 text-violet-500"
          valueClass={stats.outItems > 0 ? "text-destructive" : ""}
        />
      </div>

      {/* ── Body ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Recent Invoices – no Amount column */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base">Recent Invoices</CardTitle>
              <CardDescription className="text-xs">Your last 5 invoices</CardDescription>
            </div>
            <Link to="/invoices">
              <Button variant="ghost" size="sm" className="text-primary gap-1 text-xs">
                View All
                <ArrowUpRight className="h-3.5 w-3.5" />
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
                    <FilePlus className="mr-2 h-3.5 w-3.5" />
                    Create Document
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.map((inv) => {
                    const StatusIcon = statusIcon[inv.status] ?? CircleDashed
                    return (
                      <TableRow
                        key={inv.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-mono text-sm font-medium">
                          <Link
                            to="/invoice-history/$invoiceId"
                            params={{ invoiceId: inv.id }}
                            className="hover:text-primary transition-colors"
                          >
                            {inv.invoiceNumber}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm">
                          <Link
                            to="/invoice-history/$invoiceId"
                            params={{ invoiceId: inv.id }}
                            className="block hover:text-primary transition-colors"
                          >
                            {inv.customer?.name || "—"}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {inv.invoiceDate || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={statusVariant[inv.status] ?? "outline"}
                            className="capitalize gap-1 text-xs"
                          >
                            <StatusIcon className="h-3 w-3" />
                            {inv.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4">

          {/* Insights promo card */}
          {hasData && (
            <Link to="/insights">
              <Card className="border-primary/20 bg-primary/5 hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="py-4 flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">Financial Insights</p>
                    <p className="text-xs text-muted-foreground">Revenue, receivables & trends</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
                </CardContent>
              </Card>
            </Link>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-1">
              <QuickActionRow
                icon={FilePlus}
                iconClass="bg-primary/10 text-primary"
                title="Create Document"
                description="Generate a new professional document"
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
              <QuickActionRow
                icon={History}
                iconClass="bg-emerald-500/10 text-emerald-500"
                title="Invoice History"
                description="Search and manage all invoices"
                to="/invoices"
              />
            </CardContent>
          </Card>

          {/* Inventory Alert */}
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
                    <Badge variant="destructive" className="text-xs">{stats.outItems} items</Badge>
                  </div>
                )}
                {stats.lowStockItems > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Running low</span>
                    <Badge variant="outline" className="text-xs border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      {stats.lowStockItems} items
                    </Badge>
                  </div>
                )}
                <Link to="/items">
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    <BarChart3 className="mr-2 h-3.5 w-3.5" />
                    View Inventory
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
