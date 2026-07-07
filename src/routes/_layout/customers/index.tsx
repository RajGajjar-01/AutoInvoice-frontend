import { useQuery } from "@tanstack/react-query"
import type { LucideIcon } from "lucide-react"
import { Building2, ContactRound, Search, Users } from "lucide-react"
import { useDeferredValue, useMemo, useState } from "react"
import { DataTable } from "@/components/Common/DataTable"
import AddCustomer from "@/components/Customers/AddCustomer"
import { columns } from "@/components/Customers/columns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { customersListQueryOptions } from "@/features/customers/queries"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

function CustomersEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <div className="rounded-full bg-muted p-5 mb-5">
        <ContactRound className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No parties yet</h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-xs">
        Get started by adding your first customer, supplier, or company.
      </p>
      <AddCustomer />
    </div>
  )
}

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
    <Card className="hover:shadow-md transition-shadow">
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

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  whatsapp?: string
  gstin?: string
  gst?: string
  billingAddress?: string
  partyType?: "customer" | "supplier" | "both"
  tags?: string[] | string
  owner_id?: string
  created_at?: string
  updated_at?: string
}

function CustomersPage() {
  useDocumentTitle("Customers")
  const { data, isLoading } = useQuery(customersListQueryOptions())
  const customers: Customer[] = (data?.data?.filter(
    (c): c is NonNullable<typeof c> => c != null,
  ) ?? []) as Customer[]
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const deferredSearch = useDeferredValue(search)

  const { customerCount, supplierCount } = useMemo(() => {
    let customersTotal = 0
    let suppliersTotal = 0

    for (const customer of customers) {
      if (
        customer.partyType === "customer" ||
        customer.partyType === "both" ||
        !customer.partyType
      ) {
        customersTotal++
      }

      if (customer.partyType === "supplier" || customer.partyType === "both") {
        suppliersTotal++
      }
    }

    return {
      customerCount: customersTotal,
      supplierCount: suppliersTotal,
    }
  }, [customers])

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase()

    return customers.filter((customer) => {
      if (typeFilter !== "all" && customer.partyType !== typeFilter) {
        return false
      }

      if (!q) return true

      const tags = Array.isArray(customer.tags)
        ? customer.tags.join(" ")
        : (customer.tags ?? "")

      return (
        customer.name?.toLowerCase().includes(q) ||
        customer.email?.toLowerCase().includes(q) ||
        customer.phone?.toLowerCase().includes(q) ||
        customer.whatsapp?.toLowerCase().includes(q) ||
        customer.gstin?.toLowerCase().includes(q) ||
        customer.gst?.toLowerCase().includes(q) ||
        customer.billingAddress?.toLowerCase().includes(q) ||
        tags.toLowerCase().includes(q)
      )
    })
  }, [customers, deferredSearch, typeFilter])

  const totalCount = customers.length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your customers, suppliers, and companies
          </p>
        </div>
        <AddCustomer />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          icon={Users}
          title="Total Parties"
          value={totalCount}
          iconClass="bg-primary/10 text-primary"
        />
        <StatsCard
          icon={ContactRound}
          title="Customers"
          value={customerCount}
          iconClass="bg-emerald-500/10 text-emerald-500"
          valueClass="text-emerald-600 dark:text-emerald-400"
        />
        <StatsCard
          icon={Building2}
          title="Suppliers"
          value={supplierCount}
          iconClass="bg-blue-500/10 text-blue-500"
          valueClass="text-blue-600 dark:text-blue-400"
        />
      </div>

      {/* Content */}
      {isLoading ? null : customers.length === 0 ? (
        <CustomersEmptyState />
      ) : (
        <>
          {/* Toolbar */}
          <div className="flex items-center gap-3">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, GSTIN, tags…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="customer">Customers</SelectItem>
                <SelectItem value="supplier">Suppliers</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">No results found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filter.
              </p>
            </div>
          ) : (
            <DataTable columns={columns} data={filtered as any} />
          )}
        </>
      )}
    </div>
  )
}

export default CustomersPage
