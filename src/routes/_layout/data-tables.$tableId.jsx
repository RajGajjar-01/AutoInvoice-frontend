import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { ArrowLeft, Bell, Filter, Plus, Trash2 } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { ExportMenu } from "@/components/DataTables/ExportMenu"
import { ReminderModal } from "@/components/DataTables/ReminderModal"
import { TableCell } from "@/components/DataTables/TableCell"
import { MobileEntryView } from "@/components/DataTables/MobileEntryView"
import { tablesStore } from "@/components/DataTables/tableStore"
import { useIsMobile } from "@/hooks/useMobile"
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

import { evaluateFormula } from "@/lib/formula-engine"

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
  const isMobile = useIsMobile()
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
  const [focusedCell, setFocusedCell] = useState(null)  // { rowId, colName, value } for Formula Bar
  const [activeColumnName, setActiveColumnName] = useState(null) // column header click for Status Bar

  // ── Cell-range selection (like Excel drag/Ctrl+Shift+Arrow)
  const [cellSelection, setCellSelection] = useState(null) // { colName, startRow, endRow } indices into filteredRows
  const cellDragRef = useRef({ active: false, colName: null, startRow: null })
  const tableContainerRef = useRef(null)

  // Clear selection on global mouseup (for drag stop)
  useEffect(() => {
    const stop = () => { cellDragRef.current.active = false }
    const handleClickOutside = (e) => {
      // If clicking completely outside the table container area, clear selection
      if (tableContainerRef.current && !tableContainerRef.current.contains(e.target)) {
        // Only clear if we're not currently dragging and not clicking on the Formula Bar or Toolbar
        // checking for closest selectors to find if the user is interacting with filters or formula bar
        if (!e.target.closest('.formula-bar') && !e.target.closest('.table-toolbar')) {
          setCellSelection(null)
          setActiveColumnName(null)
        }
      }
    }
    window.addEventListener('mouseup', stop)
    window.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('mouseup', stop)
      window.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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

  const handleAddRowWithData = (data) => {
    tablesStore.addRowWithData(tableId, data)
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

  const handleNavigate = (rowIndex, colIndex, direction) => {
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
          cell.querySelector(
            'button, input, select, textarea, [tabindex="0"]',
          ) || cell

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
  const currentTable = tablesStore.getById(tableId)
  const allRows = currentTable.rows
  const cols = currentTable.columns

  // Set of rowIds that have at least one active reminder
  const rowsWithReminders = new Set(
    (currentTable.reminders ?? []).map((r) => r.rowId)
  )

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
    <div className="flex flex-col h-full min-h-[calc(100vh)]">
      <div className="flex-1 p-4 flex flex-col">
        {/* ── Sub-header ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-5">
        <Button
          variant="ghost"
          size="sm"
          className="text-[#8A8A8A] hover:text-[#2E2E2E] gap-1.5 -ml-2 hover:bg-[#F5F6F8]"
          onClick={() => navigate({ to: "/data-tables" })}
        >
          <ArrowLeft className="h-4 w-4" />
          Data Tables
        </Button>
        <Separator orientation="vertical" className="h-5 bg-[#E5E7EB]" />
        <span className="text-sm font-semibold text-[#2E2E2E] truncate">
          {currentTable.name}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className="text-xs text-[#8A8A8A] border-[#E5E7EB] bg-white">
            {filteredRows.length} / {allRows.length} row
            {allRows.length !== 1 ? "s" : ""}
          </Badge>
          <Badge variant="outline" className="text-xs text-[#8A8A8A] border-[#E5E7EB] bg-white">
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
            className="w-64 h-9 border-[#E5E7EB] bg-white focus:border-[#1a5c38] focus:ring-[#1a5c38]/10 placeholder:text-[#8A8A8A] text-[#2E2E2E]"
          />
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-[#E5E7EB] text-[#2E2E2E] hover:bg-[#F5F6F8] hover:border-[#1a5c38] hover:text-[#1a5c38]"
            onClick={openFilterPanel}
          >
            <Filter className="h-4 w-4" />
            Filter
            {Object.keys(filters).length > 0 && (
              <Badge className="h-4 w-4 flex items-center justify-center p-0 text-[10px] bg-[#1a5c38]">
                {Object.keys(filters).length}
              </Badge>
            )}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <ExportMenu table={currentTable} rows={filteredRows} />
          <Button
            size="sm"
            className="gap-2 bg-[#1a5c38] hover:bg-[#14492d] text-white shadow-sm"
            onClick={handleAddRow}
          >
            <Plus className="h-4 w-4" />
            Add Row
          </Button>
        </div>
      </div>

      {/* ── Formula Bar ─────────────────────────────────────────────── */}
      {!isMobile && (
        <div className="flex items-center gap-0 border border-[#E5E7EB] bg-white rounded-lg mb-4 overflow-hidden shadow-sm h-10 group focus-within:ring-1 focus-within:ring-[#1a5c38]/20 focus-within:border-[#1a5c38] formula-bar">
          <div className="bg-[#F8F9FA] px-1 h-full flex items-center border-r border-[#E5E7EB] text-[10px] font-bold text-muted-foreground w-12 justify-center shrink-0">
            {focusedCell ? String.fromCharCode(65 + cols.findIndex(c => c.name === focusedCell.colName)) + (filteredRows.findIndex(r => r.id === focusedCell.rowId) + 1) : "fx"}
          </div>
          <div className="px-3 text-[#1a5c38] font-mono font-bold text-lg border-r border-[#E5E7EB] flex items-center justify-center w-8 shrink-0">
            ƒ
          </div>
          <input
            className="flex-1 h-full px-3 text-sm focus:outline-none placeholder:italic placeholder:text-muted-foreground/50 font-mono"
            placeholder="Select a cell to enter formula or text..."
            value={focusedCell?.value || ""}
            onChange={(e) => {
                if (focusedCell) {
                    const newVal = e.target.value
                    setFocusedCell(prev => ({ ...prev, value: newVal }))
                    handleCellChange(focusedCell.rowId, focusedCell.colName, newVal)
                }
            }}
          />
        </div>
      )}

      {/* ── Bulk selection bar ────────────────────────────────────────── */}
      {selectedRows.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-[#E5E7EB] bg-[#F4EBD2] px-4 py-2.5 mb-4 shadow-sm">
          <span className="text-sm font-medium text-[#2E2E2E]">
            {selectedRows.size} row{selectedRows.size !== 1 ? "s" : ""} selected
          </span>
          <div className="ml-auto flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-[#8A8A8A] hover:text-[#2E2E2E] hover:bg-white/60"
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
              rowLabel: getRowLabel(row, filteredRows.findIndex(r => r.id === rowId)),
            })
          }
        />
      ) : (
        <div ref={tableContainerRef} className="rounded-xl border border-[#E5E7EB] shadow-[0_1px_6px_0_rgba(0,0,0,0.06)] overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-[#F5F6F8] border-b border-[#E5E7EB]">
                  <TableHead className="w-10 text-center border-r border-[#E5E7EB]">
                    <Checkbox
                      checked={allFilteredSelected}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all rows"
                      className="border-[#E5E7EB] data-[state=checked]:bg-[#3B82F6] data-[state=checked]:border-[#3B82F6]"
                    />
                  </TableHead>
                  <TableHead className="w-10 text-center text-xs text-[#8A8A8A] font-semibold border-r border-[#E5E7EB]">
                    #
                  </TableHead>
                  {cols.map((col, idx) => (
                    <TableHead
                      key={col.name}
                      className={`text-xs font-semibold text-[#2E2E2E] border-r border-[#E5E7EB] last:border-r-0 min-w-[140px] py-1 px-0 cursor-pointer select-none transition-colors ${
                        activeColumnName === col.name ? 'bg-[#e8f5ee]' : 'hover:bg-[#EDF7F2]'
                      }`}
                      onClick={() => {
                        setActiveColumnName(prev => prev === col.name ? null : col.name)
                        setCellSelection(null) // Clear cell range when clicking header for total
                      }}
                    >
                      <div className="flex flex-col h-full">
                        <div className={`text-[10px] text-center py-0.5 border-b border-[#E5E7EB] font-mono transition-colors ${
                          activeColumnName === col.name
                            ? 'bg-[#1a5c38] text-white'
                            : 'bg-[#F1F3F4] text-muted-foreground'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-2">
                          <span className="truncate">{col.name}</span>
                          {col.mandatory && (
                            <span className="text-destructive text-xs">*</span>
                          )}
                        </div>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="w-12 border-l border-[#E5E7EB] text-xs text-[#8A8A8A] font-medium text-center">
                    <Bell className="h-3.5 w-3.5 mx-auto text-[#8A8A8A]" />
                  </TableHead>
                  <TableHead className="w-10 border-l border-[#E5E7EB]" />
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
                      className={`group border-b border-[#E5E7EB] last:border-b-0 transition-colors ${selectedRows.has(row.id)
                        ? "bg-[#F4EBD2] hover:bg-[#F4EBD2]"
                        : "bg-white hover:bg-[#F5F6F8]"
                        }`}
                    >
                      <ShadTableCell className="w-10 text-center border-r border-[#E5E7EB] p-2">
                        <Checkbox
                          checked={selectedRows.has(row.id)}
                          onCheckedChange={(checked) =>
                            toggleRow(row.id, checked)
                          }
                          aria-label={`Select row ${rowIndex + 1}`}
                          className="border-[#E5E7EB] data-[state=checked]:bg-[#1a5c38] data-[state=checked]:border-[#1a5c38]"
                        />
                      </ShadTableCell>
                      <ShadTableCell className="text-center text-xs text-[#8A8A8A] border-r border-[#E5E7EB] w-10 select-none font-mono">
                        <span className="text-[10px]">{rowIndex + 1}</span>
                      </ShadTableCell>
                      {cols.map((col, colIndex) => {
                        const isNumericCol = ['Number', 'Amount (₹)'].includes(col.type)
                        const isInSelection = cellSelection &&
                          cellSelection.colName === col.name &&
                          rowIndex >= Math.min(cellSelection.startRow, cellSelection.endRow) &&
                          rowIndex <= Math.max(cellSelection.startRow, cellSelection.endRow)

                        return (
                        <ShadTableCell
                          key={col.name}
                          className={`p-0 border-r border-[#E5E7EB] last:border-r-0 relative ${
                            isInSelection ? 'ring-2 ring-inset ring-[#1a5c38]/50 bg-[#e8f5ee]/60 z-10' : ''
                          }`}
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
                            cellDragRef.current = { active: true, colName: col.name, startRow: rowIndex }
                            setCellSelection({ colName: col.name, startRow: rowIndex, endRow: rowIndex })
                          }}
                          onMouseEnter={() => {
                            const d = cellDragRef.current
                            if (!d.active || d.colName !== col.name) return
                            setCellSelection({ colName: col.name, startRow: d.startRow, endRow: rowIndex })
                          }}
                          onKeyDown={(e) => {
                            // Ctrl+Shift+Down/Up extends cell selection
                            if (e.ctrlKey && e.shiftKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                              e.preventDefault()
                              if (!isNumericCol) return
                              setCellSelection(prev => {
                                const base = prev && prev.colName === col.name ? prev : { colName: col.name, startRow: rowIndex, endRow: rowIndex }
                                const newEnd = e.key === 'ArrowDown'
                                  ? Math.min(base.endRow + 1, filteredRows.length - 1)
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
                              setFocusedCell({ rowId: row.id, colName: col.name, value: row[col.name] || '' })
                              // Single-click focus also sets a 1-cell selection if numeric
                              if (isNumericCol && !cellDragRef.current.active) {
                                setActiveColumnName(null) // Clear total column selection
                                setCellSelection({ colName: col.name, startRow: rowIndex, endRow: rowIndex })
                              } else if (!isNumericCol) {
                                setCellSelection(null)
                                setActiveColumnName(null)
                              }
                            }}
                            allRows={allRows}
                            cols={cols}
                          />
                        </ShadTableCell>
                      )})}
                      <ShadTableCell className="w-12 border-l border-[#E5E7EB] p-0">
                        <div className="flex items-center justify-center h-full px-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 hover:bg-[#e8f5ee] ${rowsWithReminders.has(row.id)
                              ? "text-[#1a5c38]"
                              : "text-[#8A8A8A] hover:text-[#1a5c38]"
                              }`}
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
                              fill={rowsWithReminders.has(row.id) ? "currentColor" : "none"}
                            />
                          </Button>
                        </div>
                      </ShadTableCell>
                      <ShadTableCell className="w-10 border-l border-[#E5E7EB] p-0">
                        <div className="flex items-center justify-center h-full px-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-[#8A8A8A] hover:text-destructive hover:bg-red-50"
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
          <div className="border-t border-[#E5E7EB] px-4 py-2 bg-[#F5F6F8]/60">
            <Button
              variant="ghost"
              size="sm"
              className="text-[#8A8A8A] hover:text-[#1a5c38] hover:bg-[#e8f5ee] text-xs gap-1.5"
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
        let targetCol = null
        let sourceRows = []
        let selectionLabel = ''

        if (cellSelection) {
          targetCol = cols.find(c => c.name === cellSelection.colName)
          if (!targetCol || !['Number', 'Amount (₹)'].includes(targetCol.type)) return null
          const lo = Math.min(cellSelection.startRow, cellSelection.endRow)
          const hi = Math.max(cellSelection.startRow, cellSelection.endRow)
          sourceRows = filteredRows.slice(lo, hi + 1)
          selectionLabel = lo === hi ? `Row ${lo + 1}` : `Rows ${lo + 1}–${hi + 1}`
        } else if (activeColumnName) {
          targetCol = cols.find(c => c.name === activeColumnName)
          if (!targetCol || !['Number', 'Amount (₹)'].includes(targetCol.type)) return null
          sourceRows = allRows
          selectionLabel = 'All rows'
        } else {
          // If no column is active and no range is selected, show an empty system bar
          // to maintain the layout where the footer usually is
          return (
            <div className="mt-auto border-t border-[#E5E7EB] bg-[#F8F9FA] px-5 py-1.5 flex justify-between items-center text-[10px] text-muted-foreground/60 font-medium tracking-wide">
              <span>READY</span>
              <div className="flex gap-4">
                <span>100%</span>
                <span className="font-mono">INS</span>
              </div>
            </div>
          )
        }

        const values = sourceRows.map(r => {
          const val = r[targetCol.name]
          return typeof val === 'string' && val.startsWith('=')
            ? parseFloat(evaluateFormula(val, allRows, cols))
            : parseFloat(val)
        }).filter(v => !isNaN(v))

        if (values.length === 0) return null

        const sum = values.reduce((a, b) => a + b, 0)
        const avg = sum / values.length
        const min = Math.min(...values)
        const max = Math.max(...values)

        const fmt = (n) => targetCol.type === 'Amount (₹)'
          ? `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
          : Number.isInteger(n) ? String(n) : n.toFixed(2)

        const stats = [
          { label: 'Count', value: values.length },
          { label: 'Sum', value: fmt(sum) },
          { label: 'Avg', value: fmt(avg) },
          { label: 'Min', value: fmt(min) },
          { label: 'Max', value: fmt(max) },
        ]

        return (
          <div className="mt-auto border-t border-[#14492d] shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
            <div className="flex items-center justify-between bg-[#1a5c38] text-white px-5 py-1.5">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">{targetCol.name}</span>
                <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-sm font-bold uppercase">{selectionLabel}</span>
              </div>
              <div className="flex items-center">
                {stats.map((s, i) => (
                  <div key={s.label} className={`flex items-center gap-1.5 px-4 ${i < stats.length - 1 ? 'border-r border-white/20' : ''}`}>
                    <span className="text-[9px] text-white/50 font-bold uppercase tracking-tight">{s.label}:</span>
                    <span className="text-[11px] font-bold tabular-nums tracking-tighter">{s.value}</span>
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
    </div>
  )
}

export default TableViewPage
