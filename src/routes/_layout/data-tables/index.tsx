import {
  Copy,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Table2,
  Trash2,
} from "lucide-react"
import { useState } from "react"
import { useLoaderData, useNavigate, useRevalidator } from "react-router"
import { toast } from "sonner"
import { type DataTablePublic, TablesService } from "@/client"
import { EmptyState } from "@/components/DataTables/EmptyState"
import { TemplateSelector } from "@/components/DataTables/TemplateSelector"
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
import { adaptTableListItemToUi } from "@/features/data-tables/queries"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

interface TableData {
  id: string
  name: string
  description?: string
  columns: { name: string }[]
  createdAt?: string
}

interface DeleteDialogState {
  open: boolean
  tableId: string | null
  tableName: string
  confirmInput: string
}

interface RenameDialogState {
  open: boolean
  tableId: string | null
  tableName: string
  renameValue: string
}

export async function loader() {
  try {
    const res = await TablesService.listTables({
      skip: 0,
      limit: 50,
      sortBy: "created_at",
      sortOrder: "desc",
    })
    const items = (res.data ?? []) as DataTablePublic[]
    return { data: items.map(adaptTableListItemToUi) }
  } catch {
    return { data: [] }
  }
}

function DataTablesPage() {
  useDocumentTitle("Data Tables")
  const navigate = useNavigate()
  const { revalidate } = useRevalidator()
  const [search, setSearch] = useState("")

  const { data } = useLoaderData() as {
    data: ReturnType<typeof adaptTableListItemToUi>[]
  }
  const allTables = data as unknown as TableData[]
  const q = search.trim().toLowerCase()
  const tables = q
    ? allTables.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.description ?? "").toLowerCase().includes(q),
      )
    : allTables

  // ── Delete dialog ───────────────────────────────────────────────────────
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    open: false,
    tableId: null,
    tableName: "",
    confirmInput: "",
  })

  // ── Rename dialog ───────────────────────────────────────────────────────
  const [renameDialog, setRenameDialog] = useState<RenameDialogState>({
    open: false,
    tableId: null,
    tableName: "",
    renameValue: "",
  })

  // ── Handlers ────────────────────────────────────────────────────────────
  const openCreateBlank = () => navigate("/data-tables/new")

  const handleSelectTemplate = (template: { id: string }) =>
    navigate(`/data-tables/new?templateId=${template.id}`)

  const handleDeleteRequest = (id: string) => {
    const t = allTables.find((x) => x.id === id)
    if (!t) return
    setDeleteDialog({
      open: true,
      tableId: id,
      tableName: t.name,
      confirmInput: "",
    })
  }

  const handleDeleteConfirm = async () => {
    const tableId = deleteDialog.tableId
    setDeleteDialog({
      open: false,
      tableId: null,
      tableName: "",
      confirmInput: "",
    })
    if (!tableId) return
    try {
      await TablesService.deleteTable({ tableId })
      toast.success("Table deleted")
      revalidate()
    } catch {
      toast.error("Failed to delete table")
    }
  }

  const handleRenameRequest = (id: string) => {
    const t = allTables.find((x) => x.id === id)
    if (!t) return
    setRenameDialog({
      open: true,
      tableId: id,
      tableName: t.name,
      renameValue: t.name,
    })
  }

  const handleRenameConfirm = async () => {
    const trimmed = renameDialog.renameValue.trim()
    const tableId = renameDialog.tableId
    setRenameDialog({
      open: false,
      tableId: null,
      tableName: "",
      renameValue: "",
    })
    if (!tableId || !trimmed || trimmed === renameDialog.tableName) return
    try {
      await TablesService.updateTable({
        tableId,
        requestBody: { name: trimmed },
      })
      toast.success("Table renamed")
      revalidate()
    } catch {
      toast.error("Failed to rename table")
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      await TablesService.duplicateTable({ tableId: id })
      toast.success("Table duplicated")
      revalidate()
    } catch {
      toast.error("Failed to duplicate table")
    }
  }

  const deleteNameMatches =
    deleteDialog.confirmInput.trim() === deleteDialog.tableName

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Your Data Tables
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage structured data for your business
          </p>
        </div>
        <Button
          onClick={openCreateBlank}
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          Create Table
        </Button>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────── */}
      <Tabs defaultValue="my-tables">
        <div className="flex items-center justify-between gap-4 border-b border-border/20 pb-1">
          <TabsList variant="line" className="gap-6">
            <TabsTrigger
              value="my-tables"
              className="text-sm font-semibold px-1 pb-2 rounded-none data-[state=active]:text-primary after:bg-primary"
            >
              My Tables
            </TabsTrigger>
            <TabsTrigger
              value="templates"
              className="text-sm font-semibold px-1 pb-2 rounded-none data-[state=active]:text-primary after:bg-primary"
            >
              Templates
            </TabsTrigger>
          </TabsList>
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
                className="pl-9 h-9.5 bg-card/25 border-border/40 focus-visible:ring-1 focus-visible:ring-primary/20"
              />
            </div>
          )}

          {allTables.length === 0 ? (
            <EmptyState onCreateClick={openCreateBlank} />
          ) : (
            <div className="rounded-2xl border border-border/30 bg-card/30 dark:bg-[#151922]/20 backdrop-blur-md overflow-hidden shadow-sm">
              {/* List header */}
              <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-3 border-b border-border/20 bg-muted/20 dark:bg-muted/10">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Name
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-20 text-center">
                  Fields
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-24 text-right">
                  Created
                </span>
                <span className="w-8" />
              </div>

              {/* List rows */}
              {tables.map((table, idx) => (
                <div key={table.id}>
                  <div
                    onClick={() => navigate(`/data-tables/${table.id}`)}
                    className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-3.5 hover:bg-primary/[0.04] dark:hover:bg-primary/[0.02] transition-all duration-200 group cursor-pointer"
                  >
                    {/* Name + icon */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="shrink-0 h-9 w-9 rounded-xl bg-gradient-to-tr from-primary/15 to-primary/5 dark:from-primary/10 dark:to-primary/0 flex items-center justify-center border border-primary/20 shadow-sm transition-transform duration-200 group-hover:scale-105">
                        <Table2 className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {table.name}
                        </p>
                        {table.description ? (
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                            {table.description}
                          </p>
                        ) : table.columns.length > 0 ? (
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                            {table.columns
                              .slice(0, 3)
                              .map((c) => c.name || "Untitled")
                              .join(", ")}
                            {table.columns.length > 3
                              ? ` +${table.columns.length - 3} more`
                              : ""}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* Field count */}
                    <Badge className="w-20 justify-center tabular-nums text-[10px] font-semibold tracking-wider bg-primary/5 text-primary border border-primary/15 shadow-none hover:bg-primary/5">
                      {table.columns.length}{" "}
                      {table.columns.length === 1 ? "field" : "fields"}
                    </Badge>

                    {/* Created date */}
                    <span className="text-xs text-muted-foreground w-24 text-right whitespace-nowrap font-medium">
                      {table.createdAt
                        ? new Date(table.createdAt).toLocaleDateString(
                            "en-IN",
                            { day: "2-digit", month: "short", year: "numeric" },
                          )
                        : "—"}
                    </span>

                    {/* Actions */}
                    <div
                      className="w-8 flex justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={() => handleRenameRequest(table.id)}
                          >
                            <Pencil className="mr-2 h-3.5 w-3.5" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDuplicate(table.id)}
                          >
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
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog((d) => ({
            ...d,
            open,
            confirmInput: open ? d.confirmInput : "",
          }))
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete table?</DialogTitle>
            <DialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold text-foreground">
                &ldquo;{deleteDialog.tableName}&rdquo;
              </span>{" "}
              and all its data. Type the table name below to confirm.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder={deleteDialog.tableName}
            value={deleteDialog.confirmInput}
            onChange={(e) =>
              setDeleteDialog((d) => ({ ...d, confirmInput: e.target.value }))
            }
          />
          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button
              variant="outline"
              onClick={() =>
                setDeleteDialog((d) => ({
                  ...d,
                  open: false,
                  confirmInput: "",
                }))
              }
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!deleteNameMatches}
              onClick={handleDeleteConfirm}
            >
              Delete permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Rename Dialog ─────────────────────────────────────── */}
      <Dialog
        open={renameDialog.open}
        onOpenChange={(open) => setRenameDialog((d) => ({ ...d, open }))}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename table</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <Label htmlFor="rename-list-input" className="text-sm">
              Table name
            </Label>
            <Input
              id="rename-list-input"
              value={renameDialog.renameValue}
              onChange={(e) =>
                setRenameDialog((d) => ({ ...d, renameValue: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameConfirm()
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialog((d) => ({ ...d, open: false }))}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameConfirm}
              disabled={
                !renameDialog.renameValue.trim() ||
                renameDialog.renameValue.trim() === renameDialog.tableName
              }
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
