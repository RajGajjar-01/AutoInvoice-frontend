import { createFileRoute, Link } from "@tanstack/react-router"
import {
  ArrowLeft,
  Eye,
  Check,
  FileText,
  Receipt,
  Briefcase,
  ShoppingBag,
  Wrench,
  Pencil,
  Plus,
  Upload,
  Code2,
  Trash2,
} from "lucide-react"
import { useState, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import useCustomToast from "@/hooks/useCustomToast"
import useLocalStorage from "@/hooks/useLocalStorage"

export const Route = createFileRoute("/_layout/invoice-templates")({
  component: InvoiceTemplatesPage,
  head: () => ({
    meta: [{ title: "Invoice Templates" }],
  }),
})

// ─── Template definitions ────────────────────────────────────────────────────

const builtInTemplates = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean white layout, timeless typography, nothing extra",
    icon: FileText,
    cardColor: "bg-slate-500/10 text-slate-500",
    features: ["Clean layout", "Monospace #", "Essential fields"],
    preview: MinimalPreview,
  },
  {
    id: "gst",
    name: "GST Invoice",
    description: "Full GST-compliant with CGST / SGST / IGST breakdown",
    icon: Receipt,
    cardColor: "bg-emerald-500/10 text-emerald-500",
    features: ["GSTIN", "HSN/SAC codes", "Tax split"],
    preview: GSTPreview,
  },
  {
    id: "professional",
    name: "Professional",
    description: "Dark branded header with bank & payment details section",
    icon: Briefcase,
    cardColor: "bg-primary/10 text-primary",
    features: ["Branded header", "Bank details", "Logo area"],
    preview: ProfessionalPreview,
  },
  {
    id: "retail",
    name: "Retail",
    description: "Bold product grid for product-based businesses",
    icon: ShoppingBag,
    cardColor: "bg-purple-500/10 text-purple-500",
    features: ["SKU column", "Discount", "Product grid"],
    preview: RetailPreview,
  },
  {
    id: "service",
    name: "Service",
    description: "Soft blue, hours-based billing for freelancers",
    icon: Wrench,
    cardColor: "bg-amber-500/10 text-amber-500",
    features: ["Hours/rate", "Milestones", "Terms section"],
    preview: ServicePreview,
  },
]

// ─── Individual themed previews ───────────────────────────────────────────────

