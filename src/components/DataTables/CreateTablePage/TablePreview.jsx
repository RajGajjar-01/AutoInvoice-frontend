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
import { LayoutGrid, Plus } from "lucide-react"
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

// ─── Inline editable Table Title ─────────────────────────────────────────────
function InlineTitle({ tableName, setTableName, titleRef }) {
    const [editing, setEditing] = useState(false)
    const inputRef = useRef(null)

    useEffect(() => {
        if (titleRef) {
            titleRef.current = {
                focus: () => {
                    setEditing(true)
                    setTimeout(() => inputRef.current?.focus(), 0)
                },
            }
        }
    }, [titleRef])

    const startEditing = () => {
        setEditing(true)
        setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select() }, 0)
    }

    if (editing) {
        return (
            <input
                ref={inputRef}
                className="text-2xl font-bold tracking-tight bg-transparent border-b-2 border-primary outline-none w-full max-w-xl pb-0.5 text-foreground placeholder:text-muted-foreground/40 leading-tight"
                placeholder="Untitled Table"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                onBlur={() => setEditing(false)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setEditing(false) }}
                autoFocus
            />
        )
    }

    return (
        <button type="button" onClick={startEditing} className="group text-left w-full" title="Click to edit table name">
            {tableName
                ? <h1 className="text-2xl font-bold tracking-tight text-foreground group-hover:opacity-80 transition-opacity leading-tight">{tableName}</h1>
                : <h1 className="text-2xl font-bold tracking-tight text-muted-foreground/30 italic leading-tight">Untitled Table</h1>
            }
        </button>
    )
}

