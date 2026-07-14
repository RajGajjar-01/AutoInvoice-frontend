import { createFileRoute, useNavigate, Link } from "@tanstack/react-router"
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    CircleDashed,
    CircleX,
    CircleDot,
    Download,
    Send,
    Trash2,
    FileText,
    User,
    MapPin,
    Phone,
    Mail,
    Calendar,
    IndianRupee,
    Receipt,
    StickyNote,
    CreditCard,
    ChevronDown,
    Copy,
} from "lucide-react"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { LoadingButton } from "@/components/ui/loading-button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import useLocalStorage from "@/hooks/useLocalStorage"
import useCustomToast from "@/hooks/useCustomToast"
import { useState } from "react"
import { downloadInvoicePdf } from "@/lib/invoicePdf"

export const Route = createFileRoute("/_layout/invoice-history/$invoiceId")({
    component: InvoiceDetailPage,
    head: () => ({
        meta: [{ title: "Document Detail — UnifiedDesk" }],
    }),
})

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

function InfoRow({ icon: Icon, label, value }) {
    if (!value) return null
    return (
        <div className="flex items-start gap-3 py-2.5">
            <div className="mt-0.5 shrink-0 rounded-md bg-muted p-1.5">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground leading-none mb-0.5">{label}</p>
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
    const { invoiceId } = Route.useParams()
    const [invoices, setInvoices] = useLocalStorage("invoices", [])
    const { showSuccessToast, showErrorToast } = useCustomToast()
    const navigate = useNavigate()
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [partialDialogOpen, setPartialDialogOpen] = useState(false)
    const [partialAmountInput, setPartialAmountInput] = useState("")

    const invoice = invoices.find((i) => i.id === invoiceId)

    if (!invoice) return <NotFound />

    const docType = invoice.type || "invoice"
    const docTitle = docType === "quotation" ? "Quotation" : docType === "challan" ? "Delivery Challan" : docType === "proforma" ? "Proforma Invoice" : "Invoice"

    const cs = getCurrencySymbol(invoice.currency)
    const StatusIcon = statusIcon[invoice.status] ?? CircleDashed
    const validItems = (invoice.items || []).filter((it) => it.name)

    const grandTotal = Number(invoice.grandTotal) || 0
    const partialPaid = Number(invoice.partialAmountPaid) || 0
    const remaining = grandTotal - partialPaid
    const paidPct = grandTotal > 0 ? Math.min(100, Math.round((partialPaid / grandTotal) * 100)) : 0

    const handleToggleStatus = () => {
        const cycle = { unpaid: "partial", partial: "overdue", overdue: "paid", paid: "unpaid" }
        const next = cycle[invoice.status] ?? "unpaid"
        if (next === "partial") {
            setPartialAmountInput(invoice.partialAmountPaid ? String(invoice.partialAmountPaid) : "")
            setPartialDialogOpen(true)
            return
        }
        setInvoices((prev) =>
            prev.map((i) => (i.id === invoice.id ? { ...i, status: next } : i)),
        )
        showSuccessToast(`Status changed to ${next}`)
    }

    const handleSavePartial = () => {
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
                i.id === invoice.id
                    ? { ...i, status: "partial", partialAmountPaid: amt }
                    : i
            ),
        )
        setPartialDialogOpen(false)
        showSuccessToast(`Partial payment of ${cs}${amt.toFixed(2)} recorded`)
    }

    const handleDelete = () => {
        setInvoices((prev) => prev.filter((i) => i.id !== invoice.id))
        showSuccessToast(`${docTitle} deleted`)
        navigate({ to: "/invoice-history" })
    }

    const handleWhatsApp = () => {
        const text = `${docTitle} ${invoice.invoiceNumber}\nAmount: ${cs}${Number(invoice.grandTotal).toFixed(2)}\nStatus: ${invoice.status}\nFrom: UnifiedDesk`
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
    }

    const handleDownloadPDF = () => {
        downloadInvoicePdf(invoice)
    }

    return (
        <div className="flex flex-col gap-6">
            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight font-mono">
                            {invoice.invoiceNumber}
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1 capitalize">
                            {docType} detail
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <Badge
                        variant={statusVariant[invoice.status] ?? "outline"}
                        className={`capitalize cursor-pointer gap-1 py-1 px-3 text-sm ${statusStyle[invoice.status] ?? ""}`}
                        onClick={handleToggleStatus}
                        title="Click to cycle status"
                    >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {invoice.status === "partial" ? "Partial Paid" : invoice.status}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleWhatsApp}>
                        <Send className="mr-2 h-4 w-4" />
                        WhatsApp
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Copy className="mr-2 h-4 w-4" />
                                Convert
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {docType !== "invoice" && (
                                <DropdownMenuItem onClick={() => navigate({ to: "/create-invoice", search: { fromId: invoice.id, type: "invoice" } })}>
                                    Convert to Invoice
                                </DropdownMenuItem>
                            )}
                            {docType === "quotation" && (
                                <DropdownMenuItem onClick={() => navigate({ to: "/create-invoice", search: { fromId: invoice.id, type: "proforma" } })}>
                                    Convert to Proforma
                                </DropdownMenuItem>
                            )}
                            {docType !== "challan" && (
                                <DropdownMenuItem onClick={() => navigate({ to: "/create-invoice", search: { fromId: invoice.id, type: "challan" } })}>
                                    Convert to Delivery Challan
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left: Invoice Content */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    {/* Invoice meta */}
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-base">{docTitle} Details</CardTitle>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Issued {invoice.invoiceDate || "—"}
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">{docType === "quotation" ? "Quotation" : "Invoice"} #</p>
                                <p className="font-medium font-mono">{invoice.invoiceNumber}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Date</p>
                                <p className="font-medium">{invoice.invoiceDate || "—"}</p>
                            </div>
                            {invoice.validityDate && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Validity Date</p>
                                    <p className="font-medium text-orange-600">{invoice.validityDate}</p>
                                </div>
                            )}
                            {invoice.dueDate && !invoice.validityDate && (
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
                                    <p className="text-xs text-muted-foreground mb-1">Customer GST</p>
                                    <p className="font-medium font-mono">{invoice.customer.gst}</p>
                                </div>
                            )}
                            {invoice.sourceId && (
                                <div className="col-span-2 sm:col-span-3 pt-2">
                                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                        <Copy className="h-3 w-3" /> Converted From
                                    </p>
                                    <Link
                                        to="/invoice-history/$invoiceId"
                                        params={{ invoiceId: invoice.sourceId }}
                                        className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                                    >
                                        View Source Document
                                        <ArrowLeft className="h-3 w-3 rotate-180" />
                                    </Link>
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
                                                    it.quantity * it.price * (1 + it.tax / 100)
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
                                                        <TableCell className="text-right">{it.quantity}</TableCell>
                                                        <TableCell className="text-right">
                                                            {cs}{Number(it.price).toFixed(2)}
                                                        </TableCell>
                                                        <TableCell className="text-right">{it.tax}%</TableCell>
                                                        <TableCell className="text-right font-medium">
                                                            {cs}{lineTotal.toFixed(2)}
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
                                            <p className="text-xs text-muted-foreground mb-0.5">Notes</p>
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
                                            <p className="text-xs text-muted-foreground mb-0.5">Payment Terms</p>
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
                            <CardTitle className="text-base">
                                {docType === "challan" ? "Recipient" : "Bill To"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="divide-y divide-border">
                            <InfoRow icon={User} label="Name" value={invoice.customer?.name} />
                            <InfoRow icon={Mail} label="Email" value={invoice.customer?.email} />
                            <InfoRow icon={Phone} label="Phone" value={invoice.customer?.phone} />
                            <InfoRow icon={MapPin} label="Address" value={invoice.customer?.address} />
                            <InfoRow
                                icon={Receipt}
                                label="GST / Tax ID"
                                value={invoice.customer?.gst}
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
                                <span className="font-medium">{invoice.dueDate || "Not set"}</span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Status</span>
                                <Badge
                                    variant={statusVariant[invoice.status] ?? "outline"}
                                    className={`capitalize cursor-pointer gap-1 ${statusStyle[invoice.status] ?? ""}`}
                                    onClick={handleToggleStatus}
                                    title="Click to cycle: unpaid → partial → overdue → paid"
                                >
                                    <StatusIcon className="h-3 w-3" />
                                    {invoice.status === "partial" ? "Partial Paid" : invoice.status}
                                </Badge>
                            </div>
                            {invoice.status === "partial" && (
                                <>
                                    <Separator />
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Amount Paid</span>
                                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                {fmt(partialPaid, invoice.currency)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Remaining</span>
                                            <span className="font-semibold text-amber-600 dark:text-amber-400">
                                                {fmt(remaining, invoice.currency)}
                                            </span>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="h-2 rounded-full bg-muted overflow-hidden mt-1">
                                            <div
                                                className="h-full rounded-full bg-emerald-500 transition-all"
                                                style={{ width: `${paidPct}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground text-right">{paidPct}% collected</p>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="w-full text-xs mt-1 border-amber-400 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                            onClick={() => {
                                                setPartialAmountInput(String(partialPaid || ""))
                                                setPartialDialogOpen(true)
                                            }}
                                        >
                                            <CircleDot className="mr-1.5 h-3 w-3" />
                                            Update Partial Amount
                                        </Button>
                                    </div>
                                </>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Click the badge to cycle status
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* ── Partial Payment Dialog ── */}
            <Dialog open={partialDialogOpen} onOpenChange={setPartialDialogOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CircleDot className="h-4 w-4 text-amber-500" />
                            Record Partial Payment
                        </DialogTitle>
                        <DialogDescription>
                            Enter the amount already received for invoice{" "}
                            <strong>{invoice.invoiceNumber}</strong>. Total is{" "}
                            <strong>{fmt(grandTotal, invoice.currency)}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="partial-amount">Amount Paid ({invoice.currency || "INR"})</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{cs}</span>
                                <Input
                                    id="partial-amount"
                                    type="number"
                                    min="0"
                                    max={grandTotal - 0.01}
                                    step="0.01"
                                    placeholder="0.00"
                                    className="pl-7"
                                    value={partialAmountInput}
                                    onChange={(e) => setPartialAmountInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSavePartial()}
                                    autoFocus
                                />
                            </div>
                            {partialAmountInput && !isNaN(parseFloat(partialAmountInput)) && parseFloat(partialAmountInput) > 0 && parseFloat(partialAmountInput) < grandTotal && (
                                <p className="text-xs text-muted-foreground">
                                    Remaining: <span className="font-medium text-amber-600 dark:text-amber-400">
                                        {fmt(grandTotal - parseFloat(partialAmountInput), invoice.currency)}
                                    </span>
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
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

            {/* ── Delete Dialog ── */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete {docTitle}</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {docType}{" "}
                            <strong>{invoice.invoiceNumber}</strong>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <LoadingButton variant="destructive" loading={false} onClick={handleDelete}>
                            Delete
                        </LoadingButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
