import { Link } from "@tanstack/react-router"
import {
  ArrowLeft,
  BadgeIndianRupee,
  Barcode,
  FileCode,
  Info,
  Layers,
  Package,
  Percent,
  ShoppingCart,
  Tag,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { ItemQuickActions } from "./ItemQuickActions"
import { ItemStockHistory } from "./ItemStockHistory"

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
  stockHistory?: Array<{
    date: string
    type: "add" | "remove" | "set" | "invoice"
    qty: number
    reason?: string
  }>
}

interface StockBadgeProps {
  item: Item
}

function StockBadge({ item }: StockBadgeProps) {
  const stock = item.stock ?? 0
  const threshold = item.lowStockThreshold ?? 5
  if (stock === 0) return <Badge variant="destructive">Out of Stock</Badge>
  if (stock < threshold)
    return (
      <Badge
        variant="outline"
        className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
      >
        Low Stock — {stock} left
      </Badge>
    )
  return (
    <Badge
      variant="outline"
      className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    >
      In Stock — {stock}
    </Badge>
  )
}

interface ProfileRowProps {
  icon: typeof Tag
  label: string
  value?: string | number | null
  mono?: boolean
}

function ProfileRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: ProfileRowProps) {
  if (!value && value !== 0) return null
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="rounded-md bg-muted p-1.5 shrink-0 mt-0.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground leading-none mb-0.5">
          {label}
        </p>
        <p
          className={cn(
            "text-sm font-medium text-foreground break-words",
            mono && "font-mono",
          )}
        >
          {value}
        </p>
      </div>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string
  sub?: string
  valueClass?: string
}

function StatCard({ label, value, sub, valueClass }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={cn("text-2xl font-bold", valueClass)}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  )
}

interface ItemDetailProps {
  item: Item
  onDeleted?: () => void
}

export function ItemDetail({ item, onDeleted }: ItemDetailProps) {
  const stock = item.stock ?? 0
  const threshold = item.lowStockThreshold ?? 5
  const margin =
    item.purchasePrice && item.salePrice
      ? (
          ((item.salePrice - item.purchasePrice) / item.salePrice) *
          100
        ).toFixed(1)
      : null

  const stockValueClass =
    stock === 0
      ? "text-destructive"
      : stock < threshold
        ? "text-amber-600 dark:text-amber-400"
        : "text-emerald-600 dark:text-emerald-400"

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          to="/items"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Items
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 shrink-0">
            <Package className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{item.name}</h1>
            {item.sku && (
              <p className="text-sm font-mono text-muted-foreground mt-0.5">
                {item.sku}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StockBadge item={item} />
              {item.category && (
                <Badge variant="secondary">{item.category}</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Current Stock"
          value={`${stock} ${item.unit || "pcs"}`}
          sub={
            stock < threshold && stock > 0
              ? "Below threshold"
              : stock === 0
                ? "Reorder needed"
                : ""
          }
          valueClass={stockValueClass}
        />
        <StatCard
          label="Sale Price"
          value={`₹${Number(item.salePrice ?? 0).toLocaleString("en-IN")}`}
          sub={`per ${item.unit || "pcs"}`}
        />
        {item.purchasePrice != null && (
          <StatCard
            label="Cost Price"
            value={`₹${Number(item.purchasePrice).toLocaleString("en-IN")}`}
            sub={`per ${item.unit || "pcs"}`}
          />
        )}
        {margin != null && (
          <StatCard
            label="Profit Margin"
            value={`${margin}%`}
            sub="on sale price"
            valueClass={
              Number(margin) >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-destructive"
            }
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ItemStockHistory item={item} />
        </div>

        <div className="flex flex-col gap-4">
          <ItemQuickActions item={item} onDeleted={onDeleted} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Product Details</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-2 divide-y divide-border">
              <ProfileRow icon={Tag} label="Category" value={item.category} />
              <ProfileRow
                icon={Barcode}
                label="SKU / Item Code"
                value={item.sku}
                mono
              />
              <ProfileRow
                icon={Layers}
                label="Unit of Measure"
                value={item.unit}
              />
              <ProfileRow
                icon={BadgeIndianRupee}
                label="Sale Price"
                value={
                  item.salePrice != null
                    ? `₹${Number(item.salePrice).toLocaleString("en-IN")}`
                    : null
                }
              />
              <ProfileRow
                icon={ShoppingCart}
                label="Cost Price"
                value={
                  item.purchasePrice != null
                    ? `₹${Number(item.purchasePrice).toLocaleString("en-IN")}`
                    : null
                }
              />
              <ProfileRow
                icon={Percent}
                label="GST Rate"
                value={item.taxRate != null ? `${item.taxRate}%` : null}
              />
              <ProfileRow
                icon={FileCode}
                label="HSN / SAC Code"
                value={item.hsnCode}
                mono
              />
              <ProfileRow
                icon={Info}
                label="Description"
                value={item.description}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
