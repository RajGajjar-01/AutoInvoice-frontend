import { createFileRoute } from "@tanstack/react-router"
import { Building2, ContactRound, Search, Users } from "lucide-react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/Common/DataTable"
import AddCustomer from "@/components/Customers/AddCustomer"
import { columns } from "@/components/Customers/columns"
import { Input } from "@/components/ui/input"
import { useQuery } from "@tanstack/react-query"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { customersListQueryOptions } from "@/features/customers/queries"

export const Route = createFileRoute("/_layout/customers/")({
    component: CustomersPage,
    head: () => ({
        meta: [{ title: "Customers" }],
    }),
})

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

function StatsCard({ icon: Icon, title, value, iconClass, valueClass }) {
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

function CustomersPage() {
    const { data, isLoading } = useQuery(customersListQueryOptions())
    const customers = data?.data ?? []
    const [search, setSearch] = useState("")
    const [typeFilter, setTypeFilter] = useState("all")

    // Stats
    const totalCount = customers.length
    const customerCount = customers.filter(
        (c) => c.partyType === "customer" || c.partyType === "both" || !c.partyType,
    ).length
    const supplierCount = customers.filter(
        (c) => c.partyType === "supplier" || c.partyType === "both",
    ).length

    // Filtering
    const filtered = customers.filter((c) => {
        if (typeFilter !== "all" && c.partyType !== typeFilter) return false
        const q = search.toLowerCase()
        if (!q) return true
        const tagsStr = Array.isArray(c.tags) ? c.tags.join(" ") : c.tags ?? ""
        return (
            c.name?.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q) ||
            c.phone?.toLowerCase().includes(q) ||
            c.whatsapp?.toLowerCase().includes(q) ||
            c.gstin?.toLowerCase().includes(q) ||
            c.gst?.toLowerCase().includes(q) ||
            c.billingAddress?.toLowerCase().includes(q) ||
            tagsStr.toLowerCase().includes(q)
        )
    })

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
                        <DataTable columns={columns} data={filtered} />
                    )}
                </>
            )}
        </div>
    )
}
