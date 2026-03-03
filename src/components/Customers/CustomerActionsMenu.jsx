import { EllipsisVertical } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import DeleteCustomer from "./DeleteCustomer"
import EditCustomer from "./EditCustomer"

export const CustomerActionsMenu = ({ customer }) => {
    const [open, setOpen] = useState(false)
    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <EllipsisVertical />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <EditCustomer customer={customer} onSuccess={() => setOpen(false)} />
                <DeleteCustomer customer={customer} onSuccess={() => setOpen(false)} />
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
