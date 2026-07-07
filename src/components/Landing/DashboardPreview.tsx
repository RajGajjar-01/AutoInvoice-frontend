import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  Users,
} from "lucide-react"

const chart = [42, 58, 35, 70, 52, 88, 64, 95]

const invoices = [
  {
    num: "INV-2403",
    client: "Tech Solutions",
    initial: "T",
    amount: "₹18,000",
    paid: true,
  },
  {
    num: "INV-2402",
    client: "XYZ Ltd",
    initial: "X",
    amount: "₹32,500",
    paid: false,
  },
  {
    num: "INV-2401",
    client: "ABC Corp",
    initial: "A",
    amount: "₹45,000",
    paid: true,
  },
]

const navIcons = [
  { icon: LayoutDashboard, active: true },
  { icon: FileText, active: false },
  { icon: Users, active: false },
  { icon: Package, active: false },
  { icon: BarChart3, active: false },
  { icon: Settings, active: false },
]

export function DashboardPreview() {
  return (
    <div className="relative">
      {/* Floating "payment received" card for depth */}
      <div className="absolute -left-4 -bottom-5 z-20 hidden sm:flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-xl">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15">
          <CheckCircle2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-display text-xs font-semibold leading-tight">
            Payment received
          </p>
          <p className="text-[11px] text-muted-foreground leading-tight">
            ₹45,000 from ABC Corp
          </p>
        </div>
      </div>

      {/* App shell */}
      <div className="flex overflow-hidden rounded-2xl border bg-card shadow-2xl">
        {/* Nav rail */}
        <div className="hidden sm:flex w-14 flex-col items-center gap-1 border-r bg-muted/40 py-4">
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            A
          </div>
          {navIcons.map(({ icon: Icon, active }, i) => (
            <div
              key={i}
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                active
                  ? "bg-primary/12 text-primary"
                  : "text-muted-foreground/60"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-muted-foreground">Welcome back</p>
              <p className="font-display text-sm font-semibold">Dashboard</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
              <ArrowUpRight className="h-3 w-3" />
              18% this month
            </div>
          </div>

          {/* Revenue card with bar chart */}
          <div className="mb-4 rounded-xl border bg-background p-4">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground">
                  Revenue this month
                </p>
                <p className="font-display text-2xl font-semibold">₹2,45,000</p>
              </div>
              <p className="text-[11px] text-muted-foreground">Last 8 weeks</p>
            </div>
            <div className="flex h-20 items-end gap-2">
              {chart.map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t-sm ${
                    i === chart.length - 1 ? "bg-primary" : "bg-primary/25"
                  }`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Recent invoices */}
          <div className="rounded-xl border bg-background">
            <div className="flex items-center justify-between border-b px-4 py-2.5">
              <p className="font-display text-xs font-semibold">
                Recent invoices
              </p>
              <p className="text-[11px] text-primary">View all</p>
            </div>
            <div className="divide-y">
              {invoices.map((inv) => (
                <div
                  key={inv.num}
                  className="flex items-center gap-3 px-4 py-2.5"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                    {inv.initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{inv.client}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {inv.num}
                    </p>
                  </div>
                  <span className="text-xs font-semibold">{inv.amount}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      inv.paid
                        ? "bg-primary/10 text-primary"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {inv.paid ? "Paid" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