// ─── Column Header Cell ───────────────────────────────────────────────────────
// Fixed 160px width — original chip-style look.
// Double-click to rename (two-way sync: external col.name updates local when not focused).
function SortableColumnHeader({ col, onChange, isDragOverlay = false }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: col._id })

    const [editing, setEditing] = useState(false)
    const [localName, setLocalName] = useState(col.name)
    const inputRef = useRef(null)

    // Two-way sync: reflect changes made in ColumnEditorPanel
    useEffect(() => {
        if (!editing) setLocalName(col.name)
    }, [col.name, editing])

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

    const handleDblClick = () => {
        if (isDragOverlay) return
        setEditing(true)
        setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select() }, 0)
    }

    return (
        <div
            ref={isDragOverlay ? undefined : setNodeRef}
            style={isDragOverlay ? {} : style}
            {...(isDragOverlay ? {} : attributes)}
            {...(isDragOverlay ? {} : listeners)}
            // Fixed 160px — each column has identical width. Container scrolls when many columns are added.
            className={`
                w-[160px] shrink-0 flex items-center border-r border-border last:border-r-0 select-none
                bg-muted/30 cursor-grab active:cursor-grabbing group
                hover:bg-accent/50 transition-colors
                ${isDragOverlay ? "shadow-xl ring-2 ring-primary/30 rounded" : ""}
            `}
            onDoubleClick={handleDblClick}
            title="Drag to reorder · Double-click to rename"
        >
            {editing ? (
                <input
                    ref={inputRef}
                    className="w-full h-full bg-transparent outline-none border-b border-primary text-xs font-medium text-foreground px-2 py-2.5"
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value)}
                    onBlur={commit}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") commit() }}
                    onClick={(e) => e.stopPropagation()}
                />
            ) : (
                <div className="flex items-center gap-1.5 px-2 py-2.5 w-full overflow-hidden">
                    <span className="text-xs font-medium truncate flex-1 text-foreground">
                        {col.name ? col.name : <span className="italic text-muted-foreground/50">Untitled</span>}
                    </span>
                    <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold whitespace-nowrap ${badgeColor}`}>
                        {col.type}
                    </span>
                </div>
            )}
        </div>
    )
}

// ─── TablePreview ─────────────────────────────────────────────────────────────
// Layout contract (no page-level overflow, ever):
//
//   [outer]  flex-1 min-w-0  ← min-w-0 prevents this flex child from exceeding parent
//     [title area]  shrink-0
//     [table card area]  flex-1 overflow-hidden
//       [table card]  h-full  overflow-auto  ← ONLY place scroll lives
//         [header row sticky]  min-w-max  ← expands to fit all fixed-width columns
//         [data rows]          min-w-max
//
// Result: the table card scrolls internally (both axes if needed).
// The Properties panel is unaffected regardless of column count.
export function TablePreview({ tableName, setTableName, titleRef, columns, setColumns, onAddColumn }) {
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

    const activeCol = activeId ? columns.find((c) => c._id === activeId) : null

    return (
        // flex-1 min-w-0 → fills remaining space, CANNOT push past flex parent (critical)
        // overflow-hidden → outer container never scrolls
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-background">

            {/* ── Compact title ─────────────────────────────────────────── */}
            <div className="px-6 pt-3 pb-2 shrink-0">
                <InlineTitle tableName={tableName} setTableName={setTableName} titleRef={titleRef} />
                <p className="mt-1 text-xs text-muted-foreground">
                    Double-click column headers to rename · Drag to reorder
                </p>
            </div>

            {/* ── Table wrapper — overflow-hidden so inner scroll is self-contained ── */}
            <div className="flex-1 min-h-0 px-6 pb-4 overflow-hidden flex flex-col">
                {columns.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
                        <div className="rounded-full bg-muted p-4">
                            <LayoutGrid className="h-6 w-6 text-muted-foreground/40" />
                        </div>
                        <p className="text-sm text-muted-foreground">Add your first column using the Properties panel →</p>
                    </div>
                ) : (
                    // The ONE overflow-auto container — header + body scroll together horizontally
                    // and body scrolls vertically. Nothing else on the page scrolls.
                    <div className="flex-1 min-h-0 rounded-xl border border-border shadow-sm overflow-hidden flex flex-col bg-card">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        >
                            {/* ── Header Row ─ sticky top so it stays visible on vertical scroll ── */}
                            <div className="flex-1 overflow-auto">
                                <div className="flex items-stretch border-b border-border sticky top-0 z-10 min-w-max bg-muted/50">
                                    {/* Row number stub */}
                                    <div className="w-12 shrink-0 border-r border-border flex items-center justify-center py-3">
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter select-none">#</span>
                                    </div>

                                    {/* Sortable column headers — each exactly 160px */}
                                    <SortableContext
                                        items={columns.map((c) => c._id)}
                                        strategy={horizontalListSortingStrategy}
                                    >
                                        {columns.map((col) => (
                                            <SortableColumnHeader
                                                key={col._id}
                                                col={col}
                                                onChange={handleColumnNameChange}
                                            />
                                        ))}
                                    </SortableContext>

                                    {/* Add column — stays at right edge */}
                                    <div className="flex items-center px-1 shrink-0 border-l border-border">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                            onClick={onAddColumn}
                                            aria-label="Add column"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>

                                    <DragOverlay>
                                        {activeCol
                                            ? <SortableColumnHeader col={activeCol} onChange={() => { }} isDragOverlay />
                                            : null
                                        }
                                    </DragOverlay>
                                </div>

                                {/* ── Data Rows — same min-w-max so they align with the header ── */}
                                {[0, 1, 2].map((rowIdx) => (
                                    <div
                                        key={rowIdx}
                                        className="flex items-stretch border-b border-border last:border-b-0 min-w-max hover:bg-muted/10 transition-colors"
                                    >
                                        {/* Row number */}
                                        <div className="w-12 shrink-0 border-r border-border flex items-center justify-center py-3 bg-muted/10">
                                            <span className="text-[10px] text-muted-foreground/40 font-semibold select-none">{rowIdx + 1}</span>
                                        </div>
                                        {/* Cells — same fixed width as header columns */}
                                        {columns.map((col) => (
                                            <div
                                                key={col._id}
                                                className="w-[160px] shrink-0 border-r border-border last:border-r-0 px-3 py-3 flex items-center"
                                            >
                                                <span className="text-muted-foreground/25 text-sm select-none">—</span>
                                            </div>
                                        ))}
                                        {/* Trailing spacer to match the + button column */}
                                        <div className="w-10 shrink-0 border-l border-border" />
                                    </div>
                                ))}
                            </div>
                        </DndContext>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TablePreview
