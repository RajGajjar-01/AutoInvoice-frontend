import { createFileRoute, Link } from "@tanstack/react-router"
import { useState, useCallback, useId } from "react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  Building2,
  Calculator,
  Check,
  Eye,
  FileText,
  GripVertical,
  PenLine,
  Plus,
  RotateCcw,
  Save,
  StickyNote,
  Table2,
  Trash2,
  User,
  X,
  Palette,
  Type,
  Layout,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
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

// ─── Block definitions ─────────────────────────────────────────────────────────

const BLOCK_DEFS = [
  { type: "company-header", label: "Company Header", icon: Building2, accent: "bg-emerald-100 text-emerald-700", desc: "Logo + name + address + GSTIN" },
  { type: "customer-details", label: "Customer Details", icon: User, accent: "bg-blue-100 text-blue-700", desc: "Bill To: name, address, GST" },
  { type: "invoice-meta", label: "Invoice Meta", icon: FileText, accent: "bg-purple-100 text-purple-700", desc: "Invoice #, date, due date" },
  { type: "items-table", label: "Items Table", icon: Table2, accent: "bg-orange-100 text-orange-700", desc: "Line items, qty, price, tax" },
  { type: "totals", label: "Totals Summary", icon: Calculator, accent: "bg-rose-100 text-rose-700", desc: "Subtotal, GST, grand total" },
  { type: "notes", label: "Notes & Terms", icon: StickyNote, accent: "bg-amber-100 text-amber-700", desc: "Notes, payment terms" },
  { type: "signature", label: "Signature", icon: PenLine, accent: "bg-indigo-100 text-indigo-700", desc: "Signature lines" },
  { type: "footer", label: "Footer", icon: AlignJustify, accent: "bg-gray-100 text-gray-600", desc: "Thank you / branding text" },
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

const FONT_FAMILIES = [
  { label: "System Default", value: "system-ui, sans-serif" },
  { label: "Inter", value: "'Inter', sans-serif" },
  { label: "Roboto", value: "'Roboto', sans-serif" },
  { label: "Georgia (Serif)", value: "Georgia, serif" },
  { label: "Courier (Mono)", value: "'Courier New', monospace" },
  { label: "Playfair Display", value: "'Playfair Display', serif" },
]

const ACCENT_COLOURS = [
  { label: "Green", value: "#16a34a" },
  { label: "Blue", value: "#2563eb" },
  { label: "Purple", value: "#7c3aed" },
  { label: "Orange", value: "#ea580c" },
  { label: "Rose", value: "#e11d48" },
  { label: "Teal", value: "#0d9488" },
  { label: "Gray", value: "#374151" },
  { label: "Black", value: "#111827" },
]

const TEXT_COLOURS = [
  { label: "Black", value: "#111827" },
  { label: "Dark Gray", value: "#374151" },
  { label: "Medium Gray", value: "#6b7280" },
  { label: "Dark Blue", value: "#1e3a5f" },
  { label: "Dark Green", value: "#14532d" },
  { label: "Dark Purple", value: "#3b0764" },
]

const BG_COLOURS = [
  { label: "White", value: "#ffffff" },
  { label: "Off-White", value: "#f9fafb" },
  { label: "Light Gray", value: "#f3f4f6" },
  { label: "Light Blue", value: "#eff6ff" },
  { label: "Light Green", value: "#f0fdf4" },
  { label: "Cream", value: "#fffbeb" },
]

// ─── Block canvas preview ──────────────────────────────────────────────────────

function BlockPreview({ type, globalStyle = {} }) {
  const accent = globalStyle.accentColor || "#16a34a"
  const font = globalStyle.fontFamily || "system-ui, sans-serif"
  const textColor = globalStyle.textColor || "#111827"

  const base = { fontFamily: font, color: textColor, padding: "12px 14px", fontSize: 12 }

  switch (type) {
    case "company-header":
      return (
        <div style={base}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: accent, color: "#fff", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>AI</div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>AutoInvoice Pvt Ltd</p>
              <p style={{ color: "#6b7280", fontSize: 11, margin: 0 }}>123 Business Park, Mumbai · GSTIN: 27ABC1234Z</p>
            </div>
          </div>
        </div>
      )
    case "customer-details":
      return (
        <div style={base}>
          <p style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: accent, fontWeight: 600, margin: "0 0 2px" }}>BILL TO</p>
          <p style={{ fontWeight: 700, margin: "0 0 1px" }}>ABC Technologies Ltd</p>
          <p style={{ color: "#6b7280", fontSize: 11, margin: 0 }}>456 Tech Street, Bangalore · GSTIN: 29XYZ5678A</p>
        </div>
      )
    case "invoice-meta":
      return (
        <div style={{ ...base, display: "flex", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: "0 0 2px" }}><span style={{ color: "#6b7280" }}>Invoice # </span><strong>INV-2603-001</strong></p>
            <p style={{ margin: 0 }}><span style={{ color: "#6b7280" }}>Date </span><strong>2026-03-05</strong></p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: "0 0 2px" }}><span style={{ color: "#6b7280" }}>Due </span><strong>2026-04-05</strong></p>
            <p style={{ margin: 0 }}><span style={{ color: "#6b7280" }}>Currency </span><strong>INR</strong></p>
          </div>
        </div>
      )
    case "items-table":
      return (
        <div style={base}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ background: accent, color: "#fff" }}>
                <th style={{ padding: "5px 8px", textAlign: "left" }}>Item</th>
                <th style={{ padding: "5px 8px", textAlign: "right" }}>Qty</th>
                <th style={{ padding: "5px 8px", textAlign: "right" }}>Price</th>
                <th style={{ padding: "5px 8px", textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: "#f9fafb" }}>
                <td style={{ padding: "4px 8px", borderBottom: "1px solid #f3f4f6" }}>Web Design</td>
                <td style={{ padding: "4px 8px", textAlign: "right", borderBottom: "1px solid #f3f4f6" }}>1</td>
                <td style={{ padding: "4px 8px", textAlign: "right", borderBottom: "1px solid #f3f4f6" }}>₹5,000</td>
                <td style={{ padding: "4px 8px", textAlign: "right", fontWeight: 600, borderBottom: "1px solid #f3f4f6" }}>₹5,900</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 8px" }}>API Dev</td>
                <td style={{ padding: "4px 8px", textAlign: "right" }}>2</td>
                <td style={{ padding: "4px 8px", textAlign: "right" }}>₹3,000</td>
                <td style={{ padding: "4px 8px", textAlign: "right", fontWeight: 600 }}>₹7,080</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    case "totals":
      return (
        <div style={{ ...base, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ minWidth: 180 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}><span style={{ color: "#6b7280" }}>Subtotal</span><span>₹11,000</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}><span style={{ color: "#6b7280" }}>GST 18%</span><span>₹1,980</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: accent, borderTop: `2px solid ${accent}`, paddingTop: 4 }}><span>Grand Total</span><span>₹12,980</span></div>
          </div>
        </div>
      )
    case "notes":
      return (
        <div style={base}>
          <p style={{ fontWeight: 600, margin: "0 0 2px" }}>Notes</p>
          <p style={{ color: "#6b7280", margin: "0 0 8px", fontSize: 11 }}>Payment due within 30 days of invoice date.</p>
          <p style={{ fontWeight: 600, margin: "0 0 2px" }}>Payment Terms</p>
          <p style={{ color: "#6b7280", margin: 0, fontSize: 11 }}>Net 30 days · Late fee: 2% per month</p>
        </div>
      )
    case "signature":
      return (
        <div style={{ ...base, display: "flex", justifyContent: "space-between", paddingTop: 20 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ borderBottom: "1px solid #9ca3af", width: 120, marginBottom: 4 }} />
            <p style={{ color: "#9ca3af", fontSize: 10, margin: 0 }}>Authorized Signature</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ borderBottom: "1px solid #9ca3af", width: 120, marginBottom: 4 }} />
            <p style={{ color: "#9ca3af", fontSize: 10, margin: 0 }}>Received By</p>
          </div>
        </div>
      )
    case "footer":
      return (
        <div style={{ ...base, borderTop: "1px solid #e5e7eb", textAlign: "center", color: "#9ca3af", fontSize: 11 }}>
          Thank you for your business · Generated by AutoInvoice
        </div>
      )
    default:
      return <div style={base}>{type}</div>
  }
}

