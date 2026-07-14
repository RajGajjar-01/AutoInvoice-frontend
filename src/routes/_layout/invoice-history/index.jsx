import { createFileRoute, Link } from "@tanstack/react-router"
import {
  FileText,
  Search,
  Trash2,
  Send,
  CheckCircle2,
  CircleDashed,
  CircleX,
  CircleDot,
  MoreHorizontal,
  FilePlus,
  IndianRupee,
  Clock,
  AlertTriangle,
  Download,
  RefreshCw,
  Mail,
} from "lucide-react"
import { downloadInvoicePdf, sendInvoiceEmail } from "@/lib/invoicePdf"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
      meta: [{ title: "Document History — UnifiedDesk" }],
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
  partial: "outline",
}

const statusStyle = {
  partial: "border-amber-400 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30",
}

const statusIcon = {
  paid: CheckCircle2,
  unpaid: CircleDashed,
  overdue: CircleX,
  partial: CircleDot,
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
        <p className="text-sm text-muted-foreground mb-4">
          Try adjusting your search or filter.
        </p>
        <Button variant="outline" size="sm" onClick={() => (window.location.reload())}>
          Clear all filters
        </Button>
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
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [companyDetails] = useLocalStorage("company-details", {})
  const [selectedTemplate] = useLocalStorage("selected-template", "clean-teal")
  const [importedTemplate] = useLocalStorage("imported-template", null)

  const handleSendEmail = async (inv) => {
    if (!inv.customer?.email) {
      showErrorToast("Customer has no email address configured")
      return
    }
    try {
      showSuccessToast("Sending email...")
      await sendInvoiceEmail(inv, companyDetails, selectedTemplate, importedTemplate, inv.customer.email)
      showSuccessToast(`Email successfully sent to ${inv.customer.email}`)
    } catch (err) {
      console.error(inv.invoiceNumber, "email failed:", err)
      const docType = inv.type || "invoice"
      const docTitle = docType === "quotation" ? "Quotation" : docType === "challan" ? "Delivery Challan" : docType === "proforma" ? "Proforma Invoice" : "Invoice"
      const finalSubject = `${docTitle} ${inv.invoiceNumber} from ${companyDetails.name || 'UnifiedDesk'}`
      const mailBody = `Dear ${inv.customer?.name || ""},\n\nPlease find your document ${inv.invoiceNumber} attached.\n\nThank you!`
      window.open(`mailto:${inv.customer.email}?subject=${encodeURIComponent(finalSubject)}&body=${encodeURIComponent(mailBody)}`)
    }
  }

  // Filter states
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const [sortOrder, setSortOrder] = useState("newest")
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [partialTarget, setPartialTarget] = useState(null)
  const [partialAmountInput, setPartialAmountInput] = useState("")

  // ── Stats ────────────────────────────────────────────────────────────────
  const totalRevenue = invoices.reduce((s, i) => s + (Number(i.grandTotal) || 0), 0)
  const outstanding = invoices
    .filter((i) => i.status === "unpaid" || i.status === "overdue" || i.status === "partial")
    .reduce((s, i) => {
      if (i.status === "partial") {
        return s + Math.max(0, (Number(i.grandTotal) || 0) - (Number(i.partialAmountPaid) || 0))
      }
      return s + (Number(i.grandTotal) || 0)
    }, 0)
  const overdueCount = invoices.filter((i) => i.status === "overdue").length
  const partialCount = invoices.filter((i) => i.status === "partial").length

  // ── Filtered + sorted ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...invoices]

    // Status filter
    if (statusFilter !== "all") {
      list = list.filter((i) => i.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== "all") {
      list = list.filter((i) => (i.type || "invoice") === typeFilter)
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
  }, [invoices, search, statusFilter, typeFilter, sortOrder])

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleToggleStatus = (inv) => {
    const cycle = { unpaid: "partial", partial: "overdue", overdue: "paid", paid: "unpaid" }
    const next = cycle[inv.status] ?? "unpaid"
    if (next === "partial") {
      setPartialAmountInput(inv.partialAmountPaid ? String(inv.partialAmountPaid) : "")
      setPartialTarget(inv)
      return
    }
    setInvoices((prev) =>
      prev.map((i) => (i.id === inv.id ? { ...i, status: next } : i)),
    )
    showSuccessToast(`Status changed to ${next}`)
  }

  const handleSavePartial = () => {
    if (!partialTarget) return
    const grandTotal = Number(partialTarget.grandTotal) || 0
    const cs = getCurrencySymbol(partialTarget.currency)
    const amt = parseFloat(partialAmountInput)
    if (isNaN(amt) || amt < 0) {
      showErrorToast("Please enter a valid amount")
      return
    }
    if (amt >= grandTotal) {
      showErrorToast(`Amount must be less than the total (${cs}${grandTotal.toFixed(2)}). Mark as Paid instead.`)
      return
    }
    setInvoices((prev) =>
      prev.map((i) =>
        i.id === partialTarget.id
          ? { ...i, status: "partial", partialAmountPaid: amt }
          : i
      ),
    )
    showSuccessToast(`Partial payment of ${cs}${amt.toFixed(2)} recorded`)
    setPartialTarget(null)
    setPartialAmountInput("")
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    setInvoices((prev) => prev.filter((i) => i.id !== deleteTarget.id))
    showSuccessToast("Invoice deleted")
    setDeleteTarget(null)
  }

  const handleWhatsApp = (inv) => {
    const cs = getCurrencySymbol(inv.currency)
    const text = `Invoice ${inv.invoiceNumber}\nAmount: ${cs}${Number(inv.grandTotal).toFixed(2)}\nStatus: ${inv.status}\nFrom: UnifiedDesk`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
  }

  const handleExportCSV = () => {
    if (filtered.length === 0) return

    const headers = ["Document #", "Type", "Customer", "Date", "Due Date", "Amount", "Status"]
    const rows = filtered.map(inv => [
      inv.invoiceNumber,
      inv.type || "invoice",
      inv.customer?.name || "—",
      inv.invoiceDate || "—",
      inv.dueDate || "—",
      inv.grandTotal,
      inv.status
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `document_history_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showSuccessToast("Exported successfully")
  }

  const handleClearFilters = () => {
    setSearch("")
    setStatusFilter("all")
    setTypeFilter("all")
  }

  const hasSearch = search.trim() !== "" || statusFilter !== "all" || typeFilter !== "all"
  const isDirty = false // No longer needed for real-time

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Document History</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Search, filter, and manage all your documents
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV} disabled={filtered.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Link to="/create-invoice">
            <Button>
              <FilePlus className="mr-2 h-4 w-4" />
              New Document
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          title="Total Documents"
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
          sub={`${invoices.filter((i) => i.status === "unpaid").length} unpaid · ${partialCount} partial`}
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
              <SelectItem value="partial">Partial Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="invoice">Invoice</SelectItem>
              <SelectItem value="quotation">Quotation</SelectItem>
              <SelectItem value="challan">Challan</SelectItem>
              <SelectItem value="proforma">Proforma</SelectItem>
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
          {hasSearch && (
            <Button variant="ghost" onClick={handleClearFilters} className="text-muted-foreground">
              Clear Filters
            </Button>
          )}
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
                  <TableHead>Document #</TableHead>
                  <TableHead>Type</TableHead>
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
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-[10px] h-5">
                          {inv.type || "invoice"}
                        </Badge>
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
                          className={`capitalize cursor-pointer gap-1 text-xs ${statusStyle[inv.status] ?? ""}`}
                          onClick={() => handleToggleStatus(inv)}
                          title="Click to cycle status: unpaid → partial → overdue → paid"
                        >
                          <StatusIcon className="h-3 w-3" />
                          {inv.status === "partial" ? "Partial Paid" : inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => downloadInvoicePdf(inv)}
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
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
                              <DropdownMenuItem onClick={() => handleSendEmail(inv)}>
                                <Mail className="mr-2 h-4 w-4" />
                                Send via Email
                              </DropdownMenuItem>
                              <Separator className="my-1" />
                              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Convert To
                              </div>
                              {["invoice", "quotation", "challan", "proforma"].filter(t => (inv.type || "invoice") !== t).map(type => (
                                <DropdownMenuItem key={type} asChild>
                                  <Link to="/create-invoice" search={{ fromId: inv.id, type: type }}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    <span className="capitalize">{type}</span>
                                  </Link>
                                </DropdownMenuItem>
                              ))}
                              <Separator className="my-1" />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteTarget(inv)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {/* Footer count */}
            <div className="px-6 py-3 border-t bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing {filtered.length} of {invoices.length} documents
              </span>
              {hasSearch && (
                <button
                  className="hover:text-foreground transition-colors"
                  onClick={handleClearFilters}
                >
                  Clear filters
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Partial Payment Dialog */}
      {partialTarget && (() => {
        const grandTotal = Number(partialTarget.grandTotal) || 0
        const cs = getCurrencySymbol(partialTarget.currency)
        const inputVal = parseFloat(partialAmountInput)
        return (
          <Dialog open={!!partialTarget} onOpenChange={(open) => !open && setPartialTarget(null)}>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CircleDot className="h-4 w-4 text-amber-500" />
                  Record Partial Payment
                </DialogTitle>
                <DialogDescription>
                  Enter the amount received for{" "}
                  <strong>{partialTarget.invoiceNumber}</strong>. Total:{" "}
                  <strong>{fmt(grandTotal, partialTarget.currency)}</strong>.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="list-partial-amount">Amount Paid ({partialTarget.currency || "INR"})</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{cs}</span>
                    <Input
                      id="list-partial-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-7"
                      value={partialAmountInput}
                      onChange={(e) => setPartialAmountInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSavePartial()}
                      autoFocus
                    />
                  </div>
                  {partialAmountInput && !isNaN(inputVal) && inputVal > 0 && inputVal < grandTotal && (
                    <p className="text-xs text-muted-foreground">
                      Remaining:{" "}
                      <span className="font-medium text-amber-600 dark:text-amber-400">
                        {fmt(grandTotal - inputVal, partialTarget.currency)}
                      </span>
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" onClick={() => setPartialTarget(null)}>Cancel</Button>
                </DialogClose>
                <Button
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={handleSavePartial}
                >
                  Save Payment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )
      })()}

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete {deleteTarget?.type || "Document"}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {deleteTarget?.type || "document"}{" "}
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
