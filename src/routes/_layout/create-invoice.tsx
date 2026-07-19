import {
  ArrowLeft,
  Download,
  Eye,
  Mail,
  PackagePlus,
  Percent,
  Save,
  Send,
  Truck,
} from "lucide-react"
import { Link, useNavigate } from "react-router"
import { z } from "zod"
import { ModernExcelTable } from "@/components/modern-excel-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { BankDetailsSection } from "@/features/invoices/invoice-form/components/BankDetailsSection"
import { CustomerSection } from "@/features/invoices/invoice-form/components/CustomerSection"
import { InvoicePreviewDialog } from "@/features/invoices/invoice-form/components/InvoicePreviewDialog"
import { NotesSection } from "@/features/invoices/invoice-form/components/NotesSection"
import { documentConfigs } from "@/features/invoices/invoice-form/constants"
import { useInvoiceForm } from "@/features/invoices/invoice-form/hooks/useInvoiceForm"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

const invoiceFormSchema = z.object({
  customerName: z.string().min(1, { message: "Customer name is required" }),
  customerPhone: z.string().optional(),
  customerEmail: z
    .string()
    .email({ message: "Invalid email address" })
    .or(z.literal(""))
    .optional(),
  customerGst: z
    .string()
    .refine((v) => !v || gstinRegex.test(v.toUpperCase()), {
      message: "Invalid GSTIN format (e.g. 22AAAAA0000A1Z5)",
    })
    .optional(),
  customerAddress: z.string().optional(),
  invoiceDate: z.string().min(1, { message: "Invoice date is required" }),
  dueDate: z.string().optional(),
  currency: z.enum(["INR", "USD", "EUR", "GBP", "AED", "SGD"]),
  poNumber: z.string().optional(),
  placeOfSupply: z.string().optional(),
  reverseCharge: z.boolean().optional(),
  discountType: z.enum(["percent", "flat"]).optional(),
  discountValue: z.coerce.number().nonnegative().optional(),
  shippingCharge: z.coerce.number().nonnegative().optional(),
  extraChargeLabel: z.string().optional(),
  extraChargeAmount: z.coerce.number().nonnegative().optional(),
  roundOff: z.boolean().optional(),
  bankName: z.string().optional(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifsc: z.string().optional(),
  branch: z.string().optional(),
  upi: z.string().optional(),
  notes: z.string().optional(),
  paymentTerms: z.string().optional(),
})

type InvoiceFormData = z.infer<typeof invoiceFormSchema>

interface InvoiceItem {
  itemId?: string
  name: string
  description: string
  quantity: number
  price: number
  tax: number
  discount?: number
  discountType?: "flat" | "percent"
  unit?: string
  hsnCode?: string
  showHsn?: boolean
}

interface InventoryItem {
  id: string
  name: string
  description?: string
  salePrice?: number
  taxRate?: number
  unit?: string
  hsnCode?: string
  stock?: number
  stockHistory?: Array<{
    date: string
    type: string
    qty: number
    reason: string
  }>
}

interface CompanyDetails {
  name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  gstin?: string
  tagline?: string
  logo?: string
  invoiceFooter?: string
  bankName?: string
  accountName?: string
  accountNumber?: string
  ifsc?: string
  branch?: string
  upi?: string
}

interface Customer {
  id: string
  name?: string
  phone?: string
  email?: string
  gstin?: string
  gst?: string
  billingAddress?: string
  address?: string
  paymentTerms?: string
  notes?: string
}

interface BankDetails {
  bankName: string
  accountName: string
  accountNumber: string
  ifsc: string
  branch: string
  upi: string
}

function _generateInvoiceNumber(): string {
  const now = new Date()
  const y = now.getFullYear().toString().slice(-2)
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const r = String(Math.floor(Math.random() * 9000) + 1000)
  return `INV-${y}${m}-${r}`
}

const _emptyItem: InvoiceItem = {
  name: "",
  description: "",
  quantity: 0,
  price: 0,
  tax: 0,
}

// ── Amount in Words ─────────────────────────────────────────────────────
const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
]
const tens = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
]

