import {
    DndContext,
    DragOverlay,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from "@dnd-kit/core"
import {
    SortableContext,
    arrayMove,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Plus, X } from "lucide-react"
import { useEffect, useState } from "react"
import { COLUMN_TYPES } from "@/components/DataTables/PropertyRow"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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

// ─── Quick-add presets ────────────────────────────────────────────────────────
const QUICK_ADD_PRESETS = [
    { name: "Client Name", type: "Text" },
    { name: "Amount", type: "Amount (₹)" },
    { name: "Due Date", type: "Due Date" },
    { name: "Status", type: "Status" },
    { name: "Notes", type: "Text" },
]

// ─── Sortable Column Item ─────────────────────────────────────────────────────
// Two-row compact layout inside a fixed-width panel to avoid ALL overflow:
//   Row 1: [drag-handle] [name-input (flex-1)] [x-button]
//   Row 2:               [type-select (flex-1)] [req-checkbox]
//
// The name input uses a controlled value that reflects external state changes
// (two-way sync with the TablePreview column headers).
function SortableColumnItem({ col, index, totalCount, onChange, onRemove, isDragOverlay = false }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: col._id })

    // Local controlled state for the name input.
    // Syncs from external col.name when not focused (two-way sync from table header edits).
    const [localName, setLocalName] = useState(col.name)
    const [isFocused, setIsFocused] = useState(false)

    useEffect(() => {
        if (!isFocused) setLocalName(col.name)
    }, [col.name, isFocused])

    const commitName = () => {
        const { _isBlank, _isDuplicate, ...clean } = col
        onChange(index, { ...clean, name: localName })
        setIsFocused(false)
    }

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition ?? "transform 200ms ease",
        opacity: isDragging && !isDragOverlay ? 0.3 : 1,
    }

    const isError = col._isBlank || col._isDuplicate

    return (
        <div
            ref={isDragOverlay ? undefined : setNodeRef}
            style={isDragOverlay ? {} : style}
            className={`flex flex-col gap-1.5 rounded-lg border bg-card p-2
                ${isDragOverlay ? "shadow-xl ring-2 ring-primary/30" : "shadow-sm"}`}
        >
            {/* ── Row 1: drag + name + delete ─── */}
            <div className="flex items-center gap-1.5">
                {/* Drag handle */}
                <button
                    {...(isDragOverlay ? {} : attributes)}
                    {...(isDragOverlay ? {} : listeners)}
                    className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground transition-colors shrink-0 touch-none"
                    aria-label="Drag to reorder"
                    tabIndex={-1}
                    type="button"
                >
                    <GripVertical className="h-3.5 w-3.5" />
                </button>

                {/* Column name — controlled, syncs both ways */}
                <Input
                    placeholder="Column name"
                    value={localName}
                    onFocus={() => setIsFocused(true)}
                    onChange={(e) => setLocalName(e.target.value)}
                    onBlur={commitName}
                    onKeyDown={(e) => { if (e.key === "Enter") commitName() }}
                    className={`flex-1 min-w-0 h-7 text-xs ${isError
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                        }`}
                />

                {/* Delete — always in-container, never overflows */}
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onRemove(index)}
                    disabled={totalCount <= 1}
                    aria-label="Remove column"
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>

            {/* ── Row 2: type select + required — indented to align under name ── */}
            <div className="flex items-center gap-1.5 pl-[22px]">
                {/* Type */}
                <Select
                    value={col.type}
                    onValueChange={(type) => {
                        const { _isBlank, _isDuplicate, ...clean } = col
                        onChange(index, { ...clean, type })
                    }}
                >
                    <SelectTrigger className="flex-1 min-w-0 h-7 text-[11px]">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        {COLUMN_TYPES.map((type) => (
                            <SelectItem key={type} value={type} className="text-xs">
                                {type}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Required */}
                <div className="flex items-center gap-1 shrink-0">
                    <Checkbox
                        id={`req-${col._id}`}
                        checked={!!col.mandatory}
                        onCheckedChange={(checked) => {
                            const { _isBlank, _isDuplicate, ...clean } = col
                            onChange(index, { ...clean, mandatory: !!checked })
                        }}
                        className="h-3.5 w-3.5"
                    />
                    <Label
                        htmlFor={`req-${col._id}`}
                        className="text-[10px] text-muted-foreground cursor-pointer select-none whitespace-nowrap"
                    >
                        Required
                    </Label>
                </div>
            </div>

            {/* Dropdown options (expanded row) */}
            {col.type === "Dropdown" && (
                <div className="pl-[22px]">
                    <Input
                        placeholder="Options: e.g. A, B, C"
                        defaultValue={(col.options ?? []).join(", ")}
                        onBlur={(e) => {
                            const opts = e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean)
                            onChange(index, { ...col, options: opts })
                        }}
                        className="h-7 text-[11px] text-muted-foreground"
                    />
                </div>
            )}
        </div>
    )
}

