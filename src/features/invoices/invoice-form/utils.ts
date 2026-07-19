import type { DocumentConfig, InvoiceFormData } from "./constants"
import type {
  BankDetails,
  CompanyDetails,
  Customer,
  InvoiceCalculations,
  InvoiceItem,
} from "./types"

export function generateDocumentNumber(prefix = "INV"): string {
  const now = new Date()
  const y = now.getFullYear().toString().slice(-2)
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const r = String(Math.floor(Math.random() * 9000) + 1000)
  return `${prefix}-${y}${m}-${r}`
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
  config: DocumentConfig,
  formData: InvoiceFormData,
  items: InvoiceItem[],
  subtotal: number,
  totalTax: number,
  grandTotal: number,
  invoiceDiscount: number,
): Record<string, unknown> {
  return {
    invoice_number: invoiceNumber,
    document_type: config.type,
    invoice_date: formData.invoiceDate,
    due_date: formData.dueDate || null,
    valid_until:
      config.type === "quotation" ? formData.validityDate || null : null,
    currency: formData.currency,
    subtotal,
    total_tax: config.hidePricing ? 0 : totalTax,
    grand_total: config.hidePricing ? 0 : grandTotal,
    discount: config.hidePricing ? 0 : invoiceDiscount || 0,
    notes: formData.notes || null,
    payment_terms: formData.paymentTerms || null,
    status: config.defaultStatus,
    place_of_supply: formData.placeOfSupply || null,
    reverse_charge: formData.reverseCharge || false,
    vehicle_info:
      config.type === "challan" ? formData.vehicleInfo || null : null,
    delivery_notes:
      config.type === "challan" ? formData.deliveryNotes || null : null,
    customer_id: "",
    items: (items ?? [])
      .filter((i) => i.name)
      .map((i) => ({
        name: i.name,
        description: i.description || null,
        quantity: Number(i.quantity) || 0,
        price: config.hidePricing ? 0 : Number(i.price) || 0,
        tax: config.hidePricing ? 0 : Number(i.tax) || 0,
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

export function buildWhatsAppText(
  documentNumber: string,
  formData: InvoiceFormData,
  items: InvoiceItem[],
  grandTotal: number,
  currencySymbol: string,
  config: DocumentConfig,
): string {
  let text = `*${config.pdfTitle} ${documentNumber}*\n`
  text += `*Customer:* ${formData.customerName || "N/A"}\n`
  text += `*Date:* ${formData.invoiceDate}\n`
  if (!config.hidePricing) {
    text += `*Grand Total: ${currencySymbol}${grandTotal.toFixed(2)}*\n`
  }
  text += `--------------------------\n`
  const activeItems = items.filter(
    (i) => i.name || i.description || i.price > 0,
  )
  activeItems.forEach((item) => {
    if (config.hidePricing) {
      text += `• ${item.name || "Item"} (${item.quantity}${item.unit ? ` ${item.unit}` : ""})\n`
    } else {
      text += `• ${item.name || "Item"} (${item.quantity} x ${currencySymbol}${item.price.toFixed(2)}) = ${currencySymbol}${(item.quantity * item.price).toFixed(2)}\n`
    }
  })
  text += `--------------------------\n`
  text += `\n_Please find the detailed PDF attached._`
  return text
}
