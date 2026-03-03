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
import { LoadingButton } from "@/components/ui/loading-button"
import useCustomToast from "@/hooks/useCustomToast"
import useLocalStorage from "@/hooks/useLocalStorage"

const DeleteCustomer = ({ customer, onSuccess }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [, setCustomers] = useLocalStorage("customers", [])
    const { showSuccessToast } = useCustomToast()

    const handleDelete = () => {
        setCustomers((prev) => prev.filter((c) => c.id !== customer.id))
        showSuccessToast("Customer deleted successfully")
        setIsOpen(false)
        onSuccess?.()
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => e.preventDefault()}
                onClick={() => setIsOpen(true)}
            >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
            </DropdownMenuItem>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Delete Customer</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <strong>{customer.name}</strong>?
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <LoadingButton
                        variant="destructive"
                        loading={false}
                        onClick={handleDelete}
                    >
                        Delete
                    </LoadingButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteCustomer
