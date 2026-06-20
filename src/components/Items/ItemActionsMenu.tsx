import { Eye, MoreHorizontal } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import AdjustStock from "./AdjustStock"
import DeleteItem from "./DeleteItem"
import EditItem from "./EditItem"

interface Item {
  id: string
  name: string
  sku?: string
  category?: string
  stock?: number
}

interface ItemActionsMenuProps {
  item: Item
}

export function ItemActionsMenu({ item }: ItemActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild>
          <Link to={`/items/${item.id}`} className="flex items-center">
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <AdjustStock item={item} variant="dropdown" />
        <EditItem item={item} onSuccess={() => {}} variant="dropdown" />
        <DropdownMenuSeparator />
        <DeleteItem item={item} variant="dropdown" />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
