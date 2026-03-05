import { createFileRoute, Link } from "@tanstack/react-router"
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Eye,
  Save,
  Download,
  Send,
  Mail,
  Percent,
  Truck,
  PackagePlus,
} from "lucide-react"
import { useState, useMemo, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import useCustomToast from "@/hooks/useCustomToast"
import useLocalStorage from "@/hooks/useLocalStorage"

export const Route = createFileRoute("/_layout/create-invoice")({
  component: CreateInvoicePage,
  validateSearch: (search) => ({
    customerId: search.customerId ? String(search.customerId) : undefined,
    itemId: search.itemId ? String(search.itemId) : undefined,
  }),
  head: () => ({
    meta: [{ title: "Create Invoice" }],
  }),
})

function generateInvoiceNumber() {
  const now = new Date()
  const y = now.getFullYear().toString().slice(-2)
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const r = String(Math.floor(Math.random() * 9000) + 1000)
  return `INV-${y}${m}-${r}`
}

const emptyItem = { name: "", description: "", quantity: 0, price: 0, tax: 0 }

function CreateInvoicePage() {
  const [customers, setCustomers] = useLocalStorage("customers", [])
  const [inventoryItems, setInventoryItems] = useLocalStorage("items", [])
  const [, setInvoices] = useLocalStorage("invoices", [])
  const [selectedTemplate] = useLocalStorage("selected-template", "minimal")
  const [customTemplate] = useLocalStorage("custom-template", null)
  const [importedTemplate] = useLocalStorage("imported-template", null)
  const [companyDetails] = useLocalStorage("company-details", {})
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const savedRef = useRef(false)
  const { customerId: preselectedCustomerId, itemId: preselectedItemId } = Route.useSearch()

  const [selectedCustomerId, setSelectedCustomerId] = useState("")
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    address: "",
    gst: "",
    phone: "",
    email: "",
  })

  const [invoiceNumber] = useState(generateInvoiceNumber)
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().slice(0, 10),
  )
  const [dueDate, setDueDate] = useState("")
  const [currency, setCurrency] = useState("INR")
  const [poNumber, setPoNumber] = useState("")
  const [placeOfSupply, setPlaceOfSupply] = useState("")
  const [reverseCharge, setReverseCharge] = useState(false)
  const [items, setItems] = useState([{ ...emptyItem }])
  const [notes, setNotes] = useState("")
  const [paymentTerms, setPaymentTerms] = useState("")
  // Invoice-level adjustments
  const [discountType, setDiscountType] = useState("percent") // "percent" | "flat"
  const [discountValue, setDiscountValue] = useState(0)
  const [shippingCharge, setShippingCharge] = useState(0)
  const [extraChargeLabel, setExtraChargeLabel] = useState("Handling Charges")
  const [extraChargeAmount, setExtraChargeAmount] = useState(0)
  const [roundOff, setRoundOff] = useState(false)
  const [showBankDetails, setShowBankDetails] = useState(false)
  const [bankDetails, setBankDetails] = useState({ bankName: "", accountName: "", accountNumber: "", ifsc: "", branch: "", upi: "" })
  const [previewOpen, setPreviewOpen] = useState(false)

  // Pre-select customer and/or item if navigated from their detail pages
  useEffect(() => {
    if (preselectedCustomerId && customers.length > 0) {
      handleCustomerSelect(preselectedCustomerId)
    }
    if (preselectedItemId && inventoryItems.length > 0 && items.length === 1 && items[0].name === "") {
      handleItemSelect(0, preselectedItemId)
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedCustomerId, preselectedItemId, customers.length > 0, inventoryItems.length > 0])

  const handleCustomerSelect = (value) => {
    setSelectedCustomerId(value)
    if (value === "__new__") {
      setCustomerDetails({ name: "", address: "", gst: "", phone: "", email: "" })
      return
    }
    const c = customers.find((cust) => cust.id === value)
    if (c) {
      setCustomerDetails({
        name: c.name || "",
        address: c.billingAddress || c.address || "",
        gst: c.gstin || c.gst || "",
        phone: c.phone || "",
        email: c.email || "",
      })
      // Also pre-fill payment terms and notes if available
      if (c.paymentTerms) setPaymentTerms(c.paymentTerms)
      if (c.notes) setNotes(c.notes)
    }
  }

  const updateItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
            ...item,
            [field]:
              field === "quantity" || field === "price" || field === "tax" || field === "discount"
                ? Number(value) || 0
                : value,
          }
          : item,
      ),
    )
  }

  const handleItemSelect = (index, itemId) => {
    const invItem = inventoryItems.find(i => i.id === itemId)
    if (!invItem) return

    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
            ...item,
            itemId: invItem.id, // reference to deduct stock later
            name: invItem.name,
            description: invItem.description || "",
            price: invItem.salePrice || 0,
            tax: invItem.taxRate || 0,
            unit: invItem.unit || "pcs"
          }
          : item
      )
    )
  }

  const addItem = () => setItems((prev) => [...prev, { ...emptyItem }])
  const removeItem = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index))

  const { subtotal, totalTax, itemsDiscount, invoiceDiscount, grandTotal } = useMemo(() => {
    let sub = 0
    let tax = 0
    let itemDisc = 0
    for (const item of items) {
      const lineBase = item.quantity * item.price
      const disc = item.discountType === "flat"
        ? Math.min(item.discount || 0, lineBase)
        : lineBase * ((item.discount || 0) / 100)
      const taxable = lineBase - disc
      const lineTax = (taxable * item.tax) / 100
      sub += lineBase
      itemDisc += disc
      tax += lineTax
    }
    // Invoice-level discount
    const taxableAfterItemDisc = sub - itemDisc
    const invDisc = discountType === "flat"
      ? Math.min(discountValue, taxableAfterItemDisc)
      : taxableAfterItemDisc * (discountValue / 100)
    const netBeforeTax = taxableAfterItemDisc - invDisc
    // Recalculate tax on net if per-item tax is used (approximate redistribution)
    const effectiveTaxRate = sub > 0 ? tax / sub : 0
    const adjustedTax = netBeforeTax * effectiveTaxRate
    const beforeAdjustments = netBeforeTax + adjustedTax + Number(shippingCharge || 0) + Number(extraChargeAmount || 0)
    const rawGrand = beforeAdjustments
    const grand = roundOff ? Math.round(rawGrand) : rawGrand
    return {
      subtotal: sub,
      totalTax: adjustedTax,
      itemsDiscount: itemDisc,
      invoiceDiscount: invDisc,
      grandTotal: grand,
    }
  }, [items, discountType, discountValue, shippingCharge, extraChargeAmount, roundOff])

  const currencySymbol =
    currency === "INR"
      ? "₹"
      : currency === "USD"
        ? "$"
        : currency === "EUR"
          ? "€"
          : currency === "GBP"
            ? "£"
            : currency

  const buildInvoiceData = () => ({
    id: crypto.randomUUID(),
    invoiceNumber,
    invoiceDate,
    dueDate,
    currency,
    poNumber,
    placeOfSupply,
    reverseCharge,
    customer: customerDetails,
    items,
    subtotal,
    totalTax,
    itemsDiscount,
    invoiceDiscount,
    discountType,
    discountValue,
    shippingCharge: Number(shippingCharge || 0),
    extraChargeLabel,
    extraChargeAmount: Number(extraChargeAmount || 0),
    roundOff,
    bankDetails: showBankDetails ? bankDetails : null,
    grandTotal,
    notes,
    paymentTerms,
    status: "unpaid",
    createdAt: new Date().toISOString(),
  })

  const handleSave = () => {
    if (!customerDetails.name) {
      showErrorToast("Please select or enter a customer")
      return
    }
    if (items.length === 0 || !items[0].name) {
      showErrorToast("Please add at least one item")
      return
    }
    if (savedRef.current) return
    savedRef.current = true
    const inv = buildInvoiceData()
    setInvoices((prev) => [...prev, inv])

    // Update customer's saved notes and payment terms
    if (selectedCustomerId && selectedCustomerId !== "__new__") {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === selectedCustomerId
            ? { ...c, notes, paymentTerms }
            : c
        )
      )
    }

    // Deduct stock for items that have an itemId linked
    let stockDeducted = false
    setInventoryItems(prev => {
      const newInventory = [...prev]
      items.forEach(invLine => {
        if (!invLine.itemId) return
        const idx = newInventory.findIndex(i => i.id === invLine.itemId)
        if (idx === -1) return

        const currentStock = newInventory[idx].stock || 0
        if (currentStock <= 0) return // Already zero or negative, skip deduction or let it go negative? Let's allow negative for now so records match reality

        newInventory[idx] = {
          ...newInventory[idx],
          stock: currentStock - invLine.quantity,
          stockHistory: [
            ...(newInventory[idx].stockHistory || []),
            {
              date: new Date().toISOString(),
              type: "invoice",
              qty: -invLine.quantity,
              reason: `Invoice ${invoiceNumber}`
            }
          ]
        }
        stockDeducted = true
      })
      return newInventory
    })

    if (stockDeducted) {
      showSuccessToast("Invoice saved and stock updated")
    } else {
      showSuccessToast("Invoice saved successfully")
    }

    // Reset guard after short delay so user can save again if needed
    setTimeout(() => { savedRef.current = false }, 1000)
  }

  // ─── Template-aware invoice HTML builder ─────────────────────────────────────
  const buildInvoiceHtml = () => {
    const cs = currencySymbol
    const cd = customerDetails
    const biz = companyDetails || {}
    const validItems = items.filter((i) => i.name)

    // Build company block for invoice sender section
    const bizName = biz.name || 'Your Business'
    const bizEmail = biz.email || ''
    const bizPhone = biz.phone || ''
    const bizAddress = [biz.address, biz.city, biz.state, biz.pincode].filter(Boolean).join(', ')
    const bizGstin = biz.gstin || ''
    const bizTagline = biz.tagline || ''
    const bizLogo = biz.logo || null

    // Bank details - use company bank if not overridden
    const activeBankDetails = showBankDetails ? bankDetails : (
      (biz.bankName || biz.accountNumber || biz.upi) ? {
        bankName: biz.bankName || '',
        accountName: biz.accountName || '',
        accountNumber: biz.accountNumber || '',
        ifsc: biz.ifsc || '',
        branch: biz.branch || '',
        upi: biz.upi || '',
      } : null
    )

    const bankBlock = activeBankDetails && (activeBankDetails.bankName || activeBankDetails.accountNumber || activeBankDetails.upi) ? `
      <div style="background:#f8f9fa;border-radius:6px;padding:12px 16px;margin-bottom:20px">
        <p style="font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;color:#666">Bank / Payment Details</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 20px;font-size:11px;color:#555">
          ${activeBankDetails.bankName ? `<span>Bank: <strong>${activeBankDetails.bankName}</strong></span>` : ''}
          ${activeBankDetails.accountName ? `<span>Account Name: <strong>${activeBankDetails.accountName}</strong></span>` : ''}
          ${activeBankDetails.accountNumber ? `<span>Acc No: <strong>${activeBankDetails.accountNumber}</strong></span>` : ''}
          ${activeBankDetails.ifsc ? `<span>IFSC: <strong>${activeBankDetails.ifsc}</strong></span>` : ''}
          ${activeBankDetails.branch ? `<span>Branch: ${activeBankDetails.branch}</span>` : ''}
          ${activeBankDetails.upi ? `<span>UPI: <strong>${activeBankDetails.upi}</strong></span>` : ''}
        </div>
      </div>` : ''

    // Shared helpers
    const metaRows = `
      <tr><td>Invoice #</td><td>${invoiceNumber}</td></tr>
      <tr><td>Date</td><td>${invoiceDate}</td></tr>
      ${dueDate ? `<tr><td>Due Date</td><td>${dueDate}</td></tr>` : ''}
      <tr><td>Currency</td><td>${currency}</td></tr>
      ${poNumber ? `<tr><td>PO #</td><td>${poNumber}</td></tr>` : ''}
      ${placeOfSupply ? `<tr><td>Place of Supply</td><td>${placeOfSupply}</td></tr>` : ''}`

    const bizBlock = `
      ${bizLogo ? `<img src="${bizLogo}" style="height:40px;object-fit:contain;margin-bottom:4px" alt="logo">` : ''}
      <p style="font-weight:700;font-size:14px">${bizName}</p>
      ${bizTagline ? `<p style="color:#aaa;font-size:11px">${bizTagline}</p>` : ''}
      ${bizAddress ? `<p style="color:#888;font-size:11px">${bizAddress}</p>` : ''}
      ${bizGstin ? `<p style="color:#888;font-size:11px">GSTIN: ${bizGstin}</p>` : ''}
      ${bizEmail ? `<p style="color:#888;font-size:11px">${bizEmail}</p>` : ''}
      ${bizPhone ? `<p style="color:#888;font-size:11px">${bizPhone}</p>` : ''}`

    const invoiceFooterNote = biz.invoiceFooter || 'Thank you for your business!'

    const notesBlock = (accentColor = '#217346') => (notes || paymentTerms) ? `
      <div style="background:#f6faf8;border-left:4px solid ${accentColor};padding:12px 16px;margin-bottom:20px">
        ${notes ? `<p style="font-weight:700;font-size:12px;margin-bottom:4px">Notes</p><p style="color:#555;font-size:12px">${notes}</p>` : ''}
        ${paymentTerms ? `<p style="font-weight:700;font-size:12px;margin:8px 0 4px">Payment Terms</p><p style="color:#555;font-size:12px">${paymentTerms}</p>` : ''}
      </div>` : ''

    const footer = `${bankBlock}<div style="text-align:center;color:#aaa;font-size:11px;border-top:1px solid #e5e5e5;padding-top:14px">${invoiceFooterNote} &bull; Generated by AutoInvoice</div>`

    const wrap = (title, style, body) => `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>${style}</style></head><body>${body}</body></html>`

    // ── Shared invoice builder — Navy Professional (matches reference design) ─
    const buildProfessionalInvoice = (opts) => {
      const {
        label = 'INVOICE',
        navyBg = '#1e2d5b',
        accentOrange = '#f47321',
      } = opts

      const logoHtml = bizLogo
        ? `<img src="${bizLogo}" style="height:36px;max-width:110px;object-fit:contain;display:block;margin-bottom:6px" alt="logo">`
        : `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
             <div style="width:32px;height:32px;background:${accentOrange};border-radius:4px;display:flex;align-items:center;justify-content:center">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
             </div>
             <div>
               <p style="font-weight:800;font-size:15px;color:#fff;line-height:1.1">${bizName}</p>
               ${bizTagline ? '<p style="font-size:9px;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:1.5px">' + bizTagline + '</p>' : ''}
             </div>
           </div>`

      const rows = validItems.filter(i => i.name).map((item, idx, arr) => {
        const lineBase = item.quantity * item.price
        const disc = item.discountType === 'flat'
          ? Math.min(item.discount || 0, lineBase)
          : lineBase * ((item.discount || 0) / 100)
        const taxable = lineBase - disc
        const lineTax = (taxable * item.tax) / 100
        const lineTotal = taxable + lineTax
        const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8f9fb'
        return `<tr style="background:${rowBg}">
          <td style="padding:9px 10px;border-bottom:1px solid #edf0f5;font-size:12px;color:#374151;text-align:center;width:32px;font-weight:500">${idx + 1}</td>
          <td style="padding:9px 12px;border-bottom:1px solid #edf0f5;font-size:12px;color:#1e2d5b">
            <div style="font-weight:500">${item.name}</div>
            ${item.description ? '<div style="font-size:10.5px;color:#9ca3af;margin-top:1px">' + item.description + '</div>' : ''}
            ${item.hsnCode ? '<div style="font-size:10px;color:#c4c9d4;margin-top:1px">HSN: ' + item.hsnCode + '</div>' : ''}
          </td>
          <td style="padding:9px 12px;border-bottom:1px solid #edf0f5;text-align:center;font-size:12px;color:#374151">${item.quantity}${item.unit ? ' ' + item.unit : ''}</td>
          <td style="padding:9px 12px;border-bottom:1px solid #edf0f5;text-align:right;font-size:12px;color:#374151;font-family:ui-monospace,monospace">${cs}${Number(item.price).toFixed(2)}</td>
          ${item.discount ? '<td style="padding:9px 12px;border-bottom:1px solid #edf0f5;text-align:right;font-size:12px;color:#ef4444;font-family:ui-monospace,monospace">-' + cs + disc.toFixed(2) + '</td>' : ''}
          <td style="padding:9px 12px;border-bottom:1px solid #edf0f5;text-align:right;font-size:12px;color:#374151;font-family:ui-monospace,monospace">${cs}${lineTotal.toFixed(2)}</td>
        </tr>`
      }).join('')

      const hasDiscount = validItems.filter(i => i.name).some(i => i.discount)

      const summaryRows = [
        { label: 'Subtotal', value: cs + subtotal.toFixed(2) },
        itemsDiscount > 0 ? { label: 'Item Discounts', value: '-' + cs + itemsDiscount.toFixed(2), red: true } : null,
        invoiceDiscount > 0 ? { label: 'Invoice Discount' + (discountType === 'percent' ? ' (' + discountValue + '%)' : ''), value: '-' + cs + invoiceDiscount.toFixed(2), red: true } : null,
        totalTax > 0 ? { label: 'Tax', value: cs + totalTax.toFixed(2) } : null,
        Number(shippingCharge) > 0 ? { label: 'Shipping', value: cs + Number(shippingCharge).toFixed(2) } : null,
        Number(extraChargeAmount) > 0 ? { label: extraChargeLabel || 'Extra Charges', value: cs + Number(extraChargeAmount).toFixed(2) } : null,
      ].filter(Boolean)

      const summaryHtml = summaryRows.map(r =>
        `<tr>
          <td style="padding:5px 12px 5px 0;font-size:12px;color:#6b7280;text-align:right">${r.label}</td>
          <td style="padding:5px 0;font-size:12px;text-align:right;font-family:ui-monospace,monospace;color:${r.red ? '#ef4444' : '#1e2d5b'}">${r.value}</td>
        </tr>`
      ).join('')

      const bankSection = activeBankDetails && (activeBankDetails.bankName || activeBankDetails.accountNumber || activeBankDetails.upi) ? `
        <div style="margin-top:28px">
          <p style="font-size:12px;font-weight:700;color:#1e2d5b;margin-bottom:10px">Payment Info</p>
          <table style="font-size:11.5px;border-collapse:collapse">
            ${activeBankDetails.accountName ? '<tr><td style="color:#6b7280;padding-right:12px;padding-bottom:4px">Account Name</td><td style="color:#1e2d5b;font-weight:500">' + activeBankDetails.accountName + '</td></tr>' : ''}
            ${activeBankDetails.bankName ? '<tr><td style="color:#6b7280;padding-right:12px;padding-bottom:4px">Bank</td><td style="color:#1e2d5b;font-weight:500">' + activeBankDetails.bankName + '</td></tr>' : ''}
            ${activeBankDetails.accountNumber ? '<tr><td style="color:#6b7280;padding-right:12px;padding-bottom:4px">Account No.</td><td style="color:#1e2d5b;font-family:ui-monospace,monospace">' + activeBankDetails.accountNumber + '</td></tr>' : ''}
            ${activeBankDetails.ifsc ? '<tr><td style="color:#6b7280;padding-right:12px;padding-bottom:4px">IFSC</td><td style="color:#1e2d5b;font-family:ui-monospace,monospace">' + activeBankDetails.ifsc + '</td></tr>' : ''}
            ${activeBankDetails.upi ? '<tr><td style="color:#6b7280;padding-right:12px;padding-bottom:4px">UPI</td><td style="color:#1e2d5b;font-family:ui-monospace,monospace">' + activeBankDetails.upi + '</td></tr>' : ''}
            ${dueDate ? '<tr><td style="color:#6b7280;padding-right:12px">Payment Due</td><td style="color:#1e2d5b;font-weight:600">' + dueDate + '</td></tr>' : ''}
          </table>
        </div>` : ''

      const notesSection = (notes || paymentTerms) ? `
        <div style="margin-top:28px">
          <p style="font-size:12px;font-weight:700;color:#1e2d5b;margin-bottom:8px">Notes</p>
          ${notes ? '<p style="font-size:11.5px;color:#6b7280;line-height:1.6">' + notes + '</p>' : ''}
          ${paymentTerms ? '<p style="font-size:11.5px;color:#6b7280;margin-top:4px">' + paymentTerms + '</p>' : ''}
        </div>` : ''

      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${label} ${invoiceNumber}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.5;background:#fff;color:#1a1a1a;-webkit-font-smoothing:antialiased}
    @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style>
</head>
<body>
<div style="max-width:800px;margin:0 auto;background:#fff">

  <!-- ══ TOP HEADER BAND ══ -->
  <div style="background:${navyBg};padding:28px 36px;position:relative;overflow:hidden;display:flex;justify-content:space-between;align-items:flex-start">
    <!-- Diagonal stripe decoration -->
    <div style="position:absolute;top:-30px;right:140px;width:160px;height:200px;opacity:0.08;transform:rotate(-15deg);background:repeating-linear-gradient(0deg,transparent,transparent 12px,#fff 12px,#fff 14px)"></div>
    <div style="position:absolute;top:-30px;right:40px;width:100px;height:200px;opacity:0.06;transform:rotate(-15deg);background:repeating-linear-gradient(0deg,transparent,transparent 12px,#fff 12px,#fff 14px)"></div>

    <!-- Left: Logo + company name -->
    <div style="position:relative;z-index:1">
      ${logoHtml}
      ${bizLogo ? '<p style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.9)">' + bizName + '</p>' : ''}
    </div>

    <!-- Right: INVOICE title + ref -->
    <div style="text-align:right;position:relative;z-index:1">
      <p style="font-size:36px;font-weight:900;color:#fff;letter-spacing:2px;line-height:1">${label}</p>
      <p style="font-size:11px;color:rgba(255,255,255,0.65);margin-top:6px">Ref No. <span style="font-family:ui-monospace,monospace;color:rgba(255,255,255,0.85)">${invoiceNumber}</span></p>
      <div style="margin-top:10px;font-size:11px;color:rgba(255,255,255,0.7)">
        <div style="display:flex;justify-content:flex-end;gap:6px;margin-bottom:3px">
          <span style="color:rgba(255,255,255,0.5)">Invoice Date</span>
          <span style="color:#fff;font-weight:600">${invoiceDate}</span>
        </div>
        ${dueDate ? '<div style="display:flex;justify-content:flex-end;gap:6px"><span style="color:rgba(255,255,255,0.5)">Due Date</span><span style="color:#f47321;font-weight:600">' + dueDate + '</span></div>' : ''}
      </div>
    </div>
  </div>

  <!-- ══ COMPANY DETAILS STRIP ══ -->
  <div style="background:#eef1f7;padding:10px 36px;border-bottom:1px solid #dce1ed">
    <p style="font-size:11px;font-weight:700;color:#1e2d5b;margin-bottom:2px">${bizName}</p>
    <p style="font-size:10.5px;color:#6b7280">
      ${[bizAddress, bizGstin ? 'GSTIN: ' + bizGstin : '', bizPhone ? 'Tel: ' + bizPhone : '', bizEmail ? 'Email: ' + bizEmail : ''].filter(Boolean).join('  |  ')}
    </p>
  </div>

  <!-- ══ BODY ══ -->
  <div style="padding:28px 36px">

    <!-- Billed To -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid #edf0f5">
      <div>
        <p style="font-size:11px;font-weight:700;color:#1e2d5b;border-bottom:1px solid #1e2d5b;padding-bottom:4px;margin-bottom:10px">Billed To:</p>
        <p style="font-weight:700;font-size:12.5px;color:#1e2d5b;margin-bottom:3px">${cd.name || '—'}</p>
        ${cd.address ? '<p style="font-size:11.5px;color:#6b7280;line-height:1.5">' + cd.address + '</p>' : ''}
        ${cd.phone ? '<p style="font-size:11.5px;color:#6b7280">' + cd.phone + '</p>' : ''}
        ${cd.email ? '<p style="font-size:11.5px;color:#6b7280">' + cd.email + '</p>' : ''}
        ${cd.gst ? '<p style="font-size:11px;color:#6b7280;font-family:ui-monospace,monospace;margin-top:3px">GSTIN: ' + cd.gst + '</p>' : ''}
        ${placeOfSupply ? '<p style="font-size:10.5px;color:#9ca3af;margin-top:3px">Place of Supply: ' + placeOfSupply + '</p>' : ''}
      </div>
      <div>
        <p style="font-size:11px;font-weight:700;color:#1e2d5b;border-bottom:1px solid #1e2d5b;padding-bottom:4px;margin-bottom:10px">Invoice Details:</p>
        <table style="font-size:11.5px;border-collapse:collapse;width:100%">
          <tr><td style="color:#6b7280;padding-bottom:4px;width:50%">Invoice No.</td><td style="font-family:ui-monospace,monospace;color:#1e2d5b;font-weight:600">${invoiceNumber}</td></tr>
          <tr><td style="color:#6b7280;padding-bottom:4px">Currency</td><td style="color:#1e2d5b">${currency}</td></tr>
          ${poNumber ? '<tr><td style="color:#6b7280;padding-bottom:4px">PO Number</td><td style="color:#1e2d5b;font-family:ui-monospace,monospace">' + poNumber + '</td></tr>' : ''}
          ${reverseCharge ? '<tr><td style="color:#6b7280">Reverse Charge</td><td style="color:#ef4444;font-weight:600">Applicable</td></tr>' : ''}
        </table>
      </div>
    </div>

    <!-- Items Table -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:0">
      <thead>
        <tr style="background:${navyBg}">
          <th style="padding:10px 10px;text-align:center;font-size:11px;font-weight:600;color:#fff;width:32px">No.</th>
          <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#fff">Description</th>
          <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:600;color:#fff">Quantity</th>
          <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:600;color:#fff">Unit Price (${currency})</th>
          ${hasDiscount ? '<th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:600;color:#fff">Discount</th>' : ''}
          <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:600;color:#fff">Amount (${currency})</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <!-- Summary Row -->
    <div style="display:flex;justify-content:flex-end;margin-top:0">
      <table style="border-collapse:collapse;min-width:240px">
        ${summaryHtml}
        <tr>
          <td style="padding:10px 12px 10px 0;font-size:13px;font-weight:700;color:#1e2d5b;text-align:right;border-top:2px solid ${navyBg}">Amount Due</td>
          <td style="padding:10px 12px;background:${navyBg};font-size:14px;font-weight:800;color:#fff;font-family:ui-monospace,monospace;text-align:right;border-top:2px solid ${navyBg};white-space:nowrap">${cs}${grandTotal.toFixed(2)}</td>
        </tr>
        ${roundOff ? '<tr><td colspan="2" style="padding:3px 0;font-size:10px;color:#9ca3af;text-align:right">* Amount rounded off</td></tr>' : ''}
      </table>
    </div>

    <!-- Bank + Notes (side by side if both present) -->
    <div style="display:grid;grid-template-columns:${(activeBankDetails && (activeBankDetails.bankName || activeBankDetails.accountNumber)) && (notes || paymentTerms) ? '1fr 1fr' : '1fr'};gap:28px;margin-top:24px;padding-top:20px;border-top:1px solid #edf0f5">
      ${bankSection}
      ${notesSection}
    </div>

  </div>

  <!-- ══ FOOTER ══ -->
  <div style="background:#eef1f7;padding:12px 36px;display:flex;justify-content:space-between;align-items:center;border-top:2px solid ${navyBg}">
    <p style="font-size:11px;color:#6b7280;font-style:italic">${invoiceFooterNote}</p>
    <p style="font-size:10px;color:#9ca3af">
      ${[bizEmail ? 'Email: ' + bizEmail : '', bizEmail ? '' : '', bizPhone ? 'Tel: ' + bizPhone : ''].filter(Boolean).join('  |  ')}
    </p>
  </div>

</div>
</body>
</html>`
    }


    // ── MINIMAL ─────────────────────────────────────────────────────────────
    if (selectedTemplate === 'minimal') {
      return buildProfessionalInvoice({ label: 'INVOICE', navyBg: '#1e2d5b', accentOrange: '#f47321' })
    }
    // ── GST ─────────────────────────────────────────────────────────────────
    if (selectedTemplate === 'gst') {
      return buildProfessionalInvoice({ label: 'TAX INVOICE', navyBg: '#14532d', accentOrange: '#22c55e' })
    }
    // ── PROFESSIONAL ────────────────────────────────────────────────────────
    if (selectedTemplate === 'professional') {
      return buildProfessionalInvoice({ label: 'INVOICE', navyBg: '#111827', accentOrange: '#f97316' })
    }
    // ── RETAIL ──────────────────────────────────────────────────────────────
    if (selectedTemplate === 'retail') {
      return buildProfessionalInvoice({ label: 'RETAIL INVOICE', navyBg: '#4c1d95', accentOrange: '#a78bfa' })
    }
    // ── SERVICE ─────────────────────────────────────────────────────────────
    if (selectedTemplate === 'service') {
      return buildProfessionalInvoice({ label: 'SERVICE INVOICE', navyBg: '#78350f', accentOrange: '#f59e0b' })
    }
    // ── IMPORTED ────────────────────────────────────────────────────────────
    if (selectedTemplate === 'imported' && importedTemplate?.html) {
      return importedTemplate.html
    }
    // ── CUSTOM / FALLBACK ────────────────────────────────────────────────────
    return buildProfessionalInvoice({ label: 'INVOICE', navyBg: '#1e2d5b', accentOrange: '#f47321' })
  }




  const printInvoice = () => {
    const html = buildInvoiceHtml()

    const popup = window.open("", "_blank", "width=900,height=700")
    if (!popup) {
      showErrorToast("Please allow popups for this site to download PDF")
      return
    }
    popup.document.write(html)
    popup.document.close()
    popup.focus()
    popup.setTimeout(() => {
      popup.print()
      popup.close()
    }, 500)
  }

  const handleDownloadPDF = () => {
    printInvoice()
  }

  const handlePreviewAndPrint = () => {
    setPreviewOpen(true)
  }

  const handleWhatsApp = () => {
    const text = `Invoice ${invoiceNumber}\nAmount: ${currencySymbol}${grandTotal.toFixed(2)}\nDue: ${dueDate || "N/A"}\nFrom: AutoInvoice`
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
    )
  }

  const handleEmail = () => {
    const subject = `Invoice ${invoiceNumber}`
    const body = `Dear ${customerDetails.name},\n\nPlease find attached invoice ${invoiceNumber} for ${currencySymbol}${grandTotal.toFixed(2)}.\n\nDue Date: ${dueDate || "N/A"}\n\nThank you for your business.`
    window.open(
      `mailto:${customerDetails.email || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/invoices">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Invoice</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Build and send professional invoices
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Select Customer</Label>
                <Select
                  value={selectedCustomerId}
                  onValueChange={handleCustomerSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__new__">+ Add New Customer</SelectItem>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={customerDetails.name}
                    onChange={(e) =>
                      setCustomerDetails((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="Customer name"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={customerDetails.phone}
                    onChange={(e) =>
                      setCustomerDetails((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="Phone"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    value={customerDetails.email}
                    onChange={(e) =>
                      setCustomerDetails((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="Email"
                  />
                </div>
                <div>
                  <Label>GST</Label>
                  <Input
                    value={customerDetails.gst}
                    onChange={(e) =>
                      setCustomerDetails((p) => ({ ...p, gst: e.target.value }))
                    }
                    placeholder="GST number"
                  />
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={customerDetails.address}
                  onChange={(e) =>
                    setCustomerDetails((p) => ({ ...p, address: e.target.value }))
                  }
                  placeholder="Full address"
                />
              </div>
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <Label>Invoice Number</Label>
                  <Input value={invoiceNumber} readOnly className="bg-muted" />
                </div>
                <div>
                  <Label>Invoice Date</Label>
                  <Input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">₹ INR</SelectItem>
                      <SelectItem value="USD">$ USD</SelectItem>
                      <SelectItem value="EUR">€ EUR</SelectItem>
                      <SelectItem value="GBP">£ GBP</SelectItem>
                      <SelectItem value="AED">د.إ AED</SelectItem>
                      <SelectItem value="SGD">S$ SGD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* PO Number + Place of Supply + Reverse Charge */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                <div>
                  <Label>PO / Reference No.</Label>
                  <Input
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    placeholder="e.g. PO-00123"
                  />
                </div>
                <div>
                  <Label>Place of Supply</Label>
                  <Input
                    value={placeOfSupply}
                    onChange={(e) => setPlaceOfSupply(e.target.value)}
                    placeholder="e.g. Maharashtra"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <Label className="mb-2">Reverse Charge</Label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setReverseCharge((v) => !v)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${reverseCharge ? "bg-primary" : "bg-muted"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${reverseCharge ? "left-5" : "left-0.5"}`} />
                    </button>
                    <span className="text-xs text-muted-foreground">{reverseCharge ? "Applicable" : "Not Applicable"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Items</CardTitle>
              <Button size="sm" variant="outline" onClick={addItem}>
                <Plus className="mr-1 h-4 w-4" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <table className="w-full text-sm" style={{ minWidth: 820 }}>
                  <colgroup>
                    <col style={{ width: "19%" }} />
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "8%" }} />
                    <col style={{ width: "8%" }} />
                    <col style={{ width: "11%" }} />
                    <col style={{ width: "8%" }} />
                    <col style={{ width: "11%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "4%" }} />
                    <col style={{ width: "3%" }} />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 px-2 text-left text-xs font-medium text-muted-foreground">Item / Select</th>
                      <th className="py-2 px-2 text-left text-xs font-medium text-muted-foreground">Description</th>
                      <th className="py-2 px-2 text-right text-xs font-medium text-muted-foreground">HSN/SAC</th>
                      <th className="py-2 px-2 text-right text-xs font-medium text-muted-foreground">Qty</th>
                      <th className="py-2 px-2 text-right text-xs font-medium text-muted-foreground">Price</th>
                      <th className="py-2 px-2 text-right text-xs font-medium text-muted-foreground">Tax %</th>
                      <th className="py-2 px-2 text-right text-xs font-medium text-muted-foreground">Disc</th>
                      <th className="py-2 px-2 text-right text-xs font-medium text-muted-foreground">Total</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {
                      const lineBase = item.quantity * item.price
                      const lineDisc = item.discountType === "flat"
                        ? Math.min(item.discount || 0, lineBase)
                        : lineBase * ((item.discount || 0) / 100)
                      const lineTotal = (lineBase - lineDisc) * (1 + item.tax / 100)
                      return (
                        <tr key={index} className="border-b border-border last:border-0">
                          {/* Item select + name */}
                          <td className="py-1.5 px-1 pr-2 align-top pt-3">
                            <Select
                              value={item.itemId || ""}
                              onValueChange={(val) => { if (val) handleItemSelect(index, val) }}
                            >
                              <SelectTrigger className="h-8 w-full border-dashed bg-muted/30">
                                <SelectValue placeholder="Select item" />
                              </SelectTrigger>
                              <SelectContent>
                                {inventoryItems.map((inv) => (
                                  <SelectItem key={inv.id} value={inv.id}>{inv.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="mt-2">
                              <Input
                                value={item.name}
                                onChange={(e) => updateItem(index, "name", e.target.value)}
                                placeholder="Or enter name…"
                                className="h-8 w-full text-xs"
                              />
                            </div>
                          </td>
                          {/* Description */}
                          <td className="py-1.5 px-1 align-top pt-3">
                            <Input
                              value={item.description}
                              onChange={(e) => updateItem(index, "description", e.target.value)}
                              placeholder="Description"
                              className="h-8 w-full"
                            />
                          </td>
                          {/* HSN/SAC */}
                          <td className="py-1.5 px-1 align-top pt-3">
                            <Input
                              value={item.hsnCode || ""}
                              onChange={(e) => updateItem(index, "hsnCode", e.target.value)}
                              placeholder="HSN"
                              className="h-8 w-full text-right text-xs"
                            />
                          </td>
                          {/* Qty */}
                          <td className="py-1.5 px-1 align-top pt-3">
                            <div>
                              <Input
                                type="number" min="1"
                                value={item.quantity === 0 ? "" : item.quantity}
                                placeholder="Qty"
                                onChange={(e) => updateItem(index, "quantity", e.target.value)}
                                className="h-8 w-full text-right"
                              />
                              {item.unit && (
                                <span className="block text-center text-xs text-muted-foreground mt-0.5 leading-none">{item.unit}</span>
                              )}
                            </div>
                          </td>
                          {/* Price */}
                          <td className="py-1.5 px-1 align-top pt-3">
                            <Input
                              type="number" min="0" step="0.01"
                              value={item.price === 0 ? "" : item.price}
                              placeholder="0.00"
                              onChange={(e) => updateItem(index, "price", e.target.value)}
                              className="h-8 w-full text-right"
                            />
                          </td>
                          {/* Tax */}
                          <td className="py-1.5 px-1 align-top pt-3">
                            <Input
                              type="number" min="0" step="0.1"
                              value={item.tax === 0 ? "" : item.tax}
                              placeholder="0"
                              onChange={(e) => updateItem(index, "tax", e.target.value)}
                              className="h-8 w-full text-right"
                            />
                          </td>
                          {/* Per-item discount */}
                          <td className="py-1.5 px-1 align-top pt-3">
                            <div className="flex gap-0.5">
                              <button
                                type="button"
                                onClick={() => updateItem(index, "discountType", item.discountType === "flat" ? "percent" : "flat")}
                                className="h-8 px-1.5 rounded border border-border bg-muted/50 text-[10px] font-medium hover:bg-accent shrink-0"
                                title={item.discountType === "flat" ? "Flat ₹" : "Percent %"}
                              >
                                {item.discountType === "flat" ? "₹" : "%"}
                              </button>
                              <Input
                                type="number" min="0" step="0.01"
                                value={item.discount === 0 || !item.discount ? "" : item.discount}
                                placeholder="0"
                                onChange={(e) => updateItem(index, "discount", e.target.value)}
                                className="h-8 w-full text-right"
                              />
                            </div>
                          </td>
                          {/* Line total */}
                          <td className="py-1.5 px-2 text-right font-medium whitespace-nowrap align-top pt-4 text-sm">
                            {currencySymbol}{lineTotal.toFixed(2)}
                          </td>
                          {/* Remove */}
                          <td className="py-1.5 pl-1 align-top pt-3">
                            {items.length > 1 && (
                              <Button
                                variant="ghost" size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => removeItem(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Invoice-level Adjustments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Adjustments &amp; Charges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Invoice discount */}
                <div>
                  <Label className="flex items-center gap-1"><Percent className="h-3 w-3" /> Invoice Discount</Label>
                  <div className="flex gap-1 mt-1">
                    <Select value={discountType} onValueChange={setDiscountType}>
                      <SelectTrigger className="w-20 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">%</SelectItem>
                        <SelectItem value="flat">₹ Flat</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number" min="0" step="0.01"
                      value={discountValue === 0 ? "" : discountValue}
                      placeholder="0"
                      onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                      className="flex-1 h-9"
                    />
                  </div>
                </div>
                {/* Shipping */}
                <div>
                  <Label className="flex items-center gap-1"><Truck className="h-3 w-3" /> Shipping / Freight</Label>
                  <Input
                    type="number" min="0" step="0.01"
                    value={shippingCharge === 0 ? "" : shippingCharge}
                    placeholder="0.00"
                    onChange={(e) => setShippingCharge(Number(e.target.value) || 0)}
                    className="mt-1 h-9"
                  />
                </div>
                {/* Extra charge */}
                <div>
                  <Label className="flex items-center gap-1"><PackagePlus className="h-3 w-3" /> Other Charges</Label>
                  <div className="flex gap-1 mt-1">
                    <Input
                      value={extraChargeLabel}
                      onChange={(e) => setExtraChargeLabel(e.target.value)}
                      placeholder="Label"
                      className="flex-1 h-9 text-xs"
                    />
                    <Input
                      type="number" min="0" step="0.01"
                      value={extraChargeAmount === 0 ? "" : extraChargeAmount}
                      placeholder="0.00"
                      onChange={(e) => setExtraChargeAmount(Number(e.target.value) || 0)}
                      className="w-24 h-9"
                    />
                  </div>
                </div>
              </div>
              {/* Round off toggle */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setRoundOff((v) => !v)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${roundOff ? "bg-primary" : "bg-muted"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${roundOff ? "left-5" : "left-0.5"}`} />
                </button>
                <Label className="cursor-pointer" onClick={() => setRoundOff((v) => !v)}>Round off grand total to nearest ₹</Label>
              </div>
            </CardContent>
          </Card>

          {/* Bank / Payment Details */}
          <Card>
            <CardHeader>
              <button
                type="button"
                className="flex items-center justify-between w-full"
                onClick={() => setShowBankDetails((v) => !v)}
              >
                <CardTitle className="text-lg">Bank &amp; Payment Details</CardTitle>
                {showBankDetails ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </button>
            </CardHeader>
            {showBankDetails && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Bank Name</Label>
                    <Input value={bankDetails.bankName} onChange={(e) => setBankDetails(p => ({ ...p, bankName: e.target.value }))} placeholder="e.g. HDFC Bank" />
                  </div>
                  <div>
                    <Label>Account Holder Name</Label>
                    <Input value={bankDetails.accountName} onChange={(e) => setBankDetails(p => ({ ...p, accountName: e.target.value }))} placeholder="Name on account" />
                  </div>
                  <div>
                    <Label>Account Number</Label>
                    <Input value={bankDetails.accountNumber} onChange={(e) => setBankDetails(p => ({ ...p, accountNumber: e.target.value }))} placeholder="XXXXXXXXXXXX" />
                  </div>
                  <div>
                    <Label>IFSC Code</Label>
                    <Input value={bankDetails.ifsc} onChange={(e) => setBankDetails(p => ({ ...p, ifsc: e.target.value }))} placeholder="e.g. HDFC0000123" className="font-mono" />
                  </div>
                  <div>
                    <Label>Branch</Label>
                    <Input value={bankDetails.branch} onChange={(e) => setBankDetails(p => ({ ...p, branch: e.target.value }))} placeholder="Branch name" />
                  </div>
                  <div>
                    <Label>UPI ID</Label>
                    <Input value={bankDetails.upi} onChange={(e) => setBankDetails(p => ({ ...p, upi: e.target.value }))} placeholder="yourname@upi" />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes & Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Notes</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes to display on the invoice"
                />
              </div>
              <div>
                <Label>Payment Terms</Label>
                <Input
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="e.g. Net 30, Due on receipt"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Summary & Actions */}
        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{currencySymbol}{subtotal.toFixed(2)}</span>
              </div>
              {itemsDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Item Discounts</span>
                  <span className="text-emerald-600">−{currencySymbol}{itemsDiscount.toFixed(2)}</span>
                </div>
              )}
              {invoiceDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Invoice Discount</span>
                  <span className="text-emerald-600">−{currencySymbol}{invoiceDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax / GST</span>
                <span>{currencySymbol}{totalTax.toFixed(2)}</span>
              </div>
              {Number(shippingCharge) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>+{currencySymbol}{Number(shippingCharge).toFixed(2)}</span>
                </div>
              )}
              {Number(extraChargeAmount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{extraChargeLabel || "Other Charges"}</span>
                  <span>+{currencySymbol}{Number(extraChargeAmount).toFixed(2)}</span>
                </div>
              )}
              {roundOff && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Round Off</span>
                  <span className="text-muted-foreground">{Math.round(grandTotal) - grandTotal >= 0 ? "+" : ""}{(Math.round(grandTotal) - grandTotal).toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">
                  {currencySymbol}{grandTotal.toFixed(2)}
                </span>
              </div>

              <Separator />

              <div className="space-y-2 pt-2">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handlePreviewAndPrint}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview Invoice
                </Button>
                <Button className="w-full" onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Invoice
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleDownloadPDF}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Separator />
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleWhatsApp}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send via WhatsApp
                </Button>
                <Button
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
      </div>

      {/* Preview Dialog — renders active template in an iframe */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
          </DialogHeader>
          <iframe
            title="invoice-preview"
            srcDoc={previewOpen ? buildInvoiceHtml() : ""}
            className="w-full flex-1 rounded-md border bg-white"
            style={{ minHeight: '65vh' }}
            sandbox="allow-same-origin"
          />
          <div className="flex justify-end gap-2 mt-3">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Close</Button>
            <Button onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