// ─── Sortable canvas block ─────────────────────────────────────────────────────

function SortableCanvasBlock({ block, isSelected, onSelect, onRemove, globalStyle }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id })

  const def = BLOCK_DEFS.find((d) => d.type === block.type)
  const Icon = def?.icon || FileText
  const s = block.style || {}

  const blockStyle = {
    textAlign: s.textAlign || "left",
    background: s.bgColor || "transparent",
    border: s.border ? "1px solid #e5e7eb" : undefined,
    borderRadius: s.border ? 6 : undefined,
    fontSize: s.fontSize === "xs" ? 11 : s.fontSize === "base" ? 15 : 13,
    fontWeight: s.fontWeight === "bold" ? 700 : undefined,
    fontStyle: s.italic ? "italic" : undefined,
    marginBottom: 0,
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.2 : 1 }}
      onClick={() => onSelect(block.id)}
      className={`relative border rounded-lg bg-white transition-all cursor-pointer group ${isSelected ? "border-primary shadow-md ring-2 ring-primary/20" : "border-border hover:border-primary/40 hover:shadow-sm"
        }`}
    >
      {/* Drag handle */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/40 border-b border-border rounded-t-lg">
        <span {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none" onClick={(e) => e.stopPropagation()}>
          <GripVertical className="h-3.5 w-3.5" />
        </span>
        {def && <span className={`rounded p-0.5 ${def.accent}`}><Icon className="h-3 w-3" /></span>}
        <span className="text-xs font-medium flex-1">{def?.label || block.type}</span>
        {isSelected && <Badge variant="outline" className="text-[10px] py-0 h-4">selected</Badge>}
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(block.id) }}
          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div style={blockStyle}>
        <BlockPreview type={block.type} globalStyle={globalStyle} />
      </div>
    </div>
  )
}

