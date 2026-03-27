import { useMutation, useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import axios from "axios"
import html2pdf from "html2pdf.js"
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  Mail,
  PackagePlus,
  Percent,
  Save,
  Send,
  Truck,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { CustomersService, InvoicesService } from "@/client/sdk.gen"
import { ModernExcelTable } from "@/components/modern-excel-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  customersListQueryOptions,
  customersQueryKeys,
} from "@/features/customers/queries"
import { invoiceTemplateActiveQueryOptions } from "@/features/invoice-templates/queries"
import { invoicesQueryKeys } from "@/features/invoices/queries"
import useCustomToast from "@/hooks/useCustomToast"
import useLocalStorage from "@/hooks/useLocalStorage"
import { queryClient } from "@/queryClient"

export const Route = createFileRoute("/_layout/create-invoice")({
  component: CreateInvoicePage,
  validateSearch: (search) => ({
    customerId: search.customerId ? String(search.customerId) : undefined,
    itemId: search.itemId ? String(search.itemId) : undefined,
    documentType: search.documentType || "invoice",
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
  const [inventoryItems, setInventoryItems] = useLocalStorage("items", [])
  const [companyDetails] = useLocalStorage("company-details", {})
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const savedRef = useRef(false)
  const { customerId: preselectedCustomerId, itemId: preselectedItemId, documentType } =
    Route.useSearch()

  const { data: activeTemplate } = useQuery(invoiceTemplateActiveQueryOptions())

  const selectedTemplate =
    activeTemplate?.kind === "built_in"
      ? activeTemplate?.built_in_id
      : activeTemplate?.kind === "custom"
        ? "custom"
        : activeTemplate?.kind === "imported_html" ||
            activeTemplate?.kind === "imported_pdf"
          ? "imported"
          : "clean-teal"

  const _customTemplate =
    activeTemplate?.kind === "custom" ? activeTemplate?.custom_data : null
  const importedTemplate =
    activeTemplate?.kind === "imported_pdf"
      ? {
          type: "pdf",
          dataUrl: activeTemplate?.imported_pdf_data_url,
          name: activeTemplate?.name,
          savedAt: activeTemplate?.updated_at,
        }
      : activeTemplate?.kind === "imported_html"
        ? {
            type: "html",
            html: activeTemplate?.imported_html,
            name: activeTemplate?.name,
            savedAt: activeTemplate?.updated_at,
          }
        : null

  const { data: customersRes } = useQuery(customersListQueryOptions())
  const customers = customersRes?.data ?? []

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
  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    accountName: "",
    accountNumber: "",
    ifsc: "",
    branch: "",
    upi: "",
  })
  const [previewOpen, setPreviewOpen] = useState(false)

  const createCustomerMutation = useMutation({
    mutationFn: async (payload) => {
      return CustomersService.createCustomer({
        requestBody: payload,
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: customersQueryKeys.all })
    },
  })

  const createInvoiceMutation = useMutation({
    mutationFn: async (payload) => {
      return InvoicesService.createInvoice({
        requestBody: payload,
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: invoicesQueryKeys.all })
    },
  })

  // Pre-select customer and/or item if navigated from their detail pages
  useEffect(() => {
    if (preselectedCustomerId && customers.length > 0) {
      handleCustomerSelect(preselectedCustomerId)
    }
    if (
      preselectedItemId &&
      inventoryItems.length > 0 &&
      items.length === 1 &&
      items[0].name === ""
    ) {
      handleItemSelect(0, preselectedItemId)
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    preselectedCustomerId,
    preselectedItemId,
    customers.length,
    handleCustomerSelect,
    handleItemSelect,
    inventoryItems.length,
    items.length,
    items[0].name,
  ])

  const handleCustomerSelect = (value) => {
    setSelectedCustomerId(value)
    if (value === "__new__") {
      setCustomerDetails({
        name: "",
        address: "",
        gst: "",
        phone: "",
        email: "",
      })
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
                field === "quantity" ||
                field === "price" ||
                field === "tax" ||
                field === "discount"
                  ? Number(value) || 0
                  : value,
            }
          : item,
      ),
    )
  }

  const handleItemSelect = (index, itemId) => {
    const invItem = inventoryItems.find((i) => i.id === itemId)
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
              unit: invItem.unit || "pcs",
            }
          : item,
      ),
    )
  }

  const addItem = () => setItems((prev) => [...prev, { ...emptyItem }])
  const removeItem = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index))

  const { subtotal, totalTax, itemsDiscount, invoiceDiscount, grandTotal } =
    useMemo(() => {
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
      // Invoice-level discount
      const taxableAfterItemDisc = sub - itemDisc
      const invDisc =
        discountType === "flat"
          ? Math.min(discountValue, taxableAfterItemDisc)
          : taxableAfterItemDisc * (discountValue / 100)
      const netBeforeTax = taxableAfterItemDisc - invDisc
      // Recalculate tax on net if per-item tax is used (approximate redistribution)
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
    }, [
      items,
      discountType,
      discountValue,
      shippingCharge,
      extraChargeAmount,
      roundOff,
    ])

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
    invoice_number: invoiceNumber,
    document_type: documentType,
    invoice_date: invoiceDate,
    due_date: dueDate || null,
    currency,
    subtotal,
    total_tax: totalTax,
    grand_total: grandTotal,
    notes: notes || null,
    payment_terms: paymentTerms || null,
    status: "unpaid",
    customer_id: "",
    items: (items ?? [])
      .filter((i) => i.name)
      .map((i) => ({
        name: i.name,
        description: i.description || null,
        quantity: Number(i.quantity) || 0,
        price: Number(i.price) || 0,
        tax: Number(i.tax) || 0,
      })),
  })

  const handleSave = async () => {
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

    try {
      let customerId = selectedCustomerId

      if (!customerId || customerId === "__new__") {
        const created = await createCustomerMutation.mutateAsync({
          name: customerDetails.name,
          phone: customerDetails.phone || null,
          email: customerDetails.email || null,
          address: customerDetails.address || null,
          gst: customerDetails.gst || null,
          notes: notes || null,
        })
        customerId = created.id
        setSelectedCustomerId(created.id)
      }

      const payload = buildInvoiceData()
      payload.customer_id = customerId

      await createInvoiceMutation.mutateAsync(payload)

      showSuccessToast("Invoice saved successfully")
    } catch (_err) {
      showErrorToast("Failed to save invoice")
    }

    // Deduct stock for items that have an itemId linked
    let _stockDeducted = false
    setInventoryItems((prev) => {
      const newInventory = [...prev]
      items.forEach((invLine) => {
        if (!invLine.itemId) return
        const idx = newInventory.findIndex((i) => i.id === invLine.itemId)
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
              reason: `Invoice ${invoiceNumber}`,
            },
          ],
        }
        _stockDeducted = true
      })
      return newInventory
    })

    // Reset guard after short delay so user can save again if needed
    setTimeout(() => {
      savedRef.current = false
    }, 1000)
  }

  // ─── Template-aware invoice HTML builder ─────────────────────────────────────
  const buildInvoiceHtml = () => {
    const cs = currencySymbol
    const cd = customerDetails
    const biz = companyDetails || {}
    const validItems = items.filter((i) => i.name)

    const bizName = biz.name || "Your Business"
    const bizEmail = biz.email || ""
    const bizPhone = biz.phone || ""
    const bizAddress = [biz.address, biz.city, biz.state, biz.pincode]
      .filter(Boolean)
      .join(", ")
    const bizGstin = biz.gstin || ""
    const bizTagline = biz.tagline || ""
    const bizLogo = biz.logo || null
    const invoiceFooterNote =
      biz.invoiceFooter || "Thank you for your business!"

    const activeBankDetails = showBankDetails
      ? bankDetails
      : biz.bankName || biz.accountNumber || biz.upi
        ? {
            bankName: biz.bankName || "",
            accountName: biz.accountName || "",
            accountNumber: biz.accountNumber || "",
            ifsc: biz.ifsc || "",
            branch: biz.branch || "",
            upi: biz.upi || "",
          }
        : null

    // ── Shared: compute rows with totals ────────────────────────────────────────
    const computedRows = validItems.map((item, idx) => {
      const lineBase = item.quantity * item.price
      const disc =
        item.discountType === "flat"
          ? Math.min(item.discount || 0, lineBase)
          : lineBase * ((item.discount || 0) / 100)
      const taxable = lineBase - disc
      const lineTax = (taxable * item.tax) / 100
      const lineTotal = taxable + lineTax
      return { item, idx, lineBase, disc, taxable, lineTax, lineTotal }
    })

    const summaryEntries = [
      { label: "Subtotal", value: cs + subtotal.toFixed(2) },
      itemsDiscount > 0
        ? {
            label: "Item Discounts",
            value: `-${cs}${itemsDiscount.toFixed(2)}`,
            red: true,
          }
        : null,
      invoiceDiscount > 0
        ? {
            label: "Discount",
            value: `-${cs}${invoiceDiscount.toFixed(2)}`,
            red: true,
          }
        : null,
      totalTax > 0 ? { label: "Tax", value: cs + totalTax.toFixed(2) } : null,
      Number(shippingCharge) > 0
        ? { label: "Shipping", value: cs + Number(shippingCharge).toFixed(2) }
        : null,
      Number(extraChargeAmount) > 0
        ? {
            label: extraChargeLabel || "Extra",
            value: cs + Number(extraChargeAmount).toFixed(2),
          }
        : null,
    ].filter(Boolean)

    const bankHtml =
      activeBankDetails &&
      (activeBankDetails.bankName ||
        activeBankDetails.accountNumber ||
        activeBankDetails.upi)
        ? [
            activeBankDetails.bankName
              ? `Bank: <strong>${activeBankDetails.bankName}</strong>`
              : "",
            activeBankDetails.accountName
              ? `A/C Name: <strong>${activeBankDetails.accountName}</strong>`
              : "",
            activeBankDetails.accountNumber
              ? `A/C No: <strong>${activeBankDetails.accountNumber}</strong>`
              : "",
            activeBankDetails.ifsc
              ? `IFSC: <strong>${activeBankDetails.ifsc}</strong>`
              : "",
            activeBankDetails.upi
              ? `UPI: <strong>${activeBankDetails.upi}</strong>`
              : "",
          ]
            .filter(Boolean)
            .join(" &nbsp;|&nbsp; ")
        : ""

    // ─────────────────────────────────────────────────────────────────────────
    // TEMPLATE 1: CLEAN TEAL
    // Layout: Big cyan INVOICE title top-left, date box top-right, FROM/BILL TO
    // 2 columns, bordered SL/Description/Amount table, Note at bottom
    // ─────────────────────────────────────────────────────────────────────────
    if (selectedTemplate === "clean-teal") {
      const rows = computedRows
        .map(
          (r, i) =>
            '<tr style="border-bottom:1px solid #e2e8f0;background:' +
            (i % 2 === 0 ? "#fff" : "#f0fdfe") +
            '">' +
            '<td style="padding:10px 10px;font-size:11px;text-align:center;border-right:1px solid #e2e8f0;color:#555">' +
            (i + 1) +
            "</td>" +
            '<td style="padding:10px 12px;font-size:12px;color:#1a1a1a">' +
            r.item.name +
            (r.item.description
              ? `<div style="font-size:10px;color:#94a3b8;margin-top:2px">${r.item.description}</div>`
              : "") +
            "</td>" +
            '<td style="padding:10px 12px;font-size:12px;text-align:right;color:#1a1a1a;font-family:monospace">' +
            cs +
            r.lineTotal.toFixed(2) +
            "</td>" +
            "</tr>",
        )
        .join("")

      const noteHtml =
        notes || paymentTerms
          ? `<tr><td colspan="3" style="padding:12px;font-size:11px;border-top:1px solid #e2e8f0;background:#f8fafc"><strong>Note:</strong> ${notes || paymentTerms}</td></tr>`
          : ""

      return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>INVOICE ${invoiceNumber}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%}body{font-family:Arial,sans-serif;background:#fff;color:#1a1a1a;font-size:13px;min-height:100%}@page{size:A4;margin:0}@media print{html,body{height:100%;-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head>
<body>
<div style="max-width:794px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;background:#fff">

  <!-- CONTENT GROWS -->
  <div style="flex:1;padding:48px 52px 32px;display:flex;flex-direction:column">

    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:36px">
      <p style="font-size:56px;font-weight:900;color:#0E7490;letter-spacing:-3px;line-height:1">INVOICE</p>
      <div style="text-align:right;border:1px solid #e2e8f0;padding:14px 18px;font-size:12px;color:#555;min-width:200px">
        <div style="margin-bottom:6px"><span style="color:#94a3b8">Date:</span> ${invoiceDate}</div>
        <div style="margin-bottom:6px"><span style="color:#94a3b8">Invoice No:</span> ${invoiceNumber}</div>
        ${dueDate ? `<div style="margin-bottom:4px"><span style="color:#94a3b8">Due:</span> ${dueDate}</div>` : ""}
        ${poNumber ? `<div><span style="color:#94a3b8">PO #:</span> ${poNumber}</div>` : ""}
      </div>
    </div>

    <!-- FROM / BILL TO -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:36px">
      <div>
        <div style="font-size:11px;font-weight:700;color:#555;border-bottom:2.5px solid #0E7490;padding-bottom:5px;margin-bottom:10px;text-transform:uppercase">From</div>
        <p style="font-weight:700;font-size:14px">${bizName}</p>
        ${bizTagline ? `<p style="color:#94a3b8;font-size:11px;margin-top:2px">${bizTagline}</p>` : ""}
        ${bizAddress ? `<p style="color:#64748b;font-size:12px;margin-top:4px">${bizAddress}</p>` : ""}
        ${bizPhone ? `<p style="color:#64748b;font-size:12px">${bizPhone}</p>` : ""}
        ${bizEmail ? `<p style="color:#64748b;font-size:12px">${bizEmail}</p>` : ""}
        ${bizGstin ? `<p style="color:#64748b;font-size:11px;margin-top:2px">GSTIN: ${bizGstin}</p>` : ""}
      </div>
      <div>
        <div style="font-size:11px;font-weight:700;color:#555;border-bottom:2.5px solid #0E7490;padding-bottom:5px;margin-bottom:10px;text-transform:uppercase">Bill To</div>
        <p style="font-weight:700;font-size:14px">${cd.name || "—"}</p>
        ${cd.address ? `<p style="color:#64748b;font-size:12px;margin-top:4px;line-height:1.5">${cd.address}</p>` : ""}
        ${cd.phone ? `<p style="color:#64748b;font-size:12px">${cd.phone}</p>` : ""}
        ${cd.email ? `<p style="color:#64748b;font-size:12px">${cd.email}</p>` : ""}
        ${cd.gst ? `<p style="color:#64748b;font-size:11px;margin-top:2px">GSTIN: ${cd.gst}</p>` : ""}
        ${placeOfSupply ? `<p style="color:#9ca3af;font-size:11px">Place of Supply: ${placeOfSupply}</p>` : ""}
      </div>
    </div>

    <!-- Table -->
    <table style="width:100%;border-collapse:collapse;border:1px solid #cbd5e1">
      <thead><tr style="background:#0E7490;color:#fff">
        <th style="padding:11px 10px;font-size:11px;text-align:center;width:40px">SL</th>
        <th style="padding:11px 14px;font-size:11px;text-align:left">DESCRIPTION</th>
        <th style="padding:11px 14px;font-size:11px;text-align:right">AMOUNT</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>

    <!-- Summary section out of table -->
    <div style="display:flex;justify-content:flex-end;margin-top:20px;margin-bottom:20px">
      <table style="border-collapse:collapse;min-width:240px">
        ${summaryEntries
          .map(
            (e) => `
          <tr>
            <td style="padding:6px 20px 6px 0;font-size:12px;color:#64748b;text-align:right">${e.label}</td>
            <td style="padding:6px 0;font-size:12px;text-align:right;font-family:monospace;color:${e.red ? "#ef4444" : "#1a1a1a"}">${e.value}</td>
          </tr>
        `,
          )
          .join("")}
        <tr>
          <td style="padding:12px 20px 12px 0;font-size:14px;font-weight:700;color:#0E7490;text-align:right;border-top:2px solid #0E7490">Grand Total</td>
          <td style="padding:12px 0;font-size:24px;font-weight:900;color:#0E7490;text-align:right;font-family:monospace;border-top:2px solid #0E7490">${cs}${grandTotal.toFixed(2)}</td>
        </tr>
      </table>
    </div>

    ${noteHtml ? `<div style="padding:12px;font-size:11px;border:1px solid #e2e8f0;background:#f8fafc;margin-bottom:20px"><strong>Note:</strong> ${notes || paymentTerms}</div>` : ""}

    <!-- Note & Bank -->
    <div style="margin-top:auto;padding-top:32px;display:flex;justify-content:space-between;align-items:flex-end">
      <div style="max-width:320px">
        ${bankHtml ? `<div style="padding:14px 16px;background:#f0fdfe;border:1px solid #cffafe;font-size:12px;color:#555">${bankHtml}</div>` : ""}
        ${notes && !noteHtml ? `<div style="margin-top:16px;padding:12px 16px;background:#f8fafc;border-left:3px solid #0E7490;font-size:12px;color:#555"><strong>Note:</strong> ${notes}</div>` : ""}
        ${paymentTerms ? `<div style="margin-top:10px;font-size:11px;color:#64748b"><strong>Payment Terms:</strong> ${paymentTerms}</div>` : ""}
      </div>
      <div style="text-align:right;min-width:180px">
        <div style="border-top:1.5px solid #0E7490;padding-top:8px">
          <p style="font-size:13px;font-weight:700;color:#0E7490">Authorized Signatory</p>
          <p style="font-size:10px;color:#94a3b8;margin-top:2px">For ${bizName}</p>
        </div>
      </div>
    </div>

  </div>

  <!-- FOOTER pinned bottom -->
  <div style="background:#0E7490;padding:14px 52px;display:flex;justify-content:space-between;align-items:center;margin-top:auto">
    <p style="color:rgba(255,255,255,0.9);font-size:12px;font-style:italic">${invoiceFooterNote}</p>
    <p style="color:rgba(255,255,255,0.55);font-size:10px">Generated by AutoInvoice</p>
  </div>

</div>
</body></html>`
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEMPLATE 2: GEOMETRIC
    // Layout: Bold "INVOICE" top-left, teal+pink triangle corners, date+issued to
    // 2 cols, NO/DESC/QTY/PRICE/SUBTOTAL table with bordered rows, signature line
    // ─────────────────────────────────────────────────────────────────────────
    if (selectedTemplate === "geometric") {
      const rows = computedRows
        .map(
          (r, i) =>
            '<tr style="border-bottom:1px solid #e2e8f0;background:' +
            (i % 2 === 0 ? "#fff" : "#f8fffe") +
            '">' +
            '<td style="padding:10px 10px;font-size:11px;text-align:center;color:#555">' +
            (i + 1) +
            "</td>" +
            '<td style="padding:10px 12px;font-size:12px;color:#1a1a1a">' +
            r.item.name +
            (r.item.description
              ? `<div style="font-size:10px;color:#94a3b8;margin-top:1px">${r.item.description}</div>`
              : "") +
            "</td>" +
            '<td style="padding:10px 12px;font-size:12px;text-align:center;color:#555">' +
            r.item.quantity +
            (r.item.unit ? ` ${r.item.unit}` : "") +
            "</td>" +
            '<td style="padding:10px 12px;font-size:12px;text-align:right;font-family:monospace;color:#555">' +
            cs +
            Number(r.item.price).toFixed(2) +
            "</td>" +
            '<td style="padding:10px 12px;font-size:12px;text-align:right;font-family:monospace;font-weight:700;color:#0F766E">' +
            cs +
            r.lineTotal.toFixed(2) +
            "</td>" +
            "</tr>",
        )
        .join("")

      const _sumRows = summaryEntries
        .map(
          (e) =>
            `<tr><td style="padding:5px 0;font-size:12px;color:#64748b;text-align:right;padding-right:20px">${e.label}</td><td style="padding:5px 0;font-size:12px;text-align:right;color:${e.red ? "#ef4444" : "#1a1a1a"};font-family:monospace">${e.value}</td></tr>`,
        )
        .join("")

      return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>INVOICE ${invoiceNumber}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%}body{font-family:Arial,sans-serif;background:#fff;color:#1a1a1a;font-size:13px;min-height:100%}@page{size:A4;margin:0}@media print{html,body{height:100%;-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head>
<body>
<div style="max-width:794px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;background:#fff;position:relative;overflow:hidden">

  <!-- Corner accent triangles -->
  <div style="position:fixed;top:0;right:0;width:0;height:0;border-left:90px solid transparent;border-top:90px solid #0F766E;pointer-events:none"></div>
  <div style="position:fixed;top:0;right:50px;width:0;height:0;border-left:45px solid transparent;border-top:45px solid #EC4899;pointer-events:none"></div>
  <div style="position:fixed;bottom:0;left:0;width:0;height:0;border-right:70px solid transparent;border-bottom:70px solid #EC4899;pointer-events:none"></div>

  <!-- CONTENT GROWS -->
  <div style="flex:1;padding:52px 52px 36px;display:flex;flex-direction:column">

    <p style="font-size:48px;font-weight:900;letter-spacing:-2px;color:#1a1a1a;margin-bottom:36px;line-height:1">INVOICE</p>

    <!-- Date + From/Issued To -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:36px">
      <div style="font-size:12px;color:#555">
        <p style="margin-bottom:8px">Date Issued:<br><strong style="font-size:13px;color:#1a1a1a">${invoiceDate}</strong></p>
        <p style="margin-bottom:8px">Invoice No:<br><strong style="font-size:13px;color:#1a1a1a">${invoiceNumber}</strong></p>
        ${dueDate ? `<p>Due Date:<br><strong style="font-size:13px;color:#1a1a1a">${dueDate}</strong></p>` : ""}
        ${poNumber ? `<p style="margin-top:6px">PO #: <strong>${poNumber}</strong></p>` : ""}
      </div>
      <div style="font-size:12px">
        <p style="color:#94a3b8;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Issued By</p>
        <p style="font-weight:700;font-size:13px">${bizName}</p>
        ${bizAddress ? `<p style="color:#64748b;font-size:11px;margin-top:2px">${bizAddress}</p>` : ""}
        ${bizPhone ? `<p style="color:#64748b;font-size:11px">${bizPhone}</p>` : ""}
        ${bizGstin ? `<p style="color:#64748b;font-size:11px">GSTIN: ${bizGstin}</p>` : ""}

        <p style="color:#94a3b8;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin-top:16px;margin-bottom:6px">Issued To</p>
        <p style="font-weight:700;font-size:13px">${cd.name || "—"}</p>
        ${cd.address ? `<p style="color:#64748b;font-size:11px;margin-top:2px;line-height:1.5">${cd.address}</p>` : ""}
        ${cd.phone ? `<p style="color:#64748b;font-size:11px">${cd.phone}</p>` : ""}
        ${cd.email ? `<p style="color:#64748b;font-size:11px">${cd.email}</p>` : ""}
        ${cd.gst ? `<p style="color:#64748b;font-size:11px">GSTIN: ${cd.gst}</p>` : ""}
      </div>
    </div>

    <!-- Items table -->
    <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0">
      <thead><tr style="background:#f8f8f8;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#666">
        <th style="padding:11px 10px;text-align:center;width:40px;border-bottom:1px solid #e2e8f0">NO</th>
        <th style="padding:11px 14px;text-align:left;border-bottom:1px solid #e2e8f0">DESCRIPTION</th>
        <th style="padding:11px 14px;text-align:center;border-bottom:1px solid #e2e8f0">QTY</th>
        <th style="padding:11px 14px;text-align:right;border-bottom:1px solid #e2e8f0">PRICE</th>
        <th style="padding:11px 14px;text-align:right;border-bottom:1px solid #e2e8f0">SUBTOTAL</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>

    <!-- Summary section out of table -->
    <div style="display:flex;justify-content:flex-end;margin-top:20px;margin-bottom:20px">
      <table style="border-collapse:collapse;min-width:260px">
        ${summaryEntries
          .map(
            (e) => `
          <tr>
            <td style="padding:6px 20px 6px 0;font-size:12px;color:#64748b;text-align:right">${e.label}</td>
            <td style="padding:6px 0;font-size:12px;text-align:right;font-family:monospace;color:${e.red ? "#ef4444" : "#1a1a1a"}">${e.value}</td>
          </tr>
        `,
          )
          .join("")}
        <tr>
          <td style="padding:12px 20px 12px 0;font-size:14px;font-weight:700;color:#1a1a1a;text-align:right;border-top:1.5px solid #e2e8f0">Grand Total</td>
          <td style="padding:12px 0;font-size:24px;font-weight:900;color:#0F766E;text-align:right;font-family:monospace;border-top:1.5px solid #e2e8f0">${cs}${grandTotal.toFixed(2)}</td>
        </tr>
      </table>
    </div>


    <!-- Summary + Signature -->
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:auto;padding-top:48px">
      <div style="max-width:320px">
        ${bankHtml ? `<p style="font-size:12px;font-weight:700;margin-bottom:6px;color:#1a1a1a">Payment Details:</p><p style="font-size:12px;color:#64748b;line-height:1.6">${bankHtml}</p>` : ""}
        ${notes ? `<p style="font-size:12px;color:#64748b;margin-top:12px"><strong>Note:</strong> ${notes}</p>` : ""}
        ${paymentTerms ? `<p style="font-size:12px;color:#64748b;margin-top:4px"><strong>Payment Terms:</strong> ${paymentTerms}</p>` : ""}
      </div>
      <div style="text-align:right">
        <div style="border-top:1px solid #1a1a1a;padding-top:8px;text-align:center;min-width:160px">
          <div style="font-family:Georgia,serif;font-style:italic;font-size:26px;color:#374151;margin-bottom:4px">Authorized</div>
          <p style="font-size:11px;color:#6b7280">Authorized Signatory</p>
        </div>
      </div>
    </div>

  </div>

  <!-- FOOTER pinned bottom -->
  <div style="background:#0F766E;padding:14px 52px;display:flex;justify-content:space-between;align-items:center;margin-top:auto;position:relative;z-index:2">
    <p style="color:rgba(255,255,255,0.9);font-size:12px;font-style:italic">${invoiceFooterNote}</p>
    <p style="color:rgba(255,255,255,0.55);font-size:10px">Generated by AutoInvoice</p>
  </div>

</div>
</body></html>`
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEMPLATE 3: CIRCLE STUDIO
    // Layout: Centered circle logo header, minimalist b&w, clean type,
    // Description/Unit Price/QTY/Total table, bank details bottom-left,
    // "thank you" italic script bottom-right
    // ─────────────────────────────────────────────────────────────────────────
    if (selectedTemplate === "circle-studio") {
      const rows = computedRows
        .map(
          (r, _i) =>
            '<tr style="border-bottom:1px solid #e5e7eb">' +
            '<td style="padding:11px 14px;font-size:12px;color:#1a1a1a">' +
            r.item.name +
            (r.item.description
              ? `<div style="font-size:10px;color:#9ca3af;margin-top:2px">${r.item.description}</div>`
              : "") +
            "</td>" +
            '<td style="padding:11px 14px;font-size:12px;text-align:right;font-family:monospace">' +
            cs +
            Number(r.item.price).toFixed(2) +
            "</td>" +
            '<td style="padding:11px 14px;font-size:12px;text-align:right">' +
            r.item.quantity +
            (r.item.unit ? ` ${r.item.unit}` : "") +
            "</td>" +
            '<td style="padding:11px 14px;font-size:12px;text-align:right;font-family:monospace;font-weight:700">' +
            cs +
            r.lineTotal.toFixed(2) +
            "</td>" +
            "</tr>",
        )
        .join("")

      const _sumRows = summaryEntries
        .filter((e) => e.label !== "Subtotal")
        .map(
          (e) =>
            `<tr><td style="padding:4px 16px 4px 0;font-size:12px;color:#6b7280">${e.label}</td><td style="padding:4px 0;font-size:12px;text-align:right;font-family:monospace;color:${e.red ? "#ef4444" : "#1a1a1a"}">${e.value}</td></tr>`,
        )
        .join("")

      return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>INVOICE ${invoiceNumber}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%}body{font-family:Arial,sans-serif;background:#fff;color:#1a1a1a;font-size:13px;min-height:100%}@page{size:A4;margin:0}@media print{html,body{height:100%;-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head>
<body>
<div style="max-width:794px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;background:#fff">

  <!-- CONTENT GROWS -->
  <div style="flex:1;padding:48px 52px 36px;display:flex;flex-direction:column">

    <!-- Centered logo -->
    <div style="text-align:center;margin-bottom:36px">
      <div style="width:80px;height:80px;border-radius:50%;border:2.5px solid #1a1a1a;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;margin-bottom:8px">
        ${
          bizLogo
            ? `<img src="${bizLogo}" style="width:50px;height:50px;object-fit:contain;border-radius:50%">`
            : `<span style="font-style:italic;font-size:11px;font-family:Georgia,serif;color:#555">the</span><span style="font-weight:900;font-size:12px;letter-spacing:4px">${bizName.substring(0, 6).toUpperCase()}</span><span style="font-size:8px;letter-spacing:3px;color:#9ca3af;text-transform:uppercase">Studio</span>`
        }
      </div>
      <p style="font-size:11px;color:#9ca3af;letter-spacing:1px;text-transform:uppercase">${bizTagline || bizEmail || bizName}</p>
    </div>

    <!-- Issued to + Invoice no -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:32px">
      <div>
        <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">ISSUED TO:</p>
        <p style="font-weight:700;font-size:14px">${cd.name || "—"}</p>
        ${cd.address ? `<p style="font-size:12px;color:#6b7280;margin-top:4px;line-height:1.5">${cd.address}</p>` : ""}
        ${cd.phone ? `<p style="font-size:12px;color:#6b7280">${cd.phone}</p>` : ""}
        ${cd.email ? `<p style="font-size:12px;color:#6b7280">${cd.email}</p>` : ""}
        ${cd.gst ? `<p style="font-size:11px;color:#6b7280">GSTIN: ${cd.gst}</p>` : ""}
      </div>
      <div style="text-align:right">
        <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">INVOICE NO:</p>
        <p style="font-weight:900;font-size:28px;font-family:monospace">#${invoiceNumber}</p>
        <p style="font-size:12px;color:#6b7280;margin-top:6px">${invoiceDate}</p>
        ${dueDate ? `<p style="font-size:12px;color:#6b7280">Due: ${dueDate}</p>` : ""}
        ${poNumber ? `<p style="font-size:12px;color:#6b7280">PO: ${poNumber}</p>` : ""}
      </div>
    </div>

    <!-- Table -->
    <table style="width:100%;border-collapse:collapse">
      <thead><tr style="border-top:2.5px solid #1a1a1a;border-bottom:2.5px solid #1a1a1a;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">
        <th style="padding:11px 14px;text-align:left">DESCRIPTION</th>
        <th style="padding:11px 14px;text-align:right">UNIT PRICE</th>
        <th style="padding:11px 14px;text-align:right">QTY</th>
        <th style="padding:11px 14px;text-align:right">TOTAL</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>

    <!-- Summary section out of table -->
    <div style="display:flex;justify-content:flex-end;margin-top:20px;margin-bottom:20px">
      <table style="border-collapse:collapse;min-width:240px">
        ${summaryEntries
          .map(
            (e) => `
          <tr>
            <td style="padding:6px 24px 6px 0;font-size:12px;color:#6b7280;text-align:right;text-transform:uppercase;letter-spacing:1px">${e.label}</td>
            <td style="padding:6px 0;font-size:12px;text-align:right;font-family:monospace;color:${e.red ? "#ef4444" : "#1a1a1a"}">${e.value}</td>
          </tr>
        `,
          )
          .join("")}
      </table>
    </div>

    <!-- Total line -->
    <div style="border-top:2.5px solid #1a1a1a;border-bottom:2.5px solid #1a1a1a;padding:12px 0;display:flex;justify-content:space-between;font-weight:900;font-size:24px;margin-top:0">
      <span style="letter-spacing:2px">AMOUNT DUE</span><span style="font-family:monospace">${cs}${grandTotal.toFixed(2)}</span>
    </div>


    <!-- Bank + Thank you -->
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:auto;padding-top:48px">
      <div style="font-size:12px;color:#6b7280;max-width:280px">
        ${
          activeBankDetails &&
          (activeBankDetails.bankName || activeBankDetails.accountNumber)
            ? '<p style="font-weight:700;color:#1a1a1a;margin-bottom:6px;font-size:12px">BANK DETAILS</p>' +
              (activeBankDetails.bankName
                ? `<p>Bank: ${activeBankDetails.bankName}</p>`
                : "") +
              (activeBankDetails.accountName
                ? `<p>Account Name: ${activeBankDetails.accountName}</p>`
                : "") +
              (activeBankDetails.accountNumber
                ? `<p>Account No.: ${activeBankDetails.accountNumber}</p>`
                : "") +
              (activeBankDetails.ifsc
                ? `<p>IFSC: ${activeBankDetails.ifsc}</p>`
                : "") +
              (activeBankDetails.upi
                ? `<p>UPI: ${activeBankDetails.upi}</p>`
                : "") +
              (
                dueDate
                  ? `<p style="margin-top:6px">Pay by: ${dueDate}</p>`
                  : ""
              )
            : bizAddress
              ? `<p>${bizPhone}</p><p>${bizEmail}</p>`
              : ""
        }
        ${notes ? `<p style="margin-top:12px"><em>${notes}</em></p>` : ""}
        ${paymentTerms ? `<p style="margin-top:4px"><strong>Terms:</strong> ${paymentTerms}</p>` : ""}
      </div>
      <div style="text-align:right">
        <div style="margin-bottom:24px;border-top:1px solid #1a1a1a;padding-top:8px;display:inline-block;min-width:160px;text-align:center">
          <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px">Authorized Signatory</p>
        </div>
        <p style="font-family:Georgia,serif;font-size:36px;font-style:italic;color:#374151">thank you</p>
        <p style="font-size:11px;color:#9ca3af;margin-top:4px">${invoiceFooterNote}</p>
      </div>
    </div>

  </div>

  <!-- FOOTER pinned bottom -->
  <div style="border-top:2px solid #1a1a1a;padding:12px 52px;display:flex;justify-content:space-between;align-items:center;background:#f9fafb;margin-top:auto">
    <p style="font-size:12px;color:#6b7280">${bizName} &bull; ${bizEmail || bizPhone}</p>
    <p style="font-size:10px;color:#9ca3af">Generated by AutoInvoice</p>
  </div>

</div>
</body></html>`
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEMPLATE 4: AIZEN BOLD
    // Layout: Company logo top-left with geometric black+red triangles top-right,
    // big centered "INVOICE" title, invoice meta in 3 cols, light table with
    // alternating rows, red "Total" badge at bottom-right
    // ─────────────────────────────────────────────────────────────────────────
    if (selectedTemplate === "aizen-bold") {
      const rows = computedRows
        .map(
          (r, i) =>
            '<tr style="background:' +
            (i % 2 === 0 ? "#f9fafb" : "#fff") +
            ';border-bottom:1px solid #e5e7eb">' +
            '<td style="padding:11px 14px;font-size:12px;color:#374151">' +
            r.item.name +
            (r.item.description
              ? `<div style="font-size:10px;color:#9ca3af;margin-top:2px">${r.item.description}</div>`
              : "") +
            "</td>" +
            '<td style="padding:11px 14px;font-size:12px;text-align:center;color:#374151">' +
            r.item.quantity +
            (r.item.unit ? ` ${r.item.unit}` : "") +
            "</td>" +
            '<td style="padding:11px 14px;font-size:12px;text-align:right;font-family:monospace;color:#374151">' +
            cs +
            Number(r.item.price).toFixed(2) +
            "</td>" +
            '<td style="padding:11px 14px;font-size:12px;text-align:right;font-family:monospace;font-weight:700;color:#1a1a1a">' +
            cs +
            r.lineTotal.toFixed(2) +
            "</td>" +
            "</tr>",
        )
        .join("")

      return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>INVOICE ${invoiceNumber}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%}body{font-family:Arial,sans-serif;background:#fff;color:#1a1a1a;font-size:13px;min-height:100%}@page{size:A4;margin:0}@media print{html,body{height:100%;-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head>
<body>
<div style="max-width:794px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;background:#fff">

  <!-- Company header + geometric accents -->
  <div style="padding:24px 44px 20px;position:relative;overflow:hidden;display:flex;align-items:center;gap:16px;background:#fff;border-bottom:1px solid #e5e7eb">
    <div style="position:absolute;top:0;right:0;width:0;height:0;border-left:70px solid transparent;border-top:70px solid #1a1a1a"></div>
    <div style="position:absolute;top:0;right:38px;width:0;height:0;border-left:36px solid transparent;border-top:36px solid #ef4444"></div>
    ${
      bizLogo
        ? `<img src="${bizLogo}" style="width:42px;height:42px;object-fit:contain;border-radius:4px">`
        : `<div style="width:42px;height:42px;background:#ef4444;border-radius:4px;display:flex;align-items:center;justify-content:center;font-weight:900;color:#fff;font-size:20px;flex-shrink:0">${bizName.charAt(0)}</div>`
    }
    <div>
      <p style="font-weight:900;font-size:16px;line-height:1.1;color:#1a1a1a">${bizName.toUpperCase()}</p>
      <p style="font-size:10px;color:#9ca3af;letter-spacing:2px;text-transform:uppercase">${bizTagline || "Professional Services"}</p>
    </div>
  </div>

  <!-- INVOICE title centered -->
  <p style="text-align:center;font-weight:900;font-size:30px;letter-spacing:8px;padding:14px 0;border-bottom:1px solid #e5e7eb;margin:0">INVOICE</p>

  <!-- Invoice meta 3 cols -->
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;padding:20px 44px;border-bottom:1px solid #e5e7eb;font-size:12px">
    <div>
      <p style="color:#9ca3af;margin-bottom:4px;font-size:10px;text-transform:uppercase;letter-spacing:1px">Invoice To:</p>
      <p style="font-weight:700;font-size:13px">${cd.name || "—"}</p>
      ${cd.address ? `<p style="color:#6b7280;margin-top:2px;line-height:1.5">${cd.address}</p>` : ""}
      ${cd.phone ? `<p style="color:#6b7280">${cd.phone}</p>` : ""}
      ${cd.email ? `<p style="color:#6b7280">${cd.email}</p>` : ""}
      ${cd.gst ? `<p style="color:#6b7280">GSTIN: ${cd.gst}</p>` : ""}
    </div>
    <div>
      <p style="color:#9ca3af;margin-bottom:4px;font-size:10px;text-transform:uppercase;letter-spacing:1px">From:</p>
      <p style="font-weight:700;font-size:13px">${bizName}</p>
      ${bizAddress ? `<p style="color:#6b7280;margin-top:2px;line-height:1.5">${bizAddress}</p>` : ""}
      ${bizPhone ? `<p style="color:#6b7280">${bizPhone}</p>` : ""}
      ${bizGstin ? `<p style="color:#6b7280">GSTIN: ${bizGstin}</p>` : ""}
    </div>
    <div style="text-align:right">
      <p style="color:#9ca3af;margin-bottom:4px">Date: ${invoiceDate}</p>
      <p style="font-family:monospace">Invoice: ${invoiceNumber}</p>
      ${dueDate ? `<p style="color:#6b7280">Due: ${dueDate}</p>` : ""}
      ${poNumber ? `<p style="color:#6b7280">PO #: ${poNumber}</p>` : ""}
    </div>
  </div>

  <!-- CONTENT GROWS -->
  <div style="flex:1;padding:0 44px 36px;display:flex;flex-direction:column">
    <!-- Items table -->
    <table style="width:100%;border-collapse:collapse;margin-top:20px">
      <thead><tr style="background:#f3f4f6;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280">
        <th style="padding:11px 14px;text-align:left">Description</th>
        <th style="padding:11px 14px;text-align:center">Qty</th>
        <th style="padding:11px 14px;text-align:right">Price</th>
        <th style="padding:11px 14px;text-align:right">Total</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>

    <!-- Summary section out of table -->
    <div style="display:flex;justify-content:flex-end;margin-top:24px;margin-bottom:24px">
      <table style="border-collapse:collapse;min-width:280px">
        ${summaryEntries
          .map(
            (e) => `
          <tr>
            <td style="padding:6px 24px 6px 0;font-size:12px;color:#6b7280;text-align:right;text-transform:uppercase;letter-spacing:1px">${e.label}</td>
            <td style="padding:6px 0;font-size:12px;text-align:right;font-family:monospace;color:${e.red ? "#ef4444" : "#1a1a1a"}">${e.value}</td>
          </tr>
        `,
          )
          .join("")}
        <tr>
          <td style="padding:16px 24px 16px 0;font-size:16px;font-weight:900;color:#1a1a1a;text-align:right;text-transform:uppercase;letter-spacing:1px">Grand Total</td>
          <td style="padding:0;text-align:right">
            <div style="background:#ef4444;color:#fff;font-weight:900;font-size:26px;padding:12px 24px;border-radius:4px;white-space:nowrap;display:inline-block">
              ${cs}${grandTotal.toFixed(2)}
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Bank + Notes -->
    <div style="margin-top:auto;padding-top:40px;display:flex;justify-content:space-between;align-items:flex-end">
      <div style="max-width:320px">
        ${bankHtml ? `<div style="font-size:12px;color:#6b7280"><strong style="color:#1a1a1a">Payment Details</strong><br>${bankHtml}</div>` : ""}
        ${notes ? `<div style="margin-top:16px;font-size:12px;color:#6b7280"><strong>Note:</strong> ${notes}</div>` : ""}
        ${paymentTerms ? `<div style="margin-top:8px;font-size:12px;color:#6b7280"><strong>Payment Terms:</strong> ${paymentTerms}</div>` : ""}
      </div>
      <div style="text-align:right;min-width:180px">
        <div style="display:inline-block;border-top:2px solid #1a1a1a;padding-top:8px;text-align:center">
          <p style="font-size:14px;font-weight:900;text-transform:uppercase;letter-spacing:1px">Authorized</p>
          <p style="font-size:10px;color:#9ca3af;margin-top:2px">Official Signatory</p>
        </div>
      </div>
    </div>
  </div>

  <!-- FOOTER pinned bottom -->
  <div style="background:#1a1a1a;padding:14px 44px;display:flex;justify-content:space-between;align-items:center;margin-top:auto">
    <p style="color:rgba(255,255,255,0.8);font-size:12px;font-style:italic">${invoiceFooterNote}</p>
    <p style="color:rgba(255,255,255,0.4);font-size:10px">Generated by AutoInvoice</p>
  </div>

</div>
</body></html>`
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEMPLATE 5: SIMPLE BOXED / NAVY CORPORATE
    // Layout: Full dark navy header (logo left, INVOICE right), light blue-grey
    // company strip, clean 2-col billed-to/invoice-details, numbered table,
    // navy "AMOUNT DUE" box footer
    // ─────────────────────────────────────────────────────────────────────────
    if (selectedTemplate === "simple-boxed") {
      const rows = computedRows
        .map(
          (r, i) =>
            '<tr style="background:' +
            (i % 2 === 0 ? "#fff" : "#f8f9fb") +
            ';border-bottom:1px solid #edf0f5">' +
            '<td style="padding:11px 10px;font-size:12px;text-align:center;color:#6b7280;width:40px;border-right:1px solid #edf0f5">' +
            (i + 1) +
            "</td>" +
            '<td style="padding:11px 14px;font-size:12px;color:#1e2d5b">' +
            r.item.name +
            (r.item.description
              ? `<div style="font-size:10px;color:#9ca3af;margin-top:2px">${r.item.description}</div>`
              : "") +
            "</td>" +
            '<td style="padding:11px 14px;font-size:12px;text-align:center;color:#374151">' +
            r.item.quantity +
            (r.item.unit ? ` ${r.item.unit}` : "") +
            "</td>" +
            '<td style="padding:11px 14px;font-size:12px;text-align:right;font-family:monospace;color:#374151">' +
            cs +
            Number(r.item.price).toFixed(2) +
            "</td>" +
            '<td style="padding:11px 14px;font-size:12px;text-align:right;font-family:monospace;font-weight:700;color:#1e2d5b">' +
            cs +
            r.lineTotal.toFixed(2) +
            "</td>" +
            "</tr>",
        )
        .join("")

      const _sumRows = summaryEntries
        .map(
          (e) =>
            `<tr><td style="padding:5px 20px 5px 0;font-size:12px;color:#6b7280;text-align:right">${e.label}</td><td style="padding:5px 0;font-size:12px;text-align:right;font-family:monospace;color:${e.red ? "#ef4444" : "#1e2d5b"}">${e.value}</td></tr>`,
        )
        .join("")

      return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>INVOICE ${invoiceNumber}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%}body{font-family:Arial,sans-serif;background:#fff;color:#1a1a1a;font-size:13px;min-height:100%}@page{size:A4;margin:0}@media print{html,body{height:100%;-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head>
<body>
<div style="max-width:794px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;background:#fff">

  <!-- Navy header -->
  <div style="background:#1e2d5b;padding:28px 48px;display:flex;justify-content:space-between;align-items:center">
    <div>
      ${
        bizLogo
          ? `<img src="${bizLogo}" style="height:40px;max-width:110px;object-fit:contain;display:block;margin-bottom:8px">`
          : `<div style="width:40px;height:40px;background:#f47321;border-radius:4px;display:flex;align-items:center;justify-content:center;font-weight:900;color:#fff;font-size:20px;margin-bottom:8px">${bizName.charAt(0)}</div>`
      }
      <p style="color:#fff;font-weight:700;font-size:14px">${bizName}</p>
      <p style="color:rgba(255,255,255,0.55);font-size:11px">${bizTagline || bizEmail || ""}</p>
      ${bizPhone ? `<p style="color:rgba(255,255,255,0.5);font-size:10px">${bizPhone}</p>` : ""}
    </div>
    <div style="text-align:right">
      <p style="font-weight:900;font-size:38px;color:#fff;letter-spacing:4px;line-height:1">INVOICE</p>
      <p style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:8px">Ref No. ${invoiceNumber}</p>
      <p style="font-size:11px;color:rgba(255,255,255,0.6)">Date: ${invoiceDate}</p>
      ${dueDate ? `<p style="font-size:11px;color:#f47321">Due: ${dueDate}</p>` : ""}
    </div>
  </div>

  <!-- Company detail strip -->
  <div style="background:#eef1f7;padding:9px 48px;border-bottom:1px solid #dce1ed;font-size:11px;color:#6b7280">
    <strong style="color:#1e2d5b">${bizName}</strong> &nbsp;|&nbsp;
    ${[bizAddress, bizGstin ? `GSTIN: ${bizGstin}` : "", bizPhone ? `Tel: ${bizPhone}` : "", bizEmail].filter(Boolean).join("  |  ")}
  </div>

  <!-- CONTENT GROWS -->
  <div style="flex:1;padding:32px 48px 36px;display:flex;flex-direction:column">
    <!-- Billed To + Invoice Details -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:28px;padding-bottom:24px;border-bottom:1px solid #edf0f5">
      <div>
        <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin-bottom:10px">Billed To</p>
        <p style="font-weight:700;font-size:14px;color:#1e2d5b">${cd.name || "—"}</p>
        ${cd.address ? `<p style="font-size:12px;color:#6b7280;margin-top:4px;line-height:1.5">${cd.address}</p>` : ""}
        ${cd.phone ? `<p style="font-size:12px;color:#6b7280">${cd.phone}</p>` : ""}
        ${cd.email ? `<p style="font-size:12px;color:#6b7280">${cd.email}</p>` : ""}
        ${cd.gst ? `<p style="font-size:11px;color:#6b7280">GSTIN: ${cd.gst}</p>` : ""}
        ${placeOfSupply ? `<p style="font-size:10px;color:#9ca3af;margin-top:3px">Place of Supply: ${placeOfSupply}</p>` : ""}
      </div>
      <div>
        <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin-bottom:10px">Invoice Details</p>
        <table style="font-size:12px;border-collapse:collapse;width:100%">
          <tr><td style="color:#6b7280;padding-bottom:5px;width:50%">Invoice No.</td><td style="font-family:monospace;color:#1e2d5b;font-weight:600">${invoiceNumber}</td></tr>
          <tr><td style="color:#6b7280;padding-bottom:5px">Invoice Date</td><td style="color:#1e2d5b">${invoiceDate}</td></tr>
          <tr><td style="color:#6b7280;padding-bottom:5px">Currency</td><td style="color:#1e2d5b">${currency}</td></tr>
          ${poNumber ? `<tr><td style="color:#6b7280;padding-bottom:5px">PO Number</td><td style="color:#1e2d5b;font-family:monospace">${poNumber}</td></tr>` : ""}
          ${reverseCharge ? '<tr><td style="color:#6b7280">Reverse Charge</td><td style="color:#ef4444;font-weight:600">Applicable</td></tr>' : ""}
        </table>
      </div>
    </div>

    <!-- Items table -->
    <table style="width:100%;border-collapse:collapse">
      <thead><tr style="background:#1e2d5b">
        <th style="padding:11px 10px;text-align:center;font-size:11px;font-weight:600;color:#fff;width:40px">No.</th>
        <th style="padding:11px 14px;text-align:left;font-size:11px;font-weight:600;color:#fff">Description</th>
        <th style="padding:11px 14px;text-align:center;font-size:11px;font-weight:600;color:#fff">Quantity</th>
        <th style="padding:11px 14px;text-align:right;font-size:11px;font-weight:600;color:#fff">Unit Price</th>
        <th style="padding:11px 14px;text-align:right;font-size:11px;font-weight:600;color:#fff">Amount</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>

    <!-- Summary section out of table -->
    <div style="display:flex;justify-content:flex-end;margin-top:24px;margin-bottom:24px">
      <table style="border-collapse:collapse;min-width:280px">
        ${summaryEntries
          .map(
            (e) => `
          <tr>
            <td style="padding:8px 24px 8px 0;font-size:12px;color:#6b7280;text-align:right">${e.label}</td>
            <td style="padding:8px 0;font-size:12px;text-align:right;font-family:monospace;color:${e.red ? "#ef4444" : "#1e2d5b"}">${e.value}</td>
          </tr>
        `,
          )
          .join("")}
        <tr>
          <td style="padding:16px 24px 16px 0;font-size:14px;font-weight:700;color:#1e2d5b;text-align:right;border-top:2.5px solid #1e2d5b">Amount Due</td>
          <td style="padding:14px 20px;background:#1e2d5b;font-size:26px;font-weight:900;color:#fff;font-family:monospace;text-align:right;white-space:nowrap;border-radius:0 0 4px 4px">${cs}${grandTotal.toFixed(2)}</td>
        </tr>
      </table>
    </div>

    ${roundOff ? '<div style="text-align:right;font-size:10px;color:#9ca3af;margin-top:4px">* Amount rounded off</div>' : ""}

    <!-- Bank + Notes -->
    ${
      bankHtml || notes || paymentTerms
        ? '<div style="margin-top:auto;padding-top:48px;display:flex;justify-content:space-between;align-items:flex-end">' +
          '<div style="max-width:320px;font-size:12px;color:#6b7280">' +
          (bankHtml
            ? `<p style="font-weight:700;color:#1e2d5b;margin-bottom:5px">Bank / Payment Details</p><p>${bankHtml}</p>`
            : "") +
          (notes
            ? `<p style="margin-top:10px"><strong>Notes:</strong> ${notes}</p>`
            : "") +
          (paymentTerms
            ? `<p style="margin-top:4px"><strong>Payment Terms:</strong> ${paymentTerms}</p>`
            : "") +
          "</div>" +
          '<div style="text-align:right;min-width:180px">' +
          '<div style="border-top:2px solid #1e2d5b;padding-top:8px;text-align:center">' +
          '<p style="font-size:13px;font-weight:700;color:#1e2d5b">Authorized Signatory</p>' +
          '<p style="font-size:10px;color:#9ca3af;margin-top:2px">For ' +
          bizName +
          "</p>" +
          "</div>" +
          "</div>" +
          "</div>"
        : ""
    }
  </div>

  <!-- FOOTER pinned bottom -->
  <div style="background:#eef1f7;padding:14px 48px;display:flex;justify-content:space-between;align-items:center;border-top:2.5px solid #1e2d5b;margin-top:auto">
    <p style="font-size:12px;color:#6b7280;font-style:italic">${invoiceFooterNote}</p>
    <p style="font-size:10px;color:#9ca3af">Generated by AutoInvoice</p>
  </div>

</div>
</body></html>`
    }

    // ── IMPORTED ────────────────────────────────────────────────────────────
    if (selectedTemplate === "imported" && importedTemplate?.html) {
      return importedTemplate.html
    }
    // ── FALLBACK (clean-teal) ────────────────────────────────────────────────
    const rows = computedRows
      .map(
        (r, i) =>
          '<tr style="border-bottom:1px solid #e2e8f0;background:' +
          (i % 2 === 0 ? "#fff" : "#f0fdfe") +
          '">' +
          '<td style="padding:8px 10px;font-size:11px;text-align:center;border-right:1px solid #e2e8f0;color:#555">' +
          (i + 1) +
          "</td>" +
          '<td style="padding:8px 12px;font-size:12px;color:#1a1a1a">' +
          r.item.name +
          "</td>" +
          '<td style="padding:8px 12px;font-size:12px;text-align:right;color:#1a1a1a">' +
          cs +
          r.lineTotal.toFixed(2) +
          "</td>" +
          "</tr>",
      )
      .join("")
    return (
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>INVOICE ' +
      invoiceNumber +
      '</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;background:#fff;font-size:13px}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body><div style="max-width:800px;margin:0 auto;padding:36px">' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:28px"><p style="font-size:48px;font-weight:900;color:#0E7490;letter-spacing:-2px;line-height:1">INVOICE</p><div style="text-align:right;border:1px solid #e2e8f0;padding:10px 16px;font-size:11px"><div><span style="color:#94a3b8">Date:</span> ' +
      invoiceDate +
      '</div><div><span style="color:#94a3b8">Invoice No:</span> ' +
      invoiceNumber +
      "</div></div></div>" +
      '<table style="width:100%;border-collapse:collapse;border:1px solid #cbd5e1"><thead><tr style="background:#0E7490;color:#fff"><th style="padding:9px 10px;font-size:11px;text-align:center;width:36px">SL</th><th style="padding:9px 12px;font-size:11px;text-align:left">Description</th><th style="padding:9px 12px;font-size:11px;text-align:right">Amount</th></tr></thead><tbody>' +
      rows +
      '<tr style="border-top:2px solid #0E7490"><td colspan="2" style="padding:10px 12px;font-size:12px;font-weight:700;text-align:right">Total</td><td style="padding:10px 12px;font-size:13px;font-weight:800;text-align:right;color:#0E7490">' +
      cs +
      grandTotal.toFixed(2) +
      "</td></tr></tbody></table>" +
      '<div style="margin-top:16px;text-align:center;font-size:10px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:10px">' +
      invoiceFooterNote +
      " &bull; Generated by AutoInvoice</div>" +
      "</div></body></html>"
    )
  }

  const printInvoice = () => {
    const html = buildInvoiceHtml()

    const iframe = document.createElement("iframe")
    iframe.style.display = "none"
    document.body.appendChild(iframe)
    const doc = iframe.contentDocument || iframe.contentWindow.document

    doc.open()
    doc.write(html)
    doc.close()

    iframe.contentWindow.focus()
    setTimeout(() => {
      iframe.contentWindow.print()
      setTimeout(() => {
        document.body.removeChild(iframe)
      }, 1000)
    }, 500)
  }

  const handleDownloadPDF = () => {
    printInvoice()
  }

  const handlePreviewAndPrint = () => {
    setPreviewOpen(true)
  }

  const handleWhatsApp = async () => {
    // 1. Validate invoice has items
    const activeItems = items.filter(
      (i) => i.name || i.description || i.price > 0,
    )
    if (activeItems.length === 0) {
      showErrorToast("Please add at least one item before sharing.")
      return
    }

    const html = buildInvoiceHtml()
    const filename = `${invoiceNumber}.pdf`

    // 2. Prepare professional text summary (needed for fallback)
    let text = `*INVOICE ${invoiceNumber}*\n`
    text += `*Customer:* ${customerDetails.name || "N/A"}\n`
    text += `*Date:* ${invoiceDate}\n`
    text += `*Grand Total: ${currencySymbol}${grandTotal.toFixed(2)}*\n`
    text += `--------------------------\n`

    activeItems.forEach((item) => {
      text += `• ${item.name || "Item"} (${item.quantity} x ${currencySymbol}${item.price.toFixed(2)}) = ${currencySymbol}${(item.quantity * item.price).toFixed(2)}\n`
    })
    text += `--------------------------\n`
    text += `\n_Please find the detailed PDF attached._`

    // Try Web Share API (Mobile/Modern Browsers)
    if (typeof navigator !== "undefined" && navigator.share) {
      showSuccessToast("Generating PDF for sharing...")
      try {
        const opt = {
          margin: 0,
          filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        }

        const pdfBlob = await html2pdf().set(opt).from(html).output("blob")
        const file = new File([pdfBlob], filename, { type: "application/pdf" })

        // Attempt to share the actual file if possible
        try {
          await navigator.share({
            files: [file],
            title: `Invoice ${invoiceNumber}`,
            text: `Invoice ${invoiceNumber} from ${companyDetails.name || "AutoInvoice"}`,
          })
          return
        } catch (_shareErr) {
          // Fallback to text share if file share fails/unsupported
          await navigator.share({
            title: `Invoice ${invoiceNumber}`,
            text: text,
          })
          return
        }
      } catch (err) {
        console.error("Native Share failed:", err)
      }
    }

    // Desktop/Fallback: WhatsApp Link
    if (typeof navigator !== "undefined" && !navigator.share) {
      showSuccessToast(
        "Summary shared. On Desktop, please download and attach PDF manually.",
      )
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
  }

  const handleEmail = async () => {
    if (!customerDetails.email) {
      showErrorToast("Please provide a customer email first")
      return
    }

    const html = buildInvoiceHtml()
    const finalSubject = `Invoice ${invoiceNumber} from ${companyDetails.name || "AutoInvoice"}`
    const apiUrl = OpenAPI.BASE || ""

    try {
      showSuccessToast("Sending invoice via email...")
      await axios.post(`${apiUrl}/api/v1/utils/send-invoice/`, {
        email_to: customerDetails.email,
        subject: finalSubject,
        html_content: html,
      })
      showSuccessToast(`Invoice successfully sent to ${customerDetails.email}`)
      return
    } catch (err) {
      console.error("Email API failed:", err)
      // Fallback to mailto
      const mailBody = `Dear ${customerDetails.name},\n\nPlease find your invoice ${invoiceNumber} for ${currencySymbol}${grandTotal.toFixed(2)} attached.\n\nDue Date: ${dueDate || "N/A"}\n\nThank you for choosing ${companyDetails.name || "AutoInvoice"}.`
      window.open(
        `mailto:${customerDetails.email}?subject=${encodeURIComponent(finalSubject)}&body=${encodeURIComponent(mailBody)}`,
      )
      return
    }

    // cleanup
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
                      setCustomerDetails((p) => ({
                        ...p,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Customer name"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={customerDetails.phone}
                    onChange={(e) =>
                      setCustomerDetails((p) => ({
                        ...p,
                        phone: e.target.value,
                      }))
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
                      setCustomerDetails((p) => ({
                        ...p,
                        email: e.target.value,
                      }))
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
                    setCustomerDetails((p) => ({
                      ...p,
                      address: e.target.value,
                    }))
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
                      <span
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${reverseCharge ? "left-5" : "left-0.5"}`}
                      />
                    </button>
                    <span className="text-xs text-muted-foreground">
                      {reverseCharge ? "Applicable" : "Not Applicable"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items Table - Advanced Excel Style */}
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg">Invoice Items</CardTitle>
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
              />
            </CardContent>
          </Card>

          {/* Invoice-level Adjustments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Adjustments &amp; Charges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Invoice discount */}
                <div>
                  <Label className="flex items-center gap-1">
                    <Percent className="h-3 w-3" /> Invoice Discount
                  </Label>
                  <div className="flex gap-1 mt-1">
                    <Select
                      value={discountType}
                      onValueChange={setDiscountType}
                    >
                      <SelectTrigger className="w-20 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">%</SelectItem>
                        <SelectItem value="flat">₹ Flat</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={discountValue === 0 ? "" : discountValue}
                      placeholder="0"
                      onChange={(e) =>
                        setDiscountValue(Number(e.target.value) || 0)
                      }
                      className="flex-1 h-9"
                    />
                  </div>
                </div>
                {/* Shipping */}
                <div>
                  <Label className="flex items-center gap-1">
                    <Truck className="h-3 w-3" /> Shipping / Freight
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={shippingCharge === 0 ? "" : shippingCharge}
                    placeholder="0.00"
                    onChange={(e) =>
                      setShippingCharge(Number(e.target.value) || 0)
                    }
                    className="mt-1 h-9"
                  />
                </div>
                {/* Extra charge */}
                <div>
                  <Label className="flex items-center gap-1">
                    <PackagePlus className="h-3 w-3" /> Other Charges
                  </Label>
                  <div className="flex gap-1 mt-1">
                    <Input
                      value={extraChargeLabel}
                      onChange={(e) => setExtraChargeLabel(e.target.value)}
                      placeholder="Label"
                      className="flex-1 h-9 text-xs"
                    />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={extraChargeAmount === 0 ? "" : extraChargeAmount}
                      placeholder="0.00"
                      onChange={(e) =>
                        setExtraChargeAmount(Number(e.target.value) || 0)
                      }
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
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${roundOff ? "left-5" : "left-0.5"}`}
                  />
                </button>
                <Label
                  className="cursor-pointer"
                  onClick={() => setRoundOff((v) => !v)}
                >
                  Round off grand total to nearest ₹
                </Label>
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
                <CardTitle className="text-lg">
                  Bank &amp; Payment Details
                </CardTitle>
                {showBankDetails ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </CardHeader>
            {showBankDetails && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Bank Name</Label>
                    <Input
                      value={bankDetails.bankName}
                      onChange={(e) =>
                        setBankDetails((p) => ({
                          ...p,
                          bankName: e.target.value,
                        }))
                      }
                      placeholder="e.g. HDFC Bank"
                    />
                  </div>
                  <div>
                    <Label>Account Holder Name</Label>
                    <Input
                      value={bankDetails.accountName}
                      onChange={(e) =>
                        setBankDetails((p) => ({
                          ...p,
                          accountName: e.target.value,
                        }))
                      }
                      placeholder="Name on account"
                    />
                  </div>
                  <div>
                    <Label>Account Number</Label>
                    <Input
                      value={bankDetails.accountNumber}
                      onChange={(e) =>
                        setBankDetails((p) => ({
                          ...p,
                          accountNumber: e.target.value,
                        }))
                      }
                      placeholder="XXXXXXXXXXXX"
                    />
                  </div>
                  <div>
                    <Label>IFSC Code</Label>
                    <Input
                      value={bankDetails.ifsc}
                      onChange={(e) =>
                        setBankDetails((p) => ({ ...p, ifsc: e.target.value }))
                      }
                      placeholder="e.g. HDFC0000123"
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <Label>Branch</Label>
                    <Input
                      value={bankDetails.branch}
                      onChange={(e) =>
                        setBankDetails((p) => ({
                          ...p,
                          branch: e.target.value,
                        }))
                      }
                      placeholder="Branch name"
                    />
                  </div>
                  <div>
                    <Label>UPI ID</Label>
                    <Input
                      value={bankDetails.upi}
                      onChange={(e) =>
                        setBankDetails((p) => ({ ...p, upi: e.target.value }))
                      }
                      placeholder="yourname@upi"
                    />
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
                <span>
                  {currencySymbol}
                  {subtotal.toFixed(2)}
                </span>
              </div>
              {itemsDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Item Discounts</span>
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
                    {Math.round(grandTotal) - grandTotal >= 0 ? "+" : ""}
                    {(Math.round(grandTotal) - grandTotal).toFixed(2)}
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
            style={{ minHeight: "65vh" }}
            sandbox="allow-same-origin"
          />
          <div className="flex justify-end gap-2 mt-3">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
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
