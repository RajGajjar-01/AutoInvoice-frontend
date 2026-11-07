import {
  AlertTriangle,
  Clock,
  FilePlus,
  FileText,
  IndianRupee,
  MoreHorizontal,
  Send,
  Trash2,
} from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router"
import { FilterChips } from "@/components/Common/FilterChips"
import { ListSkeleton } from "@/components/Common/ListSkeleton"
import { PageHeader } from "@/components/Common/PageHeader"
import { SearchInput } from "@/components/Common/SearchInput"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { MobileInvoiceCard } from "@/features/invoices/components/MobileInvoiceCard"
import { StatCard } from "@/features/invoices/components/StatCard"
import { StatusBadge } from "@/features/invoices/components/StatusBadge"
import { useInvoices } from "@/features/invoices/hooks/useInvoices"
import { fmt } from "@/features/invoices/utils"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

function InvoiceHistoryPage() {
  useDocumentTitle("Invoice History")
  const {
    invoices,
    isLoading,
    totalRevenue,
    outstanding,
    overdueCount,
    deleteTarget,
    setDeleteTarget,
    handleToggleStatus,
    handleDelete,
    handleWhatsApp,
    setStatus,
    deleteWithUndo,
  } = useInvoices()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<string>("newest")

  // ── Stats ────────────────────────────────────────────────────────────────

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

  if (isLoading) return <ListSkeleton />

  const hasSearch = search.trim() !== "" || statusFilter !== "all"

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Invoice History"
        description="Search, filter, and manage all your invoices"
        actions={
          <Button asChild className="max-md:hidden">
            <Link to="/create-invoice">
              <FilePlus /> New Invoice
            </Link>
          </Button>
        }
      />

      <div className="hidden grid-cols-2 gap-4 md:grid lg:grid-cols-4 animate-in animate-in-delay-1">
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
        <div className="flex flex-col gap-3 animate-in animate-in-delay-2">
          <div className="flex items-center gap-2">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by invoice #, customer, amount…"
              className="sm:max-w-sm"
            />
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger
                className="w-32 shrink-0 sm:w-36"
                aria-label="Sort"
              >
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <FilterChips
            label="Invoice status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: "All", count: invoices.length },
              ...(["unpaid", "overdue", "paid"] as const).map((st) => ({
                value: st,
                label: st[0].toUpperCase() + st.slice(1),
                count: invoices.filter((i) => i.status === st).length,
              })),
            ]}
          />
        </div>
      )}

      {invoices.length === 0 ? (
        <HistoryEmptyState hasSearch={false} />
      ) : filtered.length === 0 ? (
        <HistoryEmptyState hasSearch={true} />
      ) : (
        <Card className="animate-in animate-in-delay-2">
          <CardContent className="px-0 pb-0">
            <div className="divide-y md:hidden">
              {filtered.map((inv) => (
                <MobileInvoiceCard
                  key={inv.id}
                  invoice={inv}
                  onWhatsApp={handleWhatsApp}
                  onDelete={setDeleteTarget}
                  onSetPaid={(inv, paid) =>
                    setStatus(inv, paid ? "paid" : "unpaid")
                  }
                  onSwipeDelete={deleteWithUndo}
                />
              ))}
            </div>
            <div className="hidden md:block">
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
                            {inv.customer?.name || "-"}
                          </span>
                          {inv.customer?.email && (
                            <span className="block text-xs text-muted-foreground mt-0.5">
                              {inv.customer.email}
                            </span>
                          )}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {inv.invoiceDate || "-"}
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
                          <span className="text-muted-foreground">-</span>
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
                                <FileText className="mr-2 h-4 w-4" /> View
                                Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleWhatsApp(inv)}
                            >
                              <Send className="mr-2 h-4 w-4" /> Send via
                              WhatsApp
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
            </div>

            <div className="hidden px-6 py-3 border-t bg-muted/20 md:flex items-center justify-between text-xs text-muted-foreground">
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