// ─── ColumnEditorPanel ────────────────────────────────────────────────────────
// Right-side panel — fixed width, vertical scroll only, no horizontal scroll.
// Drag-and-drop here reorders shared `columns` state, which the TablePreview
// column headers reflect immediately (and vice-versa).
export function ColumnEditorPanel({ columns, setColumns, onAddColumn }) {
    const [activeId, setActiveId] = useState(null)

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    )

    // Compute validation flags
    const names = columns.map((c) => c.name.trim())
    const enrichedColumns = columns.map((col) => ({
        ...col,
        _isBlank: col.name.trim() === "",
        _isDuplicate:
            col.name.trim() !== "" &&
            names.filter((n) => n === col.name.trim()).length > 1,
    }))

    const handleDragStart = ({ active }) => setActiveId(active.id)

    const handleDragEnd = ({ active, over }) => {
        setActiveId(null)
        if (!over || active.id === over.id) return
        const fromIdx = columns.findIndex((c) => c._id === active.id)
        const toIdx = columns.findIndex((c) => c._id === over.id)
        if (fromIdx === -1 || toIdx === -1) return
        setColumns((prev) => arrayMove(prev, fromIdx, toIdx))
    }

    const handleChange = (index, updated) => {
        setColumns((prev) => prev.map((c, i) => (i === index ? updated : c)))
    }

    const handleRemove = (index) => {
        if (columns.length <= 1) return
        setColumns((prev) => prev.filter((_, i) => i !== index))
    }

    const handleQuickAdd = (preset) => {
        setColumns((prev) => [
            ...prev,
            {
                name: preset.name,
                type: preset.type,
                mandatory: false,
                options: [],
                _id: crypto.randomUUID(),
            },
        ])
    }

    const activeCol = activeId ? columns.find((c) => c._id === activeId) : null
    const activeIdx = activeId ? columns.findIndex((c) => c._id === activeId) : -1

    return (
        // Fixed 272px width — overflow-y-auto for scroll, overflow-x-hidden to prevent any bleed
        <div className="w-68 flex-shrink-0 border-l border-border bg-background flex flex-col overflow-hidden"
            style={{ width: "272px" }}
        >
            {/* ── Sticky Panel Header ─── */}
            <div className="px-3 py-2.5 border-b border-border shrink-0 bg-background flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground tracking-wide uppercase">Properties</span>
                <Badge variant="secondary" className="text-[10px] tabular-nums h-4 px-1.5">
                    {columns.length}
                </Badge>
            </div>

            {/* ── Scrollable Content — vertical only ─── */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
                <div className="flex flex-col gap-4 px-3 py-3">

                    {/* Column list with DnD */}
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={columns.map((c) => c._id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="flex flex-col gap-1.5">
                                {enrichedColumns.map((col, i) => (
                                    <SortableColumnItem
                                        key={col._id}
                                        col={col}
                                        index={i}
                                        totalCount={columns.length}
                                        onChange={handleChange}
                                        onRemove={handleRemove}
                                    />
                                ))}
                            </div>
                        </SortableContext>

                        <DragOverlay>
                            {activeCol && activeIdx !== -1 ? (
                                <SortableColumnItem
                                    col={enrichedColumns[activeIdx]}
                                    index={activeIdx}
                                    totalCount={columns.length}
                                    onChange={() => { }}
                                    onRemove={() => { }}
                                    isDragOverlay
                                />
                            ) : null}
                        </DragOverlay>
                    </DndContext>

                    {/* Add Column */}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5 text-xs h-8"
                        onClick={onAddColumn}
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add Column
                    </Button>

                    <Separator />

                    {/* Quick Add */}
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Quick Add
                        </span>
                        <div className="flex flex-wrap gap-1">
                            {QUICK_ADD_PRESETS.map((preset) => {
                                const exists = columns.some(
                                    (c) => c.name.trim() === preset.name
                                )
                                return (
                                    <button
                                        key={preset.name}
                                        type="button"
                                        disabled={exists}
                                        onClick={() => handleQuickAdd(preset)}
                                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors
                                            ${exists
                                                ? "border-border text-muted-foreground/40 cursor-not-allowed"
                                                : "border-border text-foreground hover:border-primary hover:bg-accent cursor-pointer"
                                            }`}
                                    >
                                        {preset.name}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ColumnEditorPanel
