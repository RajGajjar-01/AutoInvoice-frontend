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
import { useState, useMemo, useRef } from "react"
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
  const [customers] = useLocalStorage("customers", [])
  const [, setInvoices] = useLocalStorage("invoices", [])
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const savedRef = useRef(false)

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
        address: c.address || "",
        gst: c.gst || "",
        phone: c.phone || "",
        email: c.email || "",
      })
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
    showSuccessToast("Invoice saved successfully")
    // Reset guard after short delay so user can save again if needed
    setTimeout(() => { savedRef.current = false }, 1000)
  }

  const printInvoice = () => {
    const cs = currencySymbol
    const itemRows = items
      .filter((i) => i.name)
      .map(
        (item) => `
        <tr>
          <td>${item.name}</td>
          <td>${item.description || ''}</td>
          <td style="text-align:right">${item.quantity}</td>
          <td style="text-align:right">${cs}${Number(item.price).toFixed(2)}</td>
          <td style="text-align:right">${item.tax}%</td>
          <td style="text-align:right;font-weight:600">${cs}${(item.quantity * item.price * (1 + item.tax / 100)).toFixed(2)}</td>
        </tr>`,
      )
      .join("")

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${invoiceNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1a1a1a; padding: 32px; background: white; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 3px solid #217346; padding-bottom: 20px; }
    .header h1 { font-size: 28px; font-weight: 800; color: #217346; letter-spacing: 2px; }
    .header .inv-num { color: #666; font-size: 12px; margin-top: 4px; }
    .header .company { text-align: right; font-weight: 600; }
    .header .company p { color: #666; font-size: 12px; font-weight: 400; }
    .parties { display: flex; justify-content: space-between; margin-bottom: 28px; }
    .bill-to h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 6px; }
    .bill-to p { font-size: 13px; }
    .bill-to .name { font-weight: 700; font-size: 15px; }
    .bill-to .muted { color: #666; }
    .inv-meta { text-align: right; }
    .inv-meta table { margin-left: auto; }
    .inv-meta td:first-child { color: #888; padding-right: 12px; text-align: right; }
    .inv-meta td:last-child { font-weight: 600; }
    table.items { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    table.items thead tr { background: #217346; color: white; }
    table.items thead th { padding: 9px 10px; text-align: left; font-size: 12px; font-weight: 600; }
    table.items thead th:nth-child(n+3) { text-align: right; }
    table.items tbody tr:nth-child(even) { background: #f6faf8; }
    table.items tbody td { padding: 8px 10px; border-bottom: 1px solid #e5e5e5; }
    .totals { display: flex; justify-content: flex-end; margin-bottom: 24px; }
    .totals table { min-width: 220px; }
    .totals td { padding: 4px 6px; }
    .totals td:first-child { color: #666; }
    .totals td:last-child { text-align: right; font-weight: 500; }
    .totals .grand td { border-top: 2px solid #217346; padding-top: 8px; font-size: 16px; font-weight: 800; color: #217346; }
    .notes { background: #f6faf8; border-left: 4px solid #217346; padding: 12px 16px; margin-bottom: 24px; }
    .notes h4 { font-weight: 700; margin-bottom: 4px; font-size: 12px; }
    .notes p { color: #555; font-size: 12px; }
    .footer { text-align: center; color: #aaa; font-size: 11px; border-top: 1px solid #e5e5e5; padding-top: 16px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>INVOICE</h1>
      <div class="inv-num">${invoiceNumber}</div>
    </div>
    <div class="company">
      AutoInvoice
      <p>Your Company</p>
    </div>
  </div>
  <div class="parties">
    <div class="bill-to">
      <h4>Bill To</h4>
      <p class="name">${customerDetails.name || '—'}</p>
      ${customerDetails.address ? `<p class="muted">${customerDetails.address}</p>` : ''}
      ${customerDetails.phone ? `<p class="muted">${customerDetails.phone}</p>` : ''}
      ${customerDetails.email ? `<p class="muted">${customerDetails.email}</p>` : ''}
      ${customerDetails.gst ? `<p class="muted">GST: ${customerDetails.gst}</p>` : ''}
    </div>
    <div class="inv-meta">
      <table>
        <tr><td>Invoice #</td><td>${invoiceNumber}</td></tr>
        <tr><td>Date</td><td>${invoiceDate}</td></tr>
        ${dueDate ? `<tr><td>Due Date</td><td>${dueDate}</td></tr>` : ''}
        <tr><td>Currency</td><td>${currency}</td></tr>
      </table>
    </div>
  </div>
  <table class="items">
    <thead>
      <tr>
        <th>Item</th><th>Description</th>
        <th style="text-align:right">Qty</th>
        <th style="text-align:right">Price</th>
        <th style="text-align:right">Tax</th>
        <th style="text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>
  <div class="totals">
    <table>
      <tr><td>Subtotal</td><td>${cs}${subtotal.toFixed(2)}</td></tr>
      <tr><td>Tax / GST</td><td>${cs}${totalTax.toFixed(2)}</td></tr>
      <tr class="grand"><td>Grand Total</td><td>${cs}${grandTotal.toFixed(2)}</td></tr>
    </table>
  </div>
  ${(notes || paymentTerms) ? `<div class="notes">
    ${notes ? `<h4>Notes</h4><p>${notes}</p>` : ''}
    ${paymentTerms ? `<h4 style="margin-top:8px">Payment Terms</h4><p>${paymentTerms}</p>` : ''}
  </div>` : ''}
  <div class="footer">Thank you for your business &bull; Generated by AutoInvoice</div>
</body>
</html>`

    const popup = window.open("", "_blank", "width=900,height=700")
    if (!popup) {
      showErrorToast("Please allow popups for this site to download PDF")
      return
    }
    popup.document.write(html)
    popup.document.close()
    popup.focus()
    // Give browser a moment to lay out then print
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
                        <td className="py-1.5 px-1">
                          <Input
                            value={item.name}
                            onChange={(e) => updateItem(index, "name", e.target.value)}
                            placeholder="Item name"
                            className="h-8 w-full"
                          />
                        </td>
                        <td className="py-1.5 px-1">
                          <Input
                            value={item.description}
                            onChange={(e) => updateItem(index, "description", e.target.value)}
                            placeholder="Description"
                            className="h-8 w-full"
                          />
                        </td>
                        <td className="py-1.5 px-1">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity === 0 ? "" : item.quantity}
                            placeholder="1"
                            onChange={(e) => updateItem(index, "quantity", e.target.value)}
                            className="h-8 w-full text-right"
                          />
                        </td>
                        <td className="py-1.5 px-1">
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
                        <td className="py-1.5 px-1">
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
                        <td className="py-1.5 px-2 text-right font-medium whitespace-nowrap">
                          {currencySymbol}{lineTotal.toFixed(2)}
                        </td>
                        <td className="py-1.5 pl-1">
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

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="print-hidden">
            <DialogTitle>Invoice Preview</DialogTitle>
          </DialogHeader>
          <div className="p-8 bg-background border rounded-lg" id="invoice-print-area">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bold text-primary">INVOICE</h2>
                <p className="text-sm text-muted-foreground mt-1">{invoiceNumber}</p>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold">AutoInvoice</p>
                <p className="text-muted-foreground">Your Company Address</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                  Bill To
                </h3>
                <p className="font-semibold">{customerDetails.name || "—"}</p>
                <p className="text-sm text-muted-foreground">{customerDetails.address}</p>
                {customerDetails.phone && (
                  <p className="text-sm text-muted-foreground">{customerDetails.phone}</p>
                )}
                {customerDetails.email && (
                  <p className="text-sm text-muted-foreground">{customerDetails.email}</p>
                )}
                {customerDetails.gst && (
                  <p className="text-sm text-muted-foreground">GST: {customerDetails.gst}</p>
                )}
              </div>
              <div className="text-right">
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">Date: </span>
                    <span className="font-medium">{invoiceDate}</span>
                  </div>
                  {dueDate && (
                    <div>
                      <span className="text-muted-foreground">Due Date: </span>
                      <span className="font-medium">{dueDate}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Currency: </span>
                    <span className="font-medium">{currency}</span>
                  </div>
                </div>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Item</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Tax %</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items
                  .filter((i) => i.name)
                  .map((item, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.description || "—"}
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {currencySymbol}{item.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">{item.tax}%</TableCell>
                      <TableCell className="text-right font-medium">
                        {currencySymbol}
                        {(item.quantity * item.price * (1 + item.tax / 100)).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>

            <div className="flex justify-end mt-6">
              <div className="w-64 space-y-2">
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
              </div>
            </div>

            {(notes || paymentTerms) && (
              <div className="mt-8 pt-6 border-t space-y-2">
                {notes && (
                  <div>
                    <p className="text-sm font-semibold">Notes</p>
                    <p className="text-sm text-muted-foreground">{notes}</p>
                  </div>
                )}
                {paymentTerms && (
                  <div>
                    <p className="text-sm font-semibold">Payment Terms</p>
                    <p className="text-sm text-muted-foreground">{paymentTerms}</p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 pt-4 border-t text-center text-xs text-muted-foreground">
              Thank you for your business • Generated by AutoInvoice
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4 print-hidden">
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