function numToWords(n: number): string {
  if (n === 0) return "Zero"
  if (n < 0) return `Minus ${numToWords(-n)}`
  if (n < 20) return ones[n]
  if (n < 100)
    return tens[Math.floor(n / 10)] + (n % 10 ? ` ${ones[n % 10]}` : "")
  if (n < 1000)
    return `${ones[Math.floor(n / 100)]} Hundred${n % 100 ? ` ${numToWords(n % 100)}` : ""}`
  if (n < 100000)
    return `${numToWords(Math.floor(n / 1000))} Thousand${n % 1000 ? ` ${numToWords(n % 1000)}` : ""}`
  if (n < 10000000)
    return `${numToWords(Math.floor(n / 100000))} Lakh${n % 100000 ? ` ${numToWords(n % 100000)}` : ""}`
  return `${numToWords(Math.floor(n / 10000000))} Crore${n % 10000000 ? ` ${numToWords(n % 10000000)}` : ""}`
}

function amountToWords(amount: number): string {
  const rupees = Math.floor(amount)
  const paise = Math.round((amount - rupees) * 100)
  let result = `${numToWords(rupees)} Rupees`
  if (paise > 0) result += ` and ${numToWords(paise)} Paise`
  return `${result} Only`
}

const documentRouteMap: Record<string, string> = {
  invoice: "/create-invoice",
  quotation: "/create-quotation",
  challan: "/create-challan",
  proforma: "/create-proforma",
}