// ─── Drop Zone ────────────────────────────────────────────────────────────────

function CanvasDropZone({ onDrop }) {
  const { isOver, setNodeRef } = useDroppable({ id: "canvas-drop" })
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl py-14 text-center transition-colors ${isOver ? "border-primary bg-primary/5" : "border-border"
        }`}
    >
      <div className="rounded-full bg-muted p-4 mb-3">
        <Table2 className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="font-medium text-sm mb-1">Canvas is empty</p>
      <p className="text-xs text-muted-foreground">Click a block on the left to add it here</p>
    </div>
  )
}

// ─── Block Style Panel ─────────────────────────────────────────────────────────

function BlockStylePanel({ block, onChange }) {
  if (!block) return (
    <div className="flex flex-col items-center justify-center py-8 text-center px-2">
      <div className="rounded-full bg-muted p-3 mb-2"><FileText className="h-5 w-5 text-muted-foreground" /></div>
      <p className="text-xs text-muted-foreground">Click a canvas block to edit its style</p>
    </div>
  )

  const s = block.style || {}
  const def = BLOCK_DEFS.find((d) => d.type === block.type)
  const Icon = def?.icon || FileText

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <span className={`rounded p-1 ${def?.accent || "bg-muted"}`}><Icon className="h-3.5 w-3.5" /></span>
        <p className="font-semibold text-xs">{def?.label}</p>
      </div>

      {/* Font size */}
      <div className="space-y-1">
        <Label className="text-xs">Font Size</Label>
        <Select value={s.fontSize || "sm"} onValueChange={(v) => onChange("fontSize", v)}>
          <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="xs">Small (11px)</SelectItem>
            <SelectItem value="sm">Normal (13px)</SelectItem>
            <SelectItem value="base">Large (15px)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Font weight & style */}
      <div className="space-y-1">
        <Label className="text-xs">Font Style</Label>
        <div className="flex gap-1">
          <button
            onClick={() => onChange("fontWeight", s.fontWeight === "bold" ? "" : "bold")}
            className={`flex-1 py-1 text-xs rounded border font-bold transition-colors ${s.fontWeight === "bold" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}
          >B</button>
          <button
            onClick={() => onChange("italic", !s.italic)}
            className={`flex-1 py-1 text-xs rounded border italic transition-colors ${s.italic ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}
          >I</button>
        </div>
      </div>

      {/* Text align */}
      <div className="space-y-1">
        <Label className="text-xs">Alignment</Label>
        <div className="flex gap-1">
          {[
            { v: "left", icon: AlignLeft },
            { v: "center", icon: AlignCenter },
            { v: "right", icon: AlignRight },
            { v: "justify", icon: AlignJustify },
          ].map(({ v, icon: Icon }) => (
            <button
              key={v}
              onClick={() => onChange("textAlign", v)}
              className={`flex-1 flex items-center justify-center py-1 rounded border transition-colors ${(s.textAlign || "left") === v ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}
            >
              <Icon className="h-3 w-3" />
            </button>
          ))}
        </div>
      </div>

      {/* Block background */}
      <div className="space-y-1">
        <Label className="text-xs">Block Background</Label>
        <div className="grid grid-cols-3 gap-1">
          {[
            { label: "None", value: "" },
            { label: "Gray", value: "#f9fafb" },
            { label: "Blue", value: "#eff6ff" },
            { label: "Green", value: "#f0fdf4" },
            { label: "Yellow", value: "#fefce8" },
            { label: "Pink", value: "#fdf2f8" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange("bgColor", opt.value)}
              title={opt.label}
              className={`h-7 rounded border text-[10px] transition-colors ${(s.bgColor || "") === opt.value ? "ring-2 ring-primary border-primary" : "border-border"}`}
              style={{ background: opt.value || "#fff" }}
            >
              {(s.bgColor || "") === opt.value && <Check className="h-3 w-3 mx-auto text-primary" />}
            </button>
          ))}
        </div>
      </div>

      {/* Show border */}
      <div className="flex items-center justify-between">
        <Label className="text-xs">Show Border</Label>
        <button
          onClick={() => onChange("border", !s.border)}
          className={`relative w-9 h-5 rounded-full transition-colors ${s.border ? "bg-primary" : "bg-muted"}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${s.border ? "left-4" : "left-0.5"}`} />
        </button>
      </div>

      {/* Padding */}
      <div className="space-y-1">
        <Label className="text-xs">Padding</Label>
        <Select value={s.padding || "md"} onValueChange={(v) => onChange("padding", v)}>
          <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="sm">Compact</SelectItem>
            <SelectItem value="md">Normal</SelectItem>
            <SelectItem value="lg">Spacious</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

