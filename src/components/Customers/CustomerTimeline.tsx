import { Link } from "@tanstack/react-router"
import {
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  CircleX,
  Clock,
  FilePlus,
  FileText,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import useLocalStorage from "@/hooks/useLocalStorage"

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  paid: "default",
  unpaid: "secondary",
  overdue: "destructive",
}
const statusIcon: Record<string, typeof CheckCircle2> = {
  paid: CheckCircle2,
  unpaid: CircleDashed,
  overdue: CircleX,
}

function fmt(num: number, currency: string = "INR"): string {
  const cs =
    currency === "USD"
      ? "$"
      : currency === "EUR"
        ? "€"
        : currency === "GBP"
          ? "£"
          : "₹"
  return `${cs}${Number(num || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function EmptyTimeline() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Clock className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="font-medium text-sm mb-1">No invoices yet</p>
      <p className="text-xs text-muted-foreground max-w-xs mb-4">
        Invoices created for this party will appear here.
      </p>
      <Link to="/create-invoice" search={{ documentType: "invoice" }}>
        <Button variant="outline" size="sm">
          <FilePlus className="mr-2 h-3.5 w-3.5" />
          Create Invoice
        </Button>
      </Link>
    </div>
  )
}

interface InvoiceItem {
  name?: string
}

interface Invoice {
  id: string
  invoiceNumber?: string
  status?: string
  invoiceDate?: string
  dueDate?: string
  grandTotal?: number
  totalTax?: number
  currency?: string
  items?: InvoiceItem[]
  customer?: { name?: string }
  customerId?: string
  partyId?: string
  createdAt?: string
}

interface TimelineRowProps {
  invoice: Invoice
}

function TimelineRow({ invoice }: TimelineRowProps) {
  const StatusIcon = statusIcon[invoice.status ?? "unpaid"] ?? CircleDashed

  const date = invoice.invoiceDate
    ? new Date(invoice.invoiceDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—"

  const dueDate = invoice.dueDate
    ? new Date(invoice.dueDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null

  return (
    <>
      <div className="flex items-center gap-4 py-3 group">
        <div className="rounded-lg bg-muted p-2 shrink-0">
          <FileText className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm font-mono truncate">
              {invoice.invoiceNumber || "Invoice"}
            </span>
            <Badge
              variant={statusVariant[invoice.status ?? "unpaid"] ?? "outline"}
              className="text-xs capitalize gap-1"
            >
              <StatusIcon className="h-3 w-3" />
              {invoice.status ?? "unknown"}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-muted-foreground">Issued: {date}</p>
            {dueDate && (
              <p
                className={`text-xs ${invoice.status === "overdue" ? "text-destructive font-medium" : "text-muted-foreground"}`}
              >
                · Due: {dueDate}
              </p>
            )}
          </div>
          {invoice.items && invoice.items.length > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {invoice.items
                .filter((i) => i.name)
                .map((i) => i.name)
                .join(", ")}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="font-semibold text-sm">
            {fmt(invoice.grandTotal ?? 0, invoice.currency)}
          </p>
          {invoice.totalTax && invoice.totalTax > 0 && (
            <p className="text-xs text-muted-foreground">
              +{fmt(invoice.totalTax, invoice.currency)} tax
            </p>
          )}
        </div>
        <Link
          to="/invoice-history/$invoiceId"
          params={{ invoiceId: invoice.id }}
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

interface Customer {
  id: string
  name: string
}

interface CustomerTimelineProps {
  customer: Customer
}

export function CustomerTimeline({ customer }: CustomerTimelineProps) {
  const [invoices] = useLocalStorage<Invoice[]>("invoices", [])

  const partyInvoices = invoices
    .filter((inv) => {
      if (!inv.customer) return false
      if (inv.customerId && inv.customerId === customer.id) return true
      if (inv.partyId && inv.partyId === customer.id) return true
      return inv.customer.name?.toLowerCase() === customer.name?.toLowerCase()
    })
    .sort((a, b) => {
      const aDate = a.createdAt || a.invoiceDate || ""
      const bDate = b.createdAt || b.invoiceDate || ""
      return bDate.localeCompare(aDate)
    })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Invoice History
        </CardTitle>
        <span className="text-xs text-muted-foreground">
          {partyInvoices.length} invoice{partyInvoices.length !== 1 ? "s" : ""}
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
