import { Search } from "lucide-react"
import { useRef, useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { InvoiceFormData } from "../constants"
import type { Customer } from "../types"

interface CustomerSectionProps {
  form: UseFormReturn<InvoiceFormData>
  customers: Customer[]
  selectedCustomerId: string
  onCustomerSelect: (value: string) => void
}

export function CustomerSection({
  form,
  customers,
  selectedCustomerId,
  onCustomerSelect,
}: CustomerSectionProps) {
  const [search, setSearch] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)

  const filteredCustomers = search.trim()
    ? customers.filter((c) =>
        [c.name, c.email, c.phone]
          .filter(Boolean)
          .some((field) => field?.toLowerCase().includes(search.toLowerCase())),
      )
    : customers

  return (
    <div className="animate-in space-y-6">
      <div className="space-y-2">
        <Label>Select Customer</Label>
        <Select
          value={selectedCustomerId}
          onValueChange={onCustomerSelect}
          onOpenChange={(open) => {
            if (open) {
              // Runs after Radix's own mount-time focus of the selected
              // item, so this wins the race and lands focus in the search box.
              requestAnimationFrame(() => searchInputRef.current?.focus())
            } else {
              setSearch("")
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a customer" />
          </SelectTrigger>
          <SelectContent>
            <div className="relative px-1 pb-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Search customers…"
                className="h-8 pl-8"
              />
            </div>
            <SelectItem value="__new__">+ Add New Customer</SelectItem>
            {filteredCustomers.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
            {filteredCustomers.length === 0 && (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">
                No customers found
              </p>
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="customerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Name <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="Customer name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="customerPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Phone" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="customerEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="customerGst"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GST</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="GST number"
                  className="uppercase font-mono"
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="customerAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Full address" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
