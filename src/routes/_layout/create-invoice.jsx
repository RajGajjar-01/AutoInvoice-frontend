import { createFileRoute, Link } from "@tanstack/react-router"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  Save,
  Download,
  Send,
  Mail,
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

const emptyItem = { name: "", description: "", quantity: 1, price: 0, tax: 0 }

function CreateInvoicePage() {
  const [customers, setCustomers] = useLocalStorage("customers", [])
  const [inventoryItems, setInventoryItems] = useLocalStorage("items", [])
  const [, setInvoices] = useLocalStorage("invoices", [])
  const [selectedTemplate] = useLocalStorage("selected-template", "minimal")
  const [customTemplate] = useLocalStorage("custom-template", null)
  const [importedTemplate] = useLocalStorage("imported-template", null)
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
  const [items, setItems] = useState([{ ...emptyItem }])
  const [notes, setNotes] = useState("")
  const [paymentTerms, setPaymentTerms] = useState("")
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
              field === "quantity" || field === "price" || field === "tax"
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

  const { subtotal, totalTax, grandTotal } = useMemo(() => {
    let sub = 0
    let tax = 0
    for (const item of items) {
      const lineTotal = item.quantity * item.price
      const lineTax = (lineTotal * item.tax) / 100
      sub += lineTotal
      tax += lineTax
    }
    return { subtotal: sub, totalTax: tax, grandTotal: sub + tax }
  }, [items])

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
    customer: customerDetails,
    items,
    subtotal,
    totalTax,
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
    const validItems = items.filter((i) => i.name)

    // Shared helpers
    const metaRows = `
      <tr><td>Invoice #</td><td>${invoiceNumber}</td></tr>
      <tr><td>Date</td><td>${invoiceDate}</td></tr>
      ${dueDate ? `<tr><td>Due Date</td><td>${dueDate}</td></tr>` : ''}
      <tr><td>Currency</td><td>${currency}</td></tr>`

    const notesBlock = (accentColor = '#217346') => (notes || paymentTerms) ? `
      <div style="background:#f6faf8;border-left:4px solid ${accentColor};padding:12px 16px;margin-bottom:20px">
        ${notes ? `<p style="font-weight:700;font-size:12px;margin-bottom:4px">Notes</p><p style="color:#555;font-size:12px">${notes}</p>` : ''}
        ${paymentTerms ? `<p style="font-weight:700;font-size:12px;margin:8px 0 4px">Payment Terms</p><p style="color:#555;font-size:12px">${paymentTerms}</p>` : ''}
      </div>` : ''

    const footer = `<div style="text-align:center;color:#aaa;font-size:11px;border-top:1px solid #e5e5e5;padding-top:14px">Thank you for your business &bull; Generated by AutoInvoice</div>`

    const wrap = (title, style, body) => `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>${style}</style></head><body>${body}</body></html>`

    // ── MINIMAL ──────────────────────────────────────────────────────────────
    if (selectedTemplate === 'minimal') {
      const rows = validItems.map(item => `
        <tr><td style="padding:7px 0;border-bottom:1px solid #f0f0f0;font-family:monospace">${item.name}</td>
            <td style="padding:7px 0;border-bottom:1px solid #f0f0f0;color:#888">${item.description || ''}</td>
            <td style="padding:7px 0;border-bottom:1px solid #f0f0f0;text-align:right">${item.quantity}</td>
            <td style="padding:7px 0;border-bottom:1px solid #f0f0f0;text-align:right">${cs}${Number(item.price).toFixed(2)}</td>
            <td style="padding:7px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:700">${cs}${(item.quantity * item.price * (1 + item.tax / 100)).toFixed(2)}</td></tr>`
      ).join('')
      return wrap(`Invoice ${invoiceNumber}`,
        `*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#1a1a1a;padding:36px;background:#fff}@media print{body{padding:0}}`,
        `<div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid #ddd;padding-bottom:20px;margin-bottom:28px">
          <div><p style="font-size:26px;font-weight:800;letter-spacing:4px;color:#222;font-family:monospace">INVOICE</p><p style="color:#aaa;margin-top:4px;font-family:monospace">${invoiceNumber}</p></div>
          <div style="text-align:right"><p style="font-weight:700;color:#444">Your Business</p><p style="color:#aaa;font-size:12px">hello@yourbiz.com</p></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:28px">
          <div><p style="font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">BILL TO</p>
            <p style="font-weight:700">${cd.name || '—'}</p>
            ${cd.address ? `<p style="color:#888">${cd.address}</p>` : ''}
            ${cd.phone ? `<p style="color:#888">${cd.phone}</p>` : ''}
            ${cd.email ? `<p style="color:#888">${cd.email}</p>` : ''}
            ${cd.gst ? `<p style="color:#888">GST: ${cd.gst}</p>` : ''}
          </div>
          <div style="text-align:right"><table>${metaRows}</table></div>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <thead><tr style="border-bottom:2px solid #222">
            <th style="text-align:left;padding-bottom:6px;font-size:11px;color:#888">ITEM</th>
            <th style="text-align:left;padding-bottom:6px;font-size:11px;color:#888">DESC</th>
            <th style="text-align:right;padding-bottom:6px;font-size:11px;color:#888">QTY</th>
            <th style="text-align:right;padding-bottom:6px;font-size:11px;color:#888">RATE</th>
            <th style="text-align:right;padding-bottom:6px;font-size:11px;color:#888">AMOUNT</th>
          </tr></thead><tbody>${rows}</tbody>
        </table>
        <div style="display:flex;justify-content:flex-end;margin-bottom:24px">
          <div style="width:200px">
            <div style="display:flex;justify-content:space-between;color:#888;font-size:12px;margin-bottom:4px"><span>Subtotal</span><span>${cs}${subtotal.toFixed(2)}</span></div>
            <div style="display:flex;justify-content:space-between;color:#888;font-size:12px;margin-bottom:8px"><span>Tax</span><span>${cs}${totalTax.toFixed(2)}</span></div>
            <div style="display:flex;justify-content:space-between;font-weight:800;border-top:1px solid #ddd;padding-top:8px"><span>TOTAL</span><span>${cs}${grandTotal.toFixed(2)}</span></div>
          </div>
        </div>
        ${notesBlock('#555')}${footer}`)
    }

    // ── GST ──────────────────────────────────────────────────────────────────
    if (selectedTemplate === 'gst') {
      const rows = validItems.map(item => {
        const taxable = item.quantity * item.price
        const half = (taxable * item.tax) / 200
        const total = taxable + taxable * item.tax / 100
        return `<tr style="border-bottom:1px solid #e5e5e5">
          <td style="padding:8px">${item.name}${item.hsnCode ? ` <span style="color:#aaa;font-size:10px">(HSN: ${item.hsnCode})</span>` : ''}<br><span style="color:#aaa;font-size:10px">${item.description || ''}</span></td>
          <td style="padding:8px;text-align:right">${cs}${taxable.toFixed(2)}</td>
          <td style="padding:8px;text-align:right">${cs}${half.toFixed(2)}</td>
          <td style="padding:8px;text-align:right">${cs}${half.toFixed(2)}</td>
          <td style="padding:8px;text-align:right;font-weight:700">${cs}${total.toFixed(2)}</td></tr>`
      }).join('')
      return wrap(`Tax Invoice ${invoiceNumber}`,
        `*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#1a1a1a;padding:32px;background:#fff;border-top:5px solid #16a34a}@media print{body{padding:0}}`,
        `<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px">
          <div><p style="font-size:22px;font-weight:800;color:#16a34a;letter-spacing:2px">TAX INVOICE</p>
            <p style="color:#aaa;font-size:11px">${invoiceNumber}${cd.gst ? ` | GSTIN: ${cd.gst}` : ''}</p></div>
          <div style="text-align:right"><p style="font-weight:700">Your Business</p><p style="color:#aaa;font-size:11px">GSTIN: ENTER YOUR GSTIN</p></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;background:#f0fdf4;padding:14px;border-radius:6px;margin-bottom:20px">
          <div><p style="color:#16a34a;font-size:10px;font-weight:700;text-transform:uppercase;margin-bottom:4px">Buyer Details</p>
            <p style="font-weight:700">${cd.name || '—'}</p>
            ${cd.gst ? `<p style="color:#666;font-size:11px">GSTIN: ${cd.gst}</p>` : ''}
            ${cd.address ? `<p style="color:#666;font-size:11px">${cd.address}</p>` : ''}
          </div>
          <div style="text-align:right;font-size:11px;color:#666">
            <p>Date: ${invoiceDate}</p>
            ${dueDate ? `<p>Due: ${dueDate}</p>` : ''}
            <p>Currency: ${currency}</p>
          </div>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
          <thead><tr style="background:#16a34a;color:#fff">
            <th style="padding:9px 10px;text-align:left;font-size:12px">Description</th>
            <th style="padding:9px 10px;text-align:right;font-size:12px">Taxable</th>
            <th style="padding:9px 10px;text-align:right;font-size:12px">CGST</th>
            <th style="padding:9px 10px;text-align:right;font-size:12px">SGST</th>
            <th style="padding:9px 10px;text-align:right;font-size:12px">Total</th>
          </tr></thead><tbody>${rows}</tbody>
        </table>
        <div style="display:flex;justify-content:flex-end;margin-bottom:20px">
          <div style="width:220px">
            <div style="display:flex;justify-content:space-between;color:#666;font-size:12px;margin-bottom:3px"><span>Taxable Amount</span><span>${cs}${subtotal.toFixed(2)}</span></div>
            <div style="display:flex;justify-content:space-between;color:#666;font-size:12px;margin-bottom:3px"><span>CGST</span><span>${cs}${(totalTax / 2).toFixed(2)}</span></div>
            <div style="display:flex;justify-content:space-between;color:#666;font-size:12px;margin-bottom:8px"><span>SGST</span><span>${cs}${(totalTax / 2).toFixed(2)}</span></div>
            <div style="display:flex;justify-content:space-between;font-weight:800;color:#16a34a;border-top:2px solid #16a34a;padding-top:8px"><span>Grand Total</span><span>${cs}${grandTotal.toFixed(2)}</span></div>
          </div>
        </div>
        ${notesBlock('#16a34a')}${footer}`)
    }

    // ── PROFESSIONAL ─────────────────────────────────────────────────────────
    if (selectedTemplate === 'professional') {
      const rows = validItems.map(item => `
        <tr style="border-bottom:1px solid #e5e5e5">
          <td style="padding:9px 10px">${item.name}<br><span style="color:#aaa;font-size:11px">${item.description || ''}</span></td>
          <td style="padding:9px 10px;text-align:right">${item.quantity}</td>
          <td style="padding:9px 10px;text-align:right">${cs}${Number(item.price).toFixed(2)}</td>
          <td style="padding:9px 10px;text-align:right">${item.tax}%</td>
          <td style="padding:9px 10px;text-align:right;font-weight:700">${cs}${(item.quantity * item.price * (1 + item.tax / 100)).toFixed(2)}</td></tr>`
      ).join('')
      return wrap(`Invoice ${invoiceNumber}`,
        `*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#1a1a1a;background:#fff}@media print{body{padding:0}}`,
        `<div style="background:#111827;color:#fff;padding:28px 32px;display:flex;justify-content:space-between;align-items:center">
          <div><div style="width:36px;height:36px;border-radius:6px;background:#f97316;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:14px;margin-bottom:8px">A</div>
            <p style="font-weight:700;font-size:16px">AutoInvoice</p><p style="color:#9ca3af;font-size:11px">Professional Services</p></div>
          <div style="text-align:right"><p style="font-size:24px;font-weight:800;letter-spacing:3px;color:#f97316">INVOICE</p>
            <p style="color:#9ca3af;font-size:11px">#${invoiceNumber}</p><p style="color:#9ca3af;font-size:11px">${invoiceDate}</p></div>
        </div>
        <div style="padding:28px 32px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">
            <div><p style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Billed To</p>
              <p style="font-weight:700">${cd.name || '—'}</p>
              ${cd.address ? `<p style="color:#6b7280;font-size:12px">${cd.address}</p>` : ''}
              ${cd.phone ? `<p style="color:#6b7280;font-size:12px">${cd.phone}</p>` : ''}
              ${cd.email ? `<p style="color:#6b7280;font-size:12px">${cd.email}</p>` : ''}</div>
            <div style="background:#f9fafb;border-radius:6px;padding:12px">
              <p style="font-weight:700;font-size:12px;margin-bottom:6px">Invoice Details</p>
              <table style="font-size:11px;color:#6b7280"><tbody>${metaRows}</tbody></table>
            </div>
          </div>
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
            <thead><tr style="border-bottom:2px solid #111827">
              <th style="text-align:left;padding:8px 10px;font-size:11px;color:#374151">Service</th>
              <th style="text-align:right;padding:8px 10px;font-size:11px;color:#374151">Qty</th>
              <th style="text-align:right;padding:8px 10px;font-size:11px;color:#374151">Price</th>
              <th style="text-align:right;padding:8px 10px;font-size:11px;color:#374151">Tax</th>
              <th style="text-align:right;padding:8px 10px;font-size:11px;color:#374151">Amount</th>
            </tr></thead><tbody>${rows}</tbody>
          </table>
          <div style="display:flex;justify-content:flex-end;margin-bottom:24px">
            <div style="width:220px">
              <div style="display:flex;justify-content:space-between;color:#6b7280;font-size:12px;margin-bottom:4px"><span>Subtotal</span><span>${cs}${subtotal.toFixed(2)}</span></div>
              <div style="display:flex;justify-content:space-between;color:#6b7280;font-size:12px;margin-bottom:4px"><span>Tax</span><span>${cs}${totalTax.toFixed(2)}</span></div>
              <div style="background:#111827;color:#fff;display:flex;justify-content:space-between;padding:10px 14px;border-radius:6px;font-weight:800"><span>TOTAL</span><span>${cs}${grandTotal.toFixed(2)}</span></div>
            </div>
          </div>
          ${notesBlock('#f97316')}${footer}
        </div>`)
    }

    // ── RETAIL ───────────────────────────────────────────────────────────────
    if (selectedTemplate === 'retail') {
      const rows = validItems.map(item => {
        const sku = item.sku || item.itemSku || '—'
        const total = item.quantity * item.price * (1 + item.tax / 100)
        return `<tr style="border-bottom:1px solid #e5e5e5">
          <td style="padding:8px 10px">${item.name}</td>
          <td style="padding:8px 10px;color:#9ca3af;font-family:monospace;font-size:11px">${sku}</td>
          <td style="padding:8px 10px;text-align:right">${item.quantity}</td>
          <td style="padding:8px 10px;text-align:right">${cs}${Number(item.price).toFixed(2)}</td>
          <td style="padding:8px 10px;text-align:right;color:#ef4444">${item.tax}%</td>
          <td style="padding:8px 10px;text-align:right;font-weight:700">${cs}${total.toFixed(2)}</td></tr>`
      }).join('')
      return wrap(`Retail Invoice ${invoiceNumber}`,
        `*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#1a1a1a;padding:32px;background:#fff}@media print{body{padding:0}}`,
        `<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #7c3aed;padding-bottom:14px;margin-bottom:20px">
          <div><p style="font-size:20px;font-weight:800;color:#7c3aed">RETAIL INVOICE</p>
            <p style="color:#aaa;font-size:11px">#${invoiceNumber} | ${invoiceDate}</p></div>
          <div style="text-align:right"><p style="font-weight:700">Your Business</p>${cd.gst ? `<p style="color:#aaa;font-size:11px">GST: ${cd.gst}</p>` : ''}</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:12px;color:#6b7280;margin-bottom:20px">
          <div><p style="font-weight:700;color:#1a1a1a">${cd.name || '—'}</p>
            ${cd.phone ? `<p>${cd.phone}</p>` : ''}
            ${cd.address ? `<p>${cd.address}</p>` : ''}</div>
          <div style="text-align:right"><table style="margin-left:auto"><tbody>${metaRows}</tbody></table></div>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
          <thead><tr style="background:#7c3aed;color:#fff">
            <th style="padding:9px 10px;text-align:left">Product</th>
            <th style="padding:9px 10px;text-align:left">SKU</th>
            <th style="padding:9px 10px;text-align:right">Qty</th>
            <th style="padding:9px 10px;text-align:right">MRP</th>
            <th style="padding:9px 10px;text-align:right">Tax</th>
            <th style="padding:9px 10px;text-align:right">Total</th>
          </tr></thead><tbody>${rows}</tbody>
        </table>
        <div style="display:flex;justify-content:flex-end;margin-bottom:20px">
          <div style="width:220px">
            <div style="display:flex;justify-content:space-between;color:#6b7280;font-size:12px;margin-bottom:4px"><span>Subtotal</span><span>${cs}${subtotal.toFixed(2)}</span></div>
            <div style="display:flex;justify-content:space-between;color:#6b7280;font-size:12px;margin-bottom:8px"><span>Tax</span><span>${cs}${totalTax.toFixed(2)}</span></div>
            <div style="display:flex;justify-content:space-between;font-weight:800;color:#7c3aed;border-top:2px solid #7c3aed;padding-top:8px"><span>Grand Total</span><span>${cs}${grandTotal.toFixed(2)}</span></div>
          </div>
        </div>
        ${notesBlock('#7c3aed')}${footer}`)
    }

    // ── SERVICE ──────────────────────────────────────────────────────────────
    if (selectedTemplate === 'service') {
      const rows = validItems.map(item => `
        <tr style="border-bottom:1px solid #fde68a">
          <td style="padding:8px 0">${item.name}<br><span style="color:#aaa;font-size:11px">${item.description || ''}</span></td>
          <td style="padding:8px 0;text-align:right">${item.quantity}</td>
          <td style="padding:8px 0;text-align:right">${cs}${Number(item.price).toFixed(2)}</td>
          <td style="padding:8px 0;text-align:right;font-weight:700">${cs}${(item.quantity * item.price * (1 + item.tax / 100)).toFixed(2)}</td></tr>`
      ).join('')
      return wrap(`Service Invoice ${invoiceNumber}`,
        `*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#1a1a1a;background:#fff}@media print{body{padding:0}}`,
        `<div style="background:#fffbeb;border-bottom:4px solid #f59e0b;padding:24px 32px;display:flex;justify-content:space-between">
          <div><p style="font-size:20px;font-weight:800;color:#92400e">SERVICE INVOICE</p>
            <p style="color:#6b7280;font-size:11px">${invoiceNumber} | ${invoiceDate}</p></div>
          <div style="text-align:right"><p style="font-weight:700">Your Business</p><p style="color:#9ca3af;font-size:11px">your@email.com</p></div>
        </div>
        <div style="padding:28px 32px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">
            <div><p style="font-size:10px;font-weight:700;color:#f59e0b;text-transform:uppercase;margin-bottom:4px">CLIENT</p>
              <p style="font-weight:700">${cd.name || '—'}</p>
              ${cd.address ? `<p style="color:#6b7280;font-size:12px">${cd.address}</p>` : ''}
              ${cd.email ? `<p style="color:#6b7280;font-size:12px">${cd.email}</p>` : ''}
              ${dueDate ? `<p style="color:#6b7280;font-size:12px">Due: ${dueDate}</p>` : ''}
            </div>
            <div style="background:#fffbeb;border-radius:6px;padding:12px">
              <p style="font-size:10px;font-weight:700;color:#92400e;text-transform:uppercase;margin-bottom:4px">Invoice Details</p>
              <table style="font-size:11px;color:#6b7280"><tbody>${metaRows}</tbody></table>
            </div>
          </div>
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
            <thead><tr style="border-bottom:2px solid #f59e0b;color:#92400e">
              <th style="text-align:left;padding-bottom:8px">Service / Item</th>
              <th style="text-align:right;padding-bottom:8px">Qty / Hrs</th>
              <th style="text-align:right;padding-bottom:8px">Rate</th>
              <th style="text-align:right;padding-bottom:8px">Amount</th>
            </tr></thead><tbody>${rows}</tbody>
          </table>
          <div style="display:flex;justify-content:flex-end;margin-bottom:20px">
            <div style="width:200px">
              <div style="display:flex;justify-content:space-between;color:#6b7280;font-size:12px;margin-bottom:4px"><span>Subtotal</span><span>${cs}${subtotal.toFixed(2)}</span></div>
              <div style="display:flex;justify-content:space-between;color:#6b7280;font-size:12px;margin-bottom:8px"><span>Tax</span><span>${cs}${totalTax.toFixed(2)}</span></div>
              <div style="display:flex;justify-content:space-between;font-weight:800;color:#92400e;border-top:2px solid #f59e0b;padding-top:8px"><span>Total Due</span><span>${cs}${grandTotal.toFixed(2)}</span></div>
            </div>
          </div>
          ${notesBlock('#f59e0b')}${footer}
        </div>`)
    }

    // ── IMPORTED (HTML) ───────────────────────────────────────────────────────
    if (selectedTemplate === 'imported' && importedTemplate?.html) {
      return importedTemplate.html
    }

    // ── CUSTOM (template-builder) ─────────────────────────────────────────────
    if (selectedTemplate === 'custom' && customTemplate) {
      // Generate a basic rendering - custom templates store blocks
      const rows = validItems.map(item => `
        <tr><td style="padding:8px;border-bottom:1px solid #eee">${item.name}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;color:#888">${item.description || ''}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${item.quantity}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${cs}${Number(item.price).toFixed(2)}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;font-weight:700">${cs}${(item.quantity * item.price * (1 + item.tax / 100)).toFixed(2)}</td></tr>`
      ).join('')
      return wrap(`Invoice ${invoiceNumber}`,
        `*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#1a1a1a;padding:32px;background:#fff}@media print{body{padding:0}}`,
        `<div style="display:flex;justify-content:space-between;margin-bottom:28px">
          <div><p style="font-size:24px;font-weight:800;color:#1a1a1a">INVOICE</p><p style="color:#aaa">${invoiceNumber}</p></div>
          <div style="text-align:right;font-size:11px;color:#6b7280"><p style="font-weight:700;font-size:14px;color:#1a1a1a">Your Business</p><p>${invoiceDate}</p>${dueDate ? `<p>Due: ${dueDate}</p>` : ''}</div>
        </div>
        <div style="margin-bottom:24px"><p style="font-weight:700">${cd.name || '—'}</p>${cd.address ? `<p style="color:#6b7280;font-size:12px">${cd.address}</p>` : ''}${cd.gst ? `<p style="color:#6b7280;font-size:12px">GST: ${cd.gst}</p>` : ''}</div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
          <thead><tr style="background:#1a1a1a;color:#fff"><th style="padding:9px;text-align:left">Item</th><th style="padding:9px;text-align:left">Desc</th><th style="padding:9px;text-align:right">Qty</th><th style="padding:9px;text-align:right">Price</th><th style="padding:9px;text-align:right">Total</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="display:flex;justify-content:flex-end;margin-bottom:20px">
          <div style="width:200px">
            <div style="display:flex;justify-content:space-between;color:#6b7280;margin-bottom:4px"><span>Subtotal</span><span>${cs}${subtotal.toFixed(2)}</span></div>
            <div style="display:flex;justify-content:space-between;color:#6b7280;margin-bottom:8px"><span>Tax</span><span>${cs}${totalTax.toFixed(2)}</span></div>
            <div style="display:flex;justify-content:space-between;font-weight:800;border-top:2px solid #1a1a1a;padding-top:8px"><span>Total</span><span>${cs}${grandTotal.toFixed(2)}</span></div>
          </div>
        </div>
        ${notesBlock()}${footer}`)
    }

    // ── FALLBACK (default Minimal) ────────────────────────────────────────────
    return buildInvoiceHtml.call({ selectedTemplate: 'minimal' } /* re-use minimal */)
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
                    </SelectContent>
                  </Select>
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
              <table className="w-full table-fixed text-sm">
                <colgroup>
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "4%" }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 px-2 text-left text-xs font-medium text-muted-foreground">Item</th>
                    <th className="py-2 px-2 text-left text-xs font-medium text-muted-foreground">Description</th>
                    <th className="py-2 px-2 text-right text-xs font-medium text-muted-foreground">Qty</th>
                    <th className="py-2 px-2 text-right text-xs font-medium text-muted-foreground">Price</th>
                    <th className="py-2 px-2 text-right text-xs font-medium text-muted-foreground">Tax %</th>
                    <th className="py-2 px-2 text-right text-xs font-medium text-muted-foreground">Total</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const lineTotal = item.quantity * item.price * (1 + item.tax / 100)
                    return (
                      <tr key={index} className="border-b border-border last:border-0">
                        <td className="py-1.5 px-1 pr-2 align-top pt-3">
                          <Select
                            value={item.itemId || ""}
                            onValueChange={(val) => {
                              if (val) handleItemSelect(index, val)
                            }}
                          >
                            <SelectTrigger className="h-8 w-full border-dashed bg-muted/30">
                              <SelectValue placeholder="Select item" />
                            </SelectTrigger>
                            <SelectContent>
                              {inventoryItems.map((inv) => (
                                <SelectItem key={inv.id} value={inv.id}>
                                  {inv.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="mt-2">
                            <Input
                              value={item.name}
                              onChange={(e) => updateItem(index, "name", e.target.value)}
                              placeholder="Or enter custom item name..."
                              className="h-8 w-full text-xs"
                            />
                          </div>
                        </td>
                        <td className="py-1.5 px-1 align-top pt-3">
                          <Input
                            value={item.description}
                            onChange={(e) => updateItem(index, "description", e.target.value)}
                            placeholder="Description"
                            className="h-8 w-full"
                          />
                        </td>
                        <td className="py-1.5 px-1 align-top pt-3">
                          <div className="relative">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity === 0 ? "" : item.quantity}
                              placeholder="1"
                              onChange={(e) => updateItem(index, "quantity", e.target.value)}
                              className="h-8 w-full pr-8 text-right"
                            />
                            {item.unit && (
                              <span className="absolute right-2 top-1.5 text-xs text-muted-foreground pointer-events-none">
                                {item.unit}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-1.5 px-1 align-top pt-3">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.price === 0 ? "" : item.price}
                            placeholder="0.00"
                            onChange={(e) => updateItem(index, "price", e.target.value)}
                            className="h-8 w-full text-right"
                          />
                        </td>
                        <td className="py-1.5 px-1 align-top pt-3">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.tax === 0 ? "" : item.tax}
                            placeholder="0"
                            onChange={(e) => updateItem(index, "tax", e.target.value)}
                            className="h-8 w-full text-right"
                          />
                        </td>
                        <td className="py-1.5 px-2 text-right font-medium whitespace-nowrap align-top pt-4">
                          {currencySymbol}{lineTotal.toFixed(2)}
                        </td>
                        <td className="py-1.5 pl-1 align-top pt-3">
                          {items.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
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

            </CardContent>
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
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax / GST</span>
                <span>{currencySymbol}{totalTax.toFixed(2)}</span>
              </div>
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
