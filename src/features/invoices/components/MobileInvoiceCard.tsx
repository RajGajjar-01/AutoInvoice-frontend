import {
  CheckCircle2,
  CircleDashed,
  FileText,
  MoreHorizontal,
  Send,
  Share2,
  Trash2,
} from "lucide-react"
import { Link } from "react-router"
import { SwipeableRow } from "@/components/Common/SwipeableRow"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Invoice } from "@/features/invoices/hooks/useInvoices"
import { fmt } from "@/features/invoices/utils"
import { shareText } from "@/lib/share"
import { StatusBadge } from "./StatusBadge"

interface MobileInvoiceCardProps {
  invoice: Invoice
  onStatusChange: (invoice: Invoice) => void
  onWhatsApp: (invoice: Invoice) => void
  onDelete: (invoice: Invoice) => void
  /** Paid/unpaid from a swipe. Falls back to the status cycle. */
  onSetPaid?: (invoice: Invoice, paid: boolean) => void
  /** Delete from a swipe, with undo instead of a dialog. */
  onSwipeDelete?: (invoice: Invoice) => void
}

const shareInvoice = (inv: Invoice) =>
  shareText(
    `Invoice ${inv.invoiceNumber}`,
    [
      `Invoice ${inv.invoiceNumber}`,
      inv.customer?.name && `Customer: ${inv.customer.name}`,
      `Amount: ${fmt(inv.grandTotal, inv.currency)}`,
      inv.dueDate && `Due: ${inv.dueDate}`,
      `Status: ${inv.status}`,
    ]
      .filter(Boolean)
      .join("\n"),
  )

export function MobileInvoiceCard({
  invoice,
  onStatusChange,
  onWhatsApp,
  onDelete,
  onSetPaid,
  onSwipeDelete,
}: MobileInvoiceCardProps) {
  const paid = invoice.status === "paid"
  return (
    <SwipeableRow
      startActions={[
        {
          label: paid ? "Unpaid" : "Paid",
          icon: paid ? CircleDashed : CheckCircle2,
          className: paid ? "bg-amber-500" : "bg-emerald-600",
          onAction: () =>
            onSetPaid ? onSetPaid(invoice, !paid) : onStatusChange(invoice),
        },
        {
          label: "Share",
          icon: Share2,
          className: "bg-primary",
          onAction: () => shareInvoice(invoice),
        },
      ]}
      endActions={[
        {
          label: "Delete",
          icon: Trash2,
          className: "bg-destructive",
          onAction: () => (onSwipeDelete ?? onDelete)(invoice),
        },
      ]}
    >
      <article className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              to={`/invoice-history/${invoice.id}`}
              className="block break-words font-semibold text-primary underline-offset-4 hover:underline"
            >
              {invoice.invoiceNumber}
            </Link>
            <p className="mt-1 break-words text-sm font-medium">
              {invoice.customer?.name || "No customer"}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="-mr-2 -mt-2 size-11"
                aria-label={`Actions for invoice ${invoice.invoiceNumber}`}
              >
                <MoreHorizontal className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/invoice-history/${invoice.id}`}>
                  <FileText className="mr-2 h-4 w-4" /> View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onWhatsApp(invoice)}>
                <Send className="mr-2 h-4 w-4" /> Send via WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => shareInvoice(invoice)}>
                <Share2 className="mr-2 h-4 w-4" /> Share
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(invoice)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            to={`/invoice-history/${invoice.id}`}
            className="text-base font-semibold"
          >
            {fmt(invoice.grandTotal, invoice.currency)}
          </Link>
          <StatusBadge
            status={invoice.status}
            onClick={() => onStatusChange(invoice)}
          />
        </div>
        {(invoice.invoiceDate || invoice.dueDate) && (
          <p className="text-xs text-muted-foreground">
            {invoice.invoiceDate && `Issued ${invoice.invoiceDate}`}
            {invoice.invoiceDate && invoice.dueDate && " · "}
            {invoice.dueDate && `Due ${invoice.dueDate}`}
          </p>
        )}
      </article>
    </SwipeableRow>
  )
}
