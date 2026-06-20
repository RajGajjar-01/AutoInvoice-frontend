import { useMutation, useQuery } from "@tanstack/react-query"
import type { LucideIcon } from "lucide-react"
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  CircleX,
  Clock,
  FilePlus,
  FileText,
  History,
  IndianRupee,
  LayoutTemplate,
  MoreHorizontal,
  Send,
  Trash2,
} from "lucide-react"
import { useState } from "react"
import { Link } from "react-router"
import type { InvoiceStatus } from "@/client/types.gen"
import { InvoicesService } from "@/client/sdk.gen"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LoadingButton } from "@/components/ui/loading-button"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  invoicesListQueryOptions,
  invoicesQueryKeys,
} from "@/features/invoices/queries"
import useCustomToast from "@/hooks/useCustomToast"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { queryClient } from "@/queryClient"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCurrencySymbol(currency?: string): string {
  if (currency === "INR") return "₹"
  if (currency === "USD") return "$"
  if (currency === "EUR") return "€"
  if (currency === "GBP") return "£"
  return currency || "₹"
}

function fmt(num: number | string, currency?: string): string {
  const cs = getCurrencySymbol(currency)
  return `${cs}${Number(num || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const statusVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  paid: "default",
  unpaid: "secondary",
  overdue: "destructive",
}

const statusIcon: Record<string, LucideIcon> = {
  paid: CheckCircle2,
  unpaid: CircleDashed,
  overdue: CircleX,
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatCardProps {
  icon: LucideIcon
  title: string
  value: string | number
  sub?: string
  iconClass?: string
  valueClass?: string
}

function StatCard({
  icon: Icon,
  title,
  value,
  sub,
  iconClass,
  valueClass,
}: StatCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
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

interface QuickActionRowProps {
  icon: LucideIcon
  iconClass?: string
  title: string
  description: string
  to: string
}

function QuickActionRow({
  icon: Icon,
  iconClass,
  title,
  description,
  to,
}: QuickActionRowProps) {
  return (
    <Link to={to} className="group">
      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer">
        <div className={`rounded-lg p-2 shrink-0 ${iconClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground truncate">
            {description}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
      </div>
    </Link>
  )
}

function RecentInvoicesEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <FileText className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold mb-1">No invoices yet</h3>
      <p className="text-xs text-muted-foreground mb-4 max-w-xs">
        Create your first invoice to see it here.
      </p>
      <Link to="/create-invoice">
        <Button size="sm">
          <FilePlus className="mr-2 h-3.5 w-3.5" />
          Create Invoice
        </Button>
      </Link>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

interface Invoice {
  id: string
  invoiceNumber: string
  invoiceDate?: string
  status: string
  grandTotal: number | string
  currency?: string
  createdAt?: string
  customer?: {
    name?: string
  }
}

