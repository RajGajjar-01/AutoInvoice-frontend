import { Link } from "@tanstack/react-router"
import { EllipsisVertical, ExternalLink } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import DeleteCustomer from "./DeleteCustomer"
import EditCustomer from "./EditCustomer"

interface Customer {
  id: string
  name: string
  partyType?: "customer" | "supplier" | "both"
  phone?: string
  email?: string
  gstin?: string
}

interface CustomerActionsMenuProps {
  customer: Customer
}

export const CustomerActionsMenu = ({ customer }: CustomerActionsMenuProps) => {
  const [open, setOpen] = useState(false)
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <EllipsisVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Link
          to="/customers/$customerId"
          params={{ customerId: customer.id }}
          onClick={() => setOpen(false)}
        >
          <DropdownMenuItem>
            <ExternalLink className="mr-2 h-4 w-4" />
            View Profile
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <EditCustomer customer={customer} onSuccess={() => setOpen(false)} />
        <DeleteCustomer customer={customer} onSuccess={() => setOpen(false)} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
