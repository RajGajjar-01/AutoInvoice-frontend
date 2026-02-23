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
import { useState } from "react"
import { Button } from "@/components/ui/button"

// ─── Type badge colours ─────────────────────────────────────────────────────
const TYPE_BADGE_COLORS = {
    Text: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    Number: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    Date: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    Status: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    Tag: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    "Amount (₹)":
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    Checkbox: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
    "Payment Status":
        "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
    "Due Date":
        "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    "Expiry Date":
        "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    Attachment:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    Dropdown: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
}

// ─── Sortable Column Chip ────────────────────────────────────────────────────
function SortableColumnChip({ col, isDragOverlay = false }) {
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

    const badgeColor =
        TYPE_BADGE_COLORS[col.type] ?? "bg-muted text-muted-foreground"

    return (
        <div
            ref={isDragOverlay ? undefined : setNodeRef}
            style={isDragOverlay ? {} : style}
            {...(isDragOverlay ? {} : attributes)}
            {...(isDragOverlay ? {} : listeners)}
            className={`flex items-center gap-1.5 border rounded-md px-3 py-2 bg-card shadow-sm select-none min-w-[140px] cursor-grab active:cursor-grabbing
        hover:border-primary/50 hover:bg-accent transition-colors
        ${isDragOverlay ? "shadow-lg ring-2 ring-primary/30" : ""}`}
        >
            <span className="text-xs font-medium truncate flex-1">
                {col.name ? col.name : <span className="italic text-muted-foreground">Untitled</span>}
            </span>
            <span
                className={`inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap ${badgeColor}`}
            >
                {col.type}
            </span>
        </div>
    )
}

// ─── RightPanel ──────────────────────────────────────────────────────────────
export function RightPanel({
    tableName,
    tableNameInputRef,
    columns,
    setColumns,
    onAddColumn,
}) {
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

    const activeCol = activeId ? columns.find((c) => c._id === activeId) : null

    return (
        <div className="flex-1 overflow-auto p-8 bg-background">
            {/* Table Name — clicking focuses the left panel input */}
            <div
                className="mb-6 cursor-pointer inline-block"
                onClick={() => tableNameInputRef.current?.focus()}
                title="Click to edit table name"
            >
                {tableName ? (
                    <h1 className="text-2xl font-bold tracking-tight">{tableName}</h1>
                ) : (
                    <h1 className="text-2xl font-bold tracking-tight text-muted-foreground italic opacity-50">
                        Untitled Table
                    </h1>
                )}
            </div>

            {/* Table Preview */}
            {columns.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
                    <LayoutGrid className="h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                        Add your first column in the panel on the left ←
                    </p>
                </div>
            ) : (
                <div className="rounded-xl border shadow-sm overflow-hidden bg-card">
                    <div className="overflow-x-auto">
                        {/* Header Strip with horizontal DnD */}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="flex items-stretch border-b bg-muted/40">
                                {/* Row number stub */}
                                <div className="w-10 border-r flex items-center justify-center shrink-0 py-2">
                                    <span className="text-xs text-muted-foreground font-medium">#</span>
                                </div>

                                <SortableContext
                                    items={columns.map((c) => c._id)}
                                    strategy={horizontalListSortingStrategy}
                                >
                                    <div className="flex items-center gap-1 p-1.5 flex-wrap flex-1">
                                        {columns.map((col) => (
                                            <SortableColumnChip key={col._id} col={col} />
                                        ))}
                                    </div>
                                </SortableContext>

                                {/* Add column button — outside sortable context */}
                                <div className="flex items-center pr-1.5 shrink-0">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                                        onClick={onAddColumn}
                                        aria-label="Add column"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                <DragOverlay>
                                    {activeCol ? (
                                        <SortableColumnChip col={activeCol} isDragOverlay />
                                    ) : null}
                                </DragOverlay>
                            </div>
                        </DndContext>

                        {/* Phantom Rows */}
                        {[0, 1].map((rowIdx) => (
                            <div
                                key={rowIdx}
                                className="flex items-stretch border-b last:border-b-0"
                            >
                                {/* Row number */}
                                <div className="w-10 border-r flex items-center justify-center shrink-0 bg-muted/20 py-2">
                                    <span className="text-xs text-muted-foreground/50 select-none">
                                        {rowIdx + 1}
                                    </span>
                                </div>
                                {/* Cells matching column count */}
                                {columns.map((col) => (
                                    <div
                                        key={col._id}
                                        className="min-w-[140px] border-r last:border-r-0 px-3 py-2 flex items-center"
                                    >
                                        <span className="text-muted-foreground/40 text-sm select-none">
                                            —
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default RightPanel
