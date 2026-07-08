import type { CellContext } from "@tanstack/react-table"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ItemActionsMenu } from "./ItemActionsMenu"

interface Item {
  id: string
  name: string
  sku?: string
  category?: string
  unit?: string
  salePrice?: number
  purchasePrice?: number | null
  taxRate?: number
  hsnCode?: string
  stock?: number
  lowStockThreshold?: number
  description?: string
}

function StockPill({ item }: { item: Item }) {
  const stock = item.stock ?? 0
  const threshold = item.lowStockThreshold ?? 5

  if (stock === 0) {
    return (
      <Badge variant="destructive" className="font-mono text-xs">
        Out of Stock
      </Badge>
    )
  }
  if (stock < threshold) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "font-mono text-xs border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
        )}
      >
        {stock} — Low
      </Badge>
    )
  }
  return (
    <Badge
      variant="outline"
      className="font-mono text-xs border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    >
      {stock}
    </Badge>
  )
}

export const columns = [
  {
    accessorKey: "name",
    header: "Item",
    cell: ({ row }: CellContext<Item, unknown>) => {
      const item = row.original
      return (
        <div className="min-w-0">
          <Link
            to={`/items/${item.id}`}
            className="font-medium text-foreground hover:text-primary hover:underline underline-offset-4 transition-colors"
          >
            {item.name}
          </Link>
          {item.sku && (
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              {item.sku}
            </p>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }: CellContext<Item, unknown>) => {
      const cat = row.original.category
      if (!cat) return <span className="text-muted-foreground text-sm">—</span>
      return (
        <Badge variant="secondary" className="text-xs">
          {cat}
        </Badge>
      )
    },
  },
  {
    accessorKey: "salePrice",
    header: "Sale Price",
    cell: ({ row }: CellContext<Item, unknown>) => {
      const price = row.original.salePrice
      const unit = row.original.unit || "pcs"
      return (
        <div className="text-right">
          <span className="font-semibold">
            ₹
            {Number(price ?? 0).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span className="text-xs text-muted-foreground ml-1">/{unit}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "taxRate",
    header: "GST",
    cell: ({ row }: CellContext<Item, unknown>) => {
      const rate = row.original.taxRate ?? 0
      return <span className="text-sm text-muted-foreground">{rate}%</span>
    },
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }: CellContext<Item, unknown>) => (
      <StockPill item={row.original} />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }: CellContext<Item, unknown>) => (
      <div className="flex justify-end">
        <ItemActionsMenu item={row.original} />
      </div>
    ),
  },
]
