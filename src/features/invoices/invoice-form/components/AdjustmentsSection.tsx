import { PackagePlus, Percent, Truck } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"
import {
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
import type { InvoiceFormData } from "../constants"

interface AdjustmentsSectionProps {
  form: UseFormReturn<InvoiceFormData>
}

export function AdjustmentsSection({ form }: AdjustmentsSectionProps) {
  return (
    <div className="animate-in space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormItem>
          <FormLabel className="flex items-center gap-1">
            <Percent className="h-3 w-3" /> Invoice Discount
          </FormLabel>
          <div className="flex gap-1">
            <FormField
              control={form.control}
              name="discountType"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-20 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">%</SelectItem>
                    <SelectItem value="flat">₹ Flat</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FormField
              control={form.control}
              name="discountValue"
              render={({ field }) => (
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...field}
                    value={field.value || ""}
                    placeholder="0"
                    className="flex-1 h-9"
                  />
                </FormControl>
              )}
            />
          </div>
        </FormItem>
        <FormField
          control={form.control}
          name="shippingCharge"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <Truck className="h-3 w-3" /> Shipping / Freight
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  {...field}
                  value={field.value || ""}
                  placeholder="0.00"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
          <FormLabel className="flex items-center gap-1">
            <PackagePlus className="h-3 w-3" /> Other Charges
          </FormLabel>
          <div className="flex gap-1">
            <FormField
              control={form.control}
              name="extraChargeLabel"
              render={({ field }) => (
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Label"
                    className="flex-1 h-9 text-xs"
                  />
                </FormControl>
              )}
            />
            <FormField
              control={form.control}
              name="extraChargeAmount"
              render={({ field }) => (
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...field}
                    value={field.value || ""}
                    placeholder="0.00"
                    className="w-24 h-9"
                  />
                </FormControl>
              )}
            />
          </div>
        </FormItem>
      </div>
      <FormField
        control={form.control}
        name="roundOff"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center gap-3 pt-1">
              <FormControl>
                <button
                  type="button"
                  onClick={() => field.onChange(!field.value)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${field.value ? "bg-primary" : "bg-muted"}`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-background shadow transition-all ${field.value ? "left-5" : "left-0.5"}`}
                  />
                </button>
              </FormControl>
              <FormLabel className="cursor-pointer">
                Round off grand total to nearest ₹
              </FormLabel>
            </div>
          </FormItem>
        )}
      />
    </div>
  )
}
