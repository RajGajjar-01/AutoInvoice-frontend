import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { memo, useEffect, useMemo, useRef, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { evaluateFormula } from "@/lib/formula-engine"
import { cn } from "@/lib/utils"

// ─── Status ───────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ["Todo", "In Progress", "Done", "Blocked"] as const

const STATUS_COLORS: Record<string, string> = {
  Todo: "bg-muted text-muted-foreground",
  "In Progress":
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Done: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Blocked: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
}

// ─── Tag ──────────────────────────────────────────────────────────────────────
const TAG_OPTIONS = [
  "Urgent",
  "Low",
  "Medium",
  "High",
  "Internal",
  "External",
] as const

const TAG_COLORS: Record<string, string> = {
  Urgent: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  Low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  Medium:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  High: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  Internal:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  External: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
}

// ─── Payment Status ───────────────────────────────────────────────────────────
const PAYMENT_STATUS_OPTIONS = ["Paid", "Unpaid", "Partial", "Overdue"] as const

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  Paid: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Unpaid: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  Partial:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  Overdue:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"] as const

function isPastDate(dateStr: string | null | undefined) {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}

function parseIsoDate(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null
  }

  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

function toIsoDateString(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function buildMonthDays(month: Date) {
  const monthStart = getMonthStart(month)
  const gridStart = new Date(monthStart)
  gridStart.setDate(monthStart.getDate() - monthStart.getDay())

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart)
    day.setDate(gridStart.getDate() + index)
    return day
  })
}

interface TableCellProps {
  type: string
  value: unknown
  onChange: (newValue: unknown) => void
  onNavigate?: (dir: "left" | "right" | "up" | "down") => void
  onFocus?: () => void
  suggestions?: string[]
  dropdownOptions?: string[]
  allRows?: Record<string, unknown>[]
  cols?: { name: string }[]
  navRowIndex?: number
  navColIndex?: number
}

/**
 * Props:
 *   type            – column type string
 *   value           – cell value (any)
 *   onChange        – (newValue) => void
 *   suggestions     – string[]  (for Text type datalist)
 *   dropdownOptions – string[]  (for Dropdown type)
 */
