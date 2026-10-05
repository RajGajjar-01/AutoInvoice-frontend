import { FileText, MoreHorizontal, Send, Trash2 } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Invoice } from "@/features/invoices/hooks/useInvoices"
import { fmt } from "@/features/invoices/utils"
import { StatusBadge } from "./StatusBadge"

interface MobileInvoiceCardProps {
  invoice: Invoice
  onStatusChange: (invoice: Invoice) => void
  onWhatsApp: (invoice: Invoice) => void
  onDelete: (invoice: Invoice) => void
}

export function MobileInvoiceCard({
  invoice,
  onStatusChange,
  onWhatsApp,
  onDelete,
}: MobileInvoiceCardProps) {
  return (
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
  )
}
