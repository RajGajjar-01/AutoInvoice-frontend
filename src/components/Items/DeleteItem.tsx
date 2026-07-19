import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { ItemsService } from "@/client/sdk.gen"
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
import { itemsQueryKeys } from "@/features/items/queries"
import useCustomToast from "@/hooks/useCustomToast"

interface Item {
  id: string
  name: string
}

interface DeleteItemProps {
  item: Item
  onSuccess?: () => void
  variant?: "dropdown" | "button"
}

const DeleteItem = ({
  item,
  onSuccess,
  variant = "dropdown",
}: DeleteItemProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const { showSuccessToast } = useCustomToast()
  const queryClient = useQueryClient()

  const deleteItemMutation = useMutation({
    mutationFn: () => ItemsService.deleteItem({ id: item.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemsQueryKeys.all })
      showSuccessToast("Item deleted")
      setIsOpen(false)
      onSuccess?.()
    },
  })

  const handleDelete = () => {
    deleteItemMutation.mutate()
  }

  const trigger =
    variant === "button" ? (
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
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                "{item.name}"
              </span>
              ? This action cannot be undone.
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
