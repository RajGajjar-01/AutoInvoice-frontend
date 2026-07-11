import {
  AlertTriangle,
  Clock,
  FilePlus,
  FileText,
  IndianRupee,
  MoreHorizontal,
  Search,
  Send,
  Trash2,
} from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
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
import { HistoryEmptyState } from "@/features/invoice-history/components/HistoryEmptyState"
import { DeleteInvoiceDialog } from "@/features/invoices/components/DeleteInvoiceDialog"
import { StatCard } from "@/features/invoices/components/StatCard"
import { StatusBadge } from "@/features/invoices/components/StatusBadge"
import { fmt } from "@/features/invoices/utils"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

function InvoiceHistoryPage() {
  useDocumentTitle("Invoice History")
  const { data: invoicesRes } = useQuery(invoicesListQueryOptions())
  const invoices = (invoicesRes?.data ?? []) as Invoice[]
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<string>("newest")
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null)

  const updateInvoiceMutation = useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string
      patch: Partial<Invoice>
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

  // ── Stats ────────────────────────────────────────────────────────────────
  const totalRevenue = invoices.reduce(
    (s, i) => s + (Number(i.grandTotal) || 0),
    0,
  )
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
  const handleToggleStatus = (inv: Invoice) => {
    const next: "paid" | "unpaid" | "overdue" =
      inv.status === "paid"
        ? "unpaid"
        : inv.status === "unpaid"
          ? "overdue"
          : "paid"
    updateInvoiceMutation.mutate({ id: inv.id, patch: { status: next } })
    showSuccessToast(`Status changed to ${next}`)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteInvoiceMutation.mutate(deleteTarget.id)
    setDeleteTarget(null)
  }

  const sendWhatsappMutation = useMutation({
    mutationFn: (body: { id: string; to_phone: string }) =>
      InvoicesService.sendInvoiceWhatsapp({
        id: body.id,
        requestBody: { to_phone: body.to_phone },
      }),
    onSuccess: () => showSuccessToast("Invoice sent via WhatsApp"),
    onError: () => showErrorToast("Failed to send via WhatsApp"),
  })

  const handleWhatsApp = (inv: Invoice) => {
    const phone =
      (inv as any).customer?.whatsapp || (inv as any).customer?.phone
    if (!phone) {
      showErrorToast("No WhatsApp number available")
      return
    }
    sendWhatsappMutation.mutate({ id: inv.id, to_phone: phone })
  }

  const hasSearch = search.trim() !== "" || statusFilter !== "all"

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between animate-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoice History</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Search, filter, and manage all your invoices
          </p>
        </div>
        <Link to="/create-invoice">
          <Button>
            <FilePlus className="mr-2 h-4 w-4" /> New Invoice
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in animate-in-delay-1">
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
          valueClass={
            outstanding > 0 ? "text-amber-600 dark:text-amber-400" : ""
          }
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

      {invoices.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap animate-in animate-in-delay-2">
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

      {invoices.length === 0 ? (
        <HistoryEmptyState hasSearch={false} />
      ) : filtered.length === 0 ? (
        <HistoryEmptyState hasSearch={true} />
      ) : (
        <Card className="animate-in animate-in-delay-2">
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
                {filtered.map((inv) => (
                  <TableRow
                    key={inv.id}
                    className="hover:bg-muted/50 transition-colors group"
                  >
                    <TableCell className="font-mono text-sm font-medium">
                      <Link
                        to={`/invoice-history/${inv.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {inv.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">
                      <Link
                        to={`/invoice-history/${inv.id}`}
                        className="block hover:text-primary transition-colors"
                      >
                        <span className="font-medium">
                          {inv.customer?.name || "—"}
                        </span>
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
                      <StatusBadge
                        status={inv.status}
                        onClick={() => handleToggleStatus(inv)}
                      />
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
                            <Link to={`/invoice-history/${inv.id}`}>
                              <FileText className="mr-2 h-4 w-4" /> View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleWhatsApp(inv)}>
                            <Send className="mr-2 h-4 w-4" /> Send via WhatsApp
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteTarget(inv)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="px-6 py-3 border-t bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing {filtered.length} of {invoices.length} invoices
              </span>
              {hasSearch && (
                <button
                  type="button"
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

      <DeleteInvoiceDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        invoiceNumber={deleteTarget?.invoiceNumber}
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default InvoiceHistoryPage
