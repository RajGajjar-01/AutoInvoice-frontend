import {
  CheckCircle as CheckCircle2,
  CircleDashed,
  FileText,
  DotsThree as MoreHorizontal,
  ShareNetwork as Share2,
  Trash as Trash2,
} from "@phosphor-icons/react"
import { Link } from "react-router"
import { ListRow } from "@/components/Common/ListRow"
import { SwipeableRow } from "@/components/Common/SwipeableRow"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Invoice } from "@/features/invoices/hooks/useInvoices"
import { fmt } from "@/features/invoices/utils"
import { shareText } from "@/lib/share"
import { StatusBadge } from "./StatusBadge"

interface MobileInvoiceCardProps {
  invoice: Invoice
  onSetPaid: (invoice: Invoice, paid: boolean) => void
  /** Delete from the menu: opens the confirm dialog. */
  onDelete: (invoice: Invoice) => void
  /** Delete from a swipe: removes at once with undo. */
  onSwipeDelete: (invoice: Invoice) => void
}

export const invoiceTransitionName = (id: string) => `invoice-${id}`

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
  onSetPaid,
  onDelete,
  onSwipeDelete,
}: MobileInvoiceCardProps) {
  const paid = invoice.status === "paid"
  const PaidIcon = paid ? CircleDashed : CheckCircle2
  const paidLabel = paid ? "Mark as unpaid" : "Mark as paid"

  return (
    <SwipeableRow
      startActions={[
        {
          label: paid ? "Unpaid" : "Paid",
          icon: PaidIcon,
          className: paid ? "bg-amber-500" : "bg-emerald-600",
          onAction: () => onSetPaid(invoice, !paid),
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
          onAction: () => onSwipeDelete(invoice),
        },
      ]}
    >
      <ListRow
        to={`/invoice-history/${invoice.id}`}
        transitionName={invoiceTransitionName(invoice.id)}
        title={invoice.customer?.name || invoice.invoiceNumber}
        subtitle={[
          invoice.invoiceNumber,
          invoice.dueDate ? `Due ${invoice.dueDate}` : invoice.invoiceDate,
        ]
          .filter(Boolean)
          .join(" · ")}
        trailing={
          <>
            <span className="font-semibold tabular-nums">
              {fmt(invoice.grandTotal, invoice.currency)}
            </span>
            <StatusBadge status={invoice.status} />
          </>
        }
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-11"
                  aria-label={`Actions for invoice ${invoice.invoiceNumber}`}
                />
              }
            >
              <MoreHorizontal className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                render={<Link to={`/invoice-history/${invoice.id}`} />}
              >
                <FileText /> View details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSetPaid(invoice, !paid)}>
                <PaidIcon /> {paidLabel}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => shareInvoice(invoice)}>
                <Share2 /> Share
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(invoice)}
              >
                <Trash2 /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
    </SwipeableRow>
  )
}
