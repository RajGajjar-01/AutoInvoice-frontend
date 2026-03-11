import React, { useRef, useEffect, useState, useMemo } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Trash2, Plus, GripVertical, PackagePlus, ChevronDown, Package } from "lucide-react"
import { cn } from "@/lib/utils"

export function ModernExcelTable({
    items,
    inventoryItems,
    updateItem,
    handleItemSelect,
    addItem,
    removeItem,
    currencySymbol,
    docType
}) {
    const isChallan = docType === "challan"
    const tableRef = useRef(null)
    const suggestionRef = useRef(null)

    // Suggestion state
    const [suggestionRowIndex, setSuggestionRowIndex] = useState(-1)
    const [query, setQuery] = useState("")

    const filteredSuggestions = useMemo(() => {
        if (!query.trim()) return []
        const q = query.toLowerCase()
        return inventoryItems.filter(item =>
            item.name.toLowerCase().includes(q) ||
            (item.sku && item.sku.toLowerCase().includes(q))
        ).slice(0, 5)
    }, [inventoryItems, query])

    // Handle outside clicks to close suggestions
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (suggestionRef.current && !suggestionRef.current.contains(e.target)) {
                setSuggestionRowIndex(-1)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Handle keyboard navigation between cells
    const handleKeyDown = (e, index, field) => {
        const fields = ["itemId", "name", "description", "hsnCode", "quantity", "price", "tax", "discount"]
        const fieldIndex = fields.indexOf(field)

        if (e.key === "ArrowDown" || (e.key === "Enter" && !e.shiftKey)) {
            // If suggestions are open, don't navigate yet (or maybe we should let user select?)
            // For now, let's keep it simple.
            if (suggestionRowIndex !== -1) return

            e.preventDefault()
            const nextRow = tableRef.current?.querySelector(`tr[data-index="${index + 1}"]`)
            const nextInput = nextRow?.querySelector(`[data-field="${field}"]`)
            if (nextInput) {
                nextInput.focus()
                nextInput.select && nextInput.select()
            } else if (e.key === "Enter" && index === items.length - 1) {
                addItem()
            }
        } else if (e.key === "ArrowUp") {
            if (suggestionRowIndex !== -1) return
            e.preventDefault()
            const prevRow = tableRef.current?.querySelector(`tr[data-index="${index - 1}"]`)
            const prevInput = prevRow?.querySelector(`[data-field="${field}"]`)
            if (prevInput) {
                prevInput.focus()
                prevInput.select && prevInput.select()
            }
        } else if (e.key === "ArrowRight" && e.target.selectionEnd === e.target.value.length) {
            const nextField = fields[fieldIndex + 1]
            if (nextField) {
                const input = e.target.closest("tr").querySelector(`[data-field="${nextField}"]`)
                if (input) {
                    input.focus()
                    input.select && input.select()
                }
            }
        } else if (e.key === "ArrowLeft" && e.target.selectionStart === 0) {
            const prevField = fields[fieldIndex - 1]
            if (prevField) {
                const input = e.target.closest("tr").querySelector(`[data-field="${prevField}"]`)
                if (input) {
                    input.focus()
                    input.select && input.select()
                }
            }
        }
    }

    return (
        <div className="rounded-xl border border-border/50 bg-card shadow-sm hover:shadow-md transition-shadow duration-300 relative">
            <div className="w-full">
                <table className="w-full text-sm border-collapse" ref={tableRef}>
                    <thead>
                        <tr className="bg-muted/30 border-b border-border/50">
                            <th className="w-8 px-2 py-3"></th>
                            <th className="text-left font-semibold text-muted-foreground px-3 py-3 w-[250px]">Item / Product</th>
                            <th className="text-left font-semibold text-muted-foreground px-3 py-3">Description</th>
                            <th className="text-right font-semibold text-muted-foreground px-3 py-3 w-20">Qty</th>
                            {!isChallan && <th className="text-right font-semibold text-muted-foreground px-3 py-3 w-32">Price</th>}
                            {!isChallan && <th className="text-right font-semibold text-muted-foreground px-3 py-3 w-20">Tax %</th>}
                            {!isChallan && <th className="text-right font-semibold text-muted-foreground px-3 py-3 w-[120px]">Discount</th>}
                            {!isChallan && <th className="text-right font-semibold text-muted-foreground px-3 py-3 w-32">Total</th>}
                            <th className="w-12 px-2 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                        {items.map((item, index) => {
                            const lineBase = item.quantity * item.price
                            const lineDisc = item.discountType === "flat"
                                ? Math.min(item.discount || 0, lineBase)
                                : lineBase * ((item.discount || 0) / 100)
                            const lineTotal = (lineBase - lineDisc) * (1 + item.tax / 100)

                            return (
                                <tr
                                    key={index}
                                    data-index={index}
                                    className={cn(
                                        "group hover:bg-muted/20 transition-colors duration-150 relative",
                                        suggestionRowIndex === index ? "z-[60]" : "z-0"
                                    )}
                                >
                                    <td className="px-2 py-2 text-center text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors cursor-grab active:cursor-grabbing">
                                        <GripVertical className="h-4 w-4 mx-auto" />
                                    </td>
                                    <td className="px-2 py-2">
                                        <div className="relative flex items-center border border-border/10 rounded-md focus-within:border-primary/20 bg-muted/5 transition-all w-full group/itembox">
                                            <div className="flex-1 flex items-center overflow-hidden">
                                                <Input
                                                    value={item.name}
                                                    onChange={(e) => {
                                                        const val = e.target.value
                                                        updateItem(index, "name", val)
                                                        setQuery(val)
                                                        setSuggestionRowIndex(index)
                                                    }}
                                                    onFocus={() => {
                                                        if (item.name) {
                                                              setQuery(item.name)
                                                              setSuggestionRowIndex(index)
                                                        }
                                                    }}
                                                    onKeyDown={(e) => handleKeyDown(e, index, "name")}
                                                    placeholder="Search or Enter item..."
                                                    data-field="name"
                                                    className="flex-1 h-9 border-0 bg-transparent focus-visible:ring-0 px-2.5 font-medium text-xs md:text-sm"
                                                    autoComplete="off"
                                                />
                                            </div>

                                            {/* Suggestions List */}
                                            {suggestionRowIndex === index && filteredSuggestions.length > 0 && (
                                                <div
                                                    ref={suggestionRef}
                                                    className="absolute top-full left-0 z-[100] w-[300px] mt-1 bg-background border border-border rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in duration-200"
                                                >
                                                    <div className="flex flex-col">
                                                        {filteredSuggestions.map((s) => (
                                                            <button
                                                                key={s.id}
                                                                type="button"
                                                                className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 last:border-b-0 transition-colors flex flex-col gap-1"
                                                                onClick={() => {
                                                                    handleItemSelect(index, s.id)
                                                                    setSuggestionRowIndex(-1)
                                                                }}
                                                            >
                                                                <div className="flex items-center justify-between w-full">
                                                                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">{s.name}</span>
                                                                    <span className="text-xs font-medium text-slate-500 shrink-0">{currencySymbol}{Number(s.salePrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={cn(
                                                                        "text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider",
                                                                        (s.stock || 0) <= 0 ? "bg-red-50/10 text-red-600 border border-red-200/50" : "bg-emerald-50/10 text-emerald-600 border border-emerald-200/50"
                                                                    )}>
                                                                        Stock: {s.stock || 0} {s.unit || 'pcs'}
                                                                    </span>
                                                                    {s.sku && <span className="text-[10px] text-slate-400 font-mono">SKU: {s.sku}</span>}
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="w-px h-4 bg-border/20 mx-0.5 shrink-0" />
                                            <Select
                                                value={item.itemId || ""}
                                                onValueChange={(val) => { if (val) handleItemSelect(index, val) }}
                                            >
                                                <SelectTrigger
                                                    hideChevron
                                                    className="h-9 w-8 p-0 border-0 bg-transparent hover:bg-muted/50 focus:ring-0 focus:ring-offset-0 transition-colors shrink-0 rounded-none flex items-center justify-center"
                                                >
                                                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/50 group-hover/itembox:text-primary transition-colors" />
                                                </SelectTrigger>
                                                <SelectContent align="end" className="w-[320px]">
                                                    {inventoryItems.length === 0 ? (
                                                        <div className="p-3 text-xs text-muted-foreground text-center italic">No items in inventory</div>
                                                    ) : (
                                                        inventoryItems.map((inv) => (
                                                            <SelectItem key={inv.id} value={inv.id} className="cursor-pointer">
                                                                <div className="flex flex-col py-0.5 w-full pr-4">
                                                                    <div className="flex items-center justify-between gap-3 w-full">
                                                                        <span className="font-semibold text-sm truncate max-w-[180px]">{inv.name}</span>
                                                                        <span className={cn(
                                                                            "text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 whitespace-nowrap",
                                                                            (inv.stock || 0) <= 0 ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary"
                                                                        )}>
                                                                            {inv.stock || 0} {inv.unit || 'pcs'}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-[10px] text-muted-foreground mt-0.5 truncate">{inv.description || "No description"}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </td>
                                    <td className="px-2 py-2 align-top">
                                        <Input
                                            value={item.description}
                                            onChange={(e) => updateItem(index, "description", e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(e, index, "description")}
                                            placeholder="Add notes or specs"
                                            data-field="description"
                                            className="h-9 border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-primary/30 text-xs px-2 mt-1"
                                        />
                                    </td>
                                    <td className="px-2 py-2 align-top">
                                        <div className="flex flex-col items-end">
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.quantity === 0 ? "" : item.quantity}
                                                onChange={(e) => updateItem(index, "quantity", e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(e, index, "quantity")}
                                                data-field="quantity"
                                                className="h-9 w-full text-right border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-primary/30 px-2 mt-1"
                                            />
                                            {item.unit && (
                                                <span className="text-[10px] font-medium text-muted-foreground mt-0.5 px-1 uppercase tracking-wider">{item.unit}</span>
                                            )}
                                        </div>
                                    </td>
                                    {!isChallan && (
                                        <td className="px-2 py-2 align-top">
                                            <div className="relative mt-1">
                                                <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/50 font-mono italic">{currencySymbol}</span>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.price === 0 ? "" : item.price}
                                                    onChange={(e) => updateItem(index, "price", e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(e, index, "price")}
                                                    data-field="price"
                                                    className="h-9 w-full text-right border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-primary/30 pl-4 pr-2"
                                                />
                                            </div>
                                        </td>
                                    )}
                                    {!isChallan && (
                                        <td className="px-2 py-2 align-top">
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.1"
                                                value={item.tax === 0 ? "" : item.tax}
                                                onChange={(e) => updateItem(index, "tax", e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(e, index, "tax")}
                                                data-field="tax"
                                                className="h-9 w-full text-right border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-primary/30 text-amber-600 font-medium px-2 mt-1"
                                            />
                                        </td>
                                    )}
                                    {!isChallan && (
                                        <td className="px-2 py-2 align-top">
                                            <div className="flex gap-1 mt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => updateItem(index, "discountType", item.discountType === "flat" ? "percent" : "flat")}
                                                    className={cn(
                                                        "h-9 px-2 rounded-md border border-border/50 transition-all text-[10px] font-bold shrink-0 shadow-sm",
                                                        item.discountType === "flat" ? "bg-primary/10 text-primary border-primary/20" : "bg-muted/50 text-muted-foreground"
                                                    )}
                                                >
                                                    {item.discountType === "flat" ? currencySymbol : "%"}
                                                </button>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.discount === 0 || !item.discount ? "" : item.discount}
                                                    onChange={(e) => updateItem(index, "discount", e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(e, index, "discount")}
                                                    data-field="discount"
                                                    placeholder="0"
                                                    className="h-9 w-full text-right border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-primary/30 px-2"
                                                />
                                            </div>
                                        </td>
                                    )}
                                    {!isChallan && (
                                        <td className="px-3 py-2 text-right align-top pt-3.5">
                                            <span className="font-bold text-sm text-foreground">
                                                {currencySymbol}{lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                    )}
                                    <td className="px-2 py-2 align-top pt-2.5">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-all rounded-full"
                                            onClick={() => removeItem(index)}
                                            disabled={items.length === 1 && !item.name}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            <div className="p-3 bg-muted/10 border-t border-border/50 flex justify-between items-center group/footer">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={addItem}
                    className="text-xs font-semibold text-primary/80 hover:text-primary hover:bg-primary/5 gap-1.5 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
                >
                    <Plus className="h-3.5 w-3.5" />
                    New Line Item (Enter)
                </Button>

            </div>
        </div>
    )
}
