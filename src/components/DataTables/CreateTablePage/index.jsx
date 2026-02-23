import { useNavigate } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { LeftPanel } from "@/components/DataTables/CreateTablePage/LeftPanel"
import { RightPanel } from "@/components/DataTables/CreateTablePage/RightPanel"
import { PREDEFINED_TEMPLATES, tablesStore } from "@/components/DataTables/tableStore"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

// ─── CreateTablePage (root, owns all shared state) ────────────────────────────
// templateId is passed from the route file via Route.useSearch()
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

    const tableNameInputRef = useRef(null)

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

    // ── Add column helper (shared between panels) ─────────────────────────────
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

    // ── Validation ────────────────────────────────────────────────────────────
    const validate = () => {
        if (!tableName.trim()) {
            toast.error("Table name is required.")
            tableNameInputRef.current?.focus()
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
                toast.error(
                    `Dropdown column "${col.name}" must have at least one option.`
                )
                return false
            }
        }

        return true
    }

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleCreate = () => {
        if (!validate()) return
        // Strip internal _id/_isBlank/_isDuplicate fields before saving
        const cleanedColumns = columns.map(({ _id, _isBlank, _isDuplicate, ...rest }) => rest)
        tablesStore.add({ name: tableName.trim(), columns: cleanedColumns })
        toast.success(`Table "${tableName.trim()}" created!`)
        navigate({ to: "/data-tables" })
    }

    // ── Discard ───────────────────────────────────────────────────────────────
    const handleDiscard = () => {
        navigate({ to: "/data-tables" })
    }

    return (
        <div className="flex flex-col h-[calc(100vh-64px)]">
            {/* ── Sticky Top Bar ─────────────────────────────────────────────── */}
            <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm px-6 py-3 flex items-center gap-3">
                {/* Back breadcrumb */}
                <button
                    type="button"
                    onClick={handleDiscard}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Data Tables
                </button>

                <Separator orientation="vertical" className="h-5" />

                <span className="text-sm font-semibold text-foreground">
                    New Table
                </span>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Action buttons */}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDiscard}
                >
                    Discard
                </Button>
                <Button type="button" size="sm" onClick={handleCreate}>
                    Create Table
                </Button>
            </div>

            {/* ── Split Panel ────────────────────────────────────────────────── */}
            <div className="flex flex-1 overflow-hidden">
                <LeftPanel
                    tableName={tableName}
                    setTableName={setTableName}
                    tableNameInputRef={tableNameInputRef}
                    columns={columns}
                    setColumns={setColumns}
                />
                <RightPanel
                    tableName={tableName}
                    tableNameInputRef={tableNameInputRef}
                    columns={columns}
                    setColumns={setColumns}
                    onAddColumn={handleAddColumn}
                />
            </div>
        </div>
    )
}

export default CreateTablePage
