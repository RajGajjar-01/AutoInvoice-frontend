import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { ArrowLeft, Bell, Filter, Plus, Trash2 } from "lucide-react"
import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { TablesService } from "@/client"
import { ExportMenu } from "@/components/DataTables/ExportMenu"
import { MobileEntryView } from "@/components/DataTables/MobileEntryView"
import { ReminderModal } from "@/components/DataTables/ReminderModal"
import { TableCell } from "@/components/DataTables/TableCell"
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
import {
  tableDetailQueryOptions,
  tablesQueryKeys,
} from "@/features/data-tables/queries"
import { buildMandatoryDefaultRow } from "@/features/data-tables/templates"
import { useIsMobile } from "@/hooks/useMobile"
import { evaluateFormula } from "@/lib/formula-engine"
import { cn } from "@/lib/utils"
import { queryClient } from "@/queryClient"

export const Route = createFileRoute("/_layout/data-tables/$tableId")({
  component: TableViewRouteComponent,
  loader: ({ params }) => {
    return queryClient.ensureQueryData(tableDetailQueryOptions(params.tableId))
  },
  head: () => ({
    meta: [{ title: "Table View" }],
  }),
})

function TableViewRouteComponent() {
  return (
    <Suspense fallback={null}>
      <TableViewPage />
    </Suspense>
  )
}

const OPTION_FILTER_TYPES = new Set([
  "Status",
  "Payment Status",
  "Tag",
  "Dropdown",
])
const DATE_FILTER_TYPES = new Set(["Date", "Due Date", "Expiry Date"])
const BOOL_FILTER_TYPES = new Set(["Checkbox"])

interface TableColumn {
  name: string
  type: string
  mandatory?: boolean
  options?: string[]
}

interface TableDataRow {
  id: string
  [key: string]: unknown
}

interface TableData {
  id: string
  name: string
  columns: TableColumn[]
  rows: TableDataRow[]
  reminders?: { rowId: string }[]
}

interface FocusedCell {
  rowId: string
  colName: string
  value: string
}

interface CellSelection {
  colName: string
  startRow: number
  endRow: number
}

interface CellDragRef {
  active: boolean
  colName: string | null
  startRow: number | null
}

interface ReminderState {
  open: boolean
  rowId: string | null
  rowLabel: string
}

interface Filters {
  [colName: string]:
    | string
    | string[]
    | { from?: string; to?: string }
    | undefined
}

