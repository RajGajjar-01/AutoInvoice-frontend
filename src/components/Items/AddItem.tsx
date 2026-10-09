import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  Check,
  Package,
  Plus,
  Wallet,
} from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ItemsService } from "@/client/sdk.gen"
import type { ItemCreate } from "@/client/types.gen"
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
import { Textarea } from "@/components/ui/textarea"
import { itemsQueryKeys } from "@/features/items/queries"
import useCustomToast from "@/hooks/useCustomToast"
import { formResolver } from "@/lib/form"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  name: z.string().min(1, { message: "Item name is required" }).max(255),
  sku: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().default("pcs"),
  salePrice: z.coerce
    .number({ message: "Enter a valid price" })
    .min(0)
    .default(0),
  purchasePrice: z.coerce
    .number({ message: "Enter a valid price" })
    .min(0)
    .optional(),
  taxRate: z.coerce
    .number({ message: "Enter a valid tax rate" })
    .min(0)
    .max(100)
    .default(0),
  hsnCode: z.string().optional(),
  stock: z.coerce
    .number({ message: "Enter a valid quantity" })
    .min(0)
    .default(0),
  lowStockThreshold: z.coerce.number().min(0).default(5),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

type CreateItemPayload = ItemCreate & { hsn_code?: string | null }

function generateSKU() {
  return `SKU-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
}

const UNITS = [
  "pcs",
  "kg",
  "g",
  "hrs",
  "days",
  "m",
  "cm",
  "L",
  "mL",
  "box",
  "set",
  "pair",
]

const GST_RATES = [0, 5, 12, 18, 28]

const STEPS = [
  {
    id: "basic",
    label: "Basic",
    title: "What is this item?",
    hint: "Name and identity — only the name is required.",
    icon: Package,
    fields: ["name", "sku", "category", "unit"] as const,
  },
  {
    id: "pricing",
    label: "Pricing",
    title: "Price and tax",
    hint: "Sale price, cost and GST details.",
    icon: Wallet,
    fields: ["salePrice", "purchasePrice", "taxRate", "hsnCode"] as const,
  },
  {
    id: "stock",
    label: "Stock",
    title: "Stock and more",
    hint: "Opening stock, alerts and notes — all optional.",
    icon: Boxes,
    fields: ["stock", "lowStockThreshold", "description"] as const,
  },
] as const

const AddItem = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(0)
  const { showSuccessToast } = useCustomToast()
  const queryClient = useQueryClient()

  const createItemMutation = useMutation({
    mutationFn: (data: CreateItemPayload) =>
      ItemsService.createItem({ requestBody: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemsQueryKeys.all })
      showSuccessToast("Item added successfully")
      form.reset()
      setStep(0)
      setIsOpen(false)
    },
  })

  const form = useForm<FormValues>({
    resolver: formResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: "",
      sku: "",
      category: "",
      unit: "pcs",
      salePrice: 0,
      purchasePrice: 0,
      taxRate: 0,
      hsnCode: "",
      stock: 0,
      lowStockThreshold: 5,
      description: "",
    },
  })

  const onSubmit = (data: FormValues) => {
    createItemMutation.mutate({
      name: data.name,
      sku: data.sku || generateSKU(),
      category: data.category || null,
      unit: data.unit,
      price: Number(data.salePrice) || 0,
      tax_rate: Number(data.taxRate) || 0,
      hsn_code: data.hsnCode || null,
      stock: Number(data.stock) || 0,
      low_stock_threshold: Number(data.lowStockThreshold) ?? 5,
      description: data.description || null,
    })
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) setStep(0)
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
          Add Item
        </Button>
      </DialogTrigger>

      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 px-6 pt-6 text-left">
          <DialogTitle className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <Package className="h-4 w-4 text-primary" />
            </div>
            Add Item
          </DialogTitle>
          <DialogDescription>
            Step {step + 1} of {STEPS.length} — {STEPS[step].hint}
          </DialogDescription>
        </DialogHeader>

        {/* Progress — segmented steps + bar, same as customer wizard */}
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
                            Item Name{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Web Design Service"
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
                        name="sku"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SKU / Item Code</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Auto-generated if blank"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. Electronics, Services"
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
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit of Measure</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {UNITS.map((u) => (
                                <SelectItem key={u} value={u}>
                                  {u}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {step === 1 && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="salePrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Sale Price (₹){" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                inputMode="decimal"
                                placeholder="0.00"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="purchasePrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cost Price (₹)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                inputMode="decimal"
                                placeholder="0.00"
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
                        name="taxRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>GST Rate (%)</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={String(field.value)}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select GST %" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {GST_RATES.map((rate) => (
                                  <SelectItem key={rate} value={String(rate)}>
                                    {rate}%
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="hsnCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>HSN / SAC Code</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. 8471"
                                inputMode="numeric"
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
                        name="stock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Opening Stock</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                inputMode="numeric"
                                placeholder="0"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lowStockThreshold"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Low Stock Alert Below</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                inputMode="numeric"
                                placeholder="5"
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
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Optional description or notes"
                              rows={3}
                              className="min-h-[64px] resize-none"
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
                  <Button variant="ghost" type="button">
                    Cancel
                  </Button>
                </DialogClose>
              )}
              <div className="flex-1" />
              {step > 0 && (
                <DialogClose asChild>
                  <Button variant="ghost" type="button">
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
                <LoadingButton
                  type="submit"
                  loading={createItemMutation.isPending}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </LoadingButton>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddItem
