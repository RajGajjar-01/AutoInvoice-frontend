import { createFileRoute, Link } from "@tanstack/react-router"
import {
  ArrowLeft,
  Search,
  Download,
  Eye,
  Send,
  Trash2,
  MoreHorizontal,
  FileText,
  FileSpreadsheet,
} from "lucide-react"
import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import useCustomToast from "@/hooks/useCustomToast"
import useLocalStorage from "@/hooks/useLocalStorage"

export const Route = createFileRoute("/_layout/invoice-history")({
  component: InvoiceHistoryPage,
  head: () => ({
    meta: [{ title: "Invoice History" }],
  }),
})

const statusVariant = {
  paid: "default",
  unpaid: "secondary",
  overdue: "destructive",
}

function getCurrencySymbol(currency) {
  if (currency === "INR") return "₹"
  if (currency === "USD") return "$"
  if (currency === "EUR") return "€"
  if (currency === "GBP") return "£"
  return currency || "₹"
}

function InvoiceHistoryPage() {
  const [invoices, setInvoices] = useLocalStorage("invoices", [])
  const { showSuccessToast } = useCustomToast()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [viewTarget, setViewTarget] = useState(null)

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const q = search.toLowerCase()
      const matchesSearch =
        inv.invoiceNumber?.toLowerCase().includes(q) ||
        inv.customer?.name?.toLowerCase().includes(q) ||
        String(inv.grandTotal).includes(q)
      const matchesStatus =
        statusFilter === "all" || inv.status === statusFilter
      const invDate = inv.invoiceDate?.slice(0, 10) || ""
      const matchesDateFrom = !dateFrom || invDate >= dateFrom
      const matchesDateTo = !dateTo || invDate <= dateTo
      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo
    })
  }, [invoices, search, statusFilter, dateFrom, dateTo])

  const handleDelete = () => {
    if (!deleteTarget) return
    setInvoices((prev) => prev.filter((i) => i.id !== deleteTarget.id))
    showSuccessToast("Invoice deleted")
    setDeleteTarget(null)
  }

  const handleToggleStatus = (inv) => {
    const nextStatus =
      inv.status === "paid"
        ? "unpaid"
        : inv.status === "unpaid"
          ? "overdue"
          : "paid"
    setInvoices((prev) =>
      prev.map((i) => (i.id === inv.id ? { ...i, status: nextStatus } : i)),
    )
    showSuccessToast(`Status changed to ${nextStatus}`)
  }

  const handleExportCSV = () => {
    const header = ["Invoice Number", "Customer", "Amount", "Status", "Date"].join(",")
    const rows = filtered.map((inv) =>
      [
        inv.invoiceNumber,
        `"${inv.customer?.name || ""}"`,
        inv.grandTotal?.toFixed(2) || "0.00",
        inv.status,
        inv.invoiceDate,
      ].join(","),
    )
    const csv = [header, ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "invoices.csv"
    a.click()
    URL.revokeObjectURL(url)
    showSuccessToast("Export complete")
  }

  const handleDownloadPDF = (inv) => {
    setViewTarget(inv)
    setTimeout(() => window.print(), 500)
  }

  const handleSendWhatsApp = (inv) => {
    const cs = getCurrencySymbol(inv.currency)
    const text = `Invoice ${inv.invoiceNumber}\nAmount: ${cs}${inv.grandTotal?.toFixed(2)}\nStatus: ${inv.status}\nFrom: AutoInvoice`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/invoices">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Invoice History</h1>
            <p className="text-muted-foreground text-sm mt-1">
              View and manage all your invoices
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleExportCSV}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by invoice #, customer, amount..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-[150px]"
          />
          <span className="text-muted-foreground text-sm">to</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-[150px]"
          />
        </div>
      </div>

      {/* Table or Empty State */}
      {invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16">
          <div className="rounded-full bg-muted p-4 mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No invoices yet</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Create your first invoice to see it here.
          </p>
          <Link to="/create-invoice">
            <Button>Create Invoice</Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No invoices match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((inv) => {
                  const cs = getCurrencySymbol(inv.currency)
                  return (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium font-mono text-sm">
                        {inv.invoiceNumber}
                      </TableCell>
                      <TableCell>{inv.customer?.name || "—"}</TableCell>
                      <TableCell className="text-right font-medium">
                        {cs}{inv.grandTotal?.toFixed(2) || "0.00"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={statusVariant[inv.status] || "outline"}
                          className="capitalize cursor-pointer"
                          onClick={() => handleToggleStatus(inv)}
                        >
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {inv.invoiceDate || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewTarget(inv)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadPDF(inv)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendWhatsApp(inv)}>
                              <Send className="mr-2 h-4 w-4" />
                              Send Again
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
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* View Invoice Dialog */}
      <Dialog
        open={!!viewTarget}
        onOpenChange={(open) => !open && setViewTarget(null)}
      >
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice {viewTarget?.invoiceNumber}</DialogTitle>
          </DialogHeader>
          {viewTarget && (
            <div className="p-6 border rounded-lg bg-background space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-primary">INVOICE</h2>
                  <p className="text-sm text-muted-foreground">{viewTarget.invoiceNumber}</p>
                </div>
                <Badge
                  variant={statusVariant[viewTarget.status] || "outline"}
                  className="capitalize"
                >
                  {viewTarget.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                    Bill To
                  </p>
                  <p className="font-medium">{viewTarget.customer?.name || "—"}</p>
                  <p className="text-sm text-muted-foreground">{viewTarget.customer?.address}</p>
                  {viewTarget.customer?.gst && (
                    <p className="text-sm text-muted-foreground">GST: {viewTarget.customer.gst}</p>
                  )}
                </div>
                <div className="text-right text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">Date: </span>
                    <span className="font-medium">{viewTarget.invoiceDate}</span>
                  </p>
                  {viewTarget.dueDate && (
                    <p>
                      <span className="text-muted-foreground">Due: </span>
                      <span className="font-medium">{viewTarget.dueDate}</span>
                    </p>
                  )}
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Tax</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(viewTarget.items || [])
                    .filter((it) => it.name)
                    .map((it, i) => {
                      const cs = getCurrencySymbol(viewTarget.currency)
                      return (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{it.name}</TableCell>
                          <TableCell className="text-right">{it.quantity}</TableCell>
                          <TableCell className="text-right">
                            {cs}{it.price?.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">{it.tax}%</TableCell>
                          <TableCell className="text-right font-medium">
                            {cs}{(it.quantity * it.price * (1 + it.tax / 100)).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
              </Table>
              <div className="flex justify-end">
                <div className="w-56 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>
                      {getCurrencySymbol(viewTarget.currency)}
                      {viewTarget.subtotal?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>
                      {getCurrencySymbol(viewTarget.currency)}
                      {viewTarget.totalTax?.toFixed(2)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                      {getCurrencySymbol(viewTarget.currency)}
                      {viewTarget.grandTotal?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              {viewTarget.notes && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-semibold">Notes</p>
                  <p className="text-sm text-muted-foreground">{viewTarget.notes}</p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setViewTarget(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete invoice{" "}
              <strong>{deleteTarget?.invoiceNumber}</strong>? This action cannot be
              undone.
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
