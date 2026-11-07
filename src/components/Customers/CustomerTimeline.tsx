import { Clock, FilePlus, FileText } from "lucide-react"
import { Link } from "react-router"
import { ListRow, ListRows } from "@/components/Common/ListRow"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/features/invoices/components/StatusBadge"
import { fmt } from "@/features/invoices/utils"

const shortDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

function EmptyTimeline({ customerId }: { customerId: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Clock className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="font-medium text-sm mb-1">No invoices yet</p>
      <p className="text-xs text-muted-foreground max-w-xs mb-4">
        Invoices created for this party will appear here.
      </p>
      <Button variant="outline" size="sm" asChild>
        <Link
          to={`/create-invoice?customerId=${customerId}&documentType=invoice`}
        >
          <FilePlus /> Create Invoice
        </Link>
      </Button>
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
  dueDate?: string | null
  grandTotal?: number
  totalTax?: number
  currency?: string
  items?: InvoiceItem[]
  customer?: { name?: string } | null
  customerId?: string
  partyId?: string
  createdAt?: string
}

interface TimelineRowProps {
  invoice: Invoice
}

function TimelineRow({ invoice }: TimelineRowProps) {
  const items = invoice.items
    ?.map((i) => i.name)
    .filter(Boolean)
    .join(", ")
  return (
    <ListRow
      to={`/invoice-history/${invoice.id}`}
      title={
        <span className="font-mono">{invoice.invoiceNumber || "Invoice"}</span>
      }
      subtitle={[
        invoice.invoiceDate && `Issued ${shortDate(invoice.invoiceDate)}`,
        invoice.dueDate && `Due ${shortDate(invoice.dueDate)}`,
        items,
      ]
        .filter(Boolean)
        .join(" · ")}
      trailing={
        <>
          <span className="font-semibold tabular-nums">
            {fmt(invoice.grandTotal ?? 0, invoice.currency)}
          </span>
          <StatusBadge status={invoice.status ?? "unpaid"} />
        </>
      }
    />
  )
}

interface Customer {
  id: string
  name: string
}

interface CustomerTimelineProps {
  customer: Customer
  invoices?: Invoice[]
}

export function CustomerTimeline({
  customer,
  invoices = [],
}: CustomerTimelineProps) {
  const partyInvoices = invoices
    .filter((inv) => {
      const cid = inv.customerId
      return cid === customer.id
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
      <CardContent className="px-4 pt-0 sm:px-6">
        {partyInvoices.length === 0 ? (
          <EmptyTimeline customerId={customer.id} />
        ) : (
          <ListRows className="-mx-2 sm:mx-0">
            {partyInvoices.map((inv) => (
              <TimelineRow key={inv.id} invoice={inv} />
            ))}
          </ListRows>
        )}
      </CardContent>
    </Card>
  )
}

export default CustomerTimeline
