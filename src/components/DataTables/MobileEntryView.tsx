import {
  Bell,
  CaretDown as ChevronDown,
  CaretUp as ChevronUp,
  Plus,
  Trash as Trash2,
  X,
} from "@phosphor-icons/react"
import { useState } from "react"
import { TableCell } from "@/components/DataTables/TableCell"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface Column {
  name: string
  type: string
  mandatory: boolean
  options: string[]
}

interface Row {
  id: string
  [key: string]: unknown
}

interface SuggestionsMap {
  [colName: string]: string[]
}

interface MobileEntryViewProps {
  tableId: string
  table: { id: string; name: string; columns: Column[] }
  rows: Row[]
  cols: Column[]
  onDeleteRow: (rowId: string) => void
  suggestionsMap: SuggestionsMap
  onSetReminder: (rowId: string, row: Row) => void
  onAddRowWithData: (row: Row) => void
  onUpdateCell: (rowId: string, colName: string, value: unknown) => void
}

export function MobileEntryView({
  tableId: _tableId,
  table: _table,
  rows,
  cols,
  onDeleteRow,
  suggestionsMap,
  onSetReminder,
  onAddRowWithData,
  onUpdateCell,
}: MobileEntryViewProps) {
  const [newItem, setNewItem] = useState<Record<string, unknown>>({})
  const [adding, setAdding] = useState(false)

  const handleAdd = () => {
    const rowToSave = { ...newItem, id: crypto.randomUUID() }
    onAddRowWithData(rowToSave as Row)
    setNewItem({})
    setAdding(false)
  }

  return (
    <div className="flex flex-col gap-5 pb-20">
      {/* ── Entry Form ── */}
      {adding ? (
        <Card className="gap-0 overflow-hidden py-0">
          <CardHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
            <CardTitle className="text-base">New entry</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close new entry"
              className="-mr-2 size-11"
              onClick={() => setAdding(false)}
            >
              <X />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-4">
            {cols.map((col) => (
              <div key={col.name} className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">
                  {col.name}
                  {col.mandatory && (
                    <span className="ml-0.5 text-destructive">*</span>
                  )}
                </span>
                <div className="flex min-h-11 items-center overflow-hidden rounded-lg border bg-background">
                  <TableCell
                    type={col.type}
                    value={newItem[col.name]}
                    onChange={(val) =>
                      setNewItem((prev) => ({ ...prev, [col.name]: val }))
                    }
                    suggestions={suggestionsMap[col.name] ?? []}
                    dropdownOptions={col.options ?? []}
                  />
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex gap-2 border-t p-4">
            <Button
              variant="outline"
              className="h-11 flex-1"
              onClick={() => setAdding(false)}
            >
              Cancel
            </Button>
            <Button className="h-11 flex-1" onClick={handleAdd}>
              <Plus /> Add entry
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Button className="h-11 w-full" onClick={() => setAdding(true)}>
          <Plus /> New entry
        </Button>
      )}

      {/* ── Data List ── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Entries ({rows.length})
          </h2>
        </div>
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-1 rounded-xl border border-dashed px-6 py-8 text-center">
            <p className="text-sm font-medium">No entries yet</p>
            <p className="text-sm text-muted-foreground">
              Tap New entry to add the first row.
            </p>
          </div>
        ) : (
          [...rows].reverse().map((row, revIdx) => {
            const originalIdx = rows.length - 1 - revIdx
            return (
              <MobileRowCard
                key={row.id}
                row={row}
                cols={cols}
                idx={originalIdx}
                onDelete={() => onDeleteRow(row.id)}
                onCellChange={(colName, val) =>
                  onUpdateCell(row.id, colName, val)
                }
                suggestionsMap={suggestionsMap}
                onSetReminder={() => onSetReminder(row.id, row)}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

interface MobileRowCardProps {
  row: Row
  cols: Column[]
  idx: number
  onDelete: () => void
  onCellChange: (colName: string, val: unknown) => void
  suggestionsMap: SuggestionsMap
  onSetReminder: () => void
}

function MobileRowCard({
  row,
  cols,
  idx,
  onDelete,
  onCellChange,
  suggestionsMap,
  onSetReminder,
}: MobileRowCardProps) {
  const [expanded, setExpanded] = useState(false)

  // First non-null field as header
  const primaryTitleCol = cols.find((c) => c.type === "Text") || cols[0]
  const primaryTitle = row[primaryTitleCol?.name ?? ""] || `Entry #${idx + 1}`

  return (
    <Card className="shadow-sm border border-border/60 overflow-hidden bg-card transition-all active:scale-[0.99] hover:border-primary/30">
      <CardHeader
        className="px-4 py-2 flex flex-row items-center justify-between group cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-col overflow-hidden">
          <span className="text-xs font-bold truncate text-foreground/90">
            {String(primaryTitle)}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium italic truncate">
            #{idx + 1} Entry
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-primary transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              onSetReminder()
            }}
          >
            <Bell className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <div className="ml-1 p-1 rounded-full bg-muted/50 text-muted-foreground/70">
            {expanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="px-3 pb-3 pt-1 flex flex-col gap-0 divide-y divide-border/20 bg-muted/10 border-t border-border/40">
          {cols.map((col) => (
            <div
              key={col.name}
              className="grid grid-cols-[100px_1fr] items-center py-2 px-1 gap-2"
            >
              <span className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-tight truncate pr-2">
                {col.name}
              </span>
              <div className="min-h-[36px] flex items-center bg-background rounded-md border border-border/30 overflow-hidden">
                <TableCell
                  type={col.type}
                  value={row[col.name]}
                  onChange={(val) => onCellChange(col.name, val)}
                  suggestions={suggestionsMap[col.name] ?? []}
                  dropdownOptions={col.options ?? []}
                />
              </div>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  )
}
