import { Trash2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import useLocalStorage from "@/hooks/useLocalStorage"
import useCustomToast from "@/hooks/useCustomToast"

/**
 * DeleteItem supports two trigger variants:
 *   variant="dropdown"  (default) → DropdownMenuItem
 *   variant="button"              → standalone destructive outline Button
 */
const DeleteItem = ({ item, onSuccess, variant = "dropdown" }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [, setItems] = useLocalStorage("items", [])
  const { showSuccessToast } = useCustomToast()

  const handleDelete = () => {
    setItems((prev) => prev.filter((i) => i.id !== item.id))
    showSuccessToast("Item deleted")
    setIsOpen(false)
    onSuccess?.()
  }

  const trigger = variant === "button" ? (
    <Button
      variant="outline"
      size="sm"
      className="text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
      onClick={() => setIsOpen(true)}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      Delete
    </Button>
  ) : (
    <DropdownMenuItem
      className="text-destructive focus:text-destructive"
      onSelect={(e) => e.preventDefault()}
      onClick={() => setIsOpen(true)}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      Delete
    </DropdownMenuItem>
  )

  return (
    <>
      {trigger}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">"{item.name}"</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default DeleteItem
