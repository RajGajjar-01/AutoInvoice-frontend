import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { ArrowLeft, Bell, Filter, Plus, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"
import { ExportMenu } from "@/components/DataTables/ExportMenu"
import { ReminderModal } from "@/components/DataTables/ReminderModal"
import { TableCell } from "@/components/DataTables/TableCell"
import { tablesStore } from "@/components/DataTables/tableStore"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  TableCell as ShadTableCell,
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const Route = createFileRoute("/_layout/data-tables/$tableId")({
  component: TableViewPage,
  head: () => ({
    meta: [{ title: "Table View" }],
  }),
})

// ─── Type badge colours ────────────────────────────────────────────────────────
const TYPE_BADGE_COLORS = {
  Text: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  Number: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Date: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  Status:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
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

const OPTION_FILTER_TYPES = new Set([
  "Status",
  "Payment Status",
  "Tag",
  "Dropdown",
])
const DATE_FILTER_TYPES = new Set(["Date", "Due Date", "Expiry Date"])
const BOOL_FILTER_TYPES = new Set(["Checkbox"])

function TableViewPage() {
  const { tableId } = Route.useParams()
  const navigate = useNavigate()

  const [_tick, setTick] = useState(0)
  const refresh = () => setTick((t) => t + 1)

  const [selectedRows, setSelectedRows] = useState(new Set())
  const [reminderState, setReminderState] = useState({
    open: false,
    rowId: null,
    rowLabel: "",
  })
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState({})
  const [pendingFilters, setPendingFilters] = useState({})
  const [search, setSearch] = useState("")

  const table = tablesStore.getById(tableId)

  // ── Table not found ────────────────────────────────────────────────────────
  if (!table) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <h2 className="text-lg font-semibold">Table not found</h2>
        <p className="text-sm text-muted-foreground">
          This table may have been deleted or the link is invalid.
        </p>
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/data-tables" })}
        >
          ← Back to Data Tables
        </Button>
      </div>
    )
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCellChange = (rowId, colName, value) => {
    tablesStore.updateCell(tableId, rowId, colName, value)
    refresh()
  }

  const handleAddRow = () => {
    tablesStore.addRow(tableId)
    refresh()
  }

  const handleDeleteRow = (rowId) => {
    tablesStore.deleteRow(tableId, rowId)
    setSelectedRows((prev) => {
      const next = new Set(prev)
      next.delete(rowId)
      return next
    })
    refresh()
  }

  const handleBulkDelete = () => {
    tablesStore.bulkDeleteRows(tableId, [...selectedRows])
    setSelectedRows(new Set())
    refresh()
  }

  // ── Re-read after mutations ────────────────────────────────────────────────
  const currentTable = tablesStore.getById(tableId)
  const allRows = currentTable.rows
  const cols = currentTable.columns

  // ── Suggestions map for Text fields ───────────────────────────────────────
  const suggestionsMap = useMemo(() => {
    const map = {}
    for (const col of cols) {
      map[col.name] = [
        ...new Set(allRows.map((r) => r[col.name]).filter(Boolean)),
      ]
    }
    return map
  }, [allRows, cols]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Filtered rows ──────────────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    let result = allRows

    for (const [colName, filterVal] of Object.entries(filters)) {
      const col = cols.find((c) => c.name === colName)
      if (!col) continue

      if (OPTION_FILTER_TYPES.has(col.type)) {
        if (Array.isArray(filterVal) && filterVal.length > 0) {
          result = result.filter((r) => filterVal.includes(r[colName]))
        }
      } else if (DATE_FILTER_TYPES.has(col.type)) {
        const { from, to } = filterVal ?? {}
        if (from)
          result = result.filter((r) => r[colName] && r[colName] >= from)
        if (to) result = result.filter((r) => r[colName] && r[colName] <= to)
      } else if (BOOL_FILTER_TYPES.has(col.type)) {
        if (filterVal === "Checked") result = result.filter((r) => !!r[colName])
        else if (filterVal === "Unchecked")
          result = result.filter((r) => !r[colName])
      }
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter((row) =>
        cols.some((col) => {
          const v = row[col.name]
          return v != null && String(v).toLowerCase().includes(q)
        }),
      )
    }

    return result
  }, [allRows, filters, search, cols]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Select all ────────────────────────────────────────────────────────────
  const filteredIds = filteredRows.map((r) => r.id)
  const allFilteredSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selectedRows.has(id))

  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows((prev) => new Set([...prev, ...filteredIds]))
    } else {
      setSelectedRows((prev) => {
        const next = new Set(prev)
        filteredIds.forEach((id) => next.delete(id))
        return next
      })
    }
  }

  const toggleRow = (id, checked) => {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const getRowLabel = (row, rowIndex) => {
    const firstTextCol = cols.find((c) => c.type === "Text")
    const val = firstTextCol ? row[firstTextCol.name] : null
    return val ? String(val) : `Row #${rowIndex + 1}`
  }

  // ── Filter helpers ─────────────────────────────────────────────────────────
  const getOptionValues = (col) => {
    if (col.type === "Status") return ["Todo", "In Progress", "Done", "Blocked"]
    if (col.type === "Payment Status")
      return ["Paid", "Unpaid", "Partial", "Overdue"]
    if (col.type === "Tag")
      return ["Urgent", "Low", "Medium", "High", "Internal", "External"]
    if (col.type === "Dropdown") return col.options ?? []
    return []
  }

  const openFilterPanel = () => {
    setPendingFilters(JSON.parse(JSON.stringify(filters)))
    setFilterOpen(true)
  }

  const applyFilters = () => {
    setFilters(pendingFilters)
    setFilterOpen(false)
  }

  const clearFilters = () => {
    setPendingFilters({})
    setFilters({})
    setFilterOpen(false)
  }

  const toggleOptionFilter = (colName, option) => {
    setPendingFilters((prev) => {
      const current = Array.isArray(prev[colName]) ? prev[colName] : []
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option]
      return { ...prev, [colName]: next }
    })
  }

  const setDateFilter = (colName, key, val) => {
    setPendingFilters((prev) => ({
      ...prev,
      [colName]: { ...(prev[colName] ?? {}), [key]: val },
    }))
  }

  const setBoolFilter = (colName, val) => {
    setPendingFilters((prev) => ({ ...prev, [colName]: val }))
  }

  const colSpanTotal = cols.length + 4 // checkbox + # + cols + bell + delete

  return (
    <>
      {/* ── Sub-header ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground gap-1.5 -ml-2"
          onClick={() => navigate({ to: "/data-tables" })}
        >
          <ArrowLeft className="h-4 w-4" />
          Data Tables
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <span className="text-sm font-semibold truncate">
          {currentTable.name}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className="text-xs text-muted-foreground">
            {filteredRows.length} / {allRows.length} row
            {allRows.length !== 1 ? "s" : ""}
          </Badge>
          <Badge variant="outline" className="text-xs text-muted-foreground">
            {cols.length} column{cols.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search rows…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 h-9"
          />
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={openFilterPanel}
          >
            <Filter className="h-4 w-4" />
            Filter
            {Object.keys(filters).length > 0 && (
              <Badge className="h-4 w-4 flex items-center justify-center p-0 text-[10px]">
                {Object.keys(filters).length}
              </Badge>
            )}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <ExportMenu table={currentTable} rows={filteredRows} />
          <Button size="sm" className="gap-2" onClick={handleAddRow}>
            <Plus className="h-4 w-4" />
            Add Row
          </Button>
        </div>
      </div>

      {/* ── Bulk selection bar ────────────────────────────────────────── */}
      {selectedRows.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/60 px-4 py-2.5 mb-4">
          <span className="text-sm font-medium">
            {selectedRows.size} row{selectedRows.size !== 1 ? "s" : ""} selected
          </span>
          <div className="ml-auto flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedRows(new Set())}
            >
              Clear Selection
            </Button>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div className="rounded-xl border shadow-sm overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-muted/40">
                <TableHead className="w-10 text-center border-r">
                  <Checkbox
                    checked={allFilteredSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all rows"
                  />
                </TableHead>
                <TableHead className="w-10 text-center text-xs text-muted-foreground font-medium border-r">
                  #
                </TableHead>
                {cols.map((col) => (
                  <TableHead
                    key={col.name}
                    className="text-xs font-semibold border-r last:border-r-0 min-w-[140px]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="truncate">{col.name}</span>
                      {col.mandatory && (
                        <span className="text-destructive text-xs">*</span>
                      )}
                      <span
                        className={`inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${TYPE_BADGE_COLORS[col.type] ?? "bg-muted text-muted-foreground"}`}
                      >
                        {col.type}
                      </span>
                    </div>
                  </TableHead>
                ))}
                <TableHead className="w-12 border-l text-xs text-muted-foreground font-medium text-center">
                  <Bell className="h-3.5 w-3.5 mx-auto" />
                </TableHead>
                <TableHead className="w-10 border-l" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredRows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <ShadTableCell
                    colSpan={colSpanTotal}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    {allRows.length === 0
                      ? 'No rows yet. Click "Add Row" to get started.'
                      : "No rows match your search or filters."}
                  </ShadTableCell>
                </TableRow>
              ) : (
                filteredRows.map((row, rowIndex) => (
                  <TableRow
                    key={row.id}
                    className="group border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                  >
                    <ShadTableCell className="w-10 text-center border-r p-2">
                      <Checkbox
                        checked={selectedRows.has(row.id)}
                        onCheckedChange={(checked) =>
                          toggleRow(row.id, checked)
                        }
                        aria-label={`Select row ${rowIndex + 1}`}
                      />
                    </ShadTableCell>
                    <ShadTableCell className="text-center text-xs text-muted-foreground border-r w-10 select-none">
                      {rowIndex + 1}
                    </ShadTableCell>
                    {cols.map((col) => (
                      <ShadTableCell
                        key={col.name}
                        className="p-0 border-r last:border-r-0"
                      >
                        <TableCell
                          type={col.type}
                          value={row[col.name]}
                          onChange={(val) =>
                            handleCellChange(row.id, col.name, val)
                          }
                          suggestions={suggestionsMap[col.name] ?? []}
                          dropdownOptions={col.options ?? []}
                        />
                      </ShadTableCell>
                    ))}
                    <ShadTableCell className="w-12 border-l p-0">
                      <div className="flex items-center justify-center h-full px-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-primary"
                          onClick={() =>
                            setReminderState({
                              open: true,
                              rowId: row.id,
                              rowLabel: getRowLabel(row, rowIndex),
                            })
                          }
                          aria-label="Set reminder"
                        >
                          <Bell className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </ShadTableCell>
                    <ShadTableCell className="w-10 border-l p-0">
                      <div className="flex items-center justify-center h-full px-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteRow(row.id)}
                          aria-label="Delete row"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </ShadTableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add Row footer */}
        <div className="border-t px-4 py-2 bg-muted/20">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground text-xs gap-1.5"
            onClick={handleAddRow}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Row
          </Button>
        </div>
      </div>

      {/* ── Reminder Modal ────────────────────────────────────────────── */}
      <ReminderModal
        open={reminderState.open}
        onOpenChange={(open) => setReminderState((s) => ({ ...s, open }))}
        tableId={tableId}
        rowId={reminderState.rowId}
        rowLabel={reminderState.rowLabel}
      />

      {/* ── Filter Sheet ──────────────────────────────────────────────── */}
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="right" className="w-80 overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Filter Rows</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-5">
            {cols.map((col) => {
              if (OPTION_FILTER_TYPES.has(col.type)) {
                const options = getOptionValues(col)
                if (options.length === 0) return null
                const active = Array.isArray(pendingFilters[col.name])
                  ? pendingFilters[col.name]
                  : []
                return (
                  <div key={col.name} className="flex flex-col gap-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {col.name}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {options.map((opt) => (
                        <Button
                          key={opt}
                          type="button"
                          size="sm"
                          variant={active.includes(opt) ? "default" : "outline"}
                          className="h-7 text-xs"
                          onClick={() => toggleOptionFilter(col.name, opt)}
                        >
                          {opt}
                        </Button>
                      ))}
                    </div>
                  </div>
                )
              }

              if (DATE_FILTER_TYPES.has(col.type)) {
                const f = pendingFilters[col.name] ?? {}
                return (
                  <div key={col.name} className="flex flex-col gap-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {col.name}
                    </p>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-muted-foreground w-8">
                          From
                        </label>
                        <Input
                          type="date"
                          value={f.from ?? ""}
                          onChange={(e) =>
                            setDateFilter(col.name, "from", e.target.value)
                          }
                          className="h-7 text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-muted-foreground w-8">
                          To
                        </label>
                        <Input
                          type="date"
                          value={f.to ?? ""}
                          onChange={(e) =>
                            setDateFilter(col.name, "to", e.target.value)
                          }
                          className="h-7 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )
              }

              if (BOOL_FILTER_TYPES.has(col.type)) {
                return (
                  <div key={col.name} className="flex flex-col gap-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {col.name}
                    </p>
                    <Select
                      value={pendingFilters[col.name] ?? "Any"}
                      onValueChange={(v) => setBoolFilter(col.name, v)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Any">Any</SelectItem>
                        <SelectItem value="Checked">Checked</SelectItem>
                        <SelectItem value="Unchecked">Unchecked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )
              }

              return null
            })}

            {cols.every(
              (c) =>
                !OPTION_FILTER_TYPES.has(c.type) &&
                !DATE_FILTER_TYPES.has(c.type) &&
                !BOOL_FILTER_TYPES.has(c.type),
            ) && (
              <p className="text-sm text-muted-foreground">
                No filterable columns in this table.
              </p>
            )}
          </div>

          <div className="flex gap-2 mt-8">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
            <Button size="sm" className="flex-1" onClick={applyFilters}>
              Apply
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

export default TableViewPage
