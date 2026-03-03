import { CustomerActionsMenu } from "./CustomerActionsMenu"

export const columns = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
            <span className="font-medium">{row.original.name}</span>
        ),
    },
    {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => (
            <span className="text-muted-foreground">{row.original.phone || "—"}</span>
        ),
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
            <span className="text-muted-foreground">{row.original.email || "—"}</span>
        ),
    },
    {
        accessorKey: "gst",
        header: "GST",
        cell: ({ row }) => (
            <span className="font-mono text-xs text-muted-foreground">
                {row.original.gst || "—"}
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
