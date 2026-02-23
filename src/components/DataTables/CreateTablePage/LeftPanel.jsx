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
import { useState } from "react"
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

// ─── Sortable Column Item ──────────────────────────────────────────────────────
function SortableColumnItem({ col, index, totalCount, onChange, onRemove, isDragOverlay = false }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: col._id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition ?? "transform 200ms ease",
        opacity: isDragging && !isDragOverlay ? 0.3 : 1,
    }

    const isDuplicate = false // computed externally and passed via col._isDuplicate
    const isBlank = col._isBlank

    return (
        <div
            ref={isDragOverlay ? undefined : setNodeRef}
            style={isDragOverlay ? {} : style}
            className={`flex flex-col gap-1.5 rounded-lg border bg-card p-2.5 ${isDragOverlay ? "shadow-xl ring-2 ring-primary/30" : ""}`}
        >
            {/* Main row */}
            <div className="flex items-center gap-1.5">
                {/* Drag handle */}
                <button
                    {...(isDragOverlay ? {} : attributes)}
                    {...(isDragOverlay ? {} : listeners)}
                    className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors shrink-0 touch-none"
                    aria-label="Drag to reorder"
                    tabIndex={-1}
                    type="button"
                >
                    <GripVertical className="h-4 w-4" />
                </button>

                {/* Column name */}
                <Input
                    placeholder="Column name"
                    value={col.name}
                    onChange={(e) => {
                        // strip internal enrichment flags before writing back to state
                        const { _isBlank, _isDuplicate, ...clean } = col
                        onChange(index, { ...clean, name: e.target.value })
                    }}
                    className={`flex-1 h-8 text-sm text-foreground ${isBlank || col._isDuplicate
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                        }`}
                />

                {/* Type select */}
                <Select
                    value={col.type}
                    onValueChange={(type) => {
                        const { _isBlank, _isDuplicate, ...clean } = col
                        onChange(index, { ...clean, type })
                    }}
                >
                    <SelectTrigger className="w-36 h-8 text-xs shrink-0">
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

                {/* Required checkbox */}
                <div className="flex items-center gap-1 shrink-0">
                    <Checkbox
                        id={`required-${col._id}`}
                        checked={!!col.mandatory}
                        onCheckedChange={(checked) => {
                            const { _isBlank, _isDuplicate, ...clean } = col
                            onChange(index, { ...clean, mandatory: !!checked })
                        }}
                    />
                    <Label
                        htmlFor={`required-${col._id}`}
                        className="text-[11px] text-muted-foreground cursor-pointer select-none"
                    >
                        Req.
                    </Label>
                </div>

                {/* Remove */}
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemove(index)}
                    disabled={totalCount <= 1}
                    aria-label="Remove column"
                >
                    <X className="h-3.5 w-3.5" />
                </Button>
            </div>

            {/* Dropdown options */}
            {col.type === "Dropdown" && (
                <div className="pl-6">
                    <Input
                        placeholder="Options: e.g. Option A, Option B"
                        defaultValue={(col.options ?? []).join(", ")}
                        onBlur={(e) => {
                            const opts = e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean)
                            onChange(index, { ...col, options: opts })
                        }}
                        className="h-7 text-xs text-muted-foreground"
                    />
                </div>
            )}
        </div>
    )
}

// ─── LeftPanel ────────────────────────────────────────────────────────────────
export function LeftPanel({
    tableName,
    setTableName,
    tableNameInputRef,
    columns,
    setColumns,
}) {
    const [activeId, setActiveId] = useState(null)

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    )

    // Compute validation flags
    const names = columns.map((c) => c.name.trim())
    const enrichedColumns = columns.map((col, i) => ({
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

    const handleAddColumn = () => {
        setColumns((prev) => [
            ...prev,
            {
                name: "",
                type: "Text",
                mandatory: false,
                options: [],
                _id: crypto.randomUUID(),
            },
        ])
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
        <div className="w-80 flex-shrink-0 border-r bg-muted/20 overflow-y-auto px-4 py-6 flex flex-col gap-5">
            {/* Table Name */}
            <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Table Name
                </Label>
                <Input
                    ref={tableNameInputRef}
                    placeholder="e.g. Invoice Tracker"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    className={`h-9 ${tableName.trim() === "" ? "border-muted-foreground/30" : ""}`}
                    autoFocus
                />
            </div>

            <Separator />

            {/* Columns */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Columns
                    </Label>
                    <Badge variant="secondary" className="text-xs tabular-nums">
                        {columns.length}
                    </Badge>
                </div>

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
                        <div className="flex flex-col gap-2">
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
                    className="w-full gap-1.5 text-xs"
                    onClick={handleAddColumn}
                >
                    <Plus className="h-3.5 w-3.5" />
                    Add Column
                </Button>
            </div>

            <Separator />

            {/* Quick Add */}
            <div className="flex flex-col gap-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Quick Add
                </Label>
                <div className="flex flex-wrap gap-1.5">
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
                                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors
                  ${exists
                                        ? "border-border text-muted-foreground/50 cursor-not-allowed bg-muted/30"
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
    )
}

export default LeftPanel
