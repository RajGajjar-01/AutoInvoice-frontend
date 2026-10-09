import { useMutation } from "@tanstack/react-query"
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  MapPin,
  Plus,
  User,
  Wallet,
} from "lucide-react"
import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CustomersService } from "@/client/sdk.gen"
import type { CustomerCreate } from "@/client/types.gen"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { customersQueryKeys } from "@/features/customers/queries"
import useCustomToast from "@/hooks/useCustomToast"
import { formResolver } from "@/lib/form"
import { cn } from "@/lib/utils"
import { queryClient } from "@/queryClient"

const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

const formSchema = z.object({
  name: z.string().min(1, { message: "Party name is required" }).max(255),
  partyType: z.enum(["customer", "supplier", "both"] as const),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .or(z.literal(""))
    .optional(),
  gstin: z
    .string()
    .refine((v) => !v || gstinRegex.test(v.toUpperCase()), {
      message: "Invalid GSTIN format (e.g. 22AAAAA0000A1Z5)",
    })
    .optional(),
  billingAddress: z.string().optional(),
  shippingAddress: z.string().optional(),
  openingBalance: z.coerce
    .number()
    .nonnegative({ message: "Must be 0 or more" })
    .optional(),
  creditLimit: z.coerce
    .number()
    .nonnegative({ message: "Must be 0 or more" })
    .optional(),
  paymentTerms: z.string().optional(),
  tags: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

const defaultValues: Partial<FormValues> = {
  name: "",
  partyType: "customer",
  phone: "",
  whatsapp: "",
  email: "",
  gstin: "",
  billingAddress: "",
  shippingAddress: "",
  openingBalance: undefined,
  creditLimit: undefined,
  paymentTerms: "",
  tags: "",
  notes: "",
}

const STEPS = [
  {
    id: "basic",
    label: "Basic",
    title: "Who is this party?",
    hint: "Name and type — the only required bits.",
    icon: User,
    fields: ["name", "partyType", "phone", "email"] as const,
  },
  {
    id: "address",
    label: "Address",
    title: "Where are they?",
    hint: "GSTIN and addresses for GST invoices.",
    icon: MapPin,
    fields: ["gstin", "billingAddress", "shippingAddress", "whatsapp"] as const,
  },
  {
    id: "business",
    label: "Business",
    title: "Business details",
    hint: "Balances, terms and anything else — all optional.",
    icon: Wallet,
    fields: [
      "openingBalance",
      "creditLimit",
      "paymentTerms",
      "tags",
      "notes",
    ] as const,
  },
] as const

const compactArea =
  "flex min-h-[64px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"

const AddCustomer = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(0)
  const { showSuccessToast } = useCustomToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitLock = useRef(false)

  const createCustomerMutation = useMutation({
    mutationFn: async (payload: CustomerCreate) => {
      return CustomersService.createCustomer({
        requestBody: payload,
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: customersQueryKeys.all })
      showSuccessToast("Customer added successfully")
      form.reset(defaultValues)
      setStep(0)
      setIsOpen(false)
    },
  })

  const form = useForm<FormValues>({
    resolver: formResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues,
  })

  const onSubmit = (data: FormValues) => {
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

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      form.reset(defaultValues)
      setStep(0)
    }
  }

  const goToStep = async (target: number) => {
    if (target < step) {
      setStep(target)
      return
    }
    const valid = await form.trigger([...STEPS[step].fields])
    if (valid) setStep(target)
  }

  const handleNext = async () => {
    const valid = await form.trigger([...STEPS[step].fields])
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const handleBack = () => setStep((s) => Math.max(s - 1, 0))

  const isLast = step === STEPS.length - 1
  const StepIcon = STEPS[step].icon
  const progress = Math.round(((step + 1) / STEPS.length) * 100)

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 px-6 pt-6 text-left">
          <DialogTitle className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            Add Party
          </DialogTitle>
          <DialogDescription>
            Step {step + 1} of {STEPS.length} — {STEPS[step].hint}
          </DialogDescription>
        </DialogHeader>

        {/* Progress — Dribbble wizard pattern: segmented steps + bar */}
        <div className="shrink-0 px-6 pt-4">
          <ol className="flex items-center gap-1.5" aria-label="Form progress">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              const done = i < step
              const current = i === step
              return (
                <li key={s.id} className="flex-1">
                  <button
                    type="button"
                    aria-current={current ? "step" : undefined}
                    aria-label={`${s.label}${done ? " (completed)" : current ? " (current)" : ""}`}
                    onClick={() => void goToStep(i)}
                    className={cn(
                      "flex h-8 w-full items-center justify-center gap-1.5 rounded-full text-xs font-semibold transition-colors",
                      done && "bg-primary/10 text-primary hover:bg-primary/15",
                      current && "bg-primary text-primary-foreground",
                      !done &&
                        !current &&
                        "bg-muted text-muted-foreground hover:bg-muted/70",
                    )}
                  >
                    {done ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Icon className="h-3.5 w-3.5" />
                    )}
                    <span className="hidden min-[400px]:inline">{s.label}</span>
                  </button>
                </li>
              )
            })}
          </ol>
          <div
            className="mt-3 h-1 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${progress}% complete`}
          >
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            {/* Fixed-height body — no scrollbar by design */}
            <div
              data-testid="wizard-body"
              className="min-h-0 flex-1 overflow-y-auto px-6 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <div
                key={STEPS[step].id}
                className="animate-in fade-in slide-in-from-right-2 flex flex-col gap-3 duration-200"
              >
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <StepIcon className="h-4 w-4 text-primary" />
                  {STEPS[step].title}
                </p>

                {step === 0 && (
                  <>
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
                              autoComplete="organization"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2">
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
                                  Customer
                                </SelectItem>
                                <SelectItem value="supplier">
                                  Supplier
                                </SelectItem>
                                <SelectItem value="both">Both</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="+91 98765 43210"
                                inputMode="tel"
                                autoComplete="tel"
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
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="email@example.com"
                              type="email"
                              inputMode="email"
                              autoComplete="email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {step === 1 && (
                  <>
                    <FormField
                      control={form.control}
                      name="gstin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GSTIN</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="22AAAAA0000A1Z5"
                              className="font-mono uppercase"
                              autoComplete="off"
                              {...field}
                              onChange={(e) =>
                                field.onChange(e.target.value.toUpperCase())
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Optional. Printed on B2B invoices
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="billingAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Billing Address</FormLabel>
                          <FormControl>
                            <textarea
                              className={compactArea}
                              placeholder="Full billing address"
                              autoComplete="street-address"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="shippingAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shipping Address</FormLabel>
                            <FormControl>
                              <textarea
                                className={compactArea}
                                placeholder="If different from billing"
                                {...field}
                              />
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
                            <FormLabel>WhatsApp</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="If different from phone"
                                inputMode="tel"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
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
                                inputMode="decimal"
                                {...field}
                              />
                            </FormControl>
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
                                inputMode="decimal"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="paymentTerms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Terms</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Net 30" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tags</FormLabel>
                            <FormControl>
                              <Input placeholder="VIP, Wholesale" {...field} />
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
                            <textarea
                              className={compactArea}
                              placeholder="Internal notes, not visible to the customer"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 border-t border-border px-6 py-4">
              {step > 0 ? (
                <Button type="button" variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  Back
                </Button>
              ) : (
                <DialogClose asChild>
                  <Button variant="ghost" disabled={isSubmitting}>
                    Cancel
                  </Button>
                </DialogClose>
              )}
              <div className="flex-1" />
              {step > 0 && (
                <DialogClose asChild>
                  <Button variant="ghost" disabled={isSubmitting}>
                    Cancel
                  </Button>
                </DialogClose>
              )}
              {!isLast ? (
                <Button type="button" onClick={() => void handleNext()}>
                  Continue
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              ) : (
                <LoadingButton type="submit" loading={isSubmitting}>
                  Add Party
                </LoadingButton>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddCustomer
