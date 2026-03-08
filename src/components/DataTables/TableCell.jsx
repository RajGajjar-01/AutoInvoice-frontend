import { CalendarDays, Check, X } from "lucide-react"
import { useEffect, useId, useRef, useState, useMemo } from "react"
import { cn } from "@/lib/utils"
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
import { evaluateFormula } from "@/lib/formula-engine"

// ─── Status ───────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ["Todo", "In Progress", "Done", "Blocked"]

const STATUS_COLORS = {
  Todo: "bg-muted text-muted-foreground",
  "In Progress":
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Done: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Blocked: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
}

// ─── Tag ──────────────────────────────────────────────────────────────────────
const TAG_OPTIONS = ["Urgent", "Low", "Medium", "High", "Internal", "External"]

const TAG_COLORS = {
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
const PAYMENT_STATUS_OPTIONS = ["Paid", "Unpaid", "Partial", "Overdue"]

const PAYMENT_STATUS_COLORS = {
  Paid: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Unpaid: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  Partial:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  Overdue:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isPastDate(dateStr) {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}

/**
 * Props:
 *   type            – column type string
 *   value           – cell value (any)
 *   onChange        – (newValue) => void
 *   suggestions     – string[]  (for Text type datalist)
 *   dropdownOptions – string[]  (for Dropdown type)
 */
export function TableCell({
  type,
  value,
  onChange,
  onNavigate,
  onFocus, // Added this
  suggestions = [],
  dropdownOptions = [],
  allRows = [], // For formula evaluation
  cols = [],    // For formula evaluation
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? "")
  const inputRef = useRef(null)
  const datalistId = useId()

  useEffect(() => {
    setDraft(value ?? "")
  }, [value])

  const isFormula = typeof value === 'string' && value.startsWith('=')
  
  const computedValue = useMemo(() => {
    if (isFormula) {
      return evaluateFormula(value, allRows, cols)
    }
    return value
  }, [value, allRows, cols, isFormula])

  useEffect(() => {
    if (editing && inputRef.current) {
        inputRef.current.focus()
        if (inputRef.current.select) inputRef.current.select()
    }
  }, [editing])

  const commit = () => {
    onChange(draft)
    setEditing(false)
  }

  const cancel = () => {
    setDraft(value ?? "")
    setEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      commit()
    }
    if (e.key === "Escape") {
      cancel()
    }
    if (onNavigate && (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "ArrowDown")) {
      const dir = e.key.replace("Arrow", "").toLowerCase()
      
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
      <div
        className="flex items-center justify-center px-3 py-2 outline-none focus-within:bg-muted/30 h-full"
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
      >
        <Checkbox
          checked={!!value}
          onCheckedChange={(checked) => onChange(checked)}
        />
      </div>
    )
  }

  const handleSelectKeyDown = (e) => {
    if ((e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "ArrowDown") && onNavigate) {
      onNavigate(e.key.replace("Arrow", "").toLowerCase())
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
        ? STATUS_OPTIONS.reduce((acc, opt) => ({ ...acc, [opt]: STATUS_COLORS[opt] }), {})
        : type === "Tag"
          ? TAG_OPTIONS.reduce((acc, opt) => ({ ...acc, [opt]: TAG_COLORS[opt] }), {})
          : PAYMENT_STATUS_OPTIONS.reduce((acc, opt) => ({ ...acc, [opt]: PAYMENT_STATUS_COLORS[opt] }), {})

    const cellBg = (type !== "Dropdown" && value && colors?.[value])
      ? colors[value]
      : ""

    return (
      <div
        className={`outline-none h-full w-full ${cellBg}`}
        style={{ minHeight: "100%" }}
      >
        <Select value={value || ""} onValueChange={onChange}>
          <SelectTrigger
            className="h-full w-full border-0 bg-transparent px-3 py-1.5 shadow-none focus:ring-0 text-xs font-medium rounded-none"
            onKeyDown={handleSelectKeyDown}
            onFocus={onFocus}
          >
            <SelectValue placeholder="—">
              {value ? (
                <span className="font-medium text-xs">{value}</span>
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
    )
  }

  // ── Due Date / Expiry Date — inline edit with past-date highlight ──────────
  if (type === "Due Date" || type === "Expiry Date") {
    const past = isPastDate(value)
    if (editing) {
      return (
        <div className="flex items-center px-1 py-1 w-full">
          <Input
            ref={inputRef}
            type="date"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commit}
            className="h-7 text-xs border-primary focus:ring-1 focus:ring-primary w-full"
          />
        </div>
      )
    }
    return (
      <div
        tabIndex={0}
        className="px-3 py-1 text-sm cursor-text min-h-8 hover:bg-muted/50 transition-colors rounded flex items-center gap-1.5 outline-none focus:ring-1 focus:ring-primary focus:bg-muted/30"
        onClick={() => {
          setDraft(value ?? "")
          setEditing(true)
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setDraft(value ?? "")
            setEditing(true)
            e.preventDefault()
          }
          handleKeyDown(e)
        }}
      >
        {value ? (
          <>
            <CalendarDays
              className={`h-3.5 w-3.5 shrink-0 ${past ? "text-destructive" : "text-muted-foreground"}`}
            />
            <span className={past ? "text-destructive font-medium" : ""}>
              {value}
            </span>
          </>
        ) : (
          <span className="text-muted-foreground/40 select-none">—</span>
        )}
      </div>
    )
  }

  // ── Attachment ─────────────────────────────────────────────────────────────
  if (type === "Attachment") {
    if (editing) {
      return (
        <div className="flex items-center px-1 py-1 w-full">
          <Input
            ref={inputRef}
            type="text"
            value={draft}
            placeholder="filename.pdf"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commit}
            className="h-7 text-xs border-primary focus:ring-1 focus:ring-primary w-full"
          />
        </div>
      )
    }
    return (
      <div
        tabIndex={0}
        className="px-3 py-1 text-sm cursor-text min-h-8 hover:bg-muted/50 transition-colors rounded outline-none focus:ring-1 focus:ring-primary focus:bg-muted/30"
        onClick={() => {
          setDraft(value ?? "")
          setEditing(true)
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setDraft(value ?? "")
            setEditing(true)
            e.preventDefault()
          }
          handleKeyDown(e)
        }}
      >
        {value ? (
          <span className="text-xs">{value}</span>
        ) : (
          <span className="text-muted-foreground/40 text-xs select-none">
            No file
          </span>
        )}
      </div>
    )
  }

  // ── Text / Number / Date / Amount — inline edit ────────────────────────────
  if (editing) {
    const inputType =
      type === "Number" || type === "Amount (₹)"
        ? "number"
        : type === "Date"
          ? "date"
          : "text"

    return (
      <div 
        className="flex items-center px-1 py-1 w-full bg-white shadow-sm ring-1 ring-primary rounded z-10 relative"
        onFocus={onFocus}
      >
        {type === "Text" || isFormula ? (
          <div className="w-full">
            <input
              ref={inputRef}
              list={`dl-${datalistId}`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={commit}
              className="flex h-7 w-full border-0 bg-transparent px-2 py-1 text-xs focus:outline-none"
              placeholder=""
            />
            {type === "Text" && (
                <datalist id={`dl-${datalistId}`}>
                {suggestions.map((s) => (
                    <option key={s} value={s} />
                ))}
                </datalist>
            )}
          </div>
        ) : (
          <Input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commit}
            type={inputType}
            className="h-7 text-xs border-0 bg-transparent focus-visible:ring-0 w-full"
          />
        )}
      </div>
    )
  }

  const displayValue =
    type === "Amount (₹)" && computedValue && !isNaN(computedValue)
      ? `₹${Number(computedValue).toLocaleString("en-IN")}`
      : computedValue || ""

  return (
    <div
      tabIndex={0}
      className={cn(
        "px-3 py-1 text-sm cursor-text min-h-8 hover:bg-muted/50 transition-colors rounded outline-none focus:ring-1 focus:ring-primary focus:bg-muted/30 relative flex items-center",
        isFormula && "bg-primary/5",
      )}
      onClick={() => {
        setDraft(value ?? "")
        setEditing(true)
        onFocus && onFocus()
      }}
      onFocus={onFocus}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          setDraft(value ?? "")
          setEditing(true)
          onFocus && onFocus()
          e.preventDefault()
        }
        handleKeyDown(e)
      }}
    >
      {isFormula && (
        <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-primary/50 opacity-50" />
      )}
      {displayValue ? (
        <span className={cn(isFormula && "font-mono text-primary")}>{displayValue}</span>
      ) : (
        <span className="text-muted-foreground/40 select-none">—</span>
      )}
    </div>
  )
}


export default TableCell
