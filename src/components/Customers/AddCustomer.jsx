import { zodResolver } from "@hookform/resolvers/zod"
import { Building2, Plus, User } from "lucide-react"
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
    FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import useCustomToast from "@/hooks/useCustomToast"
import { useMutation } from "@tanstack/react-query"
import { CustomersService } from "@/client/sdk.gen"
import { queryClient } from "@/queryClient"
import { customersQueryKeys } from "@/features/customers/queries"

// GSTIN: 15-char Indian GST number or empty
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

const formSchema = z.object({
    name: z.string().min(1, { message: "Party name is required" }).max(255),
    partyType: z.enum(["customer", "supplier", "both"], {
        required_error: "Please select a party type",
    }),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    email: z.string().email({ message: "Invalid email address" }).or(z.literal("")).optional(),
    gstin: z
        .string()
        .refine((v) => !v || gstinRegex.test(v.toUpperCase()), {
            message: "Invalid GSTIN format (e.g. 22AAAAA0000A1Z5)",
        })
        .optional(),
    billingAddress: z.string().optional(),
    shippingAddress: z.string().optional(),
    openingBalance: z.coerce.number().nonnegative({ message: "Must be 0 or more" }).optional(),
    creditLimit: z.coerce.number().nonnegative({ message: "Must be 0 or more" }).optional(),
    paymentTerms: z.string().optional(),
    tags: z.string().optional(),
    notes: z.string().optional(),
})

const defaultValues = {
    name: "",
    partyType: "customer",
    phone: "",
    whatsapp: "",
    email: "",
    gstin: "",
    billingAddress: "",
    shippingAddress: "",
    openingBalance: "",
    creditLimit: "",
    paymentTerms: "",
    tags: "",
    notes: "",
}

// Reusable section header — thin divider with a label
function SectionHeading({ children }) {
    return (
        <div className="flex items-center gap-3 pt-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                {children}
            </span>
            <div className="h-px flex-1 bg-border" />
        </div>
    )
}

const AddCustomer = () => {
    const [isOpen, setIsOpen] = useState(false)
    const { showSuccessToast } = useCustomToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const submitLock = useRef(false)

    const createCustomerMutation = useMutation({
        mutationFn: async (payload) => {
            return CustomersService.createCustomer({
                requestBody: payload,
            })
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: customersQueryKeys.all })
            showSuccessToast("Customer added successfully")
            form.reset(defaultValues)
            setIsOpen(false)
        },
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        criteriaMode: "all",
        defaultValues,
    })

    const onSubmit = (data) => {
        if (submitLock.current) return
        submitLock.current = true
        setIsSubmitting(true)

        try {
            const payload = {
                name: data.name,
                party_type: data.partyType,
                phone: data.phone || null,
                whatsapp: data.whatsapp || null,
                email: data.email || null,
                gstin: data.gstin ? data.gstin.toUpperCase() : null,
                billing_address: data.billingAddress || null,
                shipping_address: data.shippingAddress || null,
                opening_balance: data.openingBalance ? Number(data.openingBalance) : 0,
                credit_limit: data.creditLimit ? Number(data.creditLimit) : null,
                payment_terms: data.paymentTerms || null,
                tags: data.tags
                    ? data.tags
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                    : [],
                notes: data.notes || null,
            }

            createCustomerMutation.mutate(payload)
        } finally {
            setTimeout(() => {
                submitLock.current = false
                setIsSubmitting(false)
            }, 500)
        }
    }

    const handleOpenChange = (open) => {
        setIsOpen(open)
        if (!open) form.reset(defaultValues)
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Customer
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader className="shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <div className="rounded-lg bg-primary/10 p-1.5">
                            <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        Add Party
                    </DialogTitle>
                    <DialogDescription>
                        Add a new customer, supplier, or both. Fields marked{" "}
                        <span className="text-destructive font-medium">*</span> are required.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col flex-1 min-h-0"
                    >
                        {/* Scrollable body */}
                        <div className="overflow-y-auto flex-1 pr-1 -mr-1">
                            <div className="grid gap-4 py-1">

                                {/* ── Basic Info ── */}
                                <SectionHeading>Basic Info</SectionHeading>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="sm:col-span-2">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Party Name{" "}
                                                        <span className="text-destructive">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Business name or individual name"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="partyType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Party Type{" "}
                                                    <span className="text-destructive">*</span>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="customer">
                                                            <span className="flex items-center gap-2">
                                                                <User className="h-3.5 w-3.5 text-primary" />
                                                                Customer
                                                            </span>
                                                        </SelectItem>
                                                        <SelectItem value="supplier">
                                                            <span className="flex items-center gap-2">
                                                                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                                Supplier
                                                            </span>
                                                        </SelectItem>
                                                        <SelectItem value="both">
                                                            Both
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* ── Contact ── */}
                                <SectionHeading>Contact</SectionHeading>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="+91 98765 43210" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="whatsapp"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>WhatsApp Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="If different from phone" {...field} />
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
                                                    <Input
                                                        placeholder="email@example.com"
                                                        type="email"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* ── Tax & Address ── */}
                                <SectionHeading>Tax &amp; Address</SectionHeading>

                                <FormField
                                    control={form.control}
                                    name="gstin"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>GSTIN</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="22AAAAA0000A1Z5"
                                                    className="uppercase font-mono"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(e.target.value.toUpperCase())
                                                    }
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Optional — printed on B2B invoices
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="billingAddress"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Billing Address</FormLabel>
                                                <FormControl>
                                                    <textarea
                                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                                        placeholder="Full billing address"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="shippingAddress"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Shipping Address</FormLabel>
                                                <FormControl>
                                                    <textarea
                                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                                        placeholder="Optional — if different from billing"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* ── Financial ── */}
                                <SectionHeading>Financial</SectionHeading>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="openingBalance"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Opening Balance</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="0.00"
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Balance before system setup
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="creditLimit"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Credit Limit</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="No limit"
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Max credit allowed
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="paymentTerms"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Payment Terms</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g. Net 30"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Auto-sets invoice due date
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* ── Other ── */}
                                <SectionHeading>Other</SectionHeading>

                                <FormField
                                    control={form.control}
                                    name="tags"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tags</FormLabel>
                                            <FormControl>
                                                <Input placeholder="VIP, Wholesale, New (comma-separated)" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Custom labels for grouping
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Notes</FormLabel>
                                            <FormControl>
                                                <textarea
                                                    className="flex min-h-[72px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                                    placeholder="Internal notes — not visible to the customer"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <DialogFooter className="shrink-0 pt-4 border-t border-border mt-2">
                            <DialogClose asChild>
                                <Button variant="outline" disabled={isSubmitting}>
                                    Cancel
                                </Button>
                            </DialogClose>
                            <LoadingButton type="submit" loading={isSubmitting}>
                                Add Party
                            </LoadingButton>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default AddCustomer
