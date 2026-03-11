import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useEffect, useMemo } from "react"
import {
  FilePlus,
  FileText,
  Package,
  Table2,
  BarChart3,
  Users,
  History,
  UserCircle,
  LayoutTemplate,
  PlusCircle,
  ChevronRight,
  Sparkles,
  Clock,
  CheckCircle2,
  CircleDashed,
  CircleX,
  ArrowRight,
  LogOut,
  Zap,
  TrendingUp,
  Settings,
  Receipt,
  Briefcase,
  FileSignature,
  Truck,
  SquareStack,
  LineChart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Appearance } from "@/components/Common/Appearance"
import { Logo } from "@/components/Common/Logo"
import useAuth from "@/hooks/useAuth"
import useLocalStorage from "@/hooks/useLocalStorage"

export const Route = createFileRoute("/home")({
  component: HomePage,
  head: () => ({
    meta: [{ title: "Home — UnifiedDesk" }],
  }),
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

const statusMeta = {
  paid:    { color: "text-emerald-500", bg: "bg-emerald-500/10", icon: CheckCircle2, label: "Paid",    dot: "bg-emerald-500" },
  unpaid:  { color: "text-amber-500",   bg: "bg-amber-500/10",   icon: CircleDashed, label: "Unpaid",  dot: "bg-amber-500"   },
  overdue: { color: "text-red-500",     bg: "bg-red-500/10",     icon: CircleX,      label: "Overdue", dot: "bg-red-500"     },
}

// ─── Grouped menu data ─────────────────────────────────────────────────────────

const MENU_GROUPS = [
  {
    label: "Create Documents",
    description: "Generate professional business documents",
    accent: "from-primary/20 to-primary/5",
    borderActive: "border-primary/30",
    items: [
      {
        icon: Receipt,
        title: "Tax Invoice",
        description: "GST / VAT compliant tax invoices",
        to: "/create-invoice",
        badge: "Popular",
        gradient: "from-primary/20 to-primary/5",
        iconColor: "text-primary",
        accentColor: "primary",
      },
      {
        icon: FileSignature,
        title: "Quotation",
        description: "Send price quotes to prospects",
        to: "/create-quotation",
        gradient: "from-blue-500/20 to-blue-500/5",
        iconColor: "text-blue-500",
        accentColor: "blue",
      },
      {
        icon: FileText,
        title: "Proforma Invoice",
        description: "Advance billing for imports & pre-payment",
        to: "/create-proforma",
        gradient: "from-indigo-500/20 to-indigo-500/5",
        iconColor: "text-indigo-500",
        accentColor: "indigo",
      },
      {
        icon: Truck,
        title: "Delivery Challan",
        description: "Dispatch notes without payment details",
        to: "/create-challan",
        gradient: "from-teal-500/20 to-teal-500/5",
        iconColor: "text-teal-500",
        accentColor: "teal",
      },
      {
        icon: LayoutTemplate,
        title: "Templates",
        description: "Browse & customize invoice templates",
        to: "/invoice-templates",
        gradient: "from-orange-500/20 to-orange-500/5",
        iconColor: "text-orange-500",
        accentColor: "orange",
      },
    ],
  },
  {
    label: "Business Hub",
    description: "Manage your core business data",
    accent: "from-violet-500/20 to-violet-500/5",
    items: [
      {
        icon: Package,
        title: "Items & Inventory",
        description: "Track products, services and stock",
        to: "/items",
        gradient: "from-violet-500/20 to-violet-500/5",
        iconColor: "text-violet-500",
        accentColor: "violet",
      },
      {
        icon: Users,
        title: "Customers",
        description: "Manage all contacts & parties",
        to: "/customers",
        gradient: "from-cyan-500/20 to-cyan-500/5",
        iconColor: "text-cyan-500",
        accentColor: "cyan",
      },
      {
        icon: SquareStack,
        title: "Data Tables",
        description: "Custom spreadsheet-style tables",
        to: "/data-tables",
        gradient: "from-emerald-500/20 to-emerald-500/5",
        iconColor: "text-emerald-500",
        accentColor: "emerald",
      },
      {
        icon: LineChart,
        title: "Insights",
        description: "Revenue trends & financial analytics",
        to: "/insights",
        badge: "New",
        gradient: "from-amber-500/20 to-amber-500/5",
        iconColor: "text-amber-500",
        accentColor: "amber",
      },
    ],
  },
  {
    label: "Account",
    description: "Profile, history and settings",
    accent: "from-rose-500/20 to-rose-500/5",
    items: [
      {
        icon: History,
        title: "Invoice History",
        description: "Browse, search and export past records",
        to: "/invoices",
        gradient: "from-rose-500/20 to-rose-500/5",
        iconColor: "text-rose-500",
        accentColor: "rose",
      },
      {
        icon: UserCircle,
        title: "My Account",
        description: "Profile, password & preferences",
        to: "/profile",
        gradient: "from-slate-500/20 to-slate-500/5",
        iconColor: "text-slate-500",
        accentColor: "slate",
      },
    ],
  },
]

// ─── Menu Card ─────────────────────────────────────────────────────────────────

function MenuCard({ icon: Icon, title, description, to, badge, gradient, iconColor }) {
  return (
    <Link
      to={to}
      className="group block focus-visible:outline-none"
    >
      <div className={`
        relative overflow-hidden rounded-2xl border bg-card
        transition-all duration-300 ease-out h-full
        hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5
        hover:border-border/80 cursor-pointer
        group-focus-visible:ring-2 group-focus-visible:ring-ring
      `}>
        {/* Gradient background blob */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

        <div className="relative p-5">
          {/* Top row: icon + badge */}
          <div className="flex items-start justify-between mb-4">
            <div className={`rounded-xl bg-gradient-to-br ${gradient} p-2.5 border border-white/10`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            {badge && (
              <Badge className="text-[10px] px-2 py-0.5 h-5 font-semibold rounded-full bg-primary/10 text-primary border-0 hover:bg-primary/10">
                {badge}
              </Badge>
            )}
          </div>

          {/* Text */}
          <p className="font-semibold text-sm leading-snug mb-1 group-hover:text-foreground transition-colors">{title}</p>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{description}</p>

          {/* Bottom arrow */}
          <div className="flex items-center gap-1 mt-4 text-xs font-medium text-muted-foreground/50 group-hover:text-primary transition-colors">
            <span>Open</span>
            <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, color, bg, icon: Icon }) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl border bg-card px-4 py-3.5 shadow-sm`}>
      <div className={`rounded-xl ${bg} p-2`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div>
        <p className={`text-2xl font-bold tabular-nums leading-none ${color}`}>{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  )
}

// ─── Recent Invoice Row ────────────────────────────────────────────────────────

function RecentRow({ inv }) {
  const meta = statusMeta[inv.status] ?? { color: "text-muted-foreground", bg: "bg-muted/50", icon: CircleDashed, label: inv.status, dot: "bg-muted-foreground" }
  const StatusIcon = meta.icon
  const typeLabel = inv.type === "quotation" ? "QUO" : inv.type === "challan" ? "CHL" : inv.type === "proforma" ? "PRO" : "INV"

  return (
    <Link
      to="/invoice-history/$invoiceId"
      params={{ invoiceId: inv.id }}
      className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/60 transition-colors"
    >
      <div className={`shrink-0 text-[10px] font-bold rounded-lg px-1.5 py-1 ${meta.bg} ${meta.color} tracking-wider`}>
        {typeLabel}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
          {inv.invoiceNumber || `#${inv.id?.slice(0, 8)}`}
        </p>
        <p className="text-xs text-muted-foreground truncate">{inv.customer?.name || "—"}</p>
      </div>
      <div className="flex items-center gap-2.5 shrink-0">
        <span className="text-xs text-muted-foreground hidden sm:block">{inv.invoiceDate || ""}</span>
        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
          <StatusIcon className="h-3 w-3" />
          <span className="capitalize">{meta.label}</span>
        </div>
      </div>
    </Link>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

function HomePage() {
  const { isLoading, user, logout } = useAuth()
  const navigate = useNavigate()
  const [invoices] = useLocalStorage("invoices", [])

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: "/login", replace: true })
    }
  }, [isLoading, user, navigate])

  const firstName = user?.full_name?.split(" ")[0] || user?.email || "there"

  const stats = useMemo(() => {
    const paid    = invoices.filter(i => i.status === "paid").length
    const unpaid  = invoices.filter(i => i.status === "unpaid").length
    const overdue = invoices.filter(i => i.status === "overdue").length
    return { total: invoices.length, paid, unpaid, overdue }
  }, [invoices])

  const recent = useMemo(
    () =>
      [...invoices]
        .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
        .slice(0, 6),
    [invoices],
  )

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Sticky Navbar ── */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo asLink={false} />

          <div className="flex items-center gap-1">
            <Appearance />
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              onClick={logout}
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden border-b">
        {/* Mesh gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-background pointer-events-none" />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 left-24 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8">
          {/* Left — greeting */}
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1 mb-4">
              <Sparkles className="h-3 w-3" />
              {getGreeting()}, {firstName}!
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
              What would you{" "}
              <span className="text-primary relative">
                like to do
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary/30 rounded-full" />
              </span>{" "}
              today?
            </h1>
            <p className="text-muted-foreground mt-3 text-sm max-w-md leading-relaxed italic">
              UnifiedDesk — your all-in-one business workspace.
            </p>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2 mt-6">
              <Button size="sm" className="gap-2 h-8 text-xs rounded-lg shadow-sm shadow-primary/20" asChild>
                <Link to="/create-invoice">
                  <PlusCircle className="h-3.5 w-3.5" />
                  New Invoice
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="gap-2 h-8 text-xs rounded-lg" asChild>
                <Link to="/create-quotation">
                  <FileText className="h-3.5 w-3.5" />
                  New Quotation
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="gap-2 h-8 text-xs rounded-lg" asChild>
                <Link to="/create-challan">
                  <Truck className="h-3.5 w-3.5" />
                  New Challan
                </Link>
              </Button>
            </div>
          </div>


        </div>
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-10 flex flex-col gap-12">

        {/* ── Feature Groups ── */}
        {MENU_GROUPS.map((group) => (
          <section key={group.label}>
            {/* Group header */}
            <div className="flex items-end justify-between mb-5">
              <div>
                <h2 className="text-base font-bold tracking-tight">{group.label}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{group.description}</p>
              </div>
            </div>

            {/* Cards grid */}
            <div className={`grid gap-3 ${
              group.items.length <= 2
                ? "grid-cols-1 sm:grid-cols-2"
                : group.items.length === 4
                  ? "grid-cols-2 lg:grid-cols-4"
                  : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
            }`}>
              {group.items.map((item) => (
                <MenuCard key={item.title} {...item} />
              ))}
            </div>
          </section>
        ))}

        {/* ── Recent Activity ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold tracking-tight">Recent Activity</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Your latest documents</p>
            </div>
            {recent.length > 0 && (
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-primary h-7 px-3 rounded-lg" asChild>
                <Link to="/invoices">
                  View all
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            )}
          </div>

          {recent.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-muted/20 py-16 flex flex-col items-center gap-4 text-center">
              <div className="rounded-2xl bg-muted/70 p-4">
                <Zap className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold">No activity yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Create your first invoice and it will appear here.
                </p>
              </div>
              <Button size="sm" asChild className="rounded-lg mt-1">
                <Link to="/create-invoice">
                  <FilePlus className="mr-2 h-3.5 w-3.5" />
                  Create Invoice
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border bg-card divide-y divide-border/50 overflow-hidden">
              {recent.map((inv) => (
                <RecentRow key={inv.id} inv={inv} />
              ))}
            </div>
          )}
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t py-5 px-6">
        <div className="mx-auto max-w-7xl flex items-center justify-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} UnifiedDesk. Crafted for modern businesses.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
