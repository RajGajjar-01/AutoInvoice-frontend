import { Bell, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react"
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
import { randomUUID } from "@/lib/uuid"

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
    const rowToSave = { ...newItem, id: randomUUID() }
    onAddRowWithData(rowToSave as Row)
    setNewItem({})
    setAdding(false)
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* ── Entry Form ── */}
      <Card className="border border-primary/20 shadow-sm overflow-hidden bg-background">
        <CardHeader
          className="bg-muted/30 px-3 py-1.5 flex flex-row items-center justify-between cursor-pointer active:bg-muted/50 transition-colors"
          onClick={() => setAdding(!adding)}
        >
          <CardTitle className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-primary/80">
            <Plus className="h-3.5 w-3.5" />
            Quick Entry
          </CardTitle>
          <div className="p-1 rounded-full bg-background/50 border border-border/20">
            {adding ? (
              <ChevronUp className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
        </CardHeader>
        {adding && (
          <CardContent className="p-0 flex flex-col divide-y divide-border/30 border-t border-border/30">
            {cols.map((col) => (
              <div
                key={col.name}
                className="grid grid-cols-[85px_1fr] items-center px-3 py-1 gap-2 min-h-[36px]"
              >
                <label className="text-[9px] uppercase font-black text-muted-foreground/80 tracking-tight leading-tight truncate">
                  {col.name}
                  {col.mandatory && (
                    <span className="text-destructive ml-0.5">*</span>
                  )}
                </label>
                <div className="min-h-[30px] flex items-center bg-muted/5 rounded border border-border/20 overflow-hidden">
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
        )}
        {adding && (
          <CardFooter className="p-2 bg-muted/10 border-t border-border/40 flex gap-2">
            <Button
              className="flex-1 h-8 text-xs font-bold"
              onClick={handleAdd}
            >
              Add Entry
            </Button>
            <Button
              variant="ghost"
              className="h-8 px-3 text-xs"
              onClick={() => setAdding(false)}
            >
              Cancel
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* ── Data List ── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-primary" />
            Entered Entries ({rows.length})
          </h3>
        </div>
        {rows.length === 0 ? (
          <div className="h-24 flex items-center justify-center border-2 border-dashed border-muted/50 rounded-xl text-muted-foreground text-[10px] uppercase font-bold tracking-widest bg-muted/5">
            No entries yet
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
              <label className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-tight truncate pr-2">
                {col.name}
              </label>
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
