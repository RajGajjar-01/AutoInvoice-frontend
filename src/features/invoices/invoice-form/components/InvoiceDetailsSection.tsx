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

interface InvoiceDetailsSectionProps {
  form: UseFormReturn<InvoiceFormData>
  invoiceNumber: string
}

export function InvoiceDetailsSection({
  form,
  invoiceNumber,
}: InvoiceDetailsSectionProps) {
  return (
    <div className="animate-in space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <FormLabel>Invoice Number</FormLabel>
          <Input value={invoiceNumber} readOnly className="bg-muted" />
        </div>
        <FormField
          control={form.control}
          name="invoiceDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Invoice Date <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="INR">₹ INR</SelectItem>
                  <SelectItem value="USD">$ USD</SelectItem>
                  <SelectItem value="EUR">€ EUR</SelectItem>
                  <SelectItem value="GBP">£ GBP</SelectItem>
                  <SelectItem value="AED">د.إ AED</SelectItem>
                  <SelectItem value="SGD">S$ SGD</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="poNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PO / Reference No.</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. PO-00123" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="placeOfSupply"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Place of Supply</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Maharashtra" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="reverseCharge"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reverse Charge</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => field.onChange(!field.value)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${field.value ? "bg-primary" : "bg-muted"}`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-background shadow transition-all ${field.value ? "left-5" : "left-0.5"}`}
                    />
                  </button>
                  <span className="text-xs text-muted-foreground">
                    {field.value ? "Applicable" : "Not Applicable"}
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
