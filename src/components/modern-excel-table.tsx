import { GripVertical, Plus, Trash2 } from "lucide-react"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface TableItem {
  itemId: string
  name: string
  description: string
  hsnCode: string
  quantity: number
  price: number
  tax: number
  discount: number
  discountType: "flat" | "percent"
  unit: string
  showHsn?: boolean
}

interface InventoryItem {
  id: string
  name: string
  stock: number
  unit: string
  hsnCode?: string
}

export function ModernExcelTable({
  items,
  inventoryItems,
  updateItem,
  handleItemSelect,
  addItem,
  removeItem,
  currencySymbol,
}: {
  items: TableItem[]
  inventoryItems: InventoryItem[]
  updateItem: (
    index: number,
    field: string,
    value: string | number | boolean,
  ) => void
  handleItemSelect: (index: number, itemId: string) => void
  addItem: () => void
  removeItem: (index: number) => void
  currencySymbol: string
}) {
  const tableRef = useRef<HTMLTableElement>(null)

  // Handle keyboard navigation between cells
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    field: string,
  ) => {
    const target = e.currentTarget
    const fields = [
      "itemId",
      "name",
      "description",
      "hsnCode",
      "quantity",
      "price",
      "tax",
      "discount",
    ]
    const fieldIndex = fields.indexOf(field)

    if (e.key === "ArrowDown" || (e.key === "Enter" && !e.shiftKey)) {
      e.preventDefault()
      const nextRow = tableRef.current?.querySelector(
        `tr[data-index="${index + 1}"]`,
      )
      const nextInput = nextRow?.querySelector<HTMLInputElement>(
        `[data-field="${field}"]`,
      )
      if (nextInput) {
        nextInput.focus()
        nextInput.select()
      } else if (e.key === "Enter" && index === items.length - 1) {
        addItem()
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      const prevRow = tableRef.current?.querySelector(
        `tr[data-index="${index - 1}"]`,
      )
      const prevInput = prevRow?.querySelector<HTMLInputElement>(
        `[data-field="${field}"]`,
      )
      if (prevInput) {
        prevInput.focus()
        prevInput.select()
      }
    } else if (
      e.key === "ArrowRight" &&
      target.selectionEnd === target.value.length
    ) {
      const nextField = fields[fieldIndex + 1]
      if (nextField) {
        const input = target
          .closest("tr")
          ?.querySelector<HTMLInputElement>(`[data-field="${nextField}"]`)
        if (input) {
          input.focus()
          input.select()
        }
      }
    } else if (e.key === "ArrowLeft" && target.selectionStart === 0) {
      const prevField = fields[fieldIndex - 1]
      if (prevField) {
        const input = target
          .closest("tr")
          ?.querySelector<HTMLInputElement>(`[data-field="${prevField}"]`)
        if (input) {
          input.focus()
          input.select()
        }
      }
    }
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse" ref={tableRef}>
          <thead>
            <tr className="bg-muted/30 border-b border-border/50">
              <th className="w-8 px-2 py-3" />
              <th className="text-left font-semibold text-muted-foreground px-3 py-3">
                Item / Product &amp; Description
              </th>
              <th className="text-right font-semibold text-muted-foreground px-3 py-3 w-20">
                Qty
              </th>
              <th className="text-right font-semibold text-muted-foreground px-3 py-3 w-32">
                Price
              </th>
              <th className="text-right font-semibold text-muted-foreground px-3 py-3 w-20">
                Tax %
              </th>
              <th className="text-right font-semibold text-muted-foreground px-3 py-3 w-[120px]">
                Discount
              </th>
              <th className="text-right font-semibold text-muted-foreground px-3 py-3 w-32">
                Total
              </th>
              <th className="w-12 px-2 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {items.map((item: TableItem, index: number) => {
              const lineBase = item.quantity * item.price
              const lineDisc =
                item.discountType === "flat"
                  ? Math.min(item.discount || 0, lineBase)
                  : lineBase * ((item.discount || 0) / 100)
              const lineTotal = (lineBase - lineDisc) * (1 + item.tax / 100)

              return (
                <tr
                  key={index}
                  data-index={index}
                  className="group hover:bg-muted/20 transition-colors duration-150"
                >
                  <td className="px-2 py-2 text-center text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors cursor-grab active:cursor-grabbing">
                    <GripVertical className="h-4 w-4 mx-auto" />
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="flex items-center border border-border/10 rounded-md focus-within:border-primary/20 bg-muted/5 transition-all w-full overflow-hidden group/itembox">
                        <Input
                          value={item.name}
                          onChange={(e) =>
                            updateItem(index, "name", e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(e, index, "name")}
                          placeholder="Search or Enter item..."
                          data-field="name"
                          className="flex-1 h-9 border-0 bg-transparent focus-visible:ring-0 px-2.5 font-medium text-xs md:text-sm"
                        />
                        <div className="w-px h-4 bg-border/20 mx-0.5 shrink-0" />
                        <Select
                          value={item.itemId || ""}
                          onValueChange={(val) => {
                            if (val) handleItemSelect(index, val)
                          }}
                        >
                          <SelectTrigger className="h-9 w-8 p-0 border-0 bg-transparent hover:bg-muted/50 focus:ring-0 focus:ring-offset-0 transition-colors shrink-0 rounded-none flex items-center justify-center [&_svg]:size-3.5 [&_svg]:text-muted-foreground/50 group-hover/itembox:[&_svg]:text-primary group-hover/itembox:[&_svg]:opacity-100 [&_svg]:transition-colors" />
                          <SelectContent
                            align="end"
                            className="w-[220px]"
                            position="popper"
                          >
                            {inventoryItems.length === 0 ? (
                              <div className="p-3 text-xs text-muted-foreground text-center italic">
                                No items in inventory
                              </div>
                            ) : (
                              inventoryItems.map((inv: InventoryItem) => (
                                <SelectItem
                                  key={inv.id}
                                  value={inv.id}
                                  className="cursor-pointer"
                                >
                                  <div className="flex flex-col py-0.5">
                                    <span className="font-semibold text-sm">
                                      {inv.name}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                      Available Stock: {inv.stock || 0}{" "}
                                      {inv.unit || "pcs"}
                                      {inv.hsnCode
                                        ? ` · HSN: ${inv.hsnCode}`
                                        : ""}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <Input
                        value={item.description}
                        onChange={(e) =>
                          updateItem(index, "description", e.target.value)
                        }
                        onKeyDown={(e) =>
                          handleKeyDown(e, index, "description")
                        }
                        placeholder="Add description or specifications"
                        data-field="description"
                        className="h-8 border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-primary/20 text-xs px-2.5 text-muted-foreground"
                      />
                      {/* HSN/SAC Toggle — shown only when item has an hsn code */}
                      {item.hsnCode && (
                        <div className="flex items-center gap-2 px-2.5 pb-1">
                          <button
                            type="button"
                            onClick={() =>
                              updateItem(index, "showHsn", item.showHsn ? 0 : 1)
                            }
                            className={`relative inline-flex w-8 h-4 rounded-full transition-colors duration-200 shrink-0 ${
                              item.showHsn
                                ? "bg-primary"
                                : "bg-slate-300 dark:bg-slate-600"
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform duration-200 ${
                                item.showHsn
                                  ? "translate-x-4"
                                  : "translate-x-0.5"
                              }`}
                            />
                          </button>
                          <span className="text-[10px] text-muted-foreground">
                            HSN/SAC:
                            <span
                              className={`ml-1 font-mono font-semibold ${
                                item.showHsn
                                  ? "text-foreground"
                                  : "line-through opacity-40"
                              }`}
                            >
                              {item.hsnCode}
                            </span>
                            <span className="ml-1 opacity-50">
                              {item.showHsn
                                ? "(included in invoice)"
                                : "(excluded)"}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-2 align-top">
                    <div className="flex flex-col items-end gap-0.5">
                      <div className="w-full rounded-md border border-border bg-muted/20 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all mt-1">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity === 0 ? "" : item.quantity}
                          onChange={(e) =>
                            updateItem(index, "quantity", e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(e, index, "quantity")}
                          data-field="quantity"
                          className="h-8 w-full text-right border-0 bg-transparent focus-visible:ring-0 px-2 shadow-none"
                        />
                      </div>
                      {item.unit && (
                        <span className="text-[10px] font-medium text-muted-foreground px-1 uppercase tracking-wider">
                          {item.unit}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-2 align-top">
                    <div className="relative mt-1 rounded-md border border-border bg-muted/20 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/60 font-mono select-none">
                        {currencySymbol}
                      </span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price === 0 ? "" : item.price}
                        onChange={(e) =>
                          updateItem(index, "price", e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(e, index, "price")}
                        data-field="price"
                        className="h-8 w-full text-right border-0 bg-transparent focus-visible:ring-0 pl-5 pr-2 shadow-none"
                      />
                    </div>
                  </td>
                  <td className="px-2 py-2 align-top">
                    <div className="mt-1 rounded-md border border-border bg-muted/20 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.tax === 0 ? "" : item.tax}
                        onChange={(e) =>
                          updateItem(index, "tax", e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(e, index, "tax")}
                        data-field="tax"
                        className="h-8 w-full text-right border-0 bg-transparent focus-visible:ring-0 text-amber-600 font-medium px-2 shadow-none"
                      />
                    </div>
                  </td>
                  <td className="px-2 py-2 align-top">
                    <div className="flex gap-1 mt-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateItem(
                            index,
                            "discountType",
                            item.discountType === "flat" ? "percent" : "flat",
                          )
                        }
                        className={cn(
                          "h-8 px-2 rounded-md border border-border/50 transition-all text-[10px] font-bold shrink-0",
                          item.discountType === "flat"
                            ? "bg-primary/10 text-primary border-primary/30"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted",
                        )}
                      >
                        {item.discountType === "flat" ? currencySymbol : "%"}
                      </button>
                      <div className="flex-1 rounded-md border border-border bg-muted/20 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            item.discount === 0 || !item.discount
                              ? ""
                              : item.discount
                          }
                          onChange={(e) =>
                            updateItem(index, "discount", e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(e, index, "discount")}
                          data-field="discount"
                          placeholder="0"
                          className="h-8 w-full text-right border-0 bg-transparent focus-visible:ring-0 px-2 shadow-none"
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right align-top pt-3.5">
                    <span className="font-bold text-sm text-foreground">
                      {currencySymbol}
                      {lineTotal.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </td>
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
