import { createFileRoute } from "@tanstack/react-router"
import { ContactRound, Search } from "lucide-react"
import { useState } from "react"
import { DataTable } from "@/components/Common/DataTable"
import AddCustomer from "@/components/Customers/AddCustomer"
import { columns } from "@/components/Customers/columns"
import { Input } from "@/components/ui/input"
import useLocalStorage from "@/hooks/useLocalStorage"

export const Route = createFileRoute("/_layout/customers")({
    component: CustomersPage,
    head: () => ({
        meta: [{ title: "Customers" }],
    }),
})

function CustomersEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
                <ContactRound className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No customers yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
                Get started by adding your first customer or company.
            </p>
        </div>
    )
}

function CustomersPage() {
    const [customers] = useLocalStorage("customers", [])
    const [search, setSearch] = useState("")

    const filtered = customers.filter((c) => {
        const q = search.toLowerCase()
        return (
            c.name?.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q) ||
            c.phone?.toLowerCase().includes(q) ||
            c.gst?.toLowerCase().includes(q)
        )
    })

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Manage your customers and companies
                    </p>
                </div>
                <AddCustomer />
            </div>

            {customers.length === 0 ? (
                <CustomersEmptyState />
            ) : (
                <>
                    <div className="flex items-center gap-4">
                        <div className="relative max-w-sm flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search customers..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                    <DataTable columns={columns} data={filtered} />
                </>
            )}
        </div>
    )
}
