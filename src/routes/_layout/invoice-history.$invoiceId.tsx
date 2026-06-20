import { useMutation, useQuery } from "@tanstack/react-query"
import type { LucideIcon } from "lucide-react"
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  CircleDashed,
  CircleX,
  CreditCard,
  IndianRupee,
  Mail,
  MapPin,
  Phone,
  Receipt,
  Send,
  StickyNote,
  Trash2,
  User,
} from "lucide-react"
import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { InvoicesService } from "@/client/sdk.gen"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  invoiceDetailQueryOptions,
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

function fmt(num: number | undefined, currency?: string): string {
  const cs = getCurrencySymbol(currency)
  return `${cs}${Number(num || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
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

interface InfoRowProps {
  icon: LucideIcon
  label: string
  value?: string
}

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="mt-0.5 shrink-0 rounded-md bg-muted p-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground leading-none mb-0.5">
          {label}
        </p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

// ─── Not Found ────────────────────────────────────────────────────────────────

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="rounded-full bg-muted p-5 mb-5">
        <AlertTriangle className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Invoice not found</h2>
      <p className="text-muted-foreground text-sm mb-6 max-w-xs">
        This invoice no longer exists, or the link may be incorrect.
      </p>
      <Link to="/invoice-history">
        <Button variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoice History
        </Button>
      </Link>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function InvoiceDetailPage() {
  useDocumentTitle("Invoice Detail")
  const { invoiceId } = useParams<{ invoiceId: string }>()
  const { showSuccessToast } = useCustomToast()
  const navigate = useNavigate()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data: invoice, isLoading } = useQuery(
    invoiceDetailQueryOptions(invoiceId),
  )

  const updateInvoiceMutation = useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string
      patch: Record<string, unknown>
    }) => {
      return InvoicesService.updateInvoice({
        id,
        requestBody: patch as Parameters<typeof InvoicesService.updateInvoice>[0]["requestBody"],
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
      navigate("/invoice-history")
    },
  })

  if (!isLoading && !invoice) return <NotFound />
  if (!invoice) return null

  const cs = getCurrencySymbol(invoice.currency)
  const StatusIcon = statusIcon[invoice.status ?? "unpaid"] ?? CircleDashed
  const validItems = (invoice.items || []).filter((it) => it.name)

  const handleToggleStatus = () => {
    const next: "paid" | "unpaid" | "overdue" =
      invoice.status === "paid"
        ? "unpaid"
        : invoice.status === "unpaid"
          ? "overdue"
          : "paid"
    updateInvoiceMutation.mutate({ id: invoice.id, patch: { status: next } })
    showSuccessToast(`Status changed to ${next}`)
  }

  const handleDelete = () => {
    deleteInvoiceMutation.mutate(invoice.id)
  }

  const handleWhatsApp = () => {
    const text = `Invoice ${invoice.invoiceNumber}\nAmount: ${cs}${Number(invoice.grandTotal).toFixed(2)}\nStatus: ${invoice.status}\nFrom: AutoInvoice`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-mono">
              {invoice.invoiceNumber}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Invoice detail</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Badge
            variant={statusVariant[invoice.status ?? "unpaid"] ?? "outline"}
            className="capitalize cursor-pointer gap-1 py-1 px-3 text-sm"
            onClick={handleToggleStatus}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {invoice.status}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleWhatsApp}>
            <Send className="mr-2 h-4 w-4" />
            WhatsApp
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Left: Invoice Content */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Invoice meta */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">Invoice Details</CardTitle>
                </div>
                <p className="text-xs text-muted-foreground">
                  Issued {invoice.invoiceDate || "—"}
                </p>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Invoice #</p>
                <p className="font-medium font-mono">{invoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Date</p>
                <p className="font-medium">{invoice.invoiceDate || "—"}</p>
              </div>
              {invoice.dueDate && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                  <p className="font-medium">{invoice.dueDate}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Currency</p>
                <p className="font-medium">{invoice.currency || "INR"}</p>
              </div>
              {invoice.customer?.gst && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Customer GST
                  </p>
                  <p className="font-medium font-mono">
                    {invoice.customer.gst}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items table */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Line Items</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {validItems.length === 0 ? (
                <div className="px-6 pb-6 text-sm text-muted-foreground">
                  No items recorded for this invoice.
                </div>
              ) : (
                <>
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
                      {validItems.map((it, i) => {
                        const lineTotal =
                          (it.quantity ?? 0) * (it.price ?? 0) * (1 + (it.tax ?? 0) / 100)
                        return (
                          <TableRow key={i}>
                            <TableCell>
                              <p className="font-medium">{it.name}</p>
                              {it.description && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {it.description}
                                </p>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {it.quantity}
                            </TableCell>
                            <TableCell className="text-right">
                              {cs}
                              {Number(it.price).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              {it.tax}%
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {cs}
                              {lineTotal.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>

                  {/* Totals footer */}
                  <div className="flex justify-end px-6 py-4 bg-muted/20 border-t">
                    <div className="w-56 space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{fmt(invoice.subtotal, invoice.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax / GST</span>
                        <span>{fmt(invoice.totalTax, invoice.currency)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-base">
                        <span>Total</span>
                        <span className="text-primary">
                          {fmt(invoice.grandTotal, invoice.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Notes / Payment Terms */}
          {(invoice.notes || invoice.paymentTerms) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Notes & Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {invoice.notes && (
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-md bg-muted p-1.5 shrink-0">
                      <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Notes
                      </p>
                      <p>{invoice.notes}</p>
                    </div>
                  </div>
                )}
                {invoice.paymentTerms && (
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-md bg-muted p-1.5 shrink-0">
                      <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Payment Terms
                      </p>
                      <p>{invoice.paymentTerms}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Customer + Summary */}
        <div className="flex flex-col gap-4">
          {/* Customer card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Bill To</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              <InfoRow
                icon={User}
                label="Name"
                value={invoice.customer?.name ?? undefined}
              />
              <InfoRow
                icon={Mail}
                label="Email"
                value={invoice.customer?.email ?? undefined}
              />
              <InfoRow
                icon={Phone}
                label="Phone"
                value={invoice.customer?.phone ?? undefined}
              />
              <InfoRow
                icon={MapPin}
                label="Address"
                value={invoice.customer?.address ?? undefined}
              />
              <InfoRow
                icon={Receipt}
                label="GST / Tax ID"
                value={invoice.customer?.gst ?? undefined}
              />
            </CardContent>
          </Card>

          {/* Payment summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Grand Total</span>
                </div>
                <span className="font-bold text-primary">
                  {fmt(invoice.grandTotal, invoice.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Due Date</span>
                </div>
                <span className="font-medium">
                  {invoice.dueDate || "Not set"}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant={statusVariant[invoice.status ?? "unpaid"] ?? "outline"}
                  className="capitalize cursor-pointer gap-1"
                  onClick={handleToggleStatus}
                >
                  <StatusIcon className="h-3 w-3" />
                  {invoice.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Click the badge to cycle status
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Delete Dialog ── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete invoice{" "}
              <strong>{invoice.invoiceNumber}</strong>? This action cannot be
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

export default InvoiceDetailPage
