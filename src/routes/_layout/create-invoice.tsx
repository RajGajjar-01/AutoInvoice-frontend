import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { OpenAPI } from "@/client"
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
import {
  Form,
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
import { Separator } from "@/components/ui/separator"
import {
  customersListQueryOptions,
  customersQueryKeys,
} from "@/features/customers/queries"
import { invoiceTemplateActiveQueryOptions } from "@/features/invoice-templates/queries"
import { invoicesQueryKeys } from "@/features/invoices/queries"
import useCustomToast from "@/hooks/useCustomToast"
import useLocalStorage from "@/hooks/useLocalStorage"
import { api } from "@/lib/api"
import { queryClient } from "@/queryClient"

export const Route = createFileRoute("/_layout/create-invoice")({
  component: CreateInvoicePage,
  validateSearch: (search: Record<string, unknown>) => ({
    customerId: search.customerId ? String(search.customerId) : undefined,
    itemId: search.itemId ? String(search.itemId) : undefined,
    documentType: (search.documentType as string) || "invoice",
  }),
  head: () => ({
    meta: [{ title: "Create Invoice" }],
  }),
})

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
}

interface InventoryItem {
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

function generateInvoiceNumber(): string {
  const now = new Date()
  const y = now.getFullYear().toString().slice(-2)
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const r = String(Math.floor(Math.random() * 9000) + 1000)
  return `INV-${y}${m}-${r}`
}

const emptyItem: InvoiceItem = {
  name: "",
  description: "",
  quantity: 0,
  price: 0,
  tax: 0,
}

function CreateInvoicePage() {
  const [inventoryItems, setInventoryItems] = useLocalStorage<InventoryItem[]>(
    "items",
    [],
  )
  const [companyDetails] = useLocalStorage<CompanyDetails>(
    "company-details",
    {},
  )
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const savedRef = useRef<boolean>(false)
  const {
    customerId: preselectedCustomerId,
    itemId: preselectedItemId,
    documentType,
  } = Route.useSearch()

  const { data: activeTemplate } = useQuery(invoiceTemplateActiveQueryOptions())

  const selectedTemplate =
    activeTemplate?.kind === "built_in"
      ? activeTemplate?.built_in_id
      : activeTemplate?.kind === "custom"
        ? "custom"
        : activeTemplate?.kind === "imported_html" ||
            activeTemplate?.kind === "imported_pdf" ||
            activeTemplate?.kind === "imported_excel"
          ? "imported"
          : "clean-teal"

  const { data: customersRes } = useQuery(customersListQueryOptions())
  const customers: Customer[] = customersRes?.data ?? []

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("")
  const [invoiceNumber] = useState<string>(generateInvoiceNumber)
  const [items, setItems] = useState<InvoiceItem[]>([{ ...emptyItem }])
  const [showBankDetails, setShowBankDetails] = useState<boolean>(false)
  const [previewOpen, setPreviewOpen] = useState<boolean>(false)

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
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
      discountValue: "",
      shippingCharge: "",
      extraChargeLabel: "Handling Charges",
      extraChargeAmount: "",
      roundOff: false,
      bankName: "",
      accountName: "",
      accountNumber: "",
      ifsc: "",
      branch: "",
      upi: "",
      notes: "",
      paymentTerms: "",
    },
  })

  const discountType = form.watch("discountType")
  const discountValue = form.watch("discountValue") || 0
  const shippingCharge = form.watch("shippingCharge") || 0
  const extraChargeAmount = form.watch("extraChargeAmount") || 0
  const extraChargeLabel = form.watch("extraChargeLabel") || "Handling Charges"
  const roundOff = form.watch("roundOff") || false
  const currency = form.watch("currency")

  const createCustomerMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      return CustomersService.createCustomer({
        requestBody: payload,
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: customersQueryKeys.all })
    },
  })

  const createInvoiceMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      return InvoicesService.createInvoice({
        requestBody: payload,
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: invoicesQueryKeys.all })
    },
  })

  const handleCustomerSelect = useCallback(
    (value: string) => {
      setSelectedCustomerId(value)
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
    },
    [customers, form],
  )

  const handleItemSelect = useCallback(
    (index: number, itemId: string) => {
      const invItem = inventoryItems.find((i) => i.id === itemId)
      if (!invItem) return

      setItems((prev) =>
        prev.map((item, i) =>
          i === index
            ? {
                ...item,
                itemId: invItem.id,
                name: invItem.name,
                description: invItem.description || "",
                price: invItem.salePrice || 0,
                tax: invItem.taxRate || 0,
                unit: invItem.unit || "pcs",
              }
            : item,
        ),
      )
    },
    [inventoryItems],
  )

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
  }, [
    preselectedCustomerId,
    preselectedItemId,
    customers.length,
    inventoryItems.length,
    items.length,
    items[0].name,
    handleCustomerSelect,
    handleItemSelect,
  ])

  const addItem = () => setItems((prev) => [...prev, { ...emptyItem }])
  const removeItem = (index: number) =>
    setItems((prev) => prev.filter((_, i) => i !== index))

  const updateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number,
  ) => {
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

  const buildInvoiceData = (
    formData: InvoiceFormData,
  ): Record<string, unknown> => ({
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
  })

  const onSubmit = async (formData: InvoiceFormData) => {
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
          name: formData.customerName,
          phone: formData.customerPhone || null,
          email: formData.customerEmail || null,
          address: formData.customerAddress || null,
          gst: formData.customerGst ? formData.customerGst.toUpperCase() : null,
          notes: formData.notes || null,
        })
        customerId = created.id
        setSelectedCustomerId(created.id)
      }

      const payload = buildInvoiceData(formData)
      payload.customer_id = customerId

      await createInvoiceMutation.mutateAsync(payload)

      showSuccessToast("Invoice saved successfully")
    } catch (_err) {
      showErrorToast("Failed to save invoice")
    }

    let _stockDeducted = false
    setInventoryItems((prev) => {
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
        _stockDeducted = true
      })
      return newInventory
    })

    setTimeout(() => {
      savedRef.current = false
    }, 1000)
  }

  const buildInvoiceHtml = (): string => {
    const formData = form.getValues()
    const cs = currencySymbol
    const cd = {
      name: formData.customerName,
      address: formData.customerAddress,
      gst: formData.customerGst,
      phone: formData.customerPhone,
      email: formData.customerEmail,
    }
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

    const activeBankDetails: BankDetails | null = showBankDetails
      ? {
          bankName: formData.bankName || "",
          accountName: formData.accountName || "",
          accountNumber: formData.accountNumber || "",
          ifsc: formData.ifsc || "",
          branch: formData.branch || "",
          upi: formData.upi || "",
        }
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

    interface ComputedRow {
      item: InvoiceItem
      idx: number
      lineBase: number
      disc: number
      taxable: number
      lineTax: number
      lineTotal: number
    }

    const computedRows: ComputedRow[] = validItems.map((item, idx) => {
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

    interface SummaryEntry {
      label: string
      value: string
      red?: boolean
    }

    const summaryEntries: (SummaryEntry | null)[] = [
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
    ].filter(Boolean) as SummaryEntry[]

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

    const notes = formData.notes || ""
    const paymentTerms = formData.paymentTerms || ""
    const invoiceDate = formData.invoiceDate
    const dueDate = formData.dueDate
    const poNumber = formData.poNumber
    const placeOfSupply = formData.placeOfSupply

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
  <div style="flex:1;padding:48px 52px 32px;display:flex;flex-direction:column">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:36px">
      <p style="font-size:56px;font-weight:900;color:#0E7490;letter-spacing:-3px;line-height:1">INVOICE</p>
      <div style="text-align:right;border:1px solid #e2e8f0;padding:14px 18px;font-size:12px;color:#555;min-width:200px">
        <div style="margin-bottom:6px"><span style="color:#94a3b8">Date:</span> ${invoiceDate}</div>
        <div style="margin-bottom:6px"><span style="color:#94a3b8">Invoice No:</span> ${invoiceNumber}</div>
        ${dueDate ? `<div style="margin-bottom:4px"><span style="color:#94a3b8">Due:</span> ${dueDate}</div>` : ""}
        ${poNumber ? `<div><span style="color:#94a3b8">PO #:</span> ${poNumber}</div>` : ""}
      </div>
    </div>
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
    <table style="width:100%;border-collapse:collapse;border:1px solid #cbd5e1">
      <thead><tr style="background:#0E7490;color:#fff">
        <th style="padding:11px 10px;font-size:11px;text-align:center;width:40px">SL</th>
        <th style="padding:11px 14px;font-size:11px;text-align:left">DESCRIPTION</th>
        <th style="padding:11px 14px;font-size:11px;text-align:right">AMOUNT</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="display:flex;justify-content:flex-end;margin-top:20px;margin-bottom:20px">
      <table style="border-collapse:collapse;min-width:240px">
        ${summaryEntries.map((e) => `<tr><td style="padding:6px 20px 6px 0;font-size:12px;color:#64748b;text-align:right">${e.label}</td><td style="padding:6px 0;font-size:12px;text-align:right;font-family:monospace;color:${e.red ? "#ef4444" : "#1a1a1a"}">${e.value}</td></tr>`).join("")}
        <tr>
          <td style="padding:12px 20px 12px 0;font-size:14px;font-weight:700;color:#0E7490;text-align:right;border-top:2px solid #0E7490">Grand Total</td>
          <td style="padding:12px 0;font-size:24px;font-weight:900;color:#0E7490;text-align:right;font-family:monospace;border-top:2px solid #0E7490">${cs}${grandTotal.toFixed(2)}</td>
        </tr>
      </table>
    </div>
    ${noteHtml ? `<div style="padding:12px;font-size:11px;border:1px solid #e2e8f0;background:#f8fafc;margin-bottom:20px"><strong>Note:</strong> ${notes || paymentTerms}</div>` : ""}
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
  <div style="background:#0E7490;padding:14px 52px;display:flex;justify-content:space-between;align-items:center;margin-top:auto">
    <p style="color:rgba(255,255,255,0.9);font-size:12px;font-style:italic">${invoiceFooterNote}</p>
    <p style="color:rgba(255,255,255,0.55);font-size:10px">Generated by AutoInvoice</p>
  </div>
</div>
</body></html>`
    }

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

      return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>INVOICE ${invoiceNumber}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%}body{font-family:Arial,sans-serif;background:#fff;color:#1a1a1a;font-size:13px;min-height:100%}@page{size:A4;margin:0}@media print{html,body{height:100%;-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head>
<body>
<div style="max-width:794px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;background:#fff;position:relative;overflow:hidden">
  <div style="position:fixed;top:0;right:0;width:0;height:0;border-left:90px solid transparent;border-top:90px solid #0F766E;pointer-events:none"></div>
  <div style="position:fixed;top:0;right:50px;width:0;height:0;border-left:45px solid transparent;border-top:45px solid #EC4899;pointer-events:none"></div>
  <div style="position:fixed;bottom:0;left:0;width:0;height:0;border-right:70px solid transparent;border-bottom:70px solid #EC4899;pointer-events:none"></div>
  <div style="flex:1;padding:52px 52px 36px;display:flex;flex-direction:column">
    <p style="font-size:48px;font-weight:900;letter-spacing:-2px;color:#1a1a1a;margin-bottom:36px;line-height:1">INVOICE</p>
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
    <div style="display:flex;justify-content:flex-end;margin-top:20px;margin-bottom:20px">
      <table style="border-collapse:collapse;min-width:260px">
        ${summaryEntries.map((e) => `<tr><td style="padding:6px 20px 6px 0;font-size:12px;color:#64748b;text-align:right">${e.label}</td><td style="padding:6px 0;font-size:12px;text-align:right;font-family:monospace;color:${e.red ? "#ef4444" : "#1a1a1a"}">${e.value}</td></tr>`).join("")}
        <tr>
          <td style="padding:12px 20px 12px 0;font-size:14px;font-weight:700;color:#1a1a1a;text-align:right;border-top:1.5px solid #e2e8f0">Grand Total</td>
          <td style="padding:12px 0;font-size:24px;font-weight:900;color:#0F766E;text-align:right;font-family:monospace;border-top:1.5px solid #e2e8f0">${cs}${grandTotal.toFixed(2)}</td>
        </tr>
      </table>
    </div>
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
  <div style="background:#0F766E;padding:14px 52px;display:flex;justify-content:space-between;align-items:center;margin-top:auto;position:relative;z-index:2">
    <p style="color:rgba(255,255,255,0.9);font-size:12px;font-style:italic">${invoiceFooterNote}</p>
    <p style="color:rgba(255,255,255,0.55);font-size:10px">Generated by AutoInvoice</p>
  </div>
</div>
</body></html>`
    }

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

      return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>INVOICE ${invoiceNumber}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%}body{font-family:Arial,sans-serif;background:#fff;color:#1a1a1a;font-size:13px;min-height:100%}@page{size:A4;margin:0}@media print{html,body{height:100%;-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head>
<body>
<div style="max-width:794px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;background:#fff">
  <div style="flex:1;padding:48px 52px 36px;display:flex;flex-direction:column">
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
    <table style="width:100%;border-collapse:collapse">
      <thead><tr style="border-top:2.5px solid #1a1a1a;border-bottom:2.5px solid #1a1a1a;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">
        <th style="padding:11px 14px;text-align:left">DESCRIPTION</th>
        <th style="padding:11px 14px;text-align:right">UNIT PRICE</th>
        <th style="padding:11px 14px;text-align:right">QTY</th>
        <th style="padding:11px 14px;text-align:right">TOTAL</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="display:flex;justify-content:flex-end;margin-top:20px;margin-bottom:20px">
      <table style="border-collapse:collapse;min-width:240px">
        ${summaryEntries.map((e) => `<tr><td style="padding:6px 24px 6px 0;font-size:12px;color:#6b7280;text-align:right;text-transform:uppercase;letter-spacing:1px">${e.label}</td><td style="padding:6px 0;font-size:12px;text-align:right;font-family:monospace;color:${e.red ? "#ef4444" : "#1a1a1a"}">${e.value}</td></tr>`).join("")}
      </table>
    </div>
    <div style="border-top:2.5px solid #1a1a1a;border-bottom:2.5px solid #1a1a1a;padding:12px 0;display:flex;justify-content:space-between;font-weight:900;font-size:24px;margin-top:0">
      <span style="letter-spacing:2px">AMOUNT DUE</span><span style="font-family:monospace">${cs}${grandTotal.toFixed(2)}</span>
    </div>
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
  <div style="border-top:2px solid #1a1a1a;padding:12px 52px;display:flex;justify-content:space-between;align-items:center;background:#f9fafb;margin-top:auto">
    <p style="font-size:12px;color:#6b7280">${bizName} &bull; ${bizEmail || bizPhone}</p>
    <p style="font-size:10px;color:#9ca3af">Generated by AutoInvoice</p>
  </div>
</div>
</body></html>`
    }

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
  <p style="text-align:center;font-weight:900;font-size:30px;letter-spacing:8px;padding:14px 0;border-bottom:1px solid #e5e7eb;margin:0">INVOICE</p>
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
  <div style="flex:1;padding:0 44px 36px;display:flex;flex-direction:column">
    <table style="width:100%;border-collapse:collapse;margin-top:20px">
      <thead><tr style="background:#f3f4f6;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280">
        <th style="padding:11px 14px;text-align:left">Description</th>
        <th style="padding:11px 14px;text-align:center">Qty</th>
        <th style="padding:11px 14px;text-align:right">Price</th>
        <th style="padding:11px 14px;text-align:right">Total</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="display:flex;justify-content:flex-end;margin-top:24px;margin-bottom:24px">
      <table style="border-collapse:collapse;min-width:280px">
        ${summaryEntries.map((e) => `<tr><td style="padding:6px 24px 6px 0;font-size:12px;color:#6b7280;text-align:right;text-transform:uppercase;letter-spacing:1px">${e.label}</td><td style="padding:6px 0;font-size:12px;text-align:right;font-family:monospace;color:${e.red ? "#ef4444" : "#1a1a1a"}">${e.value}</td></tr>`).join("")}
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
  <div style="background:#1a1a1a;padding:14px 44px;display:flex;justify-content:space-between;align-items:center;margin-top:auto">
    <p style="color:rgba(255,255,255,0.9);font-size:12px">${invoiceFooterNote}</p>
    <p style="color:rgba(255,255,255,0.55);font-size:10px">Generated by AutoInvoice</p>
  </div>
</div>
</body></html>`
    }

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
    const doc = iframe.contentDocument || iframe.contentWindow?.document

    if (!doc) return

    doc.open()
    doc.write(html)
    doc.close()

    iframe.contentWindow?.focus()
    setTimeout(() => {
      iframe.contentWindow?.print()
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
    const activeItems = items.filter(
      (i) => i.name || i.description || i.price > 0,
    )
    if (activeItems.length === 0) {
      showErrorToast("Please add at least one item before sharing.")
      return
    }

    const html = buildInvoiceHtml()
    const filename = `${invoiceNumber}.pdf`
    const formData = form.getValues()

    let text = `*INVOICE ${invoiceNumber}*\n`
    text += `*Customer:* ${formData.customerName || "N/A"}\n`
    text += `*Date:* ${formData.invoiceDate}\n`
    text += `*Grand Total: ${currencySymbol}${grandTotal.toFixed(2)}*\n`
    text += `--------------------------\n`

    activeItems.forEach((item) => {
      text += `• ${item.name || "Item"} (${item.quantity} x ${currencySymbol}${item.price.toFixed(2)}) = ${currencySymbol}${(item.quantity * item.price).toFixed(2)}\n`
    })
    text += `--------------------------\n`
    text += `\n_Please find the detailed PDF attached._`

    if (typeof navigator !== "undefined" && navigator.share) {
      showSuccessToast("Generating PDF for sharing...")
      try {
        const opt = {
          margin: 0,
          filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: {
            unit: "mm",
            format: "a4" as const,
            orientation: "portrait" as const,
          },
        }

        const pdfBlob = await html2pdf().set(opt).from(html).output("blob")
        const file = new File([pdfBlob], filename, { type: "application/pdf" })

        try {
          await navigator.share({
            files: [file],
            title: `Invoice ${invoiceNumber}`,
            text: `Invoice ${invoiceNumber} from ${companyDetails.name || "AutoInvoice"}`,
          })
          return
        } catch (_shareErr) {
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

    if (typeof navigator !== "undefined" && !navigator.share) {
      showSuccessToast(
        "Summary shared. On Desktop, please download and attach PDF manually.",
      )
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
  }

  const handleEmail = async () => {
    const formData = form.getValues()
    if (!formData.customerEmail) {
      showErrorToast("Please provide a customer email first")
      return
    }

    const html = buildInvoiceHtml()
    const finalSubject = `Invoice ${invoiceNumber} from ${companyDetails.name || "AutoInvoice"}`
    const apiUrl = OpenAPI.BASE || ""

    try {
      showSuccessToast("Sending invoice via email...")
      await api.post(`${apiUrl}/api/v1/utils/send-invoice/`, {
        email_to: formData.customerEmail,
        subject: finalSubject,
        html_content: html,
      })
      showSuccessToast(`Invoice successfully sent to ${formData.customerEmail}`)
      return
    } catch (err) {
      console.error("Email API failed:", err)
      const mailBody = `Dear ${formData.customerName},\n\nPlease find your invoice ${invoiceNumber} for ${currencySymbol}${grandTotal.toFixed(2)} attached.\n\nDue Date: ${formData.dueDate || "N/A"}\n\nThank you for choosing ${companyDetails.name || "AutoInvoice"}.`
      window.open(
        `mailto:${formData.customerEmail}?subject=${encodeURIComponent(finalSubject)}&body=${encodeURIComponent(mailBody)}`,
      )
      return
    }
  }

  return (
    <div className="flex flex-col gap-6">
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
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Customer</Label>
                  <Select
                    value={selectedCustomerId}
                    onValueChange={handleCustomerSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__new__">
                        + Add New Customer
                      </SelectItem>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
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
                            onChange={(e) =>
                              field.onChange(e.target.value.toUpperCase())
                            }
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Invoice Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <FormItem>
                    <FormLabel>Invoice Number</FormLabel>
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
                          Invoice Date{" "}
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
                              className={`relative w-10 h-5 rounded-full transition-colors ${field.value ? "bg-primary" : "bg-muted"}`}
                            >
                              <span
                                className={`absolute top-0.5 w-4 h-4 rounded-full bg-background shadow transition-all ${field.value ? "left-5" : "left-0.5"}`}
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
              </CardContent>
            </Card>

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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Adjustments &amp; Charges
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
                            className={`relative w-10 h-5 rounded-full transition-colors ${field.value ? "bg-primary" : "bg-muted"}`}
                          >
                            <span
                              className={`absolute top-0.5 w-4 h-4 rounded-full bg-background shadow transition-all ${field.value ? "left-5" : "left-0.5"}`}
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
                            <Input {...field} placeholder="XXXXXXXXXXXX" />
                          </FormControl>
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
                              placeholder="e.g. HDFC0000123"
                              className="font-mono"
                            />
                          </FormControl>
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
                            <Input {...field} placeholder="yourname@upi" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes & Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Any additional notes to display on the invoice"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Terms</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. Net 30, Due on receipt"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

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
                    type="button"
                    className="w-full"
                    variant="outline"
                    onClick={handlePreviewAndPrint}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview Invoice
                  </Button>
                  <Button type="submit" className="w-full">
                    <Save className="mr-2 h-4 w-4" />
                    Save Invoice
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

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
          </DialogHeader>
          <iframe
            title="invoice-preview"
            srcDoc={previewOpen ? buildInvoiceHtml() : ""}
            className="w-full flex-1 rounded-md border bg-background"
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