// ─── Global Style Panel ────────────────────────────────────────────────────────

function GlobalStylePanel({ globalStyle, onChange }) {
  return (
    <div className="space-y-4">
      {/* Font family */}
      <div className="space-y-1">
        <Label className="text-xs flex items-center gap-1"><Type className="h-3 w-3" /> Font Family</Label>
        <Select value={globalStyle.fontFamily || FONT_FAMILIES[0].value} onValueChange={(v) => onChange("fontFamily", v)}>
          <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((f) => (
              <SelectItem key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Accent colour */}
      <div className="space-y-1">
        <Label className="text-xs flex items-center gap-1"><Palette className="h-3 w-3" /> Accent Colour</Label>
        <div className="grid grid-cols-4 gap-1">
          {ACCENT_COLOURS.map((c) => (
            <button
              key={c.value}
              title={c.label}
              onClick={() => onChange("accentColor", c.value)}
              className={`h-7 rounded border-2 transition-all ${globalStyle.accentColor === c.value ? "ring-2 ring-offset-1 ring-primary border-white scale-110" : "border-transparent"}`}
              style={{ background: c.value }}
            />
          ))}
        </div>
        {/* Custom hex */}
        <div className="flex items-center gap-1.5 mt-1">
          <div className="w-6 h-6 rounded border" style={{ background: globalStyle.accentColor || "#16a34a" }} />
          <Input
            className="h-6 text-xs font-mono"
            value={globalStyle.accentColor || "#16a34a"}
            onChange={(e) => onChange("accentColor", e.target.value)}
            placeholder="#000000"
          />
        </div>
      </div>

      {/* Text colour */}
      <div className="space-y-1">
        <Label className="text-xs">Text Colour</Label>
        <div className="grid grid-cols-3 gap-1">
          {TEXT_COLOURS.map((c) => (
            <button
              key={c.value}
              title={c.label}
              onClick={() => onChange("textColor", c.value)}
              className={`flex items-center gap-1 px-1.5 py-1 rounded border text-[10px] transition-colors ${globalStyle.textColor === c.value ? "border-primary ring-1 ring-primary" : "border-border"}`}
            >
              <span className="w-3 h-3 rounded-full border" style={{ background: c.value }} />
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded border" style={{ background: globalStyle.textColor || "#111827" }} />
          <Input
            className="h-6 text-xs font-mono"
            value={globalStyle.textColor || "#111827"}
            onChange={(e) => onChange("textColor", e.target.value)}
          />
        </div>
      </div>

      {/* Page background */}
      <div className="space-y-1">
        <Label className="text-xs">Page Background</Label>
        <div className="grid grid-cols-3 gap-1">
          {BG_COLOURS.map((c) => (
            <button
              key={c.value}
              title={c.label}
              onClick={() => onChange("pageBg", c.value)}
              className={`flex items-center gap-1 px-1.5 py-1 rounded border text-[10px] transition-colors ${globalStyle.pageBg === c.value ? "border-primary ring-1 ring-primary" : "border-border"}`}
            >
              <span className="w-3 h-3 rounded border" style={{ background: c.value }} />
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Header style */}
      <div className="space-y-1">
        <Label className="text-xs">Header / Title Style</Label>
        <Select value={globalStyle.headerStyle || "filled"} onValueChange={(v) => onChange("headerStyle", v)}>
          <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="filled">Filled (coloured header bar)</SelectItem>
            <SelectItem value="minimal">Minimal (no header bar)</SelectItem>
            <SelectItem value="underline">Underline only</SelectItem>
            <SelectItem value="dark">Dark / inverted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoice title */}
      <div className="space-y-1">
        <Label className="text-xs">Invoice Title Text</Label>
        <Input
          className="h-7 text-xs"
          value={globalStyle.invoiceTitle || "INVOICE"}
          onChange={(e) => onChange("invoiceTitle", e.target.value)}
          placeholder="INVOICE"
        />
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

function TemplateBuilderPage() {
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [savedTemplate, setSavedTemplate] = useLocalStorage("custom-template", null)
  const [, setSelectedTemplate] = useLocalStorage("selected-template", "minimal")

  const [blocks, setBlocks] = useState(() =>
    savedTemplate?.blocks?.length ? savedTemplate.blocks : DEFAULT_BLOCKS,
  )
  const [selectedId, setSelectedId] = useState(null)
  const [dragActiveId, setDragActiveId] = useState(null)
  const [isPaletteDragging, setIsPaletteDragging] = useState(null)
  const [leftTab, setLeftTab] = useState("blocks") // "blocks" | "global" | "block-style"

  const [globalStyle, setGlobalStyle] = useState(() =>
    savedTemplate?.globalStyle || { accentColor: "#16a34a", textColor: "#111827", fontFamily: "system-ui, sans-serif", pageBg: "#ffffff", headerStyle: "filled", invoiceTitle: "INVOICE" }
  )

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const selectedBlock = blocks.find((b) => b.id === selectedId) || null
  const dragActiveBlock = blocks.find((b) => b.id === dragActiveId) || null

  const handleDragStart = useCallback(({ active }) => setDragActiveId(active.id), [])
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
    setLeftTab("block-style")
  }, [])

  const handleRemoveBlock = useCallback((id) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id))
    if (selectedId === id) setSelectedId(null)
  }, [selectedId])

  const handleStyleChange = useCallback((key, value) => {
    setBlocks((prev) => prev.map((b) => b.id === selectedId ? { ...b, style: { ...b.style, [key]: value } } : b))
  }, [selectedId])

  const handleGlobalChange = useCallback((key, value) => {
    setGlobalStyle((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleReset = useCallback(() => {
    setBlocks(DEFAULT_BLOCKS.map((b) => ({ ...b, id: `def-${Date.now()}-${b.id}`, style: {} })))
    setGlobalStyle({ accentColor: "#16a34a", textColor: "#111827", fontFamily: "system-ui, sans-serif", pageBg: "#ffffff", headerStyle: "filled", invoiceTitle: "INVOICE" })
    setSelectedId(null)
    showSuccessToast("Canvas reset to defaults")
  }, [showSuccessToast])

  const handleSave = useCallback(() => {
    setSavedTemplate({ blocks, globalStyle, savedAt: new Date().toISOString() })
    setSelectedTemplate("custom")
    showSuccessToast("Template saved and activated! It will be used for all new invoices.")
  }, [blocks, globalStyle, setSavedTemplate, setSelectedTemplate, showSuccessToast])

  const handlePreview = useCallback(() => {
    const accent = globalStyle.accentColor || "#16a34a"
    const font = globalStyle.fontFamily || "system-ui, sans-serif"
    const textColor = globalStyle.textColor || "#111827"
    const pageBg = globalStyle.pageBg || "#ffffff"

    const blockHtml = (block) => {
      const s = block.style || {}
      const fs = s.fontSize === "xs" ? "11px" : s.fontSize === "base" ? "15px" : "13px"
      const ta = s.textAlign || "left"
      const bg = s.bgColor || "transparent"
      const border = s.border ? "border:1px solid #e5e7eb;border-radius:6px;" : ""
      const pad = s.padding === "sm" ? "8px 12px" : s.padding === "lg" ? "20px 16px" : "12px 14px"
      const fw = s.fontWeight === "bold" ? "font-weight:700;" : ""
      const fi = s.italic ? "font-style:italic;" : ""
      const wrap = `style="padding:${pad};margin-bottom:10px;font-size:${fs};text-align:${ta};background:${bg};${border}${fw}${fi}"`

      switch (block.type) {
        case "company-header":
          return `<div ${wrap}><table><tr><td style="padding-right:12px"><div style="width:40px;height:40px;background:${accent};border-radius:6px;color:white;font-weight:700;font-size:14px;line-height:40px;text-align:center">AI</div></td><td><strong style="font-size:15px">${globalStyle.invoiceTitle || "INVOICE"}</strong><br><strong style="font-size:13px">AutoInvoice Pvt Ltd</strong><br><span style="color:#6b7280">123 Business Park, Mumbai · GSTIN: 27ABC1234Z</span></td></tr></table></div>`
        case "customer-details":
          return `<div ${wrap}><p style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:${accent};font-weight:600;margin-bottom:3px">BILL TO</p><strong>ABC Technologies Ltd</strong><br><span style="color:#6b7280">456 Tech Street, Bangalore · GSTIN: 29XYZ5678A · +91 98765 43210</span></div>`
        case "invoice-meta":
          return `<div ${wrap}><table style="width:100%"><tr><td>Invoice # <strong>INV-2603-001</strong><br>Date <strong>2026-03-05</strong></td><td style="text-align:right">Due <strong>2026-04-05</strong><br>Currency <strong>INR</strong></td></tr></table></div>`
        case "items-table":
          return `<div ${wrap}><table style="width:100%;border-collapse:collapse"><thead><tr style="background:${accent};color:white"><th style="padding:7px 10px;text-align:left">Item</th><th style="padding:7px 10px;text-align:right">Qty</th><th style="padding:7px 10px;text-align:right">Price</th><th style="padding:7px 10px;text-align:right">Total</th></tr></thead><tbody><tr style="background:#f9fafb"><td style="padding:6px 10px;border-bottom:1px solid #f3f4f6">Web Design</td><td style="padding:6px 10px;text-align:right;border-bottom:1px solid #f3f4f6">1</td><td style="padding:6px 10px;text-align:right;border-bottom:1px solid #f3f4f6">₹5,000.00</td><td style="padding:6px 10px;text-align:right;font-weight:600;border-bottom:1px solid #f3f4f6">₹5,900.00</td></tr><tr><td style="padding:6px 10px">API Development</td><td style="padding:6px 10px;text-align:right">2</td><td style="padding:6px 10px;text-align:right">₹3,000.00</td><td style="padding:6px 10px;text-align:right;font-weight:600">₹7,080.00</td></tr></tbody></table></div>`
        case "totals":
          return `<div ${wrap}><table style="margin-left:auto;min-width:200px"><tr><td style="color:#6b7280;padding:3px 8px">Subtotal</td><td style="text-align:right;padding:3px 8px">₹11,000.00</td></tr><tr><td style="color:#6b7280;padding:3px 8px">GST (18%)</td><td style="text-align:right;padding:3px 8px">₹1,980.00</td></tr><tr style="border-top:2px solid ${accent}"><td style="padding:6px 8px;font-weight:700;color:${accent}">Grand Total</td><td style="text-align:right;padding:6px 8px;font-weight:700;color:${accent}">₹12,980.00</td></tr></table></div>`
        case "notes":
          return `<div ${wrap}><p style="font-weight:600;margin-bottom:4px">Notes</p><p style="color:#6b7280;margin-bottom:10px">Payment due within 30 days. Cheque / NEFT / UPI accepted.</p><p style="font-weight:600;margin-bottom:4px">Payment Terms</p><p style="color:#6b7280">Net 30 days · Late surcharge: 2%/month</p></div>`
        case "signature":
          return `<div ${wrap}><table style="width:100%"><tr><td style="text-align:center;padding:0 20px"><div style="border-bottom:1px solid #9ca3af;height:36px;margin-bottom:4px"></div><p style="color:#9ca3af;font-size:10px">Authorized Signature</p></td><td style="text-align:center;padding:0 20px"><div style="border-bottom:1px solid #9ca3af;height:36px;margin-bottom:4px"></div><p style="color:#9ca3af;font-size:10px">Received By</p></td></tr></table></div>`
        case "footer":
          return `<div ${wrap} style="${wrap.slice(7, -1)};border-top:1px solid #e5e7eb;text-align:center;color:#9ca3af;font-size:11px">Thank you for your business &bull; Generated by AutoInvoice</div>`
        default: return ""
      }
    }

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Invoice Preview</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet"/>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:${font};color:${textColor};background:${pageBg};padding:32px}@media print{body{padding:12mm}}</style>
</head><body>${blocks.map(blockHtml).join("\n")}</body></html>`

    const popup = window.open("", "_blank", "width=960,height=720,left=100,top=80")
    if (!popup) { showErrorToast("Allow popups to preview"); return }
    popup.document.write(html)
    popup.document.close()
    popup.focus()
  }, [blocks, globalStyle, showErrorToast])

  // Switch to block-style tab whenever a block is selected
  const handleSelectBlock = useCallback((id) => {
    setSelectedId(id)
    setLeftTab("block-style")
  }, [])

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Link to="/invoice-templates">
            <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Template Builder</h1>
            <p className="text-muted-foreground text-xs">Drag to reorder · click block to style it · save to use as your invoice template</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />Reset
          </Button>
          <Button variant="outline" size="sm" onClick={handlePreview}>
            <Eye className="mr-1.5 h-3.5 w-3.5" />Preview
          </Button>
          <Button size="sm" onClick={handleSave} className="gap-1.5">
            <Save className="h-3.5 w-3.5" />Save & Activate
          </Button>
        </div>
      </div>

      {/* ── Two-panel layout ── */}
      <div className="grid grid-cols-[300px_1fr] gap-4" style={{ minHeight: "78vh" }}>

        {/* ═══ LEFT PANEL ═══════════════════════════════════════════════════ */}
        <Card className="flex flex-col overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-border shrink-0">
            {[
              { id: "blocks", icon: Layout, label: "Fields" },
              { id: "global", icon: Palette, label: "Design" },
              { id: "block-style", icon: Type, label: "Block Style" },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setLeftTab(id)}
                className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium transition-colors border-b-2 ${leftTab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
              >
                <Icon className="h-3 w-3" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* ── Fields tab ── */}
            {leftTab === "blocks" && (
              <div className="p-2 space-y-1">
                <p className="text-[10px] text-muted-foreground px-2 pb-1 pt-1 uppercase tracking-wide font-medium">Available Blocks — Click to add</p>
                {BLOCK_DEFS.map((def) => {
                  const Icon = def.icon
                  const alreadyAdded = blocks.some((b) => b.type === def.type)
                  return (
                    <button
                      key={def.type}
                      onClick={() => handleAddBlock(def.type)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all text-left group"
                    >
                      <span className={`rounded p-1.5 shrink-0 ${def.accent}`}><Icon className="h-3.5 w-3.5" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{def.label}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{def.desc}</p>
                      </div>
                      <Plus className={`h-3.5 w-3.5 shrink-0 ${alreadyAdded ? "text-muted-foreground/40" : "text-muted-foreground opacity-0 group-hover:opacity-100"}`} />
                    </button>
                  )
                })}
              </div>
            )}

            {/* ── Design tab ── */}
            {leftTab === "global" && (
              <div className="p-3">
                <GlobalStylePanel globalStyle={globalStyle} onChange={handleGlobalChange} />
              </div>
            )}

            {/* ── Block Style tab ── */}
            {leftTab === "block-style" && (
              <div className="p-3">
                <BlockStylePanel block={selectedBlock} onChange={handleStyleChange} />
              </div>
            )}
          </div>
        </Card>

        {/* ═══ RIGHT PANEL — Canvas ══════════════════════════════════════════ */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="px-4 py-2.5 border-b shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm">Invoice Canvas</CardTitle>
                <Badge variant="outline" className="text-[10px]">{blocks.length} block{blocks.length !== 1 && "s"}</Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><GripVertical className="h-3 w-3" /> drag to reorder</span>
                <span>·</span>
                <span>click to style</span>
              </div>
            </div>
          </CardHeader>

          <div className="flex-1 overflow-y-auto p-4" style={{ background: "#f8f9fa" }}>
            {/* A4-like page shell */}
            <div
              className="mx-auto rounded-lg shadow-lg overflow-hidden"
              style={{
                maxWidth: 680,
                minHeight: 400,
                background: globalStyle.pageBg || "#ffffff",
                fontFamily: globalStyle.fontFamily || "system-ui, sans-serif",
              }}
            >
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                  <div className="p-2 space-y-1 min-h-[300px]">
                    {blocks.length === 0
                      ? <CanvasDropZone />
                      : blocks.map((block) => (
                        <SortableCanvasBlock
                          key={block.id}
                          block={block}
                          isSelected={selectedId === block.id}
                          onSelect={handleSelectBlock}
                          onRemove={handleRemoveBlock}
                          globalStyle={globalStyle}
                        />
                      ))
                    }
                  </div>
                </SortableContext>

                <DragOverlay dropAnimation={null}>
                  {dragActiveBlock && (
                    <div className="border border-primary rounded-lg bg-white shadow-2xl opacity-90 pointer-events-none" style={{ maxWidth: 640 }}>
                      <div className="flex items-center gap-2 px-2.5 py-1 bg-muted/40 border-b border-border rounded-t-lg">
                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium">{BLOCK_DEFS.find((d) => d.type === dragActiveBlock.type)?.label}</span>
                      </div>
                      <BlockPreview type={dragActiveBlock.type} globalStyle={globalStyle} />
                    </div>
                  )}
                </DragOverlay>
              </DndContext>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
