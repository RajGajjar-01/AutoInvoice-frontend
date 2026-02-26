import { useNavigate } from "@tanstack/react-router"
import { ArrowLeft, Settings2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { ColumnEditorPanel } from "@/components/DataTables/CreateTablePage/ColumnEditorPanel"
import { TablePreview } from "@/components/DataTables/CreateTablePage/TablePreview"
import { PREDEFINED_TEMPLATES, tablesStore } from "@/components/DataTables/tableStore"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

// ─── CreateTablePage ───────────────────────────────────────────────────────────
// Notion-inspired layout:
//   [Sticky Top Bar                                      ]
//   [  Table Preview (flex-1)     ] [| Column Editor |  ]
//
// Zero horizontal scroll achieved by:
// 1. Root container: overflow-hidden
// 2. Table columns: flex-1 (proportional, never overflow)
// 3. Column panel: fixed 272px, overflow-x-hidden
// 4. No min-w anywhere in the table
export function CreateTablePage({ templateId }) {
    const navigate = useNavigate()

    const [tableName, setTableName] = useState("")
    const [columns, setColumns] = useState([
        {
            name: "",
            type: "Text",
            mandatory: false,
            options: [],
            _id: crypto.randomUUID(),
        },
    ])
    const [isPanelOpen, setIsPanelOpen] = useState(true)

    const titleRef = useRef(null)

    // Pre-fill from template
    useEffect(() => {
        if (!templateId) return
        const tpl = PREDEFINED_TEMPLATES.find((t) => t.id === templateId)
        if (!tpl) return
        setTableName(tpl.name)
        setColumns(
            tpl.columns.map((col) => ({
                ...col,
                _id: crypto.randomUUID(),
            }))
        )
    }, [templateId]) // eslint-disable-line react-hooks/exhaustive-deps

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

    const validate = () => {
        if (!tableName.trim()) {
            toast.error("Table name is required.")
            titleRef.current?.focus()
            return false
        }

        const names = columns.map((c) => c.name.trim())

        for (let i = 0; i < columns.length; i++) {
            if (!names[i]) {
                toast.error(`Column ${i + 1} has no name. Please fill in all column names.`)
                return false
            }
        }

        const uniqueNames = new Set(names)
        if (uniqueNames.size !== names.length) {
            toast.error("Duplicate column names are not allowed.")
            return false
        }

        for (const col of columns) {
            if (col.type === "Dropdown" && (!col.options || col.options.length === 0)) {
                toast.error(`Dropdown column "${col.name}" must have at least one option.`)
                return false
            }
        }

        return true
    }

    const handleCreate = () => {
        if (!validate()) return
        const cleanedColumns = columns.map(({ _id, _isBlank, _isDuplicate, ...rest }) => rest)
        tablesStore.add({ name: tableName.trim(), columns: cleanedColumns })
        toast.success(`Table "${tableName.trim()}" created!`)
        navigate({ to: "/data-tables" })
    }

    const handleDiscard = () => navigate({ to: "/data-tables" })

    return (
        // Escape parent padding (-m-6 md:-m-8) then fill viewport minus the sticky header (h-16)
        <div className="flex flex-col overflow-hidden -m-6 md:-m-8" style={{ height: "calc(100vh - 64px)" }}>

            {/* ── Top Bar ─────────────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 border-b border-border bg-background/95 backdrop-blur-sm px-4 py-2 shrink-0">
                <button
                    type="button"
                    onClick={handleDiscard}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Data Tables
                </button>

                <Separator orientation="vertical" className="h-4" />

                <span className="text-sm font-semibold">New Table</span>

                <div className="flex-1" />

                <Button
                    type="button"
                    variant={isPanelOpen ? "secondary" : "ghost"}
                    size="sm"
                    className="gap-1.5 text-xs h-8"
                    onClick={() => setIsPanelOpen((v) => !v)}
                >
                    <Settings2 className="h-3.5 w-3.5" />
                    Properties
                </Button>

                <Button type="button" variant="outline" size="sm" className="h-8" onClick={handleDiscard}>
                    Discard
                </Button>
                <Button type="button" size="sm" className="h-8" onClick={handleCreate}>
                    Create Table
                </Button>
            </div>

            {/* ── Split Content Area — fills remaining height, no scroll ──────── */}
            {/* min-h-0 is essential to allow flex children to shrink below their content size */}
            <div className="flex flex-1 min-h-0 overflow-hidden">
                <TablePreview
                    tableName={tableName}
                    setTableName={setTableName}
                    titleRef={titleRef}
                    columns={columns}
                    setColumns={setColumns}
                    onAddColumn={handleAddColumn}
                />

                {isPanelOpen && (
                    <ColumnEditorPanel
                        columns={columns}
                        setColumns={setColumns}
                        onAddColumn={handleAddColumn}
                    />
                )}
            </div>
        </div>
    )
}

export default CreateTablePage