function CreateInvoicePage() {
  const navigate = useNavigate()
  const {
    form,
    customers,
    selectedCustomerId,
    invoiceNumber,
    documentConfig,
    items,
    showBankDetails,
    inventoryItems,
    previewOpen,
    currencySymbol,
    calculations,
    shippingCharge,
    extraChargeLabel,
    extraChargeAmount,
    handleCustomerSelect,
    handleItemSelect,
    addItem,
    removeItem,
    updateItem,
    onSubmit,
    handleDownloadPDF,
    handlePreviewAndPrint,
    handleWhatsApp,
    handleEmail,
    setShowBankDetails,
    setPreviewOpen,
    previewHtml,
  } = useInvoiceForm()

  useDocumentTitle(documentConfig.title)

  const {
    subtotal,
    totalTax,
    itemsDiscount,
    invoiceDiscount,
    rawGrandTotal,
    grandTotal,
  } = calculations
  const roundOff = form.watch("roundOff")
  const hidePricing = documentConfig.hidePricing

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link to="/invoices">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {documentConfig.title}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {documentConfig.subtitle}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.values(documentConfigs).map((cfg) => (
          <Button
            key={cfg.type}
            type="button"
            size="sm"
            variant={cfg.type === documentConfig.type ? "default" : "outline"}
            onClick={() => navigate(documentRouteMap[cfg.type])}
          >
            {cfg.singular}
          </Button>
        ))}
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Details</CardTitle>
              </CardHeader>
              <CardContent>
                <CustomerSection
                  form={form}
                  customers={customers}
                  selectedCustomerId={selectedCustomerId}
                  onCustomerSelect={handleCustomerSelect}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {documentConfig.singular} Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <FormItem>
                    <FormLabel>{documentConfig.short} Number</FormLabel>
                    <FormControl>
                      <Input
                        value={invoiceNumber}
                        readOnly
                        className="bg-muted"
                      />
                    </FormControl>
                  </FormItem>
                  <FormField
                    control={form.control}
                    name="invoiceDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {documentConfig.short} Date{" "}
                          <span className="text-destructive">*</span>
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
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
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
                              className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                                field.value
                                  ? "bg-primary"
                                  : "bg-slate-300 dark:bg-slate-600"
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
                                  field.value
                                    ? "translate-x-5"
                                    : "translate-x-0.5"
                                }`}
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

                {documentConfig.type === "quotation" && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="validityDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valid Until</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {documentConfig.type === "challan" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="vehicleInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle / Transport Details</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g. MH-12 AB 1234"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deliveryNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Delivery instructions or remarks"
                              className="min-h-[38px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg">
                  {documentConfig.singular} Items
                </CardTitle>
                <p className="text-xs text-muted-foreground italic">
                  Tip: Use arrow keys to navigate table cells
                </p>
              </CardHeader>
              <CardContent>
                <ModernExcelTable
                  items={items}
                  inventoryItems={inventoryItems}
                  updateItem={updateItem}
                  handleItemSelect={handleItemSelect}
                  addItem={addItem}
                  removeItem={removeItem}
                  currencySymbol={currencySymbol}
                  hidePricing={hidePricing}
                />
              </CardContent>
            </Card>

            {!hidePricing && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Adjustments & Charges
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
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
                              className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                                field.value
                                  ? "bg-primary"
                                  : "bg-slate-300 dark:bg-slate-600"
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
                                  field.value
                                    ? "translate-x-5"
                                    : "translate-x-0.5"
                                }`}
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
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <BankDetailsSection
                  form={form}
                  showBankDetails={showBankDetails}
                  onToggle={() => setShowBankDetails((v) => !v)}
                />
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes & Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <NotesSection form={form} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {hidePricing && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Items</span>
                    <span>{items.filter((i) => i.name).length}</span>
                  </div>
                )}
                {!hidePricing && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>
                        {currencySymbol}
                        {subtotal.toFixed(2)}
                      </span>
                    </div>
                    {itemsDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Item Discounts
                        </span>
                        <span className="text-emerald-600">
                          −{currencySymbol}
                          {itemsDiscount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {invoiceDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Invoice Discount
                        </span>
                        <span className="text-emerald-600">
                          −{currencySymbol}
                          {invoiceDiscount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax / GST</span>
                      <span>
                        {currencySymbol}
                        {totalTax.toFixed(2)}
                      </span>
                    </div>
                    {Number(shippingCharge) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>
                          +{currencySymbol}
                          {Number(shippingCharge).toFixed(2)}
                        </span>
                      </div>
                    )}
                    {Number(extraChargeAmount) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {extraChargeLabel || "Other Charges"}
                        </span>
                        <span>
                          +{currencySymbol}
                          {Number(extraChargeAmount).toFixed(2)}
                        </span>
                      </div>
                    )}
                    {roundOff && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Round Off</span>
                        <span className="text-muted-foreground">
                          {grandTotal - rawGrandTotal >= 0 ? "+" : ""}
                          {(grandTotal - rawGrandTotal).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">
                        {currencySymbol}
                        {grandTotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="rounded-md bg-muted/40 border border-border/30 px-3 py-2 mt-1">
                      <p className="text-[11px] text-muted-foreground leading-snug">
                        <span className="font-semibold text-foreground">
                          Amount in Words:{" "}
                        </span>
                        {amountToWords(
                          roundOff ? Math.round(grandTotal) : grandTotal,
                        )}
                      </p>
                    </div>
                  </>
                )}

                <Separator />

                <div className="space-y-2 pt-2">
                  <Button
                    type="button"
                    className="w-full"
                    variant="outline"
                    onClick={handlePreviewAndPrint}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview {documentConfig.singular}
                  </Button>
                  <Button type="submit" className="w-full">
                    <Save className="mr-2 h-4 w-4" />
                    Save {documentConfig.singular}
                  </Button>
                  <Button
                    type="button"
                    className="w-full"
                    variant="outline"
                    onClick={handleDownloadPDF}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                  <Separator />
                  <Button
                    type="button"
                    className="w-full"
                    variant="outline"
                    onClick={handleWhatsApp}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send via WhatsApp
                  </Button>
                  <Button
                    type="button"
                    className="w-full"
                    variant="outline"
                    onClick={handleEmail}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Send via Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>

      <InvoicePreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        html={previewHtml}
        onDownload={handleDownloadPDF}
        title={`${documentConfig.singular} Preview`}
      />
    </div>
  )
}

export default CreateInvoicePage
