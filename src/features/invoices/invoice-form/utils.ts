import type { InvoiceFormData } from "./constants"
import type {
  BankDetails,
  CompanyDetails,
  Customer,
  InvoiceCalculations,
  InvoiceItem,
} from "./types"

export function generateInvoiceNumber(): string {
  const now = new Date()
  const y = now.getFullYear().toString().slice(-2)
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const r = String(Math.floor(Math.random() * 9000) + 1000)
  return `INV-${y}${m}-${r}`
}

export function getCurrencySymbol(currency: string): string {
  const map: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
  }
  return map[currency] || currency
}

export function computeInvoiceTotals(
  items: InvoiceItem[],
  discountType: string | undefined,
  discountValue: number,
  shippingCharge: number,
  extraChargeAmount: number,
  roundOff: boolean,
): InvoiceCalculations {
  let sub = 0
  let tax = 0
  let itemDisc = 0
  for (const item of items) {
    const lineBase = item.quantity * item.price
    const disc =
      item.discountType === "flat"
        ? Math.min(item.discount || 0, lineBase)
        : lineBase * ((item.discount || 0) / 100)
    const taxable = lineBase - disc
    const lineTax = (taxable * item.tax) / 100
    sub += lineBase
    itemDisc += disc
    tax += lineTax
  }
  const taxableAfterItemDisc = sub - itemDisc
  const invDisc =
    discountType === "flat"
      ? Math.min(discountValue, taxableAfterItemDisc)
      : taxableAfterItemDisc * (discountValue / 100)
  const netBeforeTax = taxableAfterItemDisc - invDisc
  const effectiveTaxRate = sub > 0 ? tax / sub : 0
  const adjustedTax = netBeforeTax * effectiveTaxRate
  const beforeAdjustments =
    netBeforeTax +
    adjustedTax +
    Number(shippingCharge || 0) +
    Number(extraChargeAmount || 0)
  const rawGrand = beforeAdjustments
  const grand = roundOff ? Math.round(rawGrand) : rawGrand
  return {
    subtotal: sub,
    totalTax: adjustedTax,
    itemsDiscount: itemDisc,
    invoiceDiscount: invDisc,
    grandTotal: grand,
  }
}

export function getActiveBankDetails(
  showBankDetails: boolean,
  formData: InvoiceFormData,
  companyDetails: CompanyDetails,
): BankDetails | null {
  if (showBankDetails) {
    return {
      bankName: formData.bankName || "",
      accountName: formData.accountName || "",
      accountNumber: formData.accountNumber || "",
      ifsc: formData.ifsc || "",
      branch: formData.branch || "",
      upi: formData.upi || "",
    }
  }
  if (
    companyDetails.bankName ||
    companyDetails.accountNumber ||
    companyDetails.upi
  ) {
    return {
      bankName: companyDetails.bankName || "",
      accountName: companyDetails.accountName || "",
      accountNumber: companyDetails.accountNumber || "",
      ifsc: companyDetails.ifsc || "",
      branch: companyDetails.branch || "",
      upi: companyDetails.upi || "",
    }
  }
  return null
}

export function buildInvoicePayload(
  invoiceNumber: string,
  documentType: string,
  formData: InvoiceFormData,
  items: InvoiceItem[],
  subtotal: number,
  totalTax: number,
  grandTotal: number,
  invoiceDiscount: number,
): Record<string, unknown> {
  return {
    invoice_number: invoiceNumber,
    document_type: documentType,
    invoice_date: formData.invoiceDate,
    due_date: formData.dueDate || null,
    currency: formData.currency,
    subtotal,
    total_tax: totalTax,
    grand_total: grandTotal,
    discount: invoiceDiscount || 0,
    notes: formData.notes || null,
    payment_terms: formData.paymentTerms || null,
    status: "unpaid",
    place_of_supply: formData.placeOfSupply || null,
    reverse_charge: formData.reverseCharge || false,
    customer_id: "",
    items: (items ?? [])
      .filter((i) => i.name)
      .map((i) => ({
        name: i.name,
        description: i.description || null,
        quantity: Number(i.quantity) || 0,
        price: Number(i.price) || 0,
        tax: Number(i.tax) || 0,
        unit: i.unit || null,
        hsn_code: i.hsnCode || null,
      })),
  }
}

export function fillCustomerForm(
  form: any,
  value: string,
  customers: Customer[],
): void {
  if (value === "__new__") {
    form.reset({
      ...form.getValues(),
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      customerGst: "",
      customerAddress: "",
    })
    return
  }
  const c = customers.find((cust) => cust.id === value)
  if (c) {
    form.setValue("customerName", c.name || "")
    form.setValue("customerPhone", c.phone || "")
    form.setValue("customerEmail", c.email || "")
    form.setValue("customerGst", c.gstin || c.gst || "")
    form.setValue("customerAddress", c.billingAddress || c.address || "")
    if (c.paymentTerms) form.setValue("paymentTerms", c.paymentTerms)
    if (c.notes) form.setValue("notes", c.notes)
  }
}

export function updateStockAfterInvoice(
  items: InvoiceItem[],
  invoiceNumber: string,
  setInventoryItems: any,
): void {
  setInventoryItems((prev: any[]) => {
    const newInventory = [...prev]
    items.forEach((invLine) => {
      if (!invLine.itemId) return
      const idx = newInventory.findIndex((i) => i.id === invLine.itemId)
      if (idx === -1) return
      const currentStock = newInventory[idx].stock || 0
      if (currentStock <= 0) return
      newInventory[idx] = {
        ...newInventory[idx],
        stock: currentStock - invLine.quantity,
        stockHistory: [
          ...(newInventory[idx].stockHistory || []),
          {
            date: new Date().toISOString(),
            type: "invoice",
            qty: -invLine.quantity,
            reason: `Invoice ${invoiceNumber}`,
          },
        ],
      }
    })
    return newInventory
  })
}

export function buildWhatsAppText(
  invoiceNumber: string,
  formData: InvoiceFormData,
  items: InvoiceItem[],
  grandTotal: number,
  currencySymbol: string,
): string {
  let text = `*INVOICE ${invoiceNumber}*\n`
  text += `*Customer:* ${formData.customerName || "N/A"}\n`
  text += `*Date:* ${formData.invoiceDate}\n`
  text += `*Grand Total: ${currencySymbol}${grandTotal.toFixed(2)}*\n`
  text += `--------------------------\n`
  const activeItems = items.filter(
    (i) => i.name || i.description || i.price > 0,
  )
  activeItems.forEach((item) => {
    text += `• ${item.name || "Item"} (${item.quantity} x ${currencySymbol}${item.price.toFixed(2)}) = ${currencySymbol}${(item.quantity * item.price).toFixed(2)}\n`
  })
  text += `--------------------------\n`
  text += `\n_Please find the detailed PDF attached._`
  return text
}
