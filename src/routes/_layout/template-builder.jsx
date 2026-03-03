import { createFileRoute, Link } from "@tanstack/react-router"
import { useState, useCallback } from "react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  ArrowLeft,
  GripVertical,
  X,
  Eye,
  Save,
  RotateCcw,
  Plus,
  Building2,
  User,
  FileText,
  Table2,
  Calculator,
  StickyNote,
  PenLine,
  AlignJustify,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import useCustomToast from "@/hooks/useCustomToast"
import useLocalStorage from "@/hooks/useLocalStorage"

export const Route = createFileRoute("/_layout/template-builder")({
  component: TemplateBuilderPage,
  head: () => ({
    meta: [{ title: "Template Builder" }],
  }),
})

// ─── Constants ────────────────────────────────────────────────────────────────

const BLOCK_DEFINITIONS = [
  {
    type: "company-header",
    label: "Company Header",
    icon: Building2,
    accent: "bg-emerald-100 text-emerald-700",
    desc: "Logo, company name, address",
  },
  {
    type: "customer-details",
    label: "Customer Details",
    icon: User,
    accent: "bg-blue-100 text-blue-700",
    desc: "Bill-to name, address, GST",
  },
  {
    type: "invoice-meta",
    label: "Invoice Meta",
    icon: FileText,
    accent: "bg-purple-100 text-purple-700",
    desc: "Invoice #, date, due date",
  },
  {
    type: "items-table",
    label: "Items Table",
    icon: Table2,
    accent: "bg-orange-100 text-orange-700",
    desc: "Line items with qty, price, tax",
  },
  {
    type: "totals",
    label: "Totals Summary",
    icon: Calculator,
    accent: "bg-rose-100 text-rose-700",
    desc: "Subtotal, tax, grand total",
  },
  {
    type: "notes",
    label: "Notes & Terms",
    icon: StickyNote,
    accent: "bg-amber-100 text-amber-700",
    desc: "Notes, payment terms",
  },
  {
    type: "signature",
    label: "Signature",
    icon: PenLine,
    accent: "bg-indigo-100 text-indigo-700",
    desc: "Signature lines",
  },
  {
    type: "footer",
    label: "Footer",
    icon: AlignJustify,
    accent: "bg-gray-100 text-gray-600",
    desc: "Thank you / branding",
  },
]

const DEFAULT_BLOCKS = [
  { id: "def-1", type: "company-header", style: {} },
  { id: "def-2", type: "customer-details", style: {} },
  { id: "def-3", type: "invoice-meta", style: {} },
  { id: "def-4", type: "items-table", style: {} },
  { id: "def-5", type: "totals", style: {} },
  { id: "def-6", type: "notes", style: {} },
  { id: "def-7", type: "footer", style: {} },
]

// ─── Block preview components ─────────────────────────────────────────────────

