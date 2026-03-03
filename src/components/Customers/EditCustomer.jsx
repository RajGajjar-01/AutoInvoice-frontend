import { zodResolver } from "@hookform/resolvers/zod"
import { Pencil } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import useCustomToast from "@/hooks/useCustomToast"
import useLocalStorage from "@/hooks/useLocalStorage"

const formSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }).max(255),
    phone: z.string().optional(),
    email: z.string().email({ message: "Invalid email" }).or(z.literal("")).optional(),
    address: z.string().optional(),
    gst: z.string().optional(),
    state: z.string().optional(),
    notes: z.string().optional(),
})

const EditCustomer = ({ customer, onSuccess }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [customers, setCustomers] = useLocalStorage("customers", [])
    const { showSuccessToast } = useCustomToast()

    const form = useForm({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        criteriaMode: "all",
        defaultValues: {
            name: customer?.name ?? "",
            phone: customer?.phone ?? "",
            email: customer?.email ?? "",
            address: customer?.address ?? "",
            gst: customer?.gst ?? "",
            state: customer?.state ?? "",
            notes: customer?.notes ?? "",
        },
    })

    const onSubmit = (data) => {
        setCustomers((prev) =>
            prev.map((c) => (c.id === customer.id ? { ...c, ...data } : c)),
        )
        showSuccessToast("Customer updated successfully")
        setIsOpen(false)
        onSuccess?.()
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                onClick={() => setIsOpen(true)}
            >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
            </DropdownMenuItem>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Customer</DialogTitle>
                    <DialogDescription>
                        Update the customer details below.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="grid gap-4 py-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Name <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Customer or company name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Phone number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Email address" type="email" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Full address" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="gst"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>GST Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Optional" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="state"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>State / Country</FormLabel>
                                            <FormControl>
                                                <Input placeholder="State or country" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Any additional notes" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <LoadingButton type="submit" loading={false}>
                                Save
                            </LoadingButton>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default EditCustomer
