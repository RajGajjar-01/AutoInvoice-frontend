import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useState, useRef } from "react"
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
    DialogTrigger,
} from "@/components/ui/dialog"
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

const AddCustomer = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [, setCustomers] = useLocalStorage("customers", [])
    const { showSuccessToast } = useCustomToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const submitLock = useRef(false)

    const form = useForm({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        criteriaMode: "all",
        defaultValues: {
            name: "",
            phone: "",
            email: "",
            address: "",
            gst: "",
            state: "",
            notes: "",
        },
    })

    const onSubmit = (data) => {
        if (submitLock.current) return
        submitLock.current = true
        setIsSubmitting(true)

        try {
            const newCustomer = {
                ...data,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
            }
            setCustomers((prev) => [...prev, newCustomer])
            showSuccessToast("Customer added successfully")
            form.reset()
            setIsOpen(false)
        } finally {
            // Short delay to prevent accidental double-submits
            setTimeout(() => {
                submitLock.current = false
                setIsSubmitting(false)
            }, 500)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Customer
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add Customer</DialogTitle>
                    <DialogDescription>
                        Fill in the details to add a new customer or company.
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
                            <LoadingButton type="submit" loading={isSubmitting}>
                                Save
                            </LoadingButton>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default AddCustomer
