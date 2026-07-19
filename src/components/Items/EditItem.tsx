import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Package, Pencil } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { itemsQueryKeys } from "@/features/items/queries"
import useCustomToast from "@/hooks/useCustomToast"

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

interface Item {
  id: string
  name: string
  sku?: string
  category?: string
  unit?: string
  salePrice?: number
  purchasePrice?: number | null
  taxRate?: number
  hsnCode?: string
  stock?: number
  lowStockThreshold?: number
  description?: string
}

interface EditItemProps {
  item: Item
  onSuccess?: () => void
  variant?: "dropdown" | "button"
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
        {label}
      </span>
      <Separator className="flex-1" />
    </div>
  )
}

const EditItem = ({ item, onSuccess, variant = "dropdown" }: EditItemProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const { showSuccessToast } = useCustomToast()
  const queryClient = useQueryClient()

  const updateItemMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      ItemsService.updateItem({ id: item.id, requestBody: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemsQueryKeys.all })
      showSuccessToast("Item updated successfully")
      setIsOpen(false)
      onSuccess?.()
    },
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: item?.name ?? "",
      sku: item?.sku ?? "",
      category: item?.category ?? "",
      unit: item?.unit ?? "pcs",
      salePrice: item?.salePrice ?? 0,
      purchasePrice: item?.purchasePrice ?? undefined,
      taxRate: item?.taxRate ?? 0,
      hsnCode: item?.hsnCode ?? "",
      stock: item?.stock ?? 0,
      lowStockThreshold: item?.lowStockThreshold ?? 5,
      description: item?.description ?? "",
    },
  })

  const onSubmit = (data: FormValues) => {
    updateItemMutation.mutate({
      name: data.name,
      sku: data.sku || item.sku || null,
      category: data.category || null,
      unit: data.unit,
      price: Number(data.salePrice) || 0,
      tax_rate: Number(data.taxRate) || 0,
      hsn_code: data.hsnCode || null,
      low_stock_threshold: Number(data.lowStockThreshold) ?? 5,
      description: data.description || null,
    })
  }

  const trigger =
    variant === "button" ? (
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <Pencil className="mr-2 h-4 w-4" />
        Edit
      </Button>
    ) : (
      <DropdownMenuItem
        onSelect={(e) => e.preventDefault()}
        onClick={() => setIsOpen(true)}
      >
        <Pencil className="mr-2 h-4 w-4" />
        Edit
      </DropdownMenuItem>
    )

  return (
    <>
      {trigger}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle>Edit Item</DialogTitle>
                <DialogDescription>
                  Update product details. To change stock, use "Adjust Stock".
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col flex-1 min-h-0"
            >
              <div className="overflow-y-auto flex-1 pr-1 -mr-1">
                <div className="grid gap-4 py-2 px-1">
                  <SectionLabel label="Product Info" />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
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
                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit of Measure</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
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
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Optional description or notes"
                              rows={2}
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <SectionLabel label="Pricing" />
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
                          <FormLabel>Purchase / Cost Price (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <SectionLabel label="Tax & Compliance" />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="taxRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GST Rate (%)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={String(field.value ?? "0")}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select GST %" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[0, 5, 12, 18, 28].map((rate) => (
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
                            <Input placeholder="e.g. 8471" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <SectionLabel label="Stock Settings" />
                  <div className="grid grid-cols-2 gap-4">
                    <FormItem>
                      <FormLabel>Current Stock</FormLabel>
                      <Input
                        value={item.stock ?? 0}
                        readOnly
                        className="bg-muted cursor-not-allowed"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Use "Adjust Stock" to change quantity.
                      </p>
                    </FormItem>
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
                              placeholder="5"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-4 pt-4 border-t border-border shrink-0">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default EditItem
