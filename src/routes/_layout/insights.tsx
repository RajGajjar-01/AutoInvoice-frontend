import {
  AlertTriangle,
  BarChart3,
  CircleDashed,
  CircleX,
  FileText,
  IndianRupee,
  TrendingUp,
  Users,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  RevenueTooltip,
  VolumeTooltip,
} from "@/features/insights/components/ChartTooltips"
import { EmptyInsights } from "@/features/insights/components/EmptyInsights"
import { InsightsKpiCard } from "@/features/insights/components/InsightsKpiCard"
import { InsightsSkeleton } from "@/features/insights/components/InsightsSkeleton"
import { SectionHeader } from "@/features/insights/components/SectionHeader"
import {
  INSIGHT_COLORS,
  useInsights,
} from "@/features/insights/hooks/useInsights"
import { fmtShort } from "@/features/invoices/utils"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

function InsightsPage() {
  useDocumentTitle("Insights")
  const {
    invoices,
    isLoading,
    kpis,
    monthlyChartData,
    pieData,
    topCustomers,
    tickColor,
  } = useInsights()

  if (isLoading) return <InsightsSkeleton />
  if (!invoices.length) return <EmptyInsights />

  const tooltipStyle: React.CSSProperties = {
    borderRadius: "8px",
    fontSize: "12px",
    border: "1px solid",
    borderColor: "rgba(0,0,0,0.1)",
    background: "#ffffff",
    color: "#0f172a",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="animate-in">
        <h1 className="font-display text-2xl font-bold tracking-tight">Insights</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Financial overview, revenue trends, and collection analytics.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in animate-in-delay-1">
        <InsightsKpiCard
          icon={IndianRupee}
          title="Total Revenue"
          value={fmtShort(kpis.totalRevenue)}
          sub="all invoices"
          iconClass="bg-emerald-500/10 text-emerald-500"
          valueClass="text-emerald-600 dark:text-emerald-400"
        />
        <InsightsKpiCard
          icon={TrendingUp}
          title="This Month"
          value={fmtShort(kpis.thisRevenue)}
          sub={kpis.prevRevenue > 0 ? "vs last 30 days" : "last 30 days"}
          trend={kpis.revTrend}
          trendUp={(kpis.revTrend ?? 0) >= 0}
          iconClass="bg-blue-500/10 text-blue-500"
          valueClass="text-blue-600 dark:text-blue-400"
        />
        <InsightsKpiCard
          icon={CircleDashed}
          title="Outstanding"
          value={fmtShort(kpis.outstanding)}
          sub={`${kpis.unpaidCount + kpis.overdueCount} invoices pending`}
          iconClass={
            kpis.overdueCount > 0
              ? "bg-destructive/10 text-destructive"
              : "bg-amber-500/10 text-amber-500"
          }
          valueClass={
            kpis.overdueCount > 0
              ? "text-destructive"
              : "text-amber-600 dark:text-amber-400"
          }
        />
        <InsightsKpiCard
          icon={BarChart3}
          title="Avg Invoice"
          value={fmtShort(kpis.avgInvoice)}
          sub={`across ${invoices.length} invoice${invoices.length !== 1 ? "s" : ""}`}
          iconClass="bg-violet-500/10 text-violet-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start animate-in animate-in-delay-2">
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
              <AreaChart
                data={monthlyChartData}
                margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={INSIGHT_COLORS.revenue}
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="95%"
                      stopColor={INSIGHT_COLORS.revenue}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
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
                  tickFormatter={(v: number) => fmtShort(v)}
                  width={70}
                />
                <Tooltip content={<RevenueTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke={INSIGHT_COLORS.revenue}
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                  dot={{ r: 3, fill: INSIGHT_COLORS.revenue, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

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
                <div
                  style={{ width: "100%", height: 200, overflow: "visible" }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart
                      margin={{ top: 16, right: 16, bottom: 16, left: 16 }}
                    >
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
                        formatter={(value: number, name: string) => [
                          `${value} invoice${value !== 1 ? "s" : ""}`,
                          name,
                        ]}
                        contentStyle={tooltipStyle}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-1.5 w-full text-sm">
                  {pieData.map((d) => (
                    <div
                      key={d.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: d.color }}
                        />
                        <span className="text-muted-foreground">{d.name}</span>
                      </div>
                      <span className="font-medium">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground py-8">
                No invoices yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {(kpis.unpaidCount > 0 || kpis.overdueCount > 0) && (
        <Card className="animate-in animate-in-delay-3">
          <CardHeader className="pb-3">
            <SectionHeader
              icon={CircleDashed}
              title="Receivables Breakdown"
              description="Pending amounts by status"
            />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <CircleDashed className="h-4 w-4 text-amber-500" />
                  <span className="text-muted-foreground font-medium">
                    Unpaid
                  </span>
                  <Badge variant="secondary" className="text-xs ml-auto">
                    {kpis.unpaidCount}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {fmtShort(kpis.unpaidAmt)}
                </p>
                <p className="text-xs text-muted-foreground">
                  awaiting payment
                </p>
              </div>
              <div className="hidden sm:flex items-center justify-center">
                <Separator orientation="vertical" className="h-16" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <CircleX className="h-4 w-4 text-destructive" />
                  <span className="text-muted-foreground font-medium">
                    Overdue
                  </span>
                  <Badge variant="destructive" className="text-xs ml-auto">
                    {kpis.overdueCount}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-destructive">
                  {fmtShort(kpis.overdueAmt)}
                </p>
                <p className="text-xs text-muted-foreground">past due date</p>
                {kpis.overdueCount > 0 && (
                  <div className="flex items-center gap-1.5 rounded-md bg-destructive/5 border border-destructive/20 px-2.5 py-1.5 mt-1">
                    <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />
                    <p className="text-xs text-destructive">
                      Follow up required
                    </p>
                  </div>
                )}
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>Total Outstanding</span>
              <span className="text-primary text-lg">
                {fmtShort(kpis.outstanding)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in animate-in-delay-3">
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
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    className="stroke-border"
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: tickColor }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => fmtShort(v)}
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
                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    fill={INSIGHT_COLORS.revenue}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No customer data
              </p>
            )}
          </CardContent>
        </Card>

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
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
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
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "11px" }}
                />
                <Bar
                  dataKey="paid"
                  name="Paid"
                  fill={INSIGHT_COLORS.paid}
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="unpaid"
                  name="Unpaid"
                  fill={INSIGHT_COLORS.unpaid}
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="overdue"
                  name="Overdue"
                  fill={INSIGHT_COLORS.overdue}
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default InsightsPage
