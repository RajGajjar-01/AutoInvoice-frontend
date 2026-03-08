import { createFileRoute, Link } from "@tanstack/react-router"
import {
  FileText,
  Search,
  Trash2,
  Send,
  CheckCircle2,
  CircleDashed,
  CircleX,
  MoreHorizontal,
  FilePlus,
  IndianRupee,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LoadingButton } from "@/components/ui/loading-button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import useLocalStorage from "@/hooks/useLocalStorage"
import useCustomToast from "@/hooks/useCustomToast"

export const Route = createFileRoute("/_layout/invoice-history/")(
  {
    component: InvoiceHistoryPage,
    head: () => ({
      meta: [{ title: "Invoice History" }],
    }),
  },
)

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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
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

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ hasSearch }) {
  if (hasSearch) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Search className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-1">No results found</h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search or filter.
        </p>
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="rounded-full bg-muted p-5 mb-5">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-xs">
        Create your first invoice to see it here in your history.
      </p>
      <Link to="/create-invoice">
        <Button>
          <FilePlus className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </Link>
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, title, value, sub, iconClass, valueClass }) {
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
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function InvoiceHistoryPage() {
  const [invoices, setInvoices] = useLocalStorage("invoices", [])
  const { showSuccessToast } = useCustomToast()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("newest")
  const [deleteTarget, setDeleteTarget] = useState(null)

  // ── Stats ────────────────────────────────────────────────────────────────
  const totalRevenue = invoices.reduce((s, i) => s + (Number(i.grandTotal) || 0), 0)
  const outstanding = invoices
    .filter((i) => i.status === "unpaid" || i.status === "overdue")
    .reduce((s, i) => s + (Number(i.grandTotal) || 0), 0)
  const overdueCount = invoices.filter((i) => i.status === "overdue").length

  // ── Filtered + sorted ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...invoices]

    // Status filter
    if (statusFilter !== "all") {
      list = list.filter((i) => i.status === statusFilter)
    }

    // Search
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (i) =>
          i.invoiceNumber?.toLowerCase().includes(q) ||
          i.customer?.name?.toLowerCase().includes(q) ||
          i.customer?.email?.toLowerCase().includes(q) ||
          i.customer?.phone?.toLowerCase().includes(q) ||
          String(i.grandTotal).includes(q),
      )
    }

    // Sort
    list.sort((a, b) => {
      const aDate = a.createdAt || a.invoiceDate || ""
      const bDate = b.createdAt || b.invoiceDate || ""
      return sortOrder === "newest"
        ? bDate.localeCompare(aDate)
        : aDate.localeCompare(bDate)
    })

    return list
  }, [invoices, search, statusFilter, sortOrder])

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleToggleStatus = (inv) => {
    const next =
      inv.status === "paid"
        ? "unpaid"
        : inv.status === "unpaid"
          ? "overdue"
          : "paid"
    setInvoices((prev) =>
      prev.map((i) => (i.id === inv.id ? { ...i, status: next } : i)),
    )
    showSuccessToast(`Status changed to ${next}`)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    setInvoices((prev) => prev.filter((i) => i.id !== deleteTarget.id))
    showSuccessToast("Invoice deleted")
    setDeleteTarget(null)
  }

  const handleWhatsApp = (inv) => {
    const cs = getCurrencySymbol(inv.currency)
    const text = `Invoice ${inv.invoiceNumber}\nAmount: ${cs}${Number(inv.grandTotal).toFixed(2)}\nStatus: ${inv.status}\nFrom: AutoInvoice`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
  }

  const hasSearch = search.trim() !== "" || statusFilter !== "all"

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoice History</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Search, filter, and manage all your invoices
          </p>
        </div>
        <Link to="/create-invoice">
          <Button>
            <FilePlus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          title="Total Invoices"
          value={invoices.length}
          sub={`${filtered.length} shown`}
          iconClass="bg-primary/10 text-primary"
        />
        <StatCard
          icon={IndianRupee}
          title="Total Revenue"
          value={fmt(totalRevenue)}
          sub="all time"
          iconClass="bg-emerald-500/10 text-emerald-500"
          valueClass="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          icon={Clock}
          title="Outstanding"
          value={fmt(outstanding)}
          sub={`${invoices.filter((i) => i.status === "unpaid").length} unpaid`}
          iconClass="bg-amber-500/10 text-amber-500"
          valueClass={outstanding > 0 ? "text-amber-600 dark:text-amber-400" : ""}
        />
        <StatCard
          icon={AlertTriangle}
          title="Overdue"
          value={overdueCount}
          sub={overdueCount > 0 ? "Needs attention" : "All clear"}
          iconClass="bg-destructive/10 text-destructive"
          valueClass={overdueCount > 0 ? "text-destructive" : ""}
        />
      </div>

      {/* Toolbar */}
      {invoices.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by invoice #, customer, amount…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Table */}
      {invoices.length === 0 ? (
        <EmptyState hasSearch={false} />
      ) : filtered.length === 0 ? (
        <EmptyState hasSearch={true} />
      ) : (
        <Card>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((inv) => {
                  const StatusIcon = statusIcon[inv.status] ?? CircleDashed
                  return (
                    <TableRow
                      key={inv.id}
                      className="hover:bg-muted/50 transition-colors group"
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
                          <span className="font-medium">{inv.customer?.name || "—"}</span>
                          {inv.customer?.email && (
                            <span className="block text-xs text-muted-foreground mt-0.5">
                              {inv.customer.email}
                            </span>
                          )}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {inv.invoiceDate || "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {inv.dueDate ? (
                          <span
                            className={
                              inv.status === "overdue"
                                ? "text-destructive font-medium"
                                : "text-muted-foreground"
                            }
                          >
                            {inv.dueDate}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium text-sm">
                        {fmt(inv.grandTotal, inv.currency)}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Badge
                          variant={statusVariant[inv.status] ?? "outline"}
                          className="capitalize cursor-pointer gap-1 text-xs"
                          onClick={() => handleToggleStatus(inv)}
                          title="Click to cycle status"
                        >
                          <StatusIcon className="h-3 w-3" />
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link
                                to="/invoice-history/$invoiceId"
                                params={{ invoiceId: inv.id }}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleWhatsApp(inv)}>
                              <Send className="mr-2 h-4 w-4" />
                              Send via WhatsApp
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteTarget(inv)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {/* Footer count */}
            <div className="px-6 py-3 border-t bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing {filtered.length} of {invoices.length} invoices
              </span>
              {hasSearch && (
                <button
                  className="hover:text-foreground transition-colors"
                  onClick={() => {
                    setSearch("")
                    setStatusFilter("all")
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete invoice{" "}
              <strong>{deleteTarget?.invoiceNumber}</strong>? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <LoadingButton
              variant="destructive"
              loading={false}
              onClick={handleDelete}
            >
              Delete
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
