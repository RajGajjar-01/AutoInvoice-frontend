import { ChevronDown, ChevronUp } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  sanitizeLowercase,
  sanitizeNumeric,
  sanitizeUppercase,
} from "@/lib/validation"
import type { InvoiceFormData } from "../constants"

interface BankDetailsSectionProps {
  form: UseFormReturn<InvoiceFormData>
  showBankDetails: boolean
  onToggle: () => void
}

export function BankDetailsSection({
  form,
  showBankDetails,
  onToggle,
}: BankDetailsSectionProps) {
  return (
    <div className="animate-in">
      <div className="flex items-center justify-between w-full py-0">
        <button
          type="button"
          className="flex items-center justify-between w-full"
          onClick={onToggle}
        >
          <h3 className="text-lg font-semibold">Bank & Payment Details</h3>
          {showBankDetails ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>
      {showBankDetails && (
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. HDFC Bank" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Holder Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Name on account" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(sanitizeNumeric(e.target.value))
                      }
                      placeholder="50100123456789"
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription className="text-[11px]">
                    9 to 18 numeric digits
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ifsc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IFSC Code</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(sanitizeUppercase(e.target.value))
                      }
                      placeholder="e.g. HDFC0001234"
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription className="text-[11px]">
                    11-character code (e.g. HDFC0001234)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="branch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Branch name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="upi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UPI ID</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(sanitizeLowercase(e.target.value))
                      }
                      placeholder="yourname@upi"
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription className="text-[11px]">
                    e.g. user@bank
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}
    </div>
  )
}
