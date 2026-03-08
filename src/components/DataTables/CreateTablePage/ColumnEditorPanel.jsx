import {
    DndContext,
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
import { ChevronDown, ChevronRight, GripVertical, Plus, Trash2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
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

// ─── Single sortable expandable column card ──────────────────────────────────
function ColumnCard({ col, index, totalCount, isOpen, onToggle, onChange, onRemove }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: col._id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition ?? "transform 200ms ease",
        opacity: isDragging ? 0.4 : 1,
    }
    const [localName, setLocalName] = useState(col.name)
    const [isFocused, setIsFocused] = useState(false)

    // Sync name from outside (e.g. renamed via table header double-click)
    useEffect(() => {
        if (!isFocused) setLocalName(col.name)
    }, [col.name, isFocused])

    const commitName = () => {
        const { _isBlank, _isDuplicate, ...clean } = col
        onChange(index, { ...clean, name: localName })
        setIsFocused(false)
    }

    const isError = col._isBlank || col._isDuplicate
    const badgeColor = "bg-muted text-muted-foreground"
    const displayName = col.name.trim() || "Untitled column"

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`rounded-lg border bg-card transition-all ${isError ? "border-destructive/60" : "border-border"}`}
        >
            {/* ── Collapsed row (always visible) ── */}
            <div className="flex items-center group">

                {/* Drag handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="shrink-0 pl-2 pr-1 py-3 cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors touch-none"
                >
                    <GripVertical className="h-4 w-4" />
                </div>

                {/* Clickable expand area */}
                <button
                    type="button"
                    onClick={onToggle}
                    className="flex-1 min-w-0 flex items-center gap-2 py-2.5 pr-2 text-left hover:bg-muted/30 transition-colors"
                >
                    {/* Index pill */}
                    <span className="shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                        {index + 1}
                    </span>

                    {/* Column name */}
                    <span className={`flex-1 min-w-0 text-sm font-medium truncate ${col.name.trim() ? "text-foreground" : "text-muted-foreground/50 italic"}`}>
                        {displayName}
                    </span>

                    {/* Type badge */}
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap ${badgeColor}`}>
                        {col.type}
                    </span>

                    {/* Chevron */}
                    {isOpen
                        ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    }
                </button>

                {/* Delete — always visible, outside the expand button */}
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    disabled={totalCount <= 1}
                    aria-label="Delete column"
                    className="shrink-0 mr-2 h-6 w-6 rounded flex items-center justify-center text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* ── Expanded editor ── */}
            {isOpen && (
                <div className="px-3 pb-3 flex flex-col gap-3 border-t border-border">

                    {/* Column name input */}
                    <div className="flex flex-col gap-1 pt-2">
                        <Label className="text-xs text-muted-foreground">Column Name</Label>
                        <Input
                            placeholder="e.g. Customer Name"
                            value={localName}
                            onFocus={() => setIsFocused(true)}
                            onChange={(e) => setLocalName(e.target.value)}
                            onBlur={commitName}
                            onKeyDown={(e) => { if (e.key === "Enter") commitName() }}
                            className={`h-8 text-sm ${isError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        />
                        {col._isBlank && <p className="text-[11px] text-destructive">Name is required</p>}
                        {col._isDuplicate && <p className="text-[11px] text-destructive">Duplicate name</p>}
                    </div>

                    {/* Column type */}
                    <div className="flex flex-col gap-1">
                        <Label className="text-xs text-muted-foreground">Column Type</Label>
                        <Select
                            value={col.type}
                            onValueChange={(type) => {
                                const { _isBlank, _isDuplicate, ...clean } = col
                                onChange(index, { ...clean, type })
                            }}
                        >
                            <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Choose type" />
                            </SelectTrigger>
                            <SelectContent>
                                {COLUMN_TYPES.map((type) => (
                                    <SelectItem key={type} value={type} className="text-sm">{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Dropdown options */}
                    {col.type === "Dropdown" && (
                        <div className="flex flex-col gap-1">
                            <Label className="text-xs text-muted-foreground">
                                Options <span className="font-normal">(comma-separated)</span>
                            </Label>
                            <Input
                                placeholder="e.g. Pending, Paid, Overdue"
                                defaultValue={(col.options ?? []).join(", ")}
                                onBlur={(e) => {
                                    const opts = e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                                    onChange(index, { ...col, options: opts })
                                }}
                                className="h-8 text-sm"
                            />
                        </div>
                    )}

                    {/* Required toggle */}
                    <div className="flex items-center gap-2 pt-0.5">
                        <Checkbox
                            id={`req-${col._id}`}
                            checked={!!col.mandatory}
                            onCheckedChange={(checked) => {
                                const { _isBlank, _isDuplicate, ...clean } = col
                                onChange(index, { ...clean, mandatory: !!checked })
                            }}
                            className="h-4 w-4"
                        />
                        <Label htmlFor={`req-${col._id}`} className="text-sm cursor-pointer select-none">
                            Required field
                        </Label>
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── ColumnEditorPanel ────────────────────────────────────────────────────────
export function ColumnEditorPanel({ columns, setColumns, onAddColumn }) {
    const [openId, setOpenId] = useState(() => columns[0]?._id ?? null)
    const prevIdsRef = useRef(new Set(columns.map((c) => c._id)))

    // Auto-open the newly added column and close the rest
    useEffect(() => {
        const prevIds = prevIdsRef.current
        const newCol = columns.find((c) => !prevIds.has(c._id))
        if (newCol) setOpenId(newCol._id)
        prevIdsRef.current = new Set(columns.map((c) => c._id))
    }, [columns])

    const names = columns.map((c) => c.name.trim())
    const enrichedColumns = columns.map((col) => ({
        ...col,
        _isBlank: col.name.trim() === "",
        _isDuplicate:
            col.name.trim() !== "" &&
            names.filter((n) => n === col.name.trim()).length > 1,
    }))

    const handleChange = (index, updated) => {
        setColumns((prev) => prev.map((c, i) => (i === index ? updated : c)))
    }

    const handleRemove = (index) => {
        if (columns.length <= 1) return
        setColumns((prev) => prev.filter((_, i) => i !== index))
    }

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
    )

    const handleDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return
        const oldIndex = columns.findIndex((c) => c._id === active.id)
        const newIndex = columns.findIndex((c) => c._id === over.id)
        setColumns((prev) => arrayMove(prev, oldIndex, newIndex))
    }

    return (
        <div
            data-panel="side-column"
            tabIndex={0}
            className="w-80 flex-shrink-0 border-l border-border bg-background flex flex-col overflow-hidden outline-none focus:ring-2 focus:ring-primary/20"
            onKeyDown={(e) => {
                if (e.key === "ArrowLeft") {
                    const headers = document.querySelectorAll("[data-col-id]")
                    if (headers.length > 0) {
                        headers[headers.length - 1].focus()
                    }
                }
            }}
        >

            {/* ── Panel Header ── */}
            <div className="px-4 py-3 border-b border-border shrink-0 flex items-center justify-between">
                <div>
                    <span className="text-sm font-semibold text-foreground">Properties</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Click a column to configure it</p>
                </div>
                <Badge variant="secondary" className="tabular-nums text-[10px]">
                    {columns.length} {columns.length === 1 ? "column" : "columns"}
                </Badge>
            </div>

            {/* ── Scrollable column list ── */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={columns.map((c) => c._id)} strategy={verticalListSortingStrategy}>
                        <div className="flex flex-col gap-1.5 px-3 py-3">
                            {enrichedColumns.map((col, i) => (
                                <ColumnCard
                                    key={col._id}
                                    col={col}
                                    index={i}
                                    totalCount={columns.length}
                                    isOpen={openId === col._id}
                                    onToggle={() => setOpenId((prev) => (prev === col._id ? null : col._id))}
                                    onChange={handleChange}
                                    onRemove={handleRemove}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>

            {/* ── Sticky footer: Add Column ── */}
            <div className="px-3 py-3 border-t border-border shrink-0">
                <Button
                    type="button"
                    className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all active:scale-[0.98]"
                    onClick={onAddColumn}
                >
                    <Plus className="h-4 w-4" />
                    Add New Column
                </Button>
            </div>
        </div>
    )
}

export default ColumnEditorPanel

