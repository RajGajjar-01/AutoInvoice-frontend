import { EllipsisVertical, ExternalLink } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router"
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
  owner_id: string
  created_at: string
  updated_at: string
}

interface CustomerActionsMenuProps {
  customer: Customer
}

export const CustomerActionsMenu = ({ customer }: CustomerActionsMenuProps) => {
  const [open, setOpen] = useState(false)
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="size-11 sm:size-8" />
        }
      >
        <EllipsisVertical className="h-4 w-4" />
        <span className="sr-only">Actions for {customer.name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          render={
            <Link
              to={`/customers/${customer.id}`}
              onClick={() => setOpen(false)}
            />
          }
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          View Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <EditCustomer customer={customer} onSuccess={() => setOpen(false)} />
        <DeleteCustomer customer={customer} onSuccess={() => setOpen(false)} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
