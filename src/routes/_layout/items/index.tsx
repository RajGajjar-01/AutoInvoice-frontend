import type { LucideIcon } from "lucide-react"
import { AlertTriangle, Filter, Package, Search, XCircle } from "lucide-react"
import { useState } from "react"
import { DataTable } from "@/components/Common/DataTable"
import AddItem from "@/components/Items/AddItem"
import { columns } from "@/components/Items/columns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import useLocalStorage from "@/hooks/useLocalStorage"

interface StatsCardProps {
  icon: LucideIcon
  title: string
  value: number
  iconClass: string
  valueClass?: string
}

function StatsCard({
  icon: Icon,
  title,
  value,
  iconClass,
  valueClass,
}: StatsCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`rounded-lg p-2 ${iconClass}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueClass ?? ""}`}>{value}</div>
      </CardContent>
    </Card>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in">
      <div className="rounded-full bg-muted p-5 mb-5">
        <Package className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No items yet</h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-xs">
        Add your first product or service to start tracking stock and creating
        invoices.
      </p>
      <AddItem />
    </div>
  )
}

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
  description?: string
  stock?: number
  lowStockThreshold?: number
}

const STOCK_FILTERS = [
  { value: "all", label: "All Stock" },
  { value: "in_stock", label: "In Stock" },
  { value: "low_stock", label: "Low Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
]

function ItemsPage() {
  useDocumentTitle("Items")
  const [items] = useLocalStorage<Item[]>("items", [])
  const [search, setSearch] = useState("")
  const [stockFilter, setStockFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const totalCount = items.length
  const lowStockCount = items.filter(
    (i) => (i.stock ?? 0) > 0 && (i.stock ?? 0) < (i.lowStockThreshold ?? 5),
  ).length
  const outOfStockCount = items.filter((i) => (i.stock ?? 0) === 0).length

  const categories = [
    "all",
    ...new Set(items.map((i) => i.category).filter(Boolean)),
  ]

  const filtered = items.filter((item) => {
    if (
      stockFilter === "in_stock" &&
      (item.stock ?? 0) < (item.lowStockThreshold ?? 5)
    )
      return false
    if (stockFilter === "low_stock") {
      const s = item.stock ?? 0
      if (s === 0 || s >= (item.lowStockThreshold ?? 5)) return false
    }
    if (stockFilter === "out_of_stock" && (item.stock ?? 0) !== 0) return false

    if (categoryFilter !== "all" && item.category !== categoryFilter)
      return false

    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      item.name?.toLowerCase().includes(q) ||
      item.sku?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.hsnCode?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q)
    )
  })

  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Items
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage your product catalogue and track stock
            </p>
          </div>
        </div>
        <EmptyState />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between animate-in">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Items
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your product catalogue and track stock
          </p>
        </div>
        <AddItem />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in animate-in-delay-1">
        <StatsCard
          icon={Package}
          title="Total Items"
          value={totalCount}
          iconClass="bg-primary/10 text-primary"
        />
        <StatsCard
          icon={AlertTriangle}
          title="Low Stock"
          value={lowStockCount}
          iconClass="bg-amber-500/10 text-amber-500"
          valueClass={
            lowStockCount > 0 ? "text-amber-600 dark:text-amber-400" : ""
          }
        />
        <StatsCard
          icon={XCircle}
          title="Out of Stock"
          value={outOfStockCount}
          iconClass="bg-destructive/10 text-destructive"
          valueClass={outOfStockCount > 0 ? "text-destructive" : ""}
        />
      </div>

      <div className="flex items-center gap-3 flex-wrap animate-in animate-in-delay-2">
        <div className="relative max-w-sm flex-1 min-w-40">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, SKU, category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {categories.length > 1 && (
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-36">
              <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories
                .filter((c): c is string => c !== "all")
                .map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}

        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Stock status" />
          </SelectTrigger>
          <SelectContent>
            {STOCK_FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-in">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-1">No items found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <div className="animate-in animate-in-delay-2">
          <DataTable columns={columns} data={filtered as any} />
        </div>
      )}
    </div>
  )
}

export default ItemsPage
