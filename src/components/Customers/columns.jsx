import { Link } from "@tanstack/react-router"
import { Badge } from "@/components/ui/badge"
import { CustomerActionsMenu } from "./CustomerActionsMenu"

const partyTypeVariant = {
    customer: "default",
    supplier: "secondary",
    both: "outline",
}

const partyTypeLabel = {
    customer: "Customer",
    supplier: "Supplier",
    both: "Both",
}

export const columns = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
            <Link
                to="/customers/$customerId"
                params={{ customerId: row.original.id }}
                className="font-medium hover:text-primary hover:underline underline-offset-4 transition-colors"
            >
                {row.original.name}
            </Link>
        ),
    },
    {
        accessorKey: "partyType",
        header: "Type",
        cell: ({ row }) => {
            const type = row.original.partyType ?? "customer"
            return (
                <Badge variant={partyTypeVariant[type] ?? "outline"} className="capitalize">
                    {partyTypeLabel[type] ?? type}
                </Badge>
            )
        },
    },
    {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => (
            <span className="text-muted-foreground text-sm">
                {row.original.phone || "—"}
            </span>
        ),
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
            <span className="text-muted-foreground text-sm">
                {row.original.email || "—"}
            </span>
        ),
    },
    {
        accessorKey: "gstin",
        header: "GSTIN",
        cell: ({ row }) => (
            <span className="font-mono text-xs text-muted-foreground">
                {row.original.gstin || row.original.gst || "—"}
            </span>
        ),
    },
    {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
            <div className="flex justify-end">
                <CustomerActionsMenu customer={row.original} />
            </div>
        ),
    },
]
