import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { UsersService } from "@/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import useAuth from "@/hooks/useAuth";

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const formSchema = z.object({
    business_name: z.string().min(2, "Business name must be at least 2 characters"),
    owner_name: z.string().min(1, "Owner / Contact name is required"),
    email: z.string().email("Please enter a valid email address"),
    phone: z
        .string()
        .optional()
        .refine((v) => !v || /^\d{10}$/.test(v), { message: "Phone must be 10 digits" }),
    gst_number: z
        .string()
        .optional()
        .refine((v) => !v || GST_REGEX.test(v), { message: "Invalid GST format" }),
    address_line1: z.string().optional(),
    address_line2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pin_code: z
        .string()
        .optional()
        .refine((v) => !v || /^\d{6}$/.test(v), { message: "PIN must be 6 digits" }),
    business_type: z.string().optional(),
});

const BUSINESS_TYPES = [
    "Sole Proprietor",
    "Partnership",
    "LLP",
    "Private Limited",
    "Other",
];

export function BusinessDetailsForm() {
    const { user, isLoading } = useAuth();
    const queryClient = useQueryClient();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            business_name: user?.full_name ?? "",
            owner_name: user?.full_name ?? "",
            email: user?.email ?? "",
            phone: "",
            gst_number: "",
            address_line1: "",
            address_line2: "",
            city: "",
            state: "",
            pin_code: "",
            business_type: "",
        },
    });

    const mutation = useMutation({
        mutationFn: async (data) => {
            // TODO: connect to API — UsersService.updateUserMe({ requestBody: data })
            // Using a simulated delay until the business-profile endpoint exists
            await new Promise((r) => setTimeout(r, 1000));
            return data;
        },
        onSuccess: () => {
            toast.success("Business profile updated");
            queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        },
        onError: () => {
            toast.error("Failed to update profile. Please try again.");
        },
    });

    const onSubmit = (data) => mutation.mutate(data);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 max-w-md rounded-md" />
                ))}
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                {/* ── Personal Info ─────────────────────────────── */}
                <div className="flex flex-col gap-4">
                    <p className="text-sm font-semibold">Personal Information</p>
                    <Separator />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                        <FormField
                            control={form.control}
                            name="owner_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Owner / Contact Name <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
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
                                    <FormLabel>Email Address <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="you@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="9876543210" maxLength={10} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* ── Business Info ─────────────────────────────── */}
                <div className="flex flex-col gap-4">
                    <p className="text-sm font-semibold">Business Information</p>
                    <Separator />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                        <FormField
                            control={form.control}
                            name="business_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Business Name <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Acme Pvt Ltd" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="business_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Business Type</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {BUSINESS_TYPES.map((t) => (
                                                <SelectItem key={t} value={t}>{t}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="gst_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>GST Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="22AAAAA0000A1Z5" {...field} />
                                    </FormControl>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Format: 22AAAAA0000A1Z5
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* ── Address ───────────────────────────────────── */}
                <div className="flex flex-col gap-4">
                    <p className="text-sm font-semibold">Business Address</p>
                    <Separator />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                        <FormField
                            control={form.control}
                            name="address_line1"
                            render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                    <FormLabel>Address Line 1</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123 Main Street" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address_line2"
                            render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                    <FormLabel>Address Line 2</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Suite / Floor / Building" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Mumbai" {...field} />
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
                                    <FormLabel>State</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Maharashtra" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="pin_code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>PIN Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="400001" maxLength={6} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div>
                    <LoadingButton type="submit" loading={mutation.isPending}>
                        Save Changes
                    </LoadingButton>
                </div>
            </form>
        </Form>
    );
}

export default BusinessDetailsForm;
