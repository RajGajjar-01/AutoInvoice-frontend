import { CalendarDays, Check, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// ─── Status ───────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ["Todo", "In Progress", "Done", "Blocked"];

const STATUS_COLORS = {
    "Todo": "bg-muted text-muted-foreground",
    "In Progress": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    "Done": "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    "Blocked": "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

// ─── Tag ──────────────────────────────────────────────────────────────────────
const TAG_OPTIONS = ["Urgent", "Low", "Medium", "High", "Internal", "External"];

const TAG_COLORS = {
    "Urgent": "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    "Low": "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    "Medium": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    "High": "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    "Internal": "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    "External": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
};

// ─── Payment Status ───────────────────────────────────────────────────────────
const PAYMENT_STATUS_OPTIONS = ["Paid", "Unpaid", "Partial", "Overdue"];

const PAYMENT_STATUS_COLORS = {
    "Paid": "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    "Unpaid": "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    "Partial": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    "Overdue": "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isPastDate(dateStr) {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
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
    suggestions = [],
    dropdownOptions = [],
}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value ?? "");
    const inputRef = useRef(null);
    const datalistId = useId();

    useEffect(() => {
        if (editing && inputRef.current) inputRef.current.focus();
    }, [editing]);

    const commit = () => {
        onChange(draft);
        setEditing(false);
    };

    const cancel = () => {
        setDraft(value ?? "");
        setEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") cancel();
    };

    // ── Checkbox ───────────────────────────────────────────────────────────────
    if (type === "Checkbox") {
        return (
            <div className="flex items-center justify-center px-3 py-2">
                <Checkbox
                    checked={!!value}
                    onCheckedChange={(checked) => onChange(checked)}
                />
            </div>
        );
    }

    // ── Status ─────────────────────────────────────────────────────────────────
    if (type === "Status") {
        return (
            <div className="px-2 py-1.5">
                <Select value={value || ""} onValueChange={onChange}>
                    <SelectTrigger className="h-7 border-0 bg-transparent p-0 shadow-none focus:ring-0 text-xs w-full">
                        <SelectValue placeholder="—">
                            {value ? (
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[value] ?? "bg-muted text-muted-foreground"}`}>
                                    {value}
                                </span>
                            ) : (
                                <span className="text-muted-foreground">—</span>
                            )}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[s]}`}>
                                    {s}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );
    }

    // ── Tag ────────────────────────────────────────────────────────────────────
    if (type === "Tag") {
        return (
            <div className="px-2 py-1.5">
                <Select value={value || ""} onValueChange={onChange}>
                    <SelectTrigger className="h-7 border-0 bg-transparent p-0 shadow-none focus:ring-0 text-xs w-full">
                        <SelectValue placeholder="—">
                            {value ? (
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TAG_COLORS[value] ?? "bg-muted text-muted-foreground"}`}>
                                    {value}
                                </span>
                            ) : (
                                <span className="text-muted-foreground">—</span>
                            )}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {TAG_OPTIONS.map((t) => (
                            <SelectItem key={t} value={t}>
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TAG_COLORS[t]}`}>
                                    {t}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );
    }

    // ── Payment Status ─────────────────────────────────────────────────────────
    if (type === "Payment Status") {
        return (
            <div className="px-2 py-1.5">
                <Select value={value || ""} onValueChange={onChange}>
                    <SelectTrigger className="h-7 border-0 bg-transparent p-0 shadow-none focus:ring-0 text-xs w-full">
                        <SelectValue placeholder="—">
                            {value ? (
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${PAYMENT_STATUS_COLORS[value] ?? "bg-muted text-muted-foreground"}`}>
                                    {value}
                                </span>
                            ) : (
                                <span className="text-muted-foreground">—</span>
                            )}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {PAYMENT_STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${PAYMENT_STATUS_COLORS[s]}`}>
                                    {s}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );
    }

    // ── Dropdown ───────────────────────────────────────────────────────────────
    if (type === "Dropdown") {
        if (dropdownOptions.length === 0) {
            return (
                <div className="px-3 py-2 text-xs text-muted-foreground">No options</div>
            );
        }
        return (
            <div className="px-2 py-1.5">
                <Select value={value || ""} onValueChange={onChange}>
                    <SelectTrigger className="h-7 border-0 bg-transparent p-0 shadow-none focus:ring-0 text-xs w-full">
                        <SelectValue placeholder="—">
                            {value || <span className="text-muted-foreground">—</span>}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {dropdownOptions.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                                {opt}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );
    }

    // ── Due Date / Expiry Date — inline edit with past-date highlight ──────────
    if (type === "Due Date" || type === "Expiry Date") {
        const past = isPastDate(value);
        if (editing) {
            return (
                <div className="flex items-center gap-1 px-1 py-1">
                    <Input
                        ref={inputRef}
                        type="date"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="h-7 text-xs border-primary"
                    />
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-green-600" onClick={commit}>
                        <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-muted-foreground" onClick={cancel}>
                        <X className="h-3.5 w-3.5" />
                    </Button>
                </div>
            );
        }
        return (
            <div
                className="px-3 py-2 text-sm cursor-text min-h-[36px] hover:bg-muted/50 transition-colors rounded flex items-center gap-1.5"
                onClick={() => { setDraft(value ?? ""); setEditing(true); }}
            >
                {value ? (
                    <>
                        <CalendarDays className={`h-3.5 w-3.5 shrink-0 ${past ? "text-destructive" : "text-muted-foreground"}`} />
                        <span className={past ? "text-destructive font-medium" : ""}>{value}</span>
                    </>
                ) : (
                    <span className="text-muted-foreground/40 select-none">—</span>
                )}
            </div>
        );
    }

    // ── Attachment ─────────────────────────────────────────────────────────────
    if (type === "Attachment") {
        if (editing) {
            return (
                <div className="flex items-center gap-1 px-1 py-1">
                    <Input
                        ref={inputRef}
                        type="text"
                        value={draft}
                        placeholder="filename.pdf"
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="h-7 text-xs border-primary"
                    />
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-green-600" onClick={commit}>
                        <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-muted-foreground" onClick={cancel}>
                        <X className="h-3.5 w-3.5" />
                    </Button>
                </div>
            );
        }
        return (
            <div
                className="px-3 py-2 text-sm cursor-text min-h-[36px] hover:bg-muted/50 transition-colors rounded"
                onClick={() => { setDraft(value ?? ""); setEditing(true); }}
            >
                {value
                    ? <span className="text-xs">{value}</span>
                    : <span className="text-muted-foreground/40 text-xs select-none">No file</span>
                }
            </div>
        );
    }

    // ── Text / Number / Date / Amount — inline edit ────────────────────────────
    if (editing) {
        const inputType =
            type === "Number" || type === "Amount (₹)"
                ? "number"
                : type === "Date"
                    ? "date"
                    : "text";

        return (
            <div className="flex items-center gap-1 px-1 py-1">
                {type === "Text" ? (
                    <>
                        <input
                            ref={inputRef}
                            list={`dl-${datalistId}`}
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex h-7 w-full rounded-md border border-primary bg-background px-2 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            placeholder=""
                        />
                        <datalist id={`dl-${datalistId}`}>
                            {suggestions.map((s) => (
                                <option key={s} value={s} />
                            ))}
                        </datalist>
                    </>
                ) : (
                    <Input
                        ref={inputRef}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={handleKeyDown}
                        type={inputType}
                        className="h-7 text-xs border-primary"
                    />
                )}
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-green-600" onClick={commit}>
                    <Check className="h-3.5 w-3.5" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-muted-foreground" onClick={cancel}>
                    <X className="h-3.5 w-3.5" />
                </Button>
            </div>
        );
    }

    const displayValue =
        type === "Amount (₹)" && value
            ? `₹${Number(value).toLocaleString("en-IN")}`
            : value || "";

    return (
        <div
            className="px-3 py-2 text-sm cursor-text min-h-[36px] hover:bg-muted/50 transition-colors rounded"
            onClick={() => { setDraft(value ?? ""); setEditing(true); }}
        >
            {displayValue
                ? <span>{displayValue}</span>
                : <span className="text-muted-foreground/40 select-none">—</span>
            }
        </div>
    );
}

export default TableCell;
