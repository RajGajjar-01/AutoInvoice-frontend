import { createFileRoute, useNavigate } from "@tanstack/react-router"
import {
    Copy,
    LayoutGrid,
    List,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    Table2,
    Trash2,
} from "lucide-react"
import { useState } from "react"
import { EmptyState } from "@/components/DataTables/EmptyState"
import { TableCard } from "@/components/DataTables/TableCard"
import { TemplateSelector } from "@/components/DataTables/TemplateSelector"
import { tablesStore } from "@/components/DataTables/tableStore"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const Route = createFileRoute("/_layout/data-tables/")(
    {
        component: DataTablesPage,
        head: () => ({
            meta: [{ title: "Data Tables" }],
        }),
    }
)


function DataTablesPage() {
    const navigate = useNavigate()
    const [_tick, setTick] = useState(0)
    const refresh = () => setTick((t) => t + 1)
    const [view, setView] = useState("list")
    const [search, setSearch] = useState("")

    const allTables = tablesStore.getAll()
    const q = search.trim().toLowerCase()
    const tables = q
        ? allTables.filter(
            (t) =>
                t.name.toLowerCase().includes(q) ||
                (t.description ?? "").toLowerCase().includes(q)
        )
        : allTables

    // ── Delete dialog ───────────────────────────────────────────────────────
    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        tableId: null,
        tableName: "",
        confirmInput: "",
    })

    // ── Rename dialog ───────────────────────────────────────────────────────
    const [renameDialog, setRenameDialog] = useState({
        open: false,
        tableId: null,
        tableName: "",
        renameValue: "",
    })

    // ── Handlers ────────────────────────────────────────────────────────────
    const openCreateBlank = () => navigate({ to: "/data-tables/new" })

    const handleSelectTemplate = (template) =>
        navigate({ to: "/data-tables/new", search: { templateId: template.id } })

    const handleDeleteRequest = (id) => {
        const t = tablesStore.getById(id)
        if (!t) return
        setDeleteDialog({ open: true, tableId: id, tableName: t.name, confirmInput: "" })
    }

    const handleDeleteConfirm = () => {
        tablesStore.remove(deleteDialog.tableId)
        refresh()
        setDeleteDialog({ open: false, tableId: null, tableName: "", confirmInput: "" })
    }

    const handleRenameRequest = (id) => {
        const t = tablesStore.getById(id)
        if (!t) return
        setRenameDialog({ open: true, tableId: id, tableName: t.name, renameValue: t.name })
    }

    const handleRenameConfirm = () => {
        const trimmed = renameDialog.renameValue.trim()
        if (trimmed && trimmed !== renameDialog.tableName) {
            tablesStore.update(renameDialog.tableId, { name: trimmed })
            refresh()
        }
        setRenameDialog({ open: false, tableId: null, tableName: "", renameValue: "" })
    }

    const handleDuplicate = (id) => { tablesStore.duplicate(id); refresh() }
    const handleOpen = (id) => navigate({ to: "/data-tables/$tableId", params: { tableId: id } })

    const deleteNameMatches = deleteDialog.confirmInput.trim() === deleteDialog.tableName

    return (
        <div className="flex flex-col gap-6">
            {/* ── Page Header ──────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Your Data Tables</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Create and manage structured data for your business
                    </p>
                </div>
                <Button onClick={openCreateBlank} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Plus className="h-4 w-4" />
                    Create Table
                </Button>
            </div>

            {/* ── Tabs ─────────────────────────────────────────────── */}
            <Tabs defaultValue="my-tables">
                <div className="flex items-center justify-between gap-4">
                    <TabsList>
                        <TabsTrigger value="my-tables">My Tables</TabsTrigger>
                        <TabsTrigger value="templates">Templates</TabsTrigger>
                    </TabsList>

                    {/* View toggle */}
                    <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 transition-colors ${view === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                            onClick={() => setView("grid")}
                            aria-label="Grid view"
                        >
                            <LayoutGrid className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 transition-colors ${view === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                            onClick={() => setView("list")}
                            aria-label="List view"
                        >
                            <List className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>

                {/* ── My Tables ─────────────────────────────────────── */}
                <TabsContent value="my-tables" className="mt-4 flex flex-col gap-4">
                    {allTables.length > 0 && (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                                placeholder="Search your tables..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-9"
                            />
                        </div>
                    )}

                    {allTables.length === 0 ? (
                        <EmptyState onCreateClick={openCreateBlank} />
                    ) : tables.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center gap-2 bg-card rounded-xl border border-dashed border-border">
                            <Search className="h-8 w-8 text-muted-foreground/40" />
                            <p className="text-sm font-medium text-foreground">No tables found</p>
                            <p className="text-xs text-muted-foreground">No tables match &ldquo;{search}&rdquo;</p>
                        </div>
                    ) : view === "grid" ? (
                        /* ── Grid view ── */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {tables.map((table) => (
                                <TableCard
                                    key={table.id}
                                    table={table}
                                    onDelete={handleDeleteRequest}
                                    onRename={(id) => handleRenameRequest(id)}
                                    onDuplicate={handleDuplicate}
                                    onOpen={handleOpen}
                                />
                            ))}
                        </div>
                    ) : (
                        /* ── List view (Google Drive style) ── */
                        <div className="rounded-xl border border-border bg-card overflow-hidden">
                            {/* List header */}
                            <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-4 py-2 border-b border-border bg-muted/40">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</span>
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-20 text-center">Fields</span>
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-24 text-right">Created</span>
                                <span className="w-8" />
                            </div>

                            {/* List rows */}
                            {tables.map((table, idx) => (
                                <div key={table.id}>
                                    <div
                                        className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-4 py-3 hover:bg-muted/30 cursor-pointer transition-colors group"
                                        onClick={() => handleOpen(table.id)}
                                    >
                                        {/* Name + icon */}
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="shrink-0 h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Table2 className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">{table.name}</p>
                                                {table.description ? (
                                                    <p className="text-[11px] text-muted-foreground truncate">{table.description}</p>
                                                ) : table.columns.length > 0 ? (
                                                    <p className="text-[11px] text-muted-foreground truncate">
                                                        {table.columns.slice(0, 3).map((c) => c.name || "Untitled").join(", ")}
                                                        {table.columns.length > 3 ? ` +${table.columns.length - 3} more` : ""}
                                                    </p>
                                                ) : null}
                                            </div>
                                        </div>

                                        {/* Field count */}
                                        <Badge variant="secondary" className="w-20 justify-center tabular-nums text-[11px]">
                                            {table.columns.length} {table.columns.length === 1 ? "field" : "fields"}
                                        </Badge>

                                        {/* Created date */}
                                        <span className="text-xs text-muted-foreground w-24 text-right whitespace-nowrap">
                                            {table.createdAt
                                                ? new Date(table.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                                                : "—"}
                                        </span>

                                        {/* Actions */}
                                        <div className="w-8 flex justify-center" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40">
                                                    <DropdownMenuItem onClick={() => handleRenameRequest(table.id)}>
                                                        <Pencil className="mr-2 h-3.5 w-3.5" />
                                                        Rename
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDuplicate(table.id)}>
                                                        <Copy className="mr-2 h-3.5 w-3.5" />
                                                        Duplicate
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteRequest(table.id)}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                    {idx < tables.length - 1 && <Separator />}
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* ── Templates ─────────────────────────────────────── */}
                <TabsContent value="templates" className="mt-6">
                    <TemplateSelector onSelectTemplate={handleSelectTemplate} />
                </TabsContent>
            </Tabs>

            {/* ── Delete Dialog ─────────────────────────────────────── */}
            <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog((d) => ({ ...d, open, confirmInput: open ? d.confirmInput : "" }))}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete table?</DialogTitle>
                        <DialogDescription>
                            This will permanently delete{" "}
                            <span className="font-semibold text-foreground">&ldquo;{deleteDialog.tableName}&rdquo;</span>{" "}
                            and all its data. Type the table name below to confirm.
                        </DialogDescription>
                    </DialogHeader>
                    <Input
                        placeholder={deleteDialog.tableName}
                        value={deleteDialog.confirmInput}
                        onChange={(e) => setDeleteDialog((d) => ({ ...d, confirmInput: e.target.value }))}
                    />
                    <DialogFooter className="gap-2 sm:gap-0 mt-2">
                        <Button variant="outline" onClick={() => setDeleteDialog((d) => ({ ...d, open: false, confirmInput: "" }))}>
                            Cancel
                        </Button>
                        <Button variant="destructive" disabled={!deleteNameMatches} onClick={handleDeleteConfirm}>
                            Delete permanently
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Rename Dialog ─────────────────────────────────────── */}
            <Dialog open={renameDialog.open} onOpenChange={(open) => setRenameDialog((d) => ({ ...d, open }))}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Rename table</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-2 py-2">
                        <Label htmlFor="rename-list-input" className="text-sm">Table name</Label>
                        <Input
                            id="rename-list-input"
                            value={renameDialog.renameValue}
                            onChange={(e) => setRenameDialog((d) => ({ ...d, renameValue: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === "Enter") handleRenameConfirm() }}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRenameDialog((d) => ({ ...d, open: false }))}>Cancel</Button>
                        <Button
                            onClick={handleRenameConfirm}
                            disabled={!renameDialog.renameValue.trim() || renameDialog.renameValue.trim() === renameDialog.tableName}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                            Rename
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default DataTablesPage
