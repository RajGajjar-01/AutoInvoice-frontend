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
    horizontalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, LayoutGrid, Plus, Trash2 } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

// ─── Type badge colours ───────────────────────────────────────────────────────
const TYPE_BADGE_COLORS = {
    Text: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    Number: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    Date: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    Status: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    Tag: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    "Amount (₹)": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    Checkbox: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
    "Payment Status": "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
    "Due Date": "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    "Expiry Date": "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    Attachment: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    Dropdown: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
}

// ─── Sortable Column Header Cell ──────────────────────────────────────────────
function SortableColumnHeader({ col, onChange, onDelete, canDelete, isDragOverlay = false }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: col._id })
    const [editing, setEditing] = useState(false)
    const [localName, setLocalName] = useState(col.name)
    const inputRef = useRef(null)

    useEffect(() => { if (!editing) setLocalName(col.name) }, [col.name, editing])

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition ?? "transform 200ms ease",
        opacity: isDragging && !isDragOverlay ? 0.25 : 1,
    }

    const badgeColor = TYPE_BADGE_COLORS[col.type] ?? "bg-muted text-muted-foreground"

    const commit = useCallback(() => {
        const { _isBlank, _isDuplicate, ...clean } = col
        onChange({ ...clean, name: localName })
        setEditing(false)
    }, [col, localName, onChange])

    return (
        <div
            ref={isDragOverlay ? undefined : setNodeRef}
            style={isDragOverlay ? {} : style}
            className={`
                w-44 shrink-0 flex items-center border-r border-border last:border-r-0 select-none relative group
                bg-muted/40 transition-colors hover:bg-muted/70
                ${isDragOverlay ? "shadow-xl ring-2 ring-primary/30 rounded" : ""}
            `}
            onDoubleClick={() => {
                if (isDragOverlay) return
                setEditing(true)
                setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select() }, 0)
            }}
            title="Double-click to rename · Drag to reorder"
        >
            {/* Drag handle — visible on hover */}
            <div
                {...(isDragOverlay ? {} : attributes)}
                {...(isDragOverlay ? {} : listeners)}
                className="px-1.5 py-3 cursor-grab active:cursor-grabbing text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors shrink-0"
            >
                <GripVertical className="h-3.5 w-3.5" />
            </div>

            {editing ? (
                <input
                    ref={inputRef}
                    className="flex-1 h-full bg-transparent outline-none border-b-2 border-primary text-xs font-medium text-foreground py-2.5 pr-2"
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value)}
                    onBlur={commit}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") commit() }}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                />
            ) : (
                <div className="flex items-center gap-1.5 pr-2 py-2.5 w-full overflow-hidden min-w-0">
                    <span className="text-xs font-semibold truncate flex-1 text-foreground">
                        {col.name ? col.name : <span className="italic text-muted-foreground/40">Untitled</span>}
                    </span>
                    <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold whitespace-nowrap ${badgeColor}`}>
                        {col.type}
                    </span>
                </div>
            )}

            {/* Delete icon — appears on hover */}
            {!isDragOverlay && canDelete && (
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDelete(col._id) }}
                    className="absolute right-0.5 top-0.5 h-5 w-5 rounded flex items-center justify-center text-muted-foreground/0 group-hover:text-muted-foreground/50 hover:!text-destructive hover:bg-destructive/10 transition-all"
                    aria-label="Remove column"
                >
                    <Trash2 className="h-2.5 w-2.5" />
                </button>
            )}
        </div>
    )
}

// ─── TablePreview ─────────────────────────────────────────────────────────────
export function TablePreview({ columns, setColumns, onAddColumn, onRemoveColumn }) {
    const [activeId, setActiveId] = useState(null)

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    )

    const handleDragStart = ({ active }) => setActiveId(active.id)
    const handleDragEnd = ({ active, over }) => {
        setActiveId(null)
        if (!over || active.id === over.id) return
        const fromIdx = columns.findIndex((c) => c._id === active.id)
        const toIdx = columns.findIndex((c) => c._id === over.id)
        if (fromIdx === -1 || toIdx === -1) return
        setColumns((prev) => arrayMove(prev, fromIdx, toIdx))
    }

    const handleColumnNameChange = useCallback((updatedCol) => {
        setColumns((prev) => prev.map((c) => (c._id === updatedCol._id ? updatedCol : c)))
    }, [setColumns])

    const handleDelete = useCallback((id) => {
        if (onRemoveColumn) {
            onRemoveColumn(id)
        } else {
            setColumns((prev) => {
                if (prev.length <= 1) return prev
                return prev.filter((c) => c._id !== id)
            })
        }
    }, [onRemoveColumn, setColumns])

    const activeCol = activeId ? columns.find((c) => c._id === activeId) : null

    // ── Empty state ────────────────────────────────────────────────────────────
    if (columns.length === 0) {
        return (
            <div className="flex-1 min-w-0 flex flex-col items-center justify-center gap-4 text-center p-8 bg-muted/10">
                <div className="rounded-2xl bg-muted/60 p-6">
                    <LayoutGrid className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-foreground">No fields added yet</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                        Use Quick Add above for common fields, or define a custom field in the panel on the right.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-muted/10">
            {/* ── Table card ── */}
            <div className="flex-1 min-h-0 m-4 rounded-xl border border-border overflow-hidden flex flex-col bg-card shadow-sm">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex-1 overflow-auto">
                        {/* ── Header row ── */}
                        <div className="flex items-stretch border-b border-border sticky top-0 z-10 bg-muted/50 min-w-max">
                            {/* Row number stub */}
                            <div className="w-10 shrink-0 border-r border-border flex items-center justify-center py-3">
                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter select-none">#</span>
                            </div>

                            <SortableContext items={columns.map((c) => c._id)} strategy={horizontalListSortingStrategy}>
                                {columns.map((col) => (
                                    <SortableColumnHeader
                                        key={col._id}
                                        col={col}
                                        onChange={handleColumnNameChange}
                                        onDelete={handleDelete}
                                        canDelete={columns.length > 1}
                                    />
                                ))}
                            </SortableContext>

                            {/* Add column button */}
                            <div className="flex items-center px-1 shrink-0 border-l border-border">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                    onClick={onAddColumn}
                                    aria-label="Add column"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                </Button>
                            </div>

                            <DragOverlay>
                                {activeCol
                                    ? <SortableColumnHeader col={activeCol} onChange={() => { }} onDelete={() => { }} canDelete={false} isDragOverlay />
                                    : null
                                }
                            </DragOverlay>
                        </div>

                        {/* ── Data rows — 5 placeholder rows ── */}
                        {[1, 2, 3, 4, 5].map((rowIdx) => (
                            <div key={rowIdx} className="flex items-stretch border-b border-border last:border-b-0 min-w-max hover:bg-muted/20 transition-colors">
                                {/* Row number */}
                                <div className="w-10 shrink-0 border-r border-border flex items-center justify-center py-3 bg-muted/10">
                                    <span className="text-[10px] text-muted-foreground/30 font-semibold select-none">{rowIdx}</span>
                                </div>

                                {columns.map((col) => (
                                    <div
                                        key={col._id}
                                        className="w-44 shrink-0 border-r border-border last:border-r-0 px-3 py-3 flex items-center"
                                    >
                                        <span className="text-muted-foreground/20 text-sm select-none">—</span>
                                    </div>
                                ))}

                                {/* Trailing spacer to match + button col */}
                                <div className="w-9 shrink-0 border-l border-border" />
                            </div>
                        ))}
                    </div>
                </DndContext>
            </div>

            {/* ── Footer hint ── */}
            <p className="text-[11px] text-muted-foreground text-center pb-2 shrink-0">
                Double-click a column header to rename it · Drag to reorder
            </p>
        </div>
    )
}

export default TablePreview
