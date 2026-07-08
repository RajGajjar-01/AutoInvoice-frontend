import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  CircleX,
  Clock,
  FilePlus,
  FileText,
  IndianRupee,
  LayoutTemplate,
  MoreHorizontal,
  Search,
  Send,
  SortAsc,
  SortDesc,
  Trash2,
} from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DeleteInvoiceDialog } from "@/features/invoices/components/DeleteInvoiceDialog"
import { InvoicesEmptyState } from "@/features/invoices/components/InvoicesEmptyState"
import { InvoicesSkeleton } from "@/features/invoices/components/InvoicesSkeleton"
import { StatusBadge } from "@/features/invoices/components/StatusBadge"
import { useInvoices } from "@/features/invoices/hooks/useInvoices"
import { fmt, fmtShort } from "@/features/invoices/utils"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

type TabId = "all" | "unpaid" | "overdue" | "paid"

function InvoicesPage() {
  useDocumentTitle("Invoices")
  const {
    invoices,
    isLoading,
    totalCount,
    paidCount,
    unpaidCount,
    overdueCount,
    totalRevenue,
    outstanding,
    deleteTarget,
    setDeleteTarget,
    handleToggleStatus,
    handleDelete,
    handleWhatsApp,
  } = useInvoices()

  const [activeTab, setActiveTab] = useState<TabId>("all")
  const [search, setSearch] = useState("")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")

  const filtered = useMemo(() => {
    let list = invoices
    if (activeTab !== "all") list = list.filter((i) => i.status === activeTab)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (i) =>
          i.invoiceNumber?.toLowerCase().includes(q) ||
          i.customer?.name?.toLowerCase().includes(q) ||
          (i.customer as any)?.email?.toLowerCase().includes(q) ||
          String(i.grandTotal).includes(q),
      )
    }
    return [...list].sort((a, b) => {
      const aDate = a.createdAt || (a as any).invoiceDate || ""
      const bDate = b.createdAt || (b as any).invoiceDate || ""
      return sortOrder === "newest"
        ? bDate.localeCompare(aDate)
        : aDate.localeCompare(bDate)
    })
  }, [invoices, activeTab, search, sortOrder])

  if (isLoading) return <InvoicesSkeleton />

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: "all", label: "All", count: totalCount },
    { id: "unpaid", label: "Unpaid", count: unpaidCount },
    { id: "overdue", label: "Overdue", count: overdueCount },
    { id: "paid", label: "Paid", count: paidCount },
  ]

  const hasFilter = search.trim() !== "" || activeTab !== "all"

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between animate-in">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Invoices
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage, track, and send all your invoices
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/invoice-templates">
            <Button variant="outline" size="sm">
              <LayoutTemplate className="mr-1.5 h-4 w-4" />
              Templates
            </Button>
          </Link>
          <Link to="/create-invoice">
            <Button size="sm">
              <FilePlus className="mr-1.5 h-4 w-4" /> New Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary pills */}
      <div className="grid grid-cols-3 gap-3 animate-in animate-in-delay-1">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-3 px-4 flex items-center gap-3">
            <IndianRupee className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="font-bold text-base text-primary leading-tight">
                {fmtShort(totalRevenue)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="py-3 px-4 flex items-center gap-3">
            <Clock className="h-4 w-4 text-amber-500 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Outstanding</p>
              <p className="font-bold text-base text-amber-600 dark:text-amber-400 leading-tight">
                {fmtShort(outstanding)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card
          className={
            overdueCount > 0
              ? "bg-destructive/5 border-destructive/20"
              : "bg-emerald-500/5 border-emerald-500/20"
          }
        >
          <CardContent className="py-3 px-4 flex items-center gap-3">
            {overdueCount > 0 ? (
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            )}
            <div>
              <p className="text-xs text-muted-foreground">Overdue</p>
              <p
                className={`font-bold text-base leading-tight ${overdueCount > 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}
              >
                {overdueCount > 0
                  ? `${overdueCount} invoice${overdueCount !== 1 ? "s" : ""}`
                  : "All clear"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search + sort */}
      <div className="flex items-center gap-2 animate-in animate-in-delay-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search invoice #, customer, email or amount…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setSortOrder((o) => (o === "newest" ? "oldest" : "newest"))
          }
          title={sortOrder === "newest" ? "Newest first" : "Oldest first"}
        >
          {sortOrder === "newest" ? (
            <SortDesc className="h-4 w-4" />
          ) : (
            <SortAsc className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 border-b border-border -mt-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            <Badge
              variant={activeTab === tab.id ? "default" : "secondary"}
              className="text-[10px] h-4 px-1.5 min-w-[18px] justify-center"
            >
              {tab.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Table */}
      {invoices.length === 0 ? (
        <InvoicesEmptyState />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-3">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-sm mb-1">No invoices found</p>
          <p className="text-xs text-muted-foreground mb-3">
            Try a different search or filter
          </p>
          {hasFilter && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("")
                setActiveTab("all")
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-muted/30">
                <TableHead className="w-[160px]">Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right w-[50px]">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((inv) => (
                <TableRow
                  key={inv.id}
                  className="hover:bg-muted/40 transition-colors group"
                >
                  <TableCell className="font-mono text-sm font-semibold">
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
                      {(inv.customer as any)?.email && (
                        <span className="block text-xs text-muted-foreground mt-0.5">
                          {(inv.customer as any).email}
                        </span>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {inv.invoiceDate || "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {(inv as any).dueDate ? (
                      <span
                        className={
                          inv.status === "overdue"
                            ? "text-destructive font-medium"
                            : "text-muted-foreground"
                        }
                      >
                        {(inv as any).dueDate}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-sm">
                    <Link
                      to={`/invoice-history/${inv.id}`}
                      className="block hover:text-primary transition-colors"
                    >
                      {fmt(inv.grandTotal, inv.currency)}
                    </Link>
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

          {/* Footer */}
          <div className="px-4 py-2.5 border-t bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-3">
              Showing {filtered.length} of {totalCount} invoices
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                {paidCount} paid
              </span>
              <span className="flex items-center gap-1.5">
                <CircleDashed className="h-3 w-3 text-amber-500" />
                {unpaidCount} unpaid
              </span>
              <span className="flex items-center gap-1.5">
                <CircleX className="h-3 w-3 text-destructive" />
                {overdueCount} overdue
              </span>
            </span>
            {hasFilter && (
              <button
                type="button"
                className="hover:text-foreground transition-colors"
                onClick={() => {
                  setSearch("")
                  setActiveTab("all")
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
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

export default InvoicesPage