function BlockPreview({ type }) {
  const base = "px-3 py-2 text-xs"
  switch (type) {
    case "company-header":
      return (
        <div className={base}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-primary/20 text-primary font-bold flex items-center justify-center text-sm shrink-0">AI</div>
            <div>
              <p className="font-semibold text-sm">AutoInvoice Pvt Ltd</p>
              <p className="text-muted-foreground text-[11px]">123 Business Park, Mumbai — GSTIN: 27ABC1234Z</p>
            </div>
          </div>
        </div>
      )
    case "customer-details":
      return (
        <div className={base}>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Bill To</p>
          <p className="font-semibold">ABC Technologies Ltd</p>
          <p className="text-muted-foreground text-[11px]">456 Tech Street, Bangalore — GSTIN: 29XYZ5678A</p>
        </div>
      )
    case "invoice-meta":
      return (
        <div className={`${base} flex justify-between`}>
          <div>
            <p className="text-[11px]"><span className="text-muted-foreground">Invoice # </span><strong>INV-2603-1042</strong></p>
            <p className="text-[11px]"><span className="text-muted-foreground">Date </span><strong>2026-03-04</strong></p>
          </div>
          <div className="text-right">
            <p className="text-[11px]"><span className="text-muted-foreground">Due </span><strong>2026-04-04</strong></p>
            <p className="text-[11px]"><span className="text-muted-foreground">Currency </span><strong>INR</strong></p>
          </div>
        </div>
      )
    case "items-table":
      return (
        <div className={base}>
          <div className="bg-primary/10 rounded grid grid-cols-4 text-[10px] font-semibold px-1.5 py-1 mb-1">
            <span>Item</span><span className="text-right">Qty</span><span className="text-right">Price</span><span className="text-right">Total</span>
          </div>
          <div className="grid grid-cols-4 text-[11px] px-1.5 py-0.5 border-b border-border">
            <span>Web Design</span><span className="text-right">1</span><span className="text-right">₹5,000</span><span className="text-right font-medium">₹5,900</span>
          </div>
          <div className="grid grid-cols-4 text-[11px] px-1.5 py-0.5">
            <span>API Dev</span><span className="text-right">2</span><span className="text-right">₹3,000</span><span className="text-right font-medium">₹7,080</span>
          </div>
        </div>
      )
    case "totals":
      return (
        <div className={`${base} flex justify-end`}>
          <div className="w-48 space-y-0.5">
            <div className="flex justify-between text-[11px]"><span className="text-muted-foreground">Subtotal</span><span>₹11,000</span></div>
            <div className="flex justify-between text-[11px]"><span className="text-muted-foreground">GST 18%</span><span>₹1,980</span></div>
            <Separator className="my-1" />
            <div className="flex justify-between text-xs font-bold text-primary"><span>Grand Total</span><span>₹12,980</span></div>
          </div>
        </div>
      )
    case "notes":
      return (
        <div className={base}>
          <p className="font-semibold text-[11px] mb-0.5">Notes</p>
          <p className="text-muted-foreground text-[11px]">Payment due within 30 days of invoice date.</p>
          <p className="font-semibold text-[11px] mt-1.5 mb-0.5">Payment Terms</p>
          <p className="text-muted-foreground text-[11px]">Net 30 days · Late fee: 2% per month</p>
        </div>
      )
    case "signature":
      return (
        <div className={`${base} flex justify-between pt-4 pb-1`}>
          <div className="text-center">
            <div className="border-b border-gray-400 w-32 mb-1" />
            <p className="text-[10px] text-muted-foreground">Authorized Signature</p>
          </div>
          <div className="text-center">
            <div className="border-b border-gray-400 w-32 mb-1" />
            <p className="text-[10px] text-muted-foreground">Received By</p>
          </div>
        </div>
      )
    case "footer":
      return (
        <div className={`${base} text-center text-muted-foreground border-t border-border py-2`}>
          <p className="text-[11px]">Thank you for your business · Generated by AutoInvoice</p>
        </div>
      )
    default:
      return <div className={base}>{type}</div>
  }
}

// ─── Sortable canvas block ─────────────────────────────────────────────────────

