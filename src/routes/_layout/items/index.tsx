import { useQuery } from "@tanstack/react-query"
import { AlertTriangle, Filter, Package, Search, XCircle } from "lucide-react"
import { useState } from "react"
import { DataTable } from "@/components/Common/DataTable"
import { FilterChips } from "@/components/Common/FilterChips"
import { ListRow } from "@/components/Common/ListRow"
import { ListSkeleton } from "@/components/Common/ListSkeleton"
import { PageHeader } from "@/components/Common/PageHeader"
import { SearchInput } from "@/components/Common/SearchInput"
import { StatCard } from "@/components/Common/StatCard"
import AddItem from "@/components/Items/AddItem"
import { columns, StockPill } from "@/components/Items/columns"
import { ItemActionsMenu } from "@/components/Items/ItemActionsMenu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { itemsListQueryOptions } from "@/features/items/queries"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

const price = (n?: number) =>
  `₹${Number(n ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`

function ItemRow({ item }: { item: Item }) {
  return (
    <ListRow
      to={`/items/${item.id}`}
      leading={
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground"
        >
          <Package className="size-5" />
        </span>
      }
      title={item.name}
      subtitle={[
        `${price(item.salePrice)} / ${item.unit || "pcs"}`,
        item.category,
        item.sku,
      ]
        .filter(Boolean)
        .join(" · ")}
      trailing={<StockPill item={item} compact />}
      actions={<ItemActionsMenu item={item} />}
    />
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

function ItemsPage() {
  useDocumentTitle("Items")
  const { data: itemsRes, isLoading } = useQuery(itemsListQueryOptions())
  const items: Item[] = (itemsRes?.data ?? []) as unknown as Item[]
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

  if (isLoading) return <ListSkeleton />

  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Items"
          description="Manage your product catalogue and track stock"
        />
        <EmptyState />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Items"
        description="Manage your product catalogue and track stock"
        actions={<AddItem />}
      />

      <div className="hidden grid-cols-1 gap-4 sm:grid sm:grid-cols-3 animate-in animate-in-delay-1">
        <StatCard
          icon={Package}
          title="Total Items"
          value={totalCount}
          iconClass="bg-primary/10 text-primary"
        />
        <StatCard
          icon={AlertTriangle}
          title="Low Stock"
          value={lowStockCount}
          iconClass="bg-amber-500/10 text-amber-500"
          valueClass={
            lowStockCount > 0 ? "text-amber-600 dark:text-amber-400" : ""
          }
        />
        <StatCard
          icon={XCircle}
          title="Out of Stock"
          value={outOfStockCount}
          iconClass="bg-destructive/10 text-destructive"
          valueClass={outOfStockCount > 0 ? "text-destructive" : ""}
        />
      </div>

      <div className="flex flex-col gap-3 animate-in animate-in-delay-2">
        <div className="flex items-center gap-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name, SKU, category…"
            className="sm:max-w-sm"
          />
          {categories.length > 1 && (
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger
                className="w-auto max-w-36 shrink-0"
                aria-label="Category"
              >
                <Filter className="text-muted-foreground" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
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
        </div>
        <FilterChips
          label="Stock status"
          value={stockFilter}
          onChange={setStockFilter}
          options={[
            { value: "all", label: "All", count: totalCount },
            { value: "in_stock", label: "In stock" },
            { value: "low_stock", label: "Low", count: lowStockCount },
            { value: "out_of_stock", label: "Out", count: outOfStockCount },
          ]}
        />
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
          <DataTable
            columns={columns}
            data={filtered}
            mobileRow={(item) => <ItemRow item={item} />}
          />
        </div>
      )}
    </div>
  )
}

export default ItemsPage
