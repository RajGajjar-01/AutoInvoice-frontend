export interface InvoiceItem {
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
}

export interface InventoryItem {
  id: string
  name: string
  description?: string
  salePrice?: number
  taxRate?: number
  unit?: string
  stock?: number
  stockHistory?: Array<{
    date: string
    type: string
    qty: number
    reason: string
  }>
}

export interface CompanyDetails {
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

export interface Customer {
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

export interface BankDetails {
  bankName: string
  accountName: string
  accountNumber: string
  ifsc: string
  branch: string
  upi: string
}

export interface ComputedRow {
  item: InvoiceItem
  idx: number
  lineBase: number
  disc: number
  taxable: number
  lineTax: number
  lineTotal: number
}

export interface SummaryEntry {
  label: string
  value: string
  red?: boolean
}

export interface InvoiceCalculations {
  subtotal: number
  totalTax: number
  itemsDiscount: number
  invoiceDiscount: number
  grandTotal: number
}
