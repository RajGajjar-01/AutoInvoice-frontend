import { Link } from "@tanstack/react-router"
import { Eye, MoreHorizontal } from "lucide-react"
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

export function ItemActionsMenu({ item }) {
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
          <Link
            to="/items/$itemId"
            params={{ itemId: item.id }}
            className="flex items-center"
          >
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
