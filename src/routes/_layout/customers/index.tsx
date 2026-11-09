import {
  Buildings as Building2,
  AddressBook as ContactRound,
  MagnifyingGlass as Search,
  Users,
} from "@phosphor-icons/react"
import { useQuery } from "@tanstack/react-query"
import { useDeferredValue, useMemo, useState } from "react"
import { DataTable } from "@/components/Common/DataTable"
import { FilterChips } from "@/components/Common/FilterChips"
import { InitialsAvatar, ListRow } from "@/components/Common/ListRow"
import { ListSkeleton } from "@/components/Common/ListSkeleton"
import { PageHeader } from "@/components/Common/PageHeader"
import { SearchInput } from "@/components/Common/SearchInput"
import { StatCard } from "@/components/Common/StatCard"
import AddCustomer from "@/components/Customers/AddCustomer"
import { CustomerActionsMenu } from "@/components/Customers/CustomerActionsMenu"
import {
  type Customer as BaseCustomer,
  columns,
} from "@/components/Customers/columns"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { customersListQueryOptions } from "@/features/customers/queries"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

function CustomersEmptyState() {
  return (
    <Card className="animate-in border-dashed shadow-none">
      <CardContent className="flex flex-col items-center py-14 text-center sm:py-20">
        <div className="mb-5 rounded-full bg-primary/10 p-5">
          <ContactRound className="size-8 text-primary" aria-hidden="true" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">No parties yet</h3>
        <p className="mb-6 max-w-xs text-sm text-muted-foreground">
          Add your first customer, supplier, or company to keep their details
          ready for invoices.
        </p>
        <AddCustomer />
      </CardContent>
    </Card>
  )
}

const partyLabel: Record<string, string> = {
  customer: "Customer",
  supplier: "Supplier",
  both: "Customer & supplier",
}

function CustomerRow({ customer }: { customer: Customer }) {
  const type = customer.partyType ?? "customer"
  return (
    <ListRow
      to={`/customers/${customer.id}`}
      leading={<InitialsAvatar name={customer.name} />}
      title={customer.name}
      subtitle={
        [customer.phone, customer.email].filter(Boolean).join(" · ") ||
        partyLabel[type]
      }
      trailing={
        type !== "customer" && (
          <Badge variant="secondary" className="text-[11px]">
            {type === "both" ? "Both" : partyLabel[type]}
          </Badge>
        )
      }
      actions={<CustomerActionsMenu customer={customer} />}
    />
  )
}

interface Customer extends BaseCustomer {
  whatsapp?: string
  billingAddress?: string
  tags?: string[] | string
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

    return { customerCount: customersTotal, supplierCount: suppliersTotal }
  }, [customers])

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase()

    return customers.filter((customer) => {
      // "both" counts as a customer and as a supplier, same as the chip counts.
      const type = customer.partyType ?? "customer"
      if (typeFilter !== "all" && type !== typeFilter && type !== "both") {
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

  if (isLoading) return <ListSkeleton avatar />

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Customers"
        description="Manage your customers, suppliers, and companies"
        actions={customers.length > 0 && <AddCustomer />}
      />

      <div className="hidden grid-cols-1 gap-4 sm:grid sm:grid-cols-3 animate-in animate-in-delay-1">
        <StatCard
          icon={Users}
          title="Total Parties"
          value={totalCount}
          iconClass="bg-primary/10 text-primary"
        />
        <StatCard
          icon={ContactRound}
          title="Customers"
          value={customerCount}
          iconClass="bg-emerald-500/10 text-emerald-500"
          valueClass="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          icon={Building2}
          title="Suppliers"
          value={supplierCount}
          iconClass="bg-blue-500/10 text-blue-500"
          valueClass="text-blue-600 dark:text-blue-400"
        />
      </div>

      {customers.length === 0 ? (
        <CustomersEmptyState />
      ) : (
        <>
          <div className="flex flex-col gap-3 animate-in animate-in-delay-2">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by name, email, GSTIN, tags…"
              className="sm:max-w-sm"
            />
            <FilterChips
              label="Party type"
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: "all", label: "All", count: totalCount },
                { value: "customer", label: "Customers", count: customerCount },
                { value: "supplier", label: "Suppliers", count: supplierCount },
              ]}
            />
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-in">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">No results found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filter.
              </p>
            </div>
          ) : (
            <div className="animate-in animate-in-delay-2">
              <DataTable
                columns={columns}
                data={filtered}
                mobileRow={(c) => <CustomerRow customer={c} />}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CustomersPage
