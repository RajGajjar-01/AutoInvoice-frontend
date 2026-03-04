import {
    ArrowRight,
    Clock,
    FileText,
    Receipt,
} from "lucide-react"
import { Link } from "@tanstack/react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// Status badge variant map (reuse invoice statuses)
const statusVariant = {
    paid: "default",
    unpaid: "secondary",
    overdue: "destructive",
    draft: "secondary",
}

function EmptyTimeline() {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
                <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-sm mb-1">No transactions yet</p>
            <p className="text-xs text-muted-foreground max-w-xs">
                Invoices and payments linked to this party will appear here.
            </p>
        </div>
    )
}

function TimelineRow({ invoice }) {
    const date = invoice.date
        ? new Date(invoice.date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
        : "—"

    const amount =
        invoice.total != null
            ? `₹${Number(invoice.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
            : "—"

    return (
        <>
            <div className="flex items-center gap-4 py-3 group">
                <div className="rounded-lg bg-muted p-2 shrink-0">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm truncate">
                            {invoice.invoiceNumber || invoice.id || "Invoice"}
                        </span>
                        <Badge
                            variant={statusVariant[invoice.status] ?? "outline"}
                            className="text-xs capitalize"
                        >
                            {invoice.status ?? "unknown"}
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{date}</p>
                </div>
                <div className="text-right shrink-0">
                    <p className="font-semibold text-sm">{amount}</p>
                </div>
                <Link
                    to="/invoice-history"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    title="View invoice"
                >
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                        <ArrowRight className="h-3.5 w-3.5" />
                        <span className="sr-only">View invoice</span>
                    </Button>
                </Link>
            </div>
            <Separator />
        </>
    )
}

/**
 * CustomerTimeline — shows all invoices from localStorage linked to a party.
 * Reads the global "invoices" key and filters by customerId.
 */
export function CustomerTimeline({ customerId }) {
    // Read invoices from localStorage — same key used by the invoice pages
    let invoices = []
    try {
        const raw = localStorage.getItem("invoices")
        if (raw) invoices = JSON.parse(raw)
    } catch {
        invoices = []
    }

    // Filter invoices that belong to this party
    const partyInvoices = invoices
        .filter((inv) => inv.customerId === customerId || inv.partyId === customerId)
        .sort((a, b) => new Date(b.date ?? 0) - new Date(a.date ?? 0))

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Transaction Timeline
                </CardTitle>
                <span className="text-xs text-muted-foreground">
                    {partyInvoices.length} transaction{partyInvoices.length !== 1 ? "s" : ""}
                </span>
            </CardHeader>
            <CardContent className="px-6 pt-0">
                {partyInvoices.length === 0 ? (
                    <EmptyTimeline />
                ) : (
                    <div>
                        <Separator />
                        {partyInvoices.map((inv) => (
                            <TimelineRow key={inv.id} invoice={inv} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default CustomerTimeline