function SortableCanvasBlock({ block, isSelected, onSelect, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id })

  const def = BLOCK_DEFINITIONS.find((d) => d.type === block.type)
  const Icon = def?.icon || FileText

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.25 : 1,
      }}
      onClick={() => onSelect(block.id)}
      className={`relative border rounded-xl bg-card transition-all cursor-pointer group ${isSelected
          ? "border-primary shadow-md ring-2 ring-primary/20"
          : "border-border hover:border-primary/40 hover:shadow-sm"
        }`}
    >
      {/* Drag handle bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/40 border-b border-border rounded-t-xl">
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </span>
        {def && (
          <span className={`rounded p-1 ${def.accent}`}>
            <Icon className="h-3 w-3" />
          </span>
        )}
        <span className="text-xs font-medium flex-1">{def?.label || block.type}</span>
        {isSelected && <Badge variant="outline" className="text-[10px] py-0">Selected</Badge>}
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(block.id) }}
          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <BlockPreview type={block.type} />
    </div>
  )
}

// ─── Property panel ───────────────────────────────────────────────────────────

function PropertyPanel({ block, onChange }) {
  if (!block) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <div className="rounded-full bg-muted p-4 mb-3">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium mb-1">No block selected</p>
        <p className="text-xs text-muted-foreground">Click a block on the canvas to see its style options</p>
      </div>
    )
  }

  const def = BLOCK_DEFINITIONS.find((d) => d.type === block.type)
  const Icon = def?.icon || FileText
  const s = block.style || {}

  return (
    <div className="space-y-5">
      {/* Block identity */}
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <span className={`rounded-md p-1.5 ${def?.accent || "bg-muted text-muted-foreground"}`}>
          <Icon className="h-4 w-4" />
        </span>
        <p className="font-semibold text-sm">{def?.label}</p>
      </div>

      {/* Font size */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Font Size</Label>
        <Select
          value={s.fontSize || "sm"}
          onValueChange={(v) => onChange("fontSize", v)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="xs">Small (10px)</SelectItem>
            <SelectItem value="sm">Medium (12px)</SelectItem>
            <SelectItem value="base">Large (14px)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Text align */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Text Alignment</Label>
        <div className="grid grid-cols-3 gap-1">
          {["left", "center", "right"].map((a) => (
            <button
              key={a}
              onClick={() => onChange("textAlign", a)}
              className={`text-xs py-1.5 rounded border capitalize transition-colors ${(s.textAlign || "left") === a
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-accent"
                }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Border toggle */}
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">Show Border</Label>
        <button
          onClick={() => onChange("border", !s.border)}
          className={`relative w-11 h-6 rounded-full transition-colors ${s.border ? "bg-primary" : "bg-muted"
            }`}
        >
          <span
            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${s.border ? "left-6" : "left-1"
              }`}
          />
        </button>
      </div>

      {/* Background */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Background Color</Label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: "None", value: "", cls: "bg-card border-border" },
            { label: "Light Gray", value: "gray", cls: "bg-gray-50" },
            { label: "Light Green", value: "green", cls: "bg-emerald-50" },
            { label: "Light Blue", value: "blue", cls: "bg-blue-50" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange("bg", opt.value)}
              className={`flex items-center gap-2 text-xs p-2 rounded border transition-colors ${opt.cls} ${(s.bg || "") === opt.value ? "border-primary ring-1 ring-primary" : "border-border"
                }`}
            >
              {(s.bg || "") === opt.value && <Check className="h-3 w-3 text-primary shrink-0" />}
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main page component ──────────────────────────────────────────────────────

function TemplateBuilderPage() {
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [savedTemplate, setSavedTemplate] = useLocalStorage("custom-template", null)
  const [, setSelectedTemplate] = useLocalStorage("selected-template", "minimal")

  const [blocks, setBlocks] = useState(() =>
    savedTemplate?.blocks?.length ? savedTemplate.blocks : DEFAULT_BLOCKS,
  )
  const [selectedId, setSelectedId] = useState(null)
  const [dragActiveId, setDragActiveId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const selectedBlock = blocks.find((b) => b.id === selectedId) || null
  const dragActiveBlock = blocks.find((b) => b.id === dragActiveId) || null

  const handleDragStart = useCallback(({ active }) => {
    setDragActiveId(active.id)
  }, [])

  const handleDragEnd = useCallback(({ active, over }) => {
    setDragActiveId(null)
    if (over && active.id !== over.id) {
      setBlocks((prev) => {
        const from = prev.findIndex((b) => b.id === active.id)
        const to = prev.findIndex((b) => b.id === over.id)
        return arrayMove(prev, from, to)
      })
    }
  }, [])

  const handleAddBlock = useCallback((type) => {
    const newBlock = { id: `blk-${Date.now()}`, type, style: {} }
    setBlocks((prev) => [...prev, newBlock])
    setSelectedId(newBlock.id)
  }, [])

  const handleRemoveBlock = useCallback((id) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id))
    if (selectedId === id) setSelectedId(null)
  }, [selectedId])

  const handleStyleChange = useCallback((key, value) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === selectedId ? { ...b, style: { ...b.style, [key]: value } } : b,
      ),
    )
  }, [selectedId])

  const handleReset = useCallback(() => {
    setBlocks(DEFAULT_BLOCKS.map((b) => ({ ...b, id: `def-${Date.now()}-${b.id}` })))
    setSelectedId(null)
    showSuccessToast("Canvas reset to default layout")
  }, [showSuccessToast])

  const handleSave = useCallback(() => {
    setSavedTemplate({ blocks, savedAt: new Date().toISOString() })
    setSelectedTemplate("custom")
    showSuccessToast("Custom template saved and activated!")
  }, [blocks, setSavedTemplate, setSelectedTemplate, showSuccessToast])

  const handlePreview = useCallback(() => {
    const fontMap = { xs: "11px", sm: "13px", base: "15px" }
    const alignMap = { left: "left", center: "center", right: "right" }
    const bgMap = {
      "": "transparent",
      gray: "#f9fafb",
      green: "#f0fdf4",
      blue: "#eff6ff",
    }

    const blockHtml = (block) => {
      const s = block.style || {}
      const fs = fontMap[s.fontSize] || "13px"
      const ta = alignMap[s.textAlign] || "left"
      const bg = bgMap[s.bg || ""] || "transparent"
      const border = s.border ? "border:1px solid #e5e7eb;border-radius:6px;" : ""
      const wrap = `style="padding:12px 14px;margin-bottom:12px;font-size:${fs};text-align:${ta};background:${bg};${border}"`

      switch (block.type) {
        case "company-header":
          return `<div ${wrap}><table><tr>
            <td style="padding-right:12px"><div style="width:40px;height:40px;background:#217346;border-radius:6px;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:14px;text-align:center;line-height:40px;">AI</div></td>
            <td><strong style="font-size:15px;">AutoInvoice Pvt Ltd</strong><br><span style="color:#6b7280;">123 Business Park, Mumbai · GSTIN: 27ABC1234Z</span></td>
          </tr></table></div>`
        case "customer-details":
          return `<div ${wrap}>
            <p style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin-bottom:4px;">BILL TO</p>
            <strong>ABC Technologies Ltd</strong><br>
            <span style="color:#6b7280;">456 Tech Street, Bangalore · GSTIN: 29XYZ5678A · +91 98765 43210</span>
          </div>`
        case "invoice-meta":
          return `<div ${wrap}><table style="width:100%"><tr>
            <td><span style="color:#6b7280;">Invoice #</span> <strong>INV-2603-1042</strong><br><span style="color:#6b7280;">Date</span> <strong>2026-03-04</strong></td>
            <td style="text-align:right"><span style="color:#6b7280;">Due Date</span> <strong>2026-04-04</strong><br><span style="color:#6b7280;">Currency</span> <strong>INR</strong></td>
          </tr></table></div>`
        case "items-table":
          return `<div ${wrap}><table style="width:100%;border-collapse:collapse;">
            <thead><tr style="background:#217346;color:white">
              <th style="padding:8px 10px;text-align:left">Item</th>
              <th style="padding:8px 10px;text-align:right">Qty</th>
              <th style="padding:8px 10px;text-align:right">Price</th>
              <th style="padding:8px 10px;text-align:right">Total</th>
            </tr></thead>
            <tbody>
              <tr style="background:#f9fafb"><td style="padding:7px 10px;border-bottom:1px solid #f3f4f6">Web Design</td><td style="padding:7px 10px;text-align:right;border-bottom:1px solid #f3f4f6">1</td><td style="padding:7px 10px;text-align:right;border-bottom:1px solid #f3f4f6">₹5,000.00</td><td style="padding:7px 10px;text-align:right;font-weight:600;border-bottom:1px solid #f3f4f6">₹5,900.00</td></tr>
              <tr><td style="padding:7px 10px">API Development</td><td style="padding:7px 10px;text-align:right">2</td><td style="padding:7px 10px;text-align:right">₹3,000.00</td><td style="padding:7px 10px;text-align:right;font-weight:600">₹7,080.00</td></tr>
            </tbody>
          </table></div>`
        case "totals":
          return `<div ${wrap}><table style="margin-left:auto;min-width:200px">
            <tr><td style="color:#6b7280;padding:3px 8px">Subtotal</td><td style="text-align:right;padding:3px 8px">₹11,000.00</td></tr>
            <tr><td style="color:#6b7280;padding:3px 8px">GST (18%)</td><td style="text-align:right;padding:3px 8px">₹1,980.00</td></tr>
            <tr style="border-top:2px solid #217346"><td style="padding:6px 8px;font-weight:700;color:#217346">Grand Total</td><td style="text-align:right;padding:6px 8px;font-weight:700;color:#217346">₹12,980.00</td></tr>
          </table></div>`
        case "notes":
          return `<div ${wrap}>
            <p style="font-weight:600;margin-bottom:4px">Notes</p>
            <p style="color:#6b7280">Payment due within 30 days of invoice date. Cheque / NEFT / UPI accepted.</p>
            <p style="font-weight:600;margin:10px 0 4px">Payment Terms</p>
            <p style="color:#6b7280">Net 30 days · Late payment surcharge: 2% per month</p>
          </div>`
        case "signature":
          return `<div ${wrap}><table style="width:100%"><tr>
            <td style="text-align:center;padding:0 20px"><div style="border-bottom:1px solid #9ca3af;height:36px;margin-bottom:4px"></div><p style="color:#9ca3af;font-size:10px">Authorized Signature</p></td>
            <td style="text-align:center;padding:0 20px"><div style="border-bottom:1px solid #9ca3af;height:36px;margin-bottom:4px"></div><p style="color:#9ca3af;font-size:10px">Received By</p></td>
          </tr></table></div>`
        case "footer":
          return `<div ${wrap} style="border-top:1px solid #e5e7eb;text-align:center;color:#9ca3af;font-size:11px">
            Thank you for your business &bull; Generated by AutoInvoice
          </div>`
        default:
          return ""
      }
    }

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Custom Invoice Template Preview</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #111827; background: white; padding: 32px; }
    @media print { body { padding: 12mm; } }
  </style>
</head>
<body>
${blocks.map(blockHtml).join("\n")}
</body>
</html>`

    const popup = window.open("", "_blank", "width=960,height=720,left=100,top=100")
    if (!popup) {
      showErrorToast("Allow popups for this site to preview the PDF")
      return
    }
    popup.document.write(html)
    popup.document.close()
    popup.focus()
    popup.setTimeout(() => { popup.print() }, 600)
  }, [blocks, showErrorToast])

  return (
    <div className="flex flex-col gap-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/invoice-templates">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Template Builder</h1>
            <p className="text-muted-foreground text-sm">
              Drag blocks to reorder · Click to select · ✕ to remove
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reset
          </Button>
          <Button variant="outline" size="sm" onClick={handlePreview}>
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            Preview & Print
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="mr-1.5 h-3.5 w-3.5" />
            Save Template
          </Button>
        </div>
      </div>

      {/* ── 3-panel layout ── */}
      <div className="grid grid-cols-[220px_1fr_220px] gap-4" style={{ minHeight: "75vh" }}>

        {/* LEFT: Palette */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="px-4 py-3 border-b shrink-0">
            <CardTitle className="text-sm">Block Palette</CardTitle>
            <p className="text-[11px] text-muted-foreground -mt-1">Click to add to canvas</p>
          </CardHeader>
          <CardContent className="px-2 py-2 space-y-1 overflow-y-auto flex-1">
            {BLOCK_DEFINITIONS.map((def) => {
              const Icon = def.icon
              return (
                <button
                  key={def.type}
                  onClick={() => handleAddBlock(def.type)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-border hover:border-primary/50 hover:bg-accent transition-all text-left group"
                >
                  <span className={`rounded p-1.5 shrink-0 ${def.accent}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{def.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{def.desc}</p>
                  </div>
                  <Plus className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
                </button>
              )
            })}
          </CardContent>
        </Card>

        {/* CENTER: Canvas */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="px-4 py-3 border-b shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Canvas</CardTitle>
              <Badge variant="outline" className="text-[11px]">
                {blocks.length} block{blocks.length !== 1 && "s"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-3 overflow-y-auto">
            {blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center border-2 border-dashed border-border rounded-xl py-16">
                <div className="rounded-full bg-muted p-4 mb-3">
                  <Table2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="font-medium text-sm mb-1">Canvas is empty</p>
                <p className="text-xs text-muted-foreground">Add blocks from the palette on the left</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={blocks.map((b) => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {blocks.map((block) => (
                      <SortableCanvasBlock
                        key={block.id}
                        block={block}
                        isSelected={selectedId === block.id}
                        onSelect={setSelectedId}
                        onRemove={handleRemoveBlock}
                      />
                    ))}
                  </div>
                </SortableContext>

                <DragOverlay dropAnimation={null}>
                  {dragActiveBlock && (
                    <div className="border border-primary rounded-xl bg-card shadow-2xl opacity-90 pointer-events-none">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/40 border-b border-border rounded-t-xl">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-medium">
                          {BLOCK_DEFINITIONS.find((d) => d.type === dragActiveBlock.type)?.label}
                        </span>
                      </div>
                      <BlockPreview type={dragActiveBlock.type} />
                    </div>
                  )}
                </DragOverlay>
              </DndContext>
            )}
          </CardContent>
        </Card>

        {/* RIGHT: Properties */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="px-4 py-3 border-b shrink-0">
            <CardTitle className="text-sm">Properties</CardTitle>
          </CardHeader>
          <CardContent className="px-4 py-4 overflow-y-auto flex-1">
            <PropertyPanel block={selectedBlock} onChange={handleStyleChange} />
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