function TableViewPage() {
  const isMobile = useIsMobile()
  const { tableId } = Route.useParams()
  const navigate = useNavigate()

  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [reminderState, setReminderState] = useState<ReminderState>({
    open: false,
    rowId: null,
    rowLabel: "",
  })
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState<Filters>({})
  const [pendingFilters, setPendingFilters] = useState<Filters>({})
  const [search, setSearch] = useState("")
  const [focusedCell, setFocusedCell] = useState<FocusedCell | null>(null)
  const [activeColumnName, setActiveColumnName] = useState<string | null>(null)

  // ── Cell-range selection (like Excel drag/Ctrl+Shift+Arrow)
  const [cellSelection, setCellSelection] = useState<CellSelection | null>(null)
  const cellDragRef = useRef<CellDragRef>({
    active: false,
    colName: null,
    startRow: null,
  })
  const tableContainerRef = useRef<HTMLDivElement>(null)

  // Clear selection on global mouseup (for drag stop)
  useEffect(() => {
    const stop = () => {
      cellDragRef.current.active = false
    }
    const handleClickOutside = (e: MouseEvent) => {
      // If clicking completely outside the table container area, clear selection
      if (
        tableContainerRef.current &&
        !tableContainerRef.current.contains(e.target as Node)
      ) {
        // Only clear if we're not currently dragging and not clicking on the Formula Bar or Toolbar
        // checking for closest selectors to find if the user is interacting with filters or formula bar
        if (
          !(e.target as Element).closest(".formula-bar") &&
          !(e.target as Element).closest(".table-toolbar")
        ) {
          setCellSelection(null)
          setActiveColumnName(null)
        }
      }
    }
    window.addEventListener("mouseup", stop)
    window.addEventListener("mousedown", handleClickOutside)
    return () => {
      window.removeEventListener("mouseup", stop)
      window.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const { data: currentTable } = useSuspenseQuery(
    tableDetailQueryOptions(tableId),
  )
  const cols: TableColumn[] = currentTable?.columns ?? []
  const allRows: TableDataRow[] = currentTable?.rows ?? []

  const uiRowToApiData = (
    row: TableDataRow | undefined,
    cols: TableColumn[],
    patch?: Record<string, unknown>,
  ): Record<string, unknown> => {
    const data: Record<string, unknown> = {}
    for (const col of cols) {
      data[col.name] = row?.[col.name]
    }
    if (patch) {
      for (const [k, v] of Object.entries(patch)) {
        data[k] = v
      }
    }
    return data
  }

  const createRowMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      return TablesService.createTableRow({
        tableId,
        requestBody: {
          data,
        },
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: tablesQueryKeys.detail(tableId),
      })
    },
    onError: () => {
      toast.error("Failed to add row")
    },
  })

  const updateRowMutation = useMutation({
    mutationFn: async ({
      rowId,
      apiData,
    }: {
      rowId: string
      apiData: Record<string, unknown>
      uiPatch?: Record<string, unknown>
    }) => {
      return TablesService.updateTableRow({
        tableId,
        rowId,
        requestBody: {
          data: apiData,
        },
      })
    },
    onMutate: async ({ rowId, uiPatch }) => {
      await queryClient.cancelQueries({
        queryKey: tablesQueryKeys.detail(tableId),
      })
      const previous = queryClient.getQueryData(tablesQueryKeys.detail(tableId))
      queryClient.setQueryData(
        tablesQueryKeys.detail(tableId),
        (old: TableData | undefined) => {
          if (!old) return old
          const patch = uiPatch ?? {}
          const nextRows = (old.rows ?? []).map((r) => {
            if (r.id !== rowId) return r
            return {
              ...r,
              ...patch,
            }
          })
          return {
            ...old,
            rows: nextRows,
          }
        },
      )
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(tablesQueryKeys.detail(tableId), ctx.previous)
      }
      toast.error("Failed to update row")
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: tablesQueryKeys.detail(tableId),
      })
    },
  })

  const deleteRowMutation = useMutation({
    mutationFn: async (rowId: string) => {
      return TablesService.deleteTableRow({ tableId, rowId })
    },
    onSuccess: async (_res, rowId) => {
      setSelectedRows((prev) => {
        const next = new Set(prev)
        next.delete(rowId)
        return next
      })
      await queryClient.invalidateQueries({
        queryKey: tablesQueryKeys.detail(tableId),
      })
    },
    onError: () => {
      toast.error("Failed to delete row")
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: async (rowIds: string[]) => {
      return TablesService.bulkDeleteTableRows({
        tableId,
        requestBody: rowIds,
      })
    },
    onSuccess: async () => {
      setSelectedRows(new Set())
      await queryClient.invalidateQueries({
        queryKey: tablesQueryKeys.detail(tableId),
      })
    },
    onError: () => {
      toast.error("Failed to bulk delete rows")
    },
  })

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCellChange = (rowId: string, colName: string, value: unknown) => {
    const row = currentTable.rows.find((r) => r.id === rowId)
    const uiPatch = { [colName]: value }
    const apiData = uiRowToApiData(row, cols, uiPatch)
    updateRowMutation.mutate({ rowId, apiData, uiPatch })
  }

  const handleAddRow = () => {
    createRowMutation.mutate(buildMandatoryDefaultRow(cols))
  }

  const handleAddRowWithData = (rowLike: Record<string, unknown>) => {
    const nextData = uiRowToApiData(rowLike as TableDataRow, cols)
    createRowMutation.mutate(nextData)
  }

  const handleDeleteRow = (rowId: string) => {
    deleteRowMutation.mutate(rowId)
  }

  const handleBulkDelete = () => {
    bulkDeleteMutation.mutate([...selectedRows])
  }

  const handleNavigate = (
    rowIndex: number,
    colIndex: number,
    direction: string,
  ): boolean => {
    let nextRow = rowIndex
    let nextCol = colIndex

    if (direction === "left") nextCol--
    else if (direction === "right") nextCol++
    else if (direction === "up") nextRow--
    else if (direction === "down") nextRow++

    const canMove =
      nextCol >= 0 &&
      nextCol < cols.length &&
      nextRow >= 0 &&
      nextRow < filteredRows.length

    if (!canMove) return false

    // Find the next cell's interactive element and focus it
    setTimeout(() => {
      const selector = `[data-row="${nextRow}"][data-col="${nextCol}"]`
      const cell = document.querySelector(selector)
      if (cell) {
        // Try to find ANY focusable element
        const focusable =
          cell.querySelector<HTMLElement>(
            'button, input, select, textarea, [tabindex="0"]',
          ) || (cell as HTMLElement)

        // Scroll before focus to avoid weird jumps
        focusable.scrollIntoView({
          behavior: "auto",
          block: "nearest",
          inline: "nearest",
        })
        focusable.focus({ preventScroll: true })

        // If it's a div (view mode), click it to enter edit mode
        if (focusable.tagName === "DIV") {
          focusable.click()
        }
      }
    }, 20)
    return true
  }

  // ── Re-read after mutations ────────────────────────────────────────────────

  // Set of rowIds that have at least one active reminder
  const rowsWithReminders = new Set(
    (currentTable.reminders ?? []).map((r) => r.rowId),
  )

  // ── Suggestions map for Text fields ───────────────────────────────────────
  const suggestionsMap = useMemo(() => {
    const map: Record<string, string[]> = {}
    for (const col of cols) {
      map[col.name] = [
        ...new Set(allRows.map((r) => r[col.name]).filter(Boolean) as string[]),
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
          result = result.filter((r) =>
            filterVal.includes(r[colName] as string),
          )
        }
      } else if (DATE_FILTER_TYPES.has(col.type)) {
        const { from, to } = (filterVal as { from?: string; to?: string }) ?? {}
        if (from)
          result = result.filter(
            (r) => r[colName] && (r[colName] as string) >= from,
          )
        if (to)
          result = result.filter(
            (r) => r[colName] && (r[colName] as string) <= to,
          )
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

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => new Set([...prev, ...filteredIds]))
    } else {
      setSelectedRows((prev) => {
        const next = new Set(prev)
        filteredIds.forEach((id) => {
          next.delete(id)
        })
        return next
      })
    }
  }

  const toggleRow = (id: string, checked: boolean) => {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const getRowLabel = (row: TableDataRow, rowIndex: number): string => {
    const firstTextCol = cols.find((c) => c.type === "Text")
    const val = firstTextCol ? row[firstTextCol.name] : null
    return val ? String(val) : `Row #${rowIndex + 1}`
  }

  // ── Filter helpers ─────────────────────────────────────────────────────────
  const getOptionValues = (col: TableColumn): string[] => {
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

  const toggleOptionFilter = (colName: string, option: string) => {
    setPendingFilters((prev) => {
      const current = Array.isArray(prev[colName])
        ? (prev[colName] as string[])
        : []
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option]
      return { ...prev, [colName]: next }
    })
  }

  const setDateFilter = (colName: string, key: string, val: string) => {
    setPendingFilters((prev) => ({
      ...prev,
      [colName]: {
        ...((prev[colName] as { from?: string; to?: string }) ?? {}),
        [key]: val,
      },
    }))
  }

  const setBoolFilter = (colName: string, val: string) => {
    setPendingFilters((prev) => ({ ...prev, [colName]: val }))
  }

  const colSpanTotal = cols.length + 4 // checkbox + # + cols + bell + delete

  return (
    <div className="flex flex-col h-full min-h-screen">
      <div className="flex-1 p-4 flex flex-col">
        {/* ── Sub-header ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-5">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1.5 -ml-2 hover:bg-muted"
            onClick={() => navigate({ to: "/data-tables" })}
          >
            <ArrowLeft className="h-4 w-4" />
            Data Tables
          </Button>
          <Separator orientation="vertical" className="h-5 bg-border" />
          <span className="text-sm font-semibold text-foreground truncate">
            {currentTable.name}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-xs text-muted-foreground border-border bg-background"
            >
              {filteredRows.length} / {allRows.length} row
              {allRows.length !== 1 ? "s" : ""}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs text-muted-foreground border-border bg-background"
            >
              {cols.length} column{cols.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>

        {/* ── Toolbar ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4 table-toolbar">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search rows…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 h-9 border-border bg-background focus:border-primary focus:ring-primary/10 placeholder:text-muted-foreground text-foreground"
            />
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-border text-foreground hover:bg-muted hover:border-primary hover:text-primary"
              onClick={openFilterPanel}
            >
              <Filter className="h-4 w-4" />
              Filter
              {Object.keys(filters).length > 0 && (
                <Badge className="h-4 w-4 flex items-center justify-center p-0 text-xs bg-primary">
                  {Object.keys(filters).length}
                </Badge>
              )}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <ExportMenu table={currentTable} rows={filteredRows} />
            <Button
              size="sm"
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              onClick={handleAddRow}
            >
              <Plus className="h-4 w-4" />
              Add Row
            </Button>
          </div>
        </div>

        {/* ── Formula Bar ─────────────────────────────────────────────── */}
        {!isMobile && (
          <div className="flex items-center gap-0 border border-border bg-background rounded-lg mb-4 overflow-hidden shadow-sm h-10 group focus-within:ring-1 focus-within:ring-primary/20 focus-within:border-primary formula-bar">
            <div className="bg-muted px-1 h-full flex items-center border-r border-border text-xs font-bold text-muted-foreground w-12 justify-center shrink-0">
              {focusedCell
                ? String.fromCharCode(
                    65 + cols.findIndex((c) => c.name === focusedCell.colName),
                  ) +
                  (filteredRows.findIndex((r) => r.id === focusedCell.rowId) +
                    1)
                : "fx"}
            </div>
            <div className="px-3 text-primary font-mono font-bold text-lg border-r border-border flex items-center justify-center w-8 shrink-0">
              ƒ
            </div>
            <input
              className="flex-1 h-full px-3 text-sm focus:outline-none placeholder:italic placeholder:text-muted-foreground/50 font-mono"
              placeholder="Select a cell to enter formula or text..."
              value={focusedCell?.value || ""}
              onChange={(e) => {
                if (focusedCell) {
                  const newVal = e.target.value
                  setFocusedCell((prev) =>
                    prev ? { ...prev, value: newVal } : null,
                  )
                  handleCellChange(
                    focusedCell.rowId,
                    focusedCell.colName,
                    newVal,
                  )
                }
              }}
            />
          </div>
        )}

        {/* ── Bulk selection bar ────────────────────────────────────────── */}
        {selectedRows.size > 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-accent px-4 py-2.5 mb-4 shadow-sm">
            <span className="text-sm font-medium text-foreground">
              {selectedRows.size} row{selectedRows.size !== 1 ? "s" : ""}{" "}
              selected
            </span>
            <div className="ml-auto flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-background/60"
                onClick={() => setSelectedRows(new Set())}
              >
                Clear Selection
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete Selected
              </Button>
            </div>
          </div>
        )}

        {/* ── Table ─────────────────────────────────────────────────────── */}
        {isMobile ? (
          <MobileEntryView
            tableId={tableId}
            table={currentTable}
            rows={filteredRows}
            cols={cols}
            onDeleteRow={handleDeleteRow}
            onAddRowWithData={handleAddRowWithData}
            onUpdateCell={handleCellChange}
            suggestionsMap={suggestionsMap}
            onSetReminder={(rowId, row) =>
              setReminderState({
                open: true,
                rowId: rowId,
                rowLabel: getRowLabel(
                  row,
                  filteredRows.findIndex((r) => r.id === rowId),
                ),
              })
            }
          />
        ) : (
          <div
            ref={tableContainerRef}
            className="rounded-xl border border-border shadow-sm overflow-hidden bg-background"
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-muted border-b border-border">
                    <TableHead className="w-10 text-center border-r border-border">
                      <Checkbox
                        checked={allFilteredSelected}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all rows"
                        className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </TableHead>
                    <TableHead className="w-10 text-center text-xs text-muted-foreground font-semibold border-r border-border">
                      #
                    </TableHead>
                    {cols.map((col, idx) => (
                      <TableHead
                        key={col.name}
                        className={cn(
                          "text-xs font-semibold text-foreground border-r border-border last:border-r-0 min-w-36 py-1 px-0 cursor-pointer select-none transition-colors",
                          activeColumnName === col.name
                            ? "bg-primary/10"
                            : "hover:bg-primary/5",
                        )}
                        onClick={() => {
                          setActiveColumnName((prev) =>
                            prev === col.name ? null : col.name,
                          )
                          setCellSelection(null) // Clear cell range when clicking header for total
                        }}
                      >
                        <div className="flex flex-col h-full">
                          <div
                            className={cn(
                              "text-xs text-center py-0.5 border-b border-border font-mono transition-colors",
                              activeColumnName === col.name
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-2">
                            <span className="truncate">{col.name}</span>
                            {col.mandatory && (
                              <span className="text-destructive text-xs">
                                *
                              </span>
                            )}
                          </div>
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="w-12 border-l border-border text-xs text-muted-foreground font-medium text-center">
                      <Bell className="h-3.5 w-3.5 mx-auto text-muted-foreground" />
                    </TableHead>
                    <TableHead className="w-10 border-l border-border" />
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
                        className={cn(
                          "group border-b border-border last:border-b-0 transition-colors",
                          selectedRows.has(row.id)
                            ? "bg-accent hover:bg-accent"
                            : "bg-background hover:bg-muted",
                        )}
                      >
                        <ShadTableCell className="w-10 text-center border-r border-border p-2">
                          <Checkbox
                            checked={selectedRows.has(row.id)}
                            onCheckedChange={(checked) =>
                              toggleRow(row.id, checked as boolean)
                            }
                            aria-label={`Select row ${rowIndex + 1}`}
                            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                        </ShadTableCell>
                        <ShadTableCell className="text-center text-xs text-muted-foreground border-r border-border w-10 select-none font-mono">
                          <span className="text-xs leading-none">
                            {rowIndex + 1}
                          </span>
                        </ShadTableCell>
                        {cols.map((col, colIndex) => {
                          const isNumericCol = [
                            "Number",
                            "Amount (₹)",
                          ].includes(col.type)
                          const isInSelection =
                            cellSelection &&
                            cellSelection.colName === col.name &&
                            rowIndex >=
                              Math.min(
                                cellSelection.startRow,
                                cellSelection.endRow,
                              ) &&
                            rowIndex <=
                              Math.max(
                                cellSelection.startRow,
                                cellSelection.endRow,
                              )

                          return (
                            <ShadTableCell
                              key={col.name}
                              className={cn(
                                "p-0 border-r border-border last:border-r-0 relative",
                                isInSelection &&
                                  "ring-2 ring-inset ring-primary/50 bg-primary/10 z-10",
                              )}
                              data-row={rowIndex}
                              data-col={colIndex}
                              onMouseDown={(e) => {
                                if (!isNumericCol) {
                                  setCellSelection(null)
                                  setActiveColumnName(null)
                                  return
                                }
                                e.preventDefault()
                                setActiveColumnName(null) // Clear total column selection when starting a range
                                cellDragRef.current = {
                                  active: true,
                                  colName: col.name,
                                  startRow: rowIndex,
                                }
                                setCellSelection({
                                  colName: col.name,
                                  startRow: rowIndex,
                                  endRow: rowIndex,
                                })
                              }}
                              onMouseEnter={() => {
                                const d = cellDragRef.current
                                if (!d.active || d.colName !== col.name) return
                                setCellSelection({
                                  colName: col.name,
                                  startRow: d.startRow!,
                                  endRow: rowIndex,
                                })
                              }}
                              onKeyDown={(e) => {
                                // Ctrl+Shift+Down/Up extends cell selection
                                if (
                                  e.ctrlKey &&
                                  e.shiftKey &&
                                  (e.key === "ArrowDown" || e.key === "ArrowUp")
                                ) {
                                  e.preventDefault()
                                  if (!isNumericCol) return
                                  setCellSelection((prev) => {
                                    const base =
                                      prev && prev.colName === col.name
                                        ? prev
                                        : {
                                            colName: col.name,
                                            startRow: rowIndex,
                                            endRow: rowIndex,
                                          }
                                    const newEnd =
                                      e.key === "ArrowDown"
                                        ? Math.min(
                                            base.endRow + 1,
                                            filteredRows.length - 1,
                                          )
                                        : Math.max(base.endRow - 1, 0)
                                    return { ...base, endRow: newEnd }
                                  })
                                }
                              }}
                            >
                              <TableCell
                                type={col.type}
                                value={row[col.name]}
                                onNavigate={(dir) =>
                                  handleNavigate(rowIndex, colIndex, dir)
                                }
                                suggestions={suggestionsMap[col.name] ?? []}
                                dropdownOptions={col.options ?? []}
                                onChange={(val) =>
                                  handleCellChange(row.id, col.name, val)
                                }
                                onFocus={() => {
                                  setFocusedCell({
                                    rowId: row.id,
                                    colName: col.name,
                                    value: (row[col.name] as string) || "",
                                  })
                                  // Single-click focus also sets a 1-cell selection if numeric
                                  if (
                                    isNumericCol &&
                                    !cellDragRef.current.active
                                  ) {
                                    setActiveColumnName(null) // Clear total column selection
                                    setCellSelection({
                                      colName: col.name,
                                      startRow: rowIndex,
                                      endRow: rowIndex,
                                    })
                                  } else if (!isNumericCol) {
                                    setCellSelection(null)
                                    setActiveColumnName(null)
                                  }
                                }}
                                allRows={allRows}
                                cols={cols}
                              />
                            </ShadTableCell>
                          )
                        })}
                        <ShadTableCell className="w-12 border-l border-border p-0">
                          <div className="flex items-center justify-center h-full px-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "h-7 w-7 hover:bg-primary/10",
                                rowsWithReminders.has(row.id)
                                  ? "text-primary"
                                  : "text-muted-foreground hover:text-primary",
                              )}
                              onClick={() =>
                                setReminderState({
                                  open: true,
                                  rowId: row.id,
                                  rowLabel: getRowLabel(row, rowIndex),
                                })
                              }
                              aria-label="Set reminder"
                            >
                              <Bell
                                className="h-3.5 w-3.5"
                                fill={
                                  rowsWithReminders.has(row.id)
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            </Button>
                          </div>
                        </ShadTableCell>
                        <ShadTableCell className="w-10 border-l border-border p-0">
                          <div className="flex items-center justify-center h-full px-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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

            {/* ── Add Row footer ────────────────────────────────────────── */}
            <div className="border-t border-border px-4 py-2 bg-muted/60">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary hover:bg-primary/10 text-xs gap-1.5"
                onClick={handleAddRow}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Row
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Excel Status Bar (at bottom of page, replacing footer) ────────── */}
      {(() => {
        // Priority: cell range selection > column header click
        let targetCol: TableColumn | null = null
        let sourceRows: TableDataRow[] = []
        let selectionLabel = ""

        if (cellSelection) {
          targetCol = cols.find((c) => c.name === cellSelection.colName) ?? null
          if (!targetCol || !["Number", "Amount (₹)"].includes(targetCol.type))
            return null
          const lo = Math.min(cellSelection.startRow, cellSelection.endRow)
          const hi = Math.max(cellSelection.startRow, cellSelection.endRow)
          sourceRows = filteredRows.slice(lo, hi + 1)
          selectionLabel =
            lo === hi ? `Row ${lo + 1}` : `Rows ${lo + 1}–${hi + 1}`
        } else if (activeColumnName) {
          targetCol = cols.find((c) => c.name === activeColumnName) ?? null
          if (!targetCol || !["Number", "Amount (₹)"].includes(targetCol.type))
            return null
          sourceRows = allRows
          selectionLabel = "All rows"
        } else {
          // If no column is active and no range is selected, show an empty system bar
          // to maintain the layout where the footer usually is
          return (
            <div className="mt-auto border-t border-border bg-muted px-5 py-1.5 flex justify-between items-center text-xs text-muted-foreground/60 font-medium tracking-wide">
              <span>READY</span>
              <div className="flex gap-4">
                <span>100%</span>
                <span className="font-mono">INS</span>
              </div>
            </div>
          )
        }

        const values = sourceRows
          .map((r) => {
            const val = r[targetCol!.name]
            return typeof val === "string" && val.startsWith("=")
              ? parseFloat(evaluateFormula(val, allRows, cols))
              : parseFloat(val as string)
          })
          .filter((v) => !Number.isNaN(v))

        if (values.length === 0) return null

        const sum = values.reduce((a, b) => a + b, 0)
        const avg = sum / values.length
        const min = Math.min(...values)
        const max = Math.max(...values)

        const fmt = (n: number): string =>
          targetCol!.type === "Amount (₹)"
            ? `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
            : Number.isInteger(n)
              ? String(n)
              : n.toFixed(2)

        const stats = [
          { label: "Count", value: values.length },
          { label: "Sum", value: fmt(sum) },
          { label: "Avg", value: fmt(avg) },
          { label: "Min", value: fmt(min) },
          { label: "Max", value: fmt(max) },
        ]

        return (
          <div className="mt-auto border-t border-border shadow-lg z-50">
            <div className="flex items-center justify-between bg-primary text-primary-foreground px-5 py-1.5">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-primary-foreground/80 uppercase tracking-widest">
                  {targetCol.name}
                </span>
                <span className="text-xs bg-primary-foreground/15 px-2 py-0.5 rounded-sm font-bold uppercase">
                  {selectionLabel}
                </span>
              </div>
              <div className="flex items-center">
                {stats.map((s, i) => (
                  <div
                    key={s.label}
                    className={cn(
                      "flex items-center gap-1.5 px-4",
                      i < stats.length - 1 &&
                        "border-r border-primary-foreground/20",
                    )}
                  >
                    <span className="text-xs text-primary-foreground/60 font-bold uppercase tracking-tight">
                      {s.label}:
                    </span>
                    <span className="text-sm font-bold tabular-nums tracking-tight">
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })()}

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
                  ? (pendingFilters[col.name] as string[])
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
                const f =
                  (pendingFilters[col.name] as {
                    from?: string
                    to?: string
                  }) ?? {}
                return (
                  <div key={col.name} className="flex flex-col gap-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {col.name}
                    </p>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor={`${col.name}-from`}
                          className="text-xs text-muted-foreground w-8"
                        >
                          From
                        </label>
                        <Input
                          id={`${col.name}-from`}
                          type="date"
                          value={f.from ?? ""}
                          onChange={(e) =>
                            setDateFilter(col.name, "from", e.target.value)
                          }
                          className="h-7 text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor={`${col.name}-to`}
                          className="text-xs text-muted-foreground w-8"
                        >
                          To
                        </label>
                        <Input
                          id={`${col.name}-to`}
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
                      value={(pendingFilters[col.name] as string) ?? "Any"}
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
    </div>
  )
}

export default TableViewPage