function InvoicesPage() {
  useDocumentTitle("Invoices")
  const { data: invoicesRes } = useQuery(invoicesListQueryOptions())
  const invoices = (invoicesRes?.data ?? []) as Invoice[]
  const { showSuccessToast } = useCustomToast()
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null)

  const updateInvoiceMutation = useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string
      patch: { status: InvoiceStatus }
    }) => {
      return InvoicesService.updateInvoice({
        id,
        requestBody: patch,
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: invoicesQueryKeys.all })
    },
  })

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: string) => {
      return InvoicesService.deleteInvoice({ id })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: invoicesQueryKeys.all })
      showSuccessToast("Invoice deleted")
    },
  })

  // ── Computed stats ──────────────────────────────────────────────────────
  const totalCount = invoices.length
  const paidCount = invoices.filter((i) => i.status === "paid").length
  const unpaidCount = invoices.filter((i) => i.status === "unpaid").length
  const overdueCount = invoices.filter((i) => i.status === "overdue").length

  const totalRevenue = invoices.reduce(
    (s, i) => s + (Number(i.grandTotal) || 0),
    0,
  )
  const outstanding = invoices
    .filter((i) => i.status === "unpaid" || i.status === "overdue")
    .reduce((s, i) => s + (Number(i.grandTotal) || 0), 0)

  const paidRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + (Number(i.grandTotal) || 0), 0)

  const paidPct =
    totalRevenue > 0 ? Math.round((paidRevenue / totalRevenue) * 100) : 0

  // ── Recent 5 ────────────────────────────────────────────────────────────
  const recent = [...invoices]
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
    .slice(0, 5)

  // ── Actions ─────────────────────────────────────────────────────────────
  const handleToggleStatus = (inv: Invoice) => {
    const next =
      inv.status === "paid"
        ? "unpaid"
        : inv.status === "unpaid"
          ? "overdue"
          : "paid"
    updateInvoiceMutation.mutate({
      id: inv.id,
      patch: { status: next },
    })
    showSuccessToast(`Status changed to ${next}`)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteInvoiceMutation.mutate(deleteTarget.id)
    setDeleteTarget(null)
  }

  const handleWhatsApp = (inv: Invoice) => {
    const cs = getCurrencySymbol(inv.currency)
    const text = `Invoice ${inv.invoiceNumber}\nAmount: ${cs}${Number(inv.grandTotal).toFixed(2)}\nStatus: ${inv.status}\nFrom: AutoInvoice`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create, manage, and track your invoices
          </p>
        </div>
        <Link to="/create-invoice">
          <Button>
            <FilePlus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </Link>
      </div>

      {/* ── KPI Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          title="Total Invoices"
          value={totalCount}
          sub={totalCount === 1 ? "1 invoice" : `${totalCount} invoices`}
          iconClass="bg-primary/10 text-primary"
        />
        <StatCard
          icon={IndianRupee}
          title="Total Revenue"
          value={fmt(totalRevenue)}
          sub={`${paidPct}% collected`}
          iconClass="bg-emerald-500/10 text-emerald-500"
          valueClass="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          icon={Clock}
          title="Outstanding"
          value={fmt(outstanding)}
          sub={`${unpaidCount} unpaid invoice${unpaidCount !== 1 ? "s" : ""}`}
          iconClass="bg-amber-500/10 text-amber-500"
          valueClass={
            outstanding > 0 ? "text-amber-600 dark:text-amber-400" : ""
          }
        />
        <StatCard
          icon={AlertTriangle}
          title="Overdue"
          value={overdueCount}
          sub={overdueCount > 0 ? "Requires attention" : "All clear"}
          iconClass="bg-destructive/10 text-destructive"
          valueClass={overdueCount > 0 ? "text-destructive" : ""}
        />
      </div>

      {/* ── Two-column body ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Recent Invoices — spans 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base">Recent Invoices</CardTitle>
              <CardDescription className="text-xs">
                Your latest 5 invoices
              </CardDescription>
            </div>
            <Link to="/invoice-history">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary gap-1 text-xs"
              >
                View All
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {invoices.length === 0 ? (
              <RecentInvoicesEmpty />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">
                      <span className="sr-only">Actions</span>
                    </TableHead>
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
                            className="block w-full hover:text-primary transition-colors"
                          >
                            {inv.customer?.name || "—"}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right font-medium text-sm">
                          <Link
                            to={`/invoice-history/${inv.id}`}
                            className="block w-full hover:text-primary transition-colors"
                          >
                            {fmt(inv.grandTotal, inv.currency)}
                          </Link>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Badge
                            variant={statusVariant[inv.status] ?? "outline"}
                            className="capitalize cursor-pointer gap-1 text-xs"
                            onClick={() => handleToggleStatus(inv)}
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
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleWhatsApp(inv)}
                              >
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
            )}
          </CardContent>
        </Card>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-1">
              <QuickActionRow
                icon={FilePlus}
                iconClass="bg-primary/10 text-primary"
                title="Create Invoice"
                description="Build a new professional invoice"
                to="/create-invoice"
              />
              <QuickActionRow
                icon={LayoutTemplate}
                iconClass="bg-blue-500/10 text-blue-500"
                title="Invoice Templates"
                description="Browse or build custom templates"
                to="/invoice-templates"
              />
              <QuickActionRow
                icon={History}
                iconClass="bg-emerald-500/10 text-emerald-500"
                title="Invoice History"
                description="Search, filter and manage invoices"
                to="/invoice-history"
              />
            </CardContent>
          </Card>

          {/* Summary Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Status Breakdown</CardTitle>
              <CardDescription className="text-xs">
                {totalCount > 0
                  ? `Across ${totalCount} invoice${totalCount !== 1 ? "s" : ""}`
                  : "No invoices yet"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Paid */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-muted-foreground">Paid</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{paidCount}</span>
                  <span className="text-xs text-muted-foreground">
                    {fmt(paidRevenue)}
                  </span>
                </div>
              </div>

              {/* Paid progress bar */}
              {totalCount > 0 && (
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${paidPct}%` }}
                  />
                </div>
              )}

              <Separator />

              {/* Unpaid */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CircleDashed className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-muted-foreground">Unpaid</span>
                </div>
                <span className="font-medium">{unpaidCount}</span>
              </div>

              {/* Overdue */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CircleX className="h-3.5 w-3.5 text-destructive" />
                  <span className="text-muted-foreground">Overdue</span>
                </div>
                <span
                  className={`font-medium ${overdueCount > 0 ? "text-destructive" : ""}`}
                >
                  {overdueCount}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Delete Confirmation ── */}
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

export default InvoicesPage