function MinimalPreview() {
  return (
    <div className="bg-white text-gray-900 p-6 rounded-lg font-mono text-xs space-y-4">
      <div className="flex justify-between items-start border-b border-gray-200 pb-4">
        <div>
          <p className="text-2xl font-bold tracking-widest text-gray-800">INVOICE</p>
          <p className="text-gray-400 mt-1">INV-2601-001</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-700">Your Business</p>
          <p className="text-gray-400">hello@yourbiz.com</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-400 text-[10px] mb-1">BILL TO</p>
          <p className="font-bold">Sample Client</p>
          <p className="text-gray-400">123 Client St</p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-[10px]">DATE</p>
          <p>2026-03-03</p>
          <p className="text-gray-400 text-[10px] mt-1">DUE</p>
          <p>2026-04-03</p>
        </div>
      </div>
      <table className="w-full text-[10px]">
        <thead>
          <tr className="border-b border-gray-200 text-gray-400">
            <th className="pb-1 text-left">Item</th>
            <th className="pb-1 text-right">Qty</th>
            <th className="pb-1 text-right">Rate</th>
            <th className="pb-1 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-100">
            <td className="py-1">Design Work</td>
            <td className="py-1 text-right">1</td>
            <td className="py-1 text-right">₹5,000</td>
            <td className="py-1 text-right font-bold">₹5,000</td>
          </tr>
          <tr>
            <td className="py-1">Consultation</td>
            <td className="py-1 text-right">2</td>
            <td className="py-1 text-right">₹1,500</td>
            <td className="py-1 text-right font-bold">₹3,000</td>
          </tr>
        </tbody>
      </table>
      <div className="flex justify-end">
        <div className="w-32 space-y-1">
          <div className="flex justify-between text-gray-400 text-[10px]">
            <span>Subtotal</span><span>₹8,000</span>
          </div>
          <div className="flex justify-between font-bold border-t border-gray-200 pt-1">
            <span>Total</span><span>₹8,000</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function GSTPreview() {
  return (
    <div className="bg-white text-gray-900 p-6 rounded-lg text-xs space-y-4 border-t-4 border-emerald-600">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xl font-extrabold text-emerald-700 tracking-wide">TAX INVOICE</p>
          <p className="text-gray-400 text-[10px]">INV-2601-001 | GSTIN: 27AAPFU0939F1ZV</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-800">Your Business</p>
          <p className="text-gray-400 text-[10px]">GSTIN: 27XXXXX1234</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 bg-emerald-50 p-3 rounded">
        <div>
          <p className="text-emerald-700 font-bold text-[10px] mb-1">BUYER DETAILS</p>
          <p className="font-bold">Sample Ltd.</p>
          <p className="text-gray-500 text-[10px]">GSTIN: 29AAACR5055K1ZK</p>
          <p className="text-gray-500 text-[10px]">HSN: 998314</p>
        </div>
        <div className="text-right text-[10px] text-gray-500">
          <p>Date: 03-03-2026</p>
          <p>Place of Supply: Maharashtra</p>
        </div>
      </div>
      <table className="w-full text-[10px]">
        <thead>
          <tr className="bg-emerald-600 text-white">
            <th className="px-2 py-1 text-left">Description</th>
            <th className="px-2 py-1 text-right">Amount</th>
            <th className="px-2 py-1 text-right">CGST 9%</th>
            <th className="px-2 py-1 text-right">SGST 9%</th>
            <th className="px-2 py-1 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-100">
            <td className="px-2 py-1">Design Services</td>
            <td className="px-2 py-1 text-right">₹5,000</td>
            <td className="px-2 py-1 text-right">₹450</td>
            <td className="px-2 py-1 text-right">₹450</td>
            <td className="px-2 py-1 text-right font-bold">₹5,900</td>
          </tr>
        </tbody>
      </table>
      <div className="flex justify-end">
        <div className="w-36 space-y-1 text-[10px]">
          <div className="flex justify-between"><span className="text-gray-400">Taxable</span><span>₹5,000</span></div>
          <div className="flex justify-between"><span className="text-gray-400">CGST</span><span>₹450</span></div>
          <div className="flex justify-between"><span className="text-gray-400">SGST</span><span>₹450</span></div>
          <div className="flex justify-between font-bold border-t border-gray-200 pt-1 text-emerald-700">
            <span>Grand Total</span><span>₹5,900</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfessionalPreview() {
  return (
    <div className="bg-white text-gray-900 rounded-lg text-xs overflow-hidden">
      {/* Dark header */}
      <div className="bg-gray-900 text-white p-6 flex justify-between items-center">
        <div>
          <div className="w-10 h-10 rounded bg-primary flex items-center justify-center text-white font-bold text-sm mb-2">
            A
          </div>
          <p className="font-bold text-lg">AutoInvoice</p>
          <p className="text-gray-400 text-[10px]">Professional Services</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold tracking-wider text-primary">INVOICE</p>
          <p className="text-gray-400 text-[10px] mt-1">#INV-2601-001</p>
          <p className="text-gray-400 text-[10px]">Date: 03 Mar 2026</p>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Billed To</p>
            <p className="font-bold text-gray-800">Global Corp Ltd.</p>
            <p className="text-gray-500 text-[10px]">456 Corporate Blvd</p>
          </div>
          <div className="bg-gray-50 rounded p-2 text-[10px]">
            <p className="font-bold text-gray-700 mb-1">Bank Details</p>
            <p className="text-gray-500">Bank: HDFC Bank</p>
            <p className="text-gray-500">A/C: 0012345678</p>
            <p className="text-gray-500">IFSC: HDFC0000123</p>
          </div>
        </div>
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b-2 border-gray-900 text-gray-700">
              <th className="pb-1 text-left">Service</th>
              <th className="pb-1 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-1">Strategy Consulting</td>
              <td className="py-1 text-right font-bold">₹25,000</td>
            </tr>
          </tbody>
        </table>
        <div className="flex justify-end">
          <div className="w-36">
            <div className="bg-gray-900 text-white flex justify-between px-3 py-2 rounded font-bold">
              <span>TOTAL</span><span>₹25,000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RetailPreview() {
  return (
    <div className="bg-white text-gray-900 p-6 rounded-lg text-xs space-y-4">
      <div className="flex justify-between items-center border-b-2 border-purple-600 pb-3">
        <div>
          <p className="text-xl font-extrabold text-purple-700">RETAIL INVOICE</p>
          <p className="text-gray-400 text-[10px]">#INV-2601-001 | 03/03/2026</p>
        </div>
        <div className="text-right">
          <p className="font-bold">RetailShop</p>
          <p className="text-gray-400 text-[10px]">GST: 27XXXXXX</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500">
        <div>
          <p className="font-bold text-gray-800">Customer: Sample Store</p>
          <p>Ph: +91 98765 43210</p>
        </div>
        <div className="text-right">
          <p>PO #: PO-0042</p>
          <p>Salesperson: Rahul</p>
        </div>
      </div>
      <table className="w-full text-[10px]">
        <thead>
          <tr className="bg-purple-600 text-white">
            <th className="px-2 py-1 text-left">Product</th>
            <th className="px-2 py-1 text-left">SKU</th>
            <th className="px-2 py-1 text-right">Qty</th>
            <th className="px-2 py-1 text-right">MRP</th>
            <th className="px-2 py-1 text-right">Disc</th>
            <th className="px-2 py-1 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-100 bg-purple-50">
            <td className="px-2 py-1">Blue Pen Box</td>
            <td className="px-2 py-1 text-gray-400">SKU-001</td>
            <td className="px-2 py-1 text-right">10</td>
            <td className="px-2 py-1 text-right">₹50</td>
            <td className="px-2 py-1 text-right text-red-500">5%</td>
            <td className="px-2 py-1 text-right font-bold">₹475</td>
          </tr>
          <tr className="border-b border-gray-100">
            <td className="px-2 py-1">A4 Ream</td>
            <td className="px-2 py-1 text-gray-400">SKU-002</td>
            <td className="px-2 py-1 text-right">5</td>
            <td className="px-2 py-1 text-right">₹200</td>
            <td className="px-2 py-1 text-right text-red-500">0%</td>
            <td className="px-2 py-1 text-right font-bold">₹1,000</td>
          </tr>
        </tbody>
      </table>
      <div className="flex justify-between items-end">
        <p className="text-gray-400 text-[10px]">Total items: 2 | Units: 15</p>
        <div className="w-36 space-y-1 text-[10px]">
          <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span>₹1,475</span></div>
          <div className="flex justify-between text-purple-700 font-bold border-t border-gray-200 pt-1">
            <span>Grand Total</span><span>₹1,475</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ServicePreview() {
  return (
    <div className="bg-white text-gray-900 rounded-lg text-xs overflow-hidden">
      <div className="bg-amber-50 border-b-4 border-amber-400 p-6 flex justify-between">
        <div>
          <p className="text-xl font-extrabold text-amber-700">SERVICE INVOICE</p>
          <p className="text-gray-500 text-[10px]">INV-2601-001 | 03 Mar 2026</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-800">Freelancer Co.</p>
          <p className="text-gray-400 text-[10px]">freelancer@email.com</p>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-[10px]">
          <div>
            <p className="font-bold text-amber-700 mb-1">CLIENT</p>
            <p className="font-bold text-gray-800">Startup Inc.</p>
            <p className="text-gray-400">Due: 03 Apr 2026</p>
          </div>
          <div className="bg-amber-50 rounded p-2">
            <p className="font-bold text-amber-700 mb-1">MILESTONES</p>
            <p className="text-gray-500">✓ Design Phase</p>
            <p className="text-gray-500">✓ Development</p>
            <p className="text-gray-400">○ Testing (pending)</p>
          </div>
        </div>
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b-2 border-amber-400 text-amber-700">
              <th className="pb-1 text-left">Service</th>
              <th className="pb-1 text-right">Hours</th>
              <th className="pb-1 text-right">Rate/hr</th>
              <th className="pb-1 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-1">UI/UX Design</td>
              <td className="py-1 text-right">20h</td>
              <td className="py-1 text-right">₹500</td>
              <td className="py-1 text-right font-bold">₹10,000</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-1">Development</td>
              <td className="py-1 text-right">40h</td>
              <td className="py-1 text-right">₹800</td>
              <td className="py-1 text-right font-bold">₹32,000</td>
            </tr>
          </tbody>
        </table>
        <div className="flex justify-end">
          <div className="w-36 space-y-1 text-[10px]">
            <div className="flex justify-between"><span className="text-gray-400">60 hrs total</span><span>₹42,000</span></div>
            <div className="flex justify-between font-bold text-amber-700 border-t border-amber-200 pt-1">
              <span>Total Due</span><span>₹42,000</span>
            </div>
          </div>
        </div>
        <div className="bg-amber-50 rounded p-2 text-[10px] text-gray-500">
          <span className="font-bold text-amber-700">Terms: </span>
          Net 30 • Late fee 2%/mo • Cheque payable to Freelancer Co.
        </div>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

function InvoiceTemplatesPage() {
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useLocalStorage(
    "selected-template",
    "minimal",
  )
  const [customTemplate] = useLocalStorage("custom-template", null)
  const [importedTemplate, setImportedTemplate] = useLocalStorage("imported-template", null)
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [pasteHtml, setPasteHtml] = useState("")
  const [showPasteBox, setShowPasteBox] = useState(false)
  const fileInputRef = useRef(null)

  const handleSelectTemplate = (id) => {
    setSelectedTemplate(id)
    showSuccessToast("Template selected! It will be used for new invoices.")
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf")
    const isHtml = file.type === "text/html" || file.name.endsWith(".html")
    if (!isPdf && !isHtml) {
      showErrorToast("Please upload a PDF (.pdf) or HTML (.html) file")
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result
      if (!result) return
      const entry = isPdf
        ? { type: "pdf", dataUrl: result, name: file.name.replace(/\.pdf$/i, ""), savedAt: new Date().toISOString() }
        : { type: "html", html: result, name: file.name.replace(/\.html$/i, ""), savedAt: new Date().toISOString() }
      setImportedTemplate(entry)
      setSelectedTemplate("imported")
      showSuccessToast(`"${file.name}" imported successfully!`)
    }
    if (isPdf) {
      reader.readAsDataURL(file)
    } else {
      reader.readAsText(file)
    }
    e.target.value = ""
  }

  const handlePasteSubmit = () => {
    const trimmed = pasteHtml.trim()
    if (!trimmed) { showErrorToast("Please paste some HTML first"); return }
    if (!trimmed.includes("<")) { showErrorToast("That doesn't look like valid HTML"); return }
    setImportedTemplate({ html: trimmed, name: "Pasted Template", savedAt: new Date().toISOString() })
    setSelectedTemplate("imported")
    setPasteHtml("")
    setShowPasteBox(false)
    showSuccessToast("Template imported from HTML and activated!")
  }

  const handlePreviewImported = () => {
    if (!importedTemplate) return
    if (importedTemplate.type === "pdf") {
      // Open PDF data URL in new tab — browser renders it natively
      window.open(importedTemplate.dataUrl, "_blank")
    } else {
      const popup = window.open("", "_blank", "width=960,height=720")
      if (!popup) { showErrorToast("Allow popups to preview"); return }
      popup.document.write(importedTemplate.html || "")
      popup.document.close()
      popup.focus()
    }
  }

  const handleDeleteImported = () => {
    setImportedTemplate(null)
    if (selectedTemplate === "imported") setSelectedTemplate("minimal")
    showSuccessToast("Imported template removed")
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
          <h1 className="text-2xl font-bold tracking-tight">Invoice Templates</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Choose a built-in template — each has a unique design to match your business style
          </p>
        </div>
      </div>

      {/* Template Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {builtInTemplates.map((tpl) => {
          const PreviewComponent = tpl.preview
          return (
            <Card
              key={tpl.id}
              className={`relative overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer ${selectedTemplate === tpl.id
                ? "border-primary ring-2 ring-primary/20"
                : "hover:border-primary/40"
                }`}
            >
              {selectedTemplate === tpl.id && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge variant="default" className="text-xs shadow">
                    <Check className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                </div>
              )}
              {/* Mini preview thumbnail */}
              <div className="overflow-hidden border-b bg-muted/20" style={{ maxHeight: 160 }}>
                <div className="scale-[0.48] origin-top-left w-[208%] pointer-events-none select-none">
                  <PreviewComponent />
                </div>
              </div>
              <CardHeader className="pt-3 pb-2">
                <div className="flex items-center gap-2">
                  <div className={`rounded-md p-1.5 ${tpl.cardColor}`}>
                    <tpl.icon className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm">{tpl.name}</CardTitle>
                </div>
                <CardDescription className="text-xs">{tpl.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex flex-wrap gap-1 mb-3">
                  {tpl.features.map((f) => (
                    <Badge key={f} variant="outline" className="text-[10px] font-normal">
                      {f}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setPreviewTemplate(tpl)}
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    variant={selectedTemplate === tpl.id ? "secondary" : "default"}
                    onClick={() => handleSelectTemplate(tpl.id)}
                    disabled={selectedTemplate === tpl.id}
                  >
                    {selectedTemplate === tpl.id ? "Selected" : "Use This"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Custom Template Builder */}
      <div className="mt-2">
        <h2 className="text-lg font-semibold mb-4">Custom Template Builder</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Saved custom template card — shown only if one exists */}
          {customTemplate && (
            <Card
              className={`relative hover:shadow-lg transition-all duration-200 ${selectedTemplate === "custom"
                ? "border-primary ring-2 ring-primary/20"
                : "hover:border-primary/40"
                }`}
            >
              {selectedTemplate === "custom" && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge variant="default" className="text-xs shadow">
                    <Check className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                </div>
              )}
              <CardHeader className="pt-3 pb-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-md p-1.5 bg-primary/10 text-primary">
                    <Pencil className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm">Your Custom Template</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Last edited: {new Date(customTemplate.savedAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex flex-wrap gap-1 mb-3">
                  <Badge variant="outline" className="text-[10px] font-normal">
                    {customTemplate.blocks?.length || 0} blocks
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-normal">Custom layout</Badge>
                </div>
                <div className="flex gap-2">
                  <Link to="/template-builder" className="flex-1">
                    <Button size="sm" variant="outline" className="w-full">
                      <Pencil className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    className="flex-1"
                    variant={selectedTemplate === "custom" ? "secondary" : "default"}
                    onClick={() => handleSelectTemplate("custom")}
                    disabled={selectedTemplate === "custom"}
                  >
                    {selectedTemplate === "custom" ? "Selected" : "Use This"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Builder launcher card */}
          <Card className="border-dashed hover:border-primary/40 hover:shadow-md transition-all duration-200">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <div className="rounded-full bg-primary/10 p-4 mb-3">
                <Pencil className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-base font-semibold mb-1">Drag & Drop Builder</h3>
              <p className="text-xs text-muted-foreground max-w-xs mb-4">
                Arrange Company Header, Customer Details, Item Table, Signature and more
                into your own layout — then save and use it.
              </p>
              <Link to="/template-builder">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Open Template Builder
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Import Your Own Template ── */}
      <div className="mt-2">
        <h2 className="text-lg font-semibold mb-1">Import Your Own Template</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Have an existing HTML invoice template? Upload the file or paste the HTML directly to use it here.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Saved imported template card */}
          {importedTemplate && (
            <Card
              className={`relative hover:shadow-lg transition-all duration-200 ${selectedTemplate === "imported"
                ? "border-primary ring-2 ring-primary/20"
                : "hover:border-primary/40"
                }`}
            >
              {selectedTemplate === "imported" && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge variant="default" className="text-xs shadow">
                    <Check className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                </div>
              )}
              <CardHeader className="pt-4 pb-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-md p-1.5 bg-violet-100 text-violet-700">
                    <Code2 className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">{importedTemplate.name}</CardTitle>
                    <p className="text-[11px] text-muted-foreground">
                      Imported {new Date(importedTemplate.savedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4 space-y-2">
                <Badge variant="outline" className="text-[10px] font-normal">
                  {importedTemplate.type === "pdf" ? "📄 PDF Template" : "💻 HTML Template"}
                </Badge>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" className="flex-1" onClick={handlePreviewImported}>
                    <Eye className="mr-1 h-3 w-3" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    variant={selectedTemplate === "imported" ? "secondary" : "default"}
                    onClick={() => handleSelectTemplate("imported")}
                    disabled={selectedTemplate === "imported"}
                  >
                    {selectedTemplate === "imported" ? "Selected" : "Use This"}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive px-2" onClick={handleDeleteImported}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload + paste card */}
          <Card className="border-dashed hover:border-primary/40 hover:shadow-md transition-all duration-200">
            <CardContent className="py-6 px-5 space-y-4">
              <div className="text-center mb-2">
                <div className="rounded-full bg-violet-100 p-3 inline-flex mb-2">
                  <Upload className="h-6 w-6 text-violet-600" />
                </div>
                <h3 className="text-sm font-semibold">Import Template File</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Upload a <strong>PDF</strong> or <strong>HTML</strong> file, or paste HTML code
                </p>
              </div>

              {/* File upload */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.html,application/pdf,text/html"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload PDF or HTML File
                </Button>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex-1 border-b border-border" />
                <span>or paste HTML</span>
                <div className="flex-1 border-b border-border" />
              </div>

              {/* Paste box toggle */}
              {!showPasteBox ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowPasteBox(true)}
                >
                  <Code2 className="mr-2 h-4 w-4" />
                  Paste HTML Code
                </Button>
              ) : (
                <div className="space-y-2">
                  <Textarea
                    value={pasteHtml}
                    onChange={(e) => setPasteHtml(e.target.value)}
                    placeholder="<!DOCTYPE html>\n<html>\n  ...your invoice HTML...\n</html>"
                    className="font-mono text-xs min-h-[120px] resize-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setShowPasteBox(false); setPasteHtml("") }} className="flex-1">
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handlePasteSubmit} className="flex-1">
                      Import HTML
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Full Preview Dialog */}
      <Dialog
        open={!!previewTemplate}
        onOpenChange={(open) => !open && setPreviewTemplate(null)}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name} — Full Preview</DialogTitle>
          </DialogHeader>
          {previewTemplate && (() => {
            const PreviewComp = previewTemplate.preview
            return <PreviewComp />
          })()}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
              Close
            </Button>
            <Button
              onClick={() => {
                handleSelectTemplate(previewTemplate.id)
                setPreviewTemplate(null)
              }}
            >
              Use This Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
