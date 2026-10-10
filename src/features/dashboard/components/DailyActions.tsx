import { ArrowUpRight, CalendarDays, CircleX, Package } from "lucide-react"
import { useId, useState } from "react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import type { ActionInvoice, ActionItem } from "@/features/dashboard/actions"
import { fmtShort } from "@/features/invoices/utils"

interface ActionRow {
  id: string
  title: string
  detail: string
  value: string
  to: string
  action: string
}

function ActionList({
  title,
  icon: Icon,
  rows,
  empty,
  unavailable,
}: {
  title: string
  icon: typeof Package
  rows: ActionRow[]
  empty: string
  unavailable: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const headingId = useId()
  const listId = useId()
  return (
    <section aria-labelledby={headingId} className="min-w-0 p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <Icon
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <h3 id={headingId} className="text-sm font-semibold">
          {title}
        </h3>
        {!unavailable && (
          <span className="ml-auto text-sm tabular-nums text-muted-foreground">
            {rows.length}
          </span>
        )}
      </div>
      {unavailable ? (
        <p role="status" className="text-sm text-muted-foreground">
          Could not load these actions. Refresh to try again.
        </p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul id={listId} className="divide-y">
          {(expanded ? rows : rows.slice(0, 3)).map((row) => (
            <li key={row.id}>
              <Link
                to={row.to}
                aria-label={`${row.action}: ${row.title}, ${row.detail}`}
                className="group flex min-h-20 items-center gap-3 rounded-md py-3 outline-offset-4 hover:bg-accent/50 focus-visible:outline-2 focus-visible:outline-ring"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{row.title}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {row.detail}
                  </p>
                  <p className="mt-1 text-xs font-medium tabular-nums">
                    {row.value}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary">
                  {row.action}
                  <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {!unavailable && rows.length > 3 && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 min-h-11 px-0 text-primary"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Show fewer" : `Show all ${rows.length}`}
        </Button>
      )}
    </section>
  )
}

function invoiceRows(invoices: ActionInvoice[], action: string): ActionRow[] {
  return invoices.map((invoice) => ({
    id: invoice.id,
    title: invoice.customer?.name || invoice.invoiceNumber,
    detail: `${invoice.invoiceNumber} · ${invoice.dueDate ? `Due ${invoice.dueDate}` : "No due date"}`,
    value: fmtShort(invoice.grandTotal, invoice.currency),
    to: `/invoice-history/${invoice.id}`,
    action,
  }))
}

export function DailyActions({
  followUps,
  dueThisWeek,
  lowStock,
  invoicesUnavailable,
  itemsUnavailable,
  invoiceCount,
  loadedInvoices,
  itemCount,
  loadedItems,
}: {
  followUps: ActionInvoice[]
  dueThisWeek: ActionInvoice[]
  lowStock: ActionItem[]
  invoicesUnavailable: boolean
  itemsUnavailable: boolean
  invoiceCount: number
  loadedInvoices: number
  itemCount: number
  loadedItems: number
}) {
  const headingId = useId()
  return (
    <section aria-labelledby={headingId}>
      <div className="mb-3">
        <h2 id={headingId} className="text-lg font-semibold tracking-tight">
          Your daily actions
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Follow up on payments, plan this week's collections, and review stock.
        </p>
      </div>
      <div className="grid divide-y rounded-xl border bg-card lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        <ActionList
          title="Payments to follow up"
          icon={CircleX}
          rows={invoiceRows(followUps, "Follow up")}
          empty="No overdue payments to follow up."
          unavailable={invoicesUnavailable}
        />
        <ActionList
          title="Invoices due this week"
          icon={CalendarDays}
          rows={invoiceRows(dueThisWeek, "Review")}
          empty="No unpaid invoices due between today and Sunday."
          unavailable={invoicesUnavailable}
        />
        <ActionList
          title="Low stock"
          icon={Package}
          rows={lowStock.map((item) => ({
            id: item.id,
            title: item.name,
            detail: `Reorder threshold: ${item.lowStockThreshold ?? 5} ${item.unit || "units"}`,
            value:
              (item.stock ?? 0) <= 0
                ? "Out of stock"
                : `${item.stock} ${item.unit || "units"} left`,
            to: `/items/${item.id}`,
            action: "Review",
          }))}
          empty="No items need restocking."
          unavailable={itemsUnavailable}
        />
      </div>
      {!invoicesUnavailable && invoiceCount > loadedInvoices && (
        <p className="mt-2 text-xs text-muted-foreground">
          Actions cover {loadedInvoices} of {invoiceCount} invoices.{" "}
          <Link to="/invoices" className="text-primary underline">
            View all invoices
          </Link>
        </p>
      )}
      {!itemsUnavailable && itemCount > loadedItems && (
        <p className="mt-2 text-xs text-muted-foreground">
          Stock alerts cover {loadedItems} of {itemCount} items.{" "}
          <Link to="/items" className="text-primary underline">
            View all items
          </Link>
        </p>
      )}
    </section>
  )
}