function TableCellComponent({
  type,
  value,
  onChange,
  onNavigate,
  onFocus,
  suggestions = [],
  dropdownOptions = [],
  allRows = [],
  cols = [],
  navRowIndex,
  navColIndex,
}: TableCellProps) {
  void suggestions
  void navRowIndex
  void navColIndex

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? "")
  const inputRef = useRef<HTMLInputElement>(null)
  const editIntentRef = useRef<"keyboard" | "pointer">("pointer")
  const isDateType =
    type === "Date" || type === "Due Date" || type === "Expiry Date"
  const parsedDateValue = useMemo(() => parseIsoDate(value), [value])
  const [visibleMonth, setVisibleMonth] = useState(() =>
    getMonthStart(parsedDateValue ?? new Date()),
  )
  const monthDays = useMemo(() => buildMonthDays(visibleMonth), [visibleMonth])

  useEffect(() => {
    setDraft(value ?? "")
  }, [value])

  useEffect(() => {
    if (editing && isDateType) {
      setVisibleMonth(getMonthStart(parsedDateValue ?? new Date()))
    }
  }, [editing, isDateType, parsedDateValue])

  const isFormula = typeof value === "string" && value.startsWith("=")

  const computedValue = useMemo(() => {
    if (isFormula && typeof value === "string") {
      return evaluateFormula(value, allRows, cols)
    }
    return value
  }, [value, allRows, cols, isFormula])

  useEffect(() => {
    if (editing && inputRef.current) {
      const input = inputRef.current
      input.focus()

      if (editIntentRef.current === "keyboard" && input.select) {
        input.select()
        return
      }

      const caretPosition = input.value.length
      input.setSelectionRange?.(caretPosition, caretPosition)
    }
  }, [editing])

  const beginEditing = (intent: "keyboard" | "pointer" = "pointer") => {
    editIntentRef.current = intent
    setDraft(value ?? "")
    setEditing(true)
  }

  const commit = () => {
    if (String(draft) !== String(value ?? "")) {
      onChange(draft)
    }
    setEditing(false)
  }

  const cancel = () => {
    setDraft(value ?? "")
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      commit()
    }
    if (e.key === "Escape") {
      cancel()
    }
    if (
      onNavigate &&
      (e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown")
    ) {
      const dir = e.key.replace("Arrow", "").toLowerCase() as
        | "left"
        | "right"
        | "up"
        | "down"

      // If navigating while editing, commit first
      if (editing) commit()

      onNavigate(dir)
      e.preventDefault()
      e.stopPropagation()
    }
  }

  // ── Checkbox ───────────────────────────────────────────────────────────────
  if (type === "Checkbox") {
    return (
      <div className="flex items-center justify-center px-3 py-2 outline-none focus-within:bg-muted/30 h-full">
        <Checkbox
          checked={!!value}
          onCheckedChange={(checked) => onChange(checked)}
          onFocus={onFocus}
          onKeyDown={handleKeyDown}
        />
      </div>
    )
  }

  const handleSelectKeyDown = (e: React.KeyboardEvent) => {
    if (
      (e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown") &&
      onNavigate
    ) {
      onNavigate(
        e.key.replace("Arrow", "").toLowerCase() as
          | "left"
          | "right"
          | "up"
          | "down",
      )
      e.preventDefault()
      e.stopPropagation()
    }
  }

  // ── Status / Tag / Payment Status / Dropdown ───────────────────────────────
  if (
    type === "Status" ||
    type === "Tag" ||
    type === "Payment Status" ||
    type === "Dropdown"
  ) {
    const options =
      type === "Status"
        ? STATUS_OPTIONS
        : type === "Tag"
          ? TAG_OPTIONS
          : type === "Payment Status"
            ? PAYMENT_STATUS_OPTIONS
            : dropdownOptions
    const colors =
      type === "Status"
        ? STATUS_COLORS
        : type === "Tag"
          ? TAG_COLORS
          : PAYMENT_STATUS_COLORS

    const cellBg =
      type !== "Dropdown" && value && colors?.[String(value)]
        ? colors[String(value)]
        : ""

    return editing ? (
      <div
        className={`outline-none h-full w-full ${cellBg}`}
        style={{ minHeight: "100%" }}
      >
        <Select
          open={editing}
          value={String(value || "")}
          onOpenChange={setEditing}
          onValueChange={(nextValue) => {
            onChange(nextValue)
            setEditing(false)
          }}
        >
          <SelectTrigger
            className="h-full w-full border-0 bg-transparent px-3 py-1.5 shadow-none focus:ring-0 text-xs font-medium rounded-none"
            onKeyDown={handleSelectKeyDown}
            onFocus={onFocus}
          >
            <SelectValue placeholder="—">
              {value ? (
                <span className="font-medium text-xs">{String(value)}</span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    ) : (
      <button
        type="button"
        className={cn(
          "h-full w-full overflow-hidden px-3 py-1.5 text-left text-xs font-medium rounded outline-none hover:bg-foreground/[0.02] focus:bg-transparent focus-visible:ring-0",
          cellBg,
        )}
        onClick={() => {
          onFocus?.()
          beginEditing()
        }}
        onFocus={onFocus}
        onKeyDown={(e) => {
          handleSelectKeyDown(e)
        }}
      >
        {value ? (
          <span className="block truncate font-medium text-xs">
            {String(value)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </button>
    )
  }

  if (isDateType) {
    const past = isPastDate(String(value))
    return (
      <Popover open={editing} onOpenChange={setEditing}>
        <PopoverAnchor asChild>
          <button
            type="button"
            className="flex min-h-8 w-full items-center gap-1.5 overflow-hidden rounded px-3 py-1 text-left text-sm cursor-text outline-none transition-colors hover:bg-foreground/[0.02] focus:bg-transparent focus-visible:ring-0"
            onClick={() => {
              onFocus?.()
              beginEditing()
            }}
            onFocus={onFocus}
            onKeyDown={(e) => {
              handleKeyDown(e)
            }}
          >
            {value ? (
              <>
                <CalendarDays
                  className={`h-3.5 w-3.5 shrink-0 ${past ? "text-destructive" : "text-muted-foreground"}`}
                />
                <span
                  className={cn(
                    "block truncate",
                    past && "text-destructive font-medium",
                  )}
                >
                  {String(value)}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground/40 select-none">—</span>
            )}
          </button>
        </PopoverAnchor>
        <PopoverContent
          align="start"
          className="w-[280px] p-3"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex items-center justify-between pb-2">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() =>
                setVisibleMonth((current) => addMonths(current, -1))
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-sm font-medium">
              {visibleMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </div>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() =>
                setVisibleMonth((current) => addMonths(current, 1))
              }
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 pb-1">
            {WEEKDAY_LABELS.map((day) => (
              <div
                key={day}
                className="flex h-8 items-center justify-center text-xs font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((day) => {
              const isSelected = parsedDateValue
                ? isSameDay(day, parsedDateValue)
                : false
              const isOutsideMonth = day.getMonth() !== visibleMonth.getMonth()

              return (
                <button
                  key={toIsoDateString(day)}
                  type="button"
                  className={cn(
                    "flex h-8 items-center justify-center rounded-md text-sm transition-colors",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted",
                    isOutsideMonth && "text-muted-foreground/45",
                  )}
                  onClick={() => {
                    const nextValue = toIsoDateString(day)
                    setDraft(nextValue)
                    onChange(nextValue)
                    setEditing(false)
                  }}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>
          <div className="mt-3 flex justify-between border-t pt-3">
            <button
              type="button"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => {
                onChange("")
                setEditing(false)
              }}
            >
              Clear
            </button>
            <button
              type="button"
              className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
              onClick={() => {
                const today = new Date()
                const nextValue = toIsoDateString(today)
                setVisibleMonth(getMonthStart(today))
                setDraft(nextValue)
                onChange(nextValue)
                setEditing(false)
              }}
            >
              Today
            </button>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  // ── Attachment ─────────────────────────────────────────────────────────────
  if (type === "Attachment") {
    if (editing) {
      return (
        <div className="flex min-h-8 w-full min-w-0 items-center overflow-hidden bg-transparent px-3 py-1">
          <Input
            ref={inputRef}
            type="text"
            value={String(draft)}
            placeholder="filename.pdf"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commit}
            className="h-auto w-full min-w-0 border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0"
          />
        </div>
      )
    }
    return (
      <button
        type="button"
        className="min-h-8 w-full overflow-hidden rounded px-3 py-1 text-left text-sm cursor-text outline-none transition-colors hover:bg-foreground/[0.02] focus:bg-transparent focus-visible:ring-0"
        onClick={() => {
          onFocus?.()
          beginEditing("pointer")
        }}
        onFocus={onFocus}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            beginEditing("keyboard")
            e.preventDefault()
          }
          handleKeyDown(e)
        }}
      >
        {value ? (
          <span className="block truncate text-xs">{String(value)}</span>
        ) : (
          <span className="text-muted-foreground/40 text-xs select-none">
            No file
          </span>
        )}
      </button>
    )
  }

  // ── Text / Number / Amount — inline edit ───────────────────────────────────
  if (editing) {
    const inputMode =
      type === "Number" || type === "Amount (₹)" ? "decimal" : undefined

    return (
      <div className="relative flex min-h-8 w-full min-w-0 items-center overflow-hidden bg-transparent px-3 py-1">
        <div className="w-full min-w-0">
          <input
            ref={inputRef}
            size={1}
            value={String(draft)}
            inputMode={inputMode}
            onChange={(e) => setDraft(e.target.value)}
            onFocus={onFocus}
            onKeyDown={handleKeyDown}
            onBlur={commit}
            className="flex h-auto w-full min-w-0 border-0 bg-transparent px-0 py-0 text-sm text-foreground focus:outline-none"
            placeholder=""
          />
        </div>
      </div>
    )
  }

  const displayValue =
    type === "Amount (₹)" && computedValue && !Number.isNaN(computedValue)
      ? `₹${Number(computedValue).toLocaleString("en-IN")}`
      : computedValue || ""

  return (
    <button
      type="button"
      className={cn(
        "relative flex min-h-8 w-full items-center overflow-hidden rounded px-3 py-1 text-left text-sm cursor-text outline-none transition-colors hover:bg-foreground/[0.02] focus:bg-transparent focus-visible:ring-0",
        isFormula && "bg-primary/5",
      )}
      onClick={() => {
        onFocus?.()
        beginEditing("pointer")
      }}
      onFocus={onFocus}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          beginEditing("keyboard")
          e.preventDefault()
        }
        handleKeyDown(e)
      }}
    >
      {isFormula && (
        <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-primary/50 opacity-50" />
      )}
      {displayValue ? (
        <span
          className={cn(
            "block truncate",
            isFormula && "font-mono text-primary",
          )}
        >
          {String(displayValue)}
        </span>
      ) : (
        <span className="text-muted-foreground/40 select-none">—</span>
      )}
    </button>
  )
}

function shallowEqualArray<T>(a: T[], b: T[]) {
  if (a === b) return true
  if (a.length !== b.length) return false
  return a.every((value, index) => value === b[index])
}

function areTableCellPropsEqual(
  prev: Readonly<TableCellProps>,
  next: Readonly<TableCellProps>,
) {
  if (prev.type !== next.type || prev.value !== next.value) return false
  if (prev.navRowIndex !== next.navRowIndex) return false
  if (prev.navColIndex !== next.navColIndex) return false
  if (
    !shallowEqualArray(prev.dropdownOptions ?? [], next.dropdownOptions ?? [])
  )
    return false
  if (!shallowEqualArray(prev.suggestions ?? [], next.suggestions ?? []))
    return false

  const prevIsFormula =
    typeof prev.value === "string" && prev.value.startsWith("=")
  const nextIsFormula =
    typeof next.value === "string" && next.value.startsWith("=")

  if (prevIsFormula || nextIsFormula) {
    if (prev.allRows !== next.allRows || prev.cols !== next.cols) return false
  }

  return true
}

export const TableCell = memo(TableCellComponent, areTableCellPropsEqual)

export default TableCell
