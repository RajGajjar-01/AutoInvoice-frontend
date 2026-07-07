import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { CustomerActionsMenu } from "./CustomerActionsMenu"

interface Customer {
  id: string
  name: string
  partyType?: "customer" | "supplier" | "both"
  phone?: string
  email?: string
  gstin?: string
  gst?: string
  owner_id: string
  created_at: string
  updated_at: string
}

const partyTypeVariant: Record<string, "default" | "secondary" | "outline"> = {
  customer: "default",
  supplier: "secondary",
  both: "outline",
}

const partyTypeLabel: Record<string, string> = {
  customer: "Customer",
  supplier: "Supplier",
  both: "Both",
}

export const columns = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }: { row: { original: Customer } }) => (
      <Link
        to={`/customers/${row.original.id}`}
        className="font-medium hover:text-primary hover:underline underline-offset-4 transition-colors"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "partyType",
    header: "Type",
    cell: ({ row }: { row: { original: Customer } }) => {
      const type = row.original.partyType ?? "customer"
      return (
        <Badge
          variant={partyTypeVariant[type] ?? "outline"}
          className="capitalize"
        >
          {partyTypeLabel[type] ?? type}
        </Badge>
      )
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }: { row: { original: Customer } }) => (
      <span className="text-muted-foreground text-sm">
        {row.original.phone || "—"}
      </span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }: { row: { original: Customer } }) => (
      <span className="text-muted-foreground text-sm">
        {row.original.email || "—"}
      </span>
    ),
  },
  {
    accessorKey: "gstin",
    header: "GSTIN",
    cell: ({ row }: { row: { original: Customer } }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.gstin || row.original.gst || "—"}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }: { row: { original: Customer } }) => (
      <div className="flex justify-end">
        <CustomerActionsMenu customer={row.original} />
      </div>
    ),
  },
]
