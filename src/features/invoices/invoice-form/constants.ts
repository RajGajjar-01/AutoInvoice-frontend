import { z } from "zod"
import type { InvoiceItem } from "./types"

export const gstinRegex =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

export const invoiceFormSchema = z.object({
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
  validityDate: z.string().optional(),
  vehicleInfo: z.string().optional(),
  deliveryNotes: z.string().optional(),
  bankName: z.string().optional(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifsc: z.string().optional(),
  branch: z.string().optional(),
  upi: z.string().optional(),
  notes: z.string().optional(),
  paymentTerms: z.string().optional(),
})

export type InvoiceFormData = z.infer<typeof invoiceFormSchema>

export type DocumentType = "invoice" | "quotation" | "challan" | "proforma"

export interface DocumentConfig {
  type: DocumentType
  numberPrefix: string
  title: string
  subtitle: string
  singular: string
  short: string
  pdfTitle: string
  defaultStatus: "unpaid" | "draft"
  hidePricing: boolean
  deductsStock: boolean
}

export const documentConfigs: Record<DocumentType, DocumentConfig> = {
  invoice: {
    type: "invoice",
    numberPrefix: "INV",
    title: "Create Invoice",
    subtitle: "Build and send professional invoices",
    singular: "Invoice",
    short: "Inv",
    pdfTitle: "INVOICE",
    defaultStatus: "unpaid",
    hidePricing: false,
    deductsStock: true,
  },
  quotation: {
    type: "quotation",
    numberPrefix: "QUO",
    title: "Create Quotation",
    subtitle: "Build and send professional quotations",
    singular: "Quotation",
    short: "Quo",
    pdfTitle: "QUOTATION",
    defaultStatus: "draft",
    hidePricing: false,
    deductsStock: false,
  },
  challan: {
    type: "challan",
    numberPrefix: "CHL",
    title: "Create Delivery Challan",
    subtitle: "Build and send professional delivery challans",
    singular: "Delivery Challan",
    short: "Chl",
    pdfTitle: "DELIVERY CHALLAN",
    defaultStatus: "unpaid",
    hidePricing: true,
    deductsStock: true,
  },
  proforma: {
    type: "proforma",
    numberPrefix: "PRO",
    title: "Create Proforma Invoice",
    subtitle: "Build and send professional proforma invoices",
    singular: "Proforma Invoice",
    short: "Prof",
    pdfTitle: "PROFORMA INVOICE",
    defaultStatus: "unpaid",
    hidePricing: false,
    deductsStock: false,
  },
}

export function resolveDocumentConfig(
  raw: string | null | undefined,
): DocumentConfig {
  if (raw && raw in documentConfigs) {
    return documentConfigs[raw as DocumentType]
  }
  return documentConfigs.invoice
}

export const emptyItem: InvoiceItem = {
  name: "",
  description: "",
  quantity: 0,
  price: 0,
  tax: 0,
}

export const defaultFormValues: InvoiceFormData = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  customerGst: "",
  customerAddress: "",
  invoiceDate: new Date().toISOString().slice(0, 10),
  dueDate: "",
  currency: "INR",
  poNumber: "",
  placeOfSupply: "",
  reverseCharge: false,
  discountType: "percent",
  discountValue: undefined,
  shippingCharge: undefined,
  extraChargeLabel: "Handling Charges",
  extraChargeAmount: undefined,
  roundOff: false,
  validityDate: "",
  vehicleInfo: "",
  deliveryNotes: "",
  bankName: "",
  accountName: "",
  accountNumber: "",
  ifsc: "",
  branch: "",
  upi: "",
  notes: "",
  paymentTerms: "",
}
