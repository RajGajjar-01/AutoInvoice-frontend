import { zodResolver } from "@hookform/resolvers/zod"
import {
  AlertTriangle,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import useCustomToast from "@/hooks/useCustomToast"
import useLocalStorage from "@/hooks/useLocalStorage"
import { cn } from "@/lib/utils"

const baseSchema = z.object({
  qty: z.coerce.number({ message: "Enter a valid quantity" }).min(0),
  reason: z.string().optional(),
})

type FormValues = z.infer<typeof baseSchema>

const MODES = [
  {
    key: "add",
    label: "Add Stock",
    icon: TrendingUp,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/30",
  },
  {
    key: "remove",
    label: "Remove Stock",
    icon: TrendingDown,
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/30",
  },
  {
    key: "set",
    label: "Set Exact",
    icon: SlidersHorizontal,
    color: "text-primary",
    bg: "bg-primary/10 border-primary/30",
  },
] as const

type Mode = (typeof MODES)[number]["key"]

interface StockHistoryEntry {
  date: string
  type: "add" | "remove" | "set"
  qty: number
  reason?: string
}

interface Item {
  id: string
  name: string
  stock?: number
  unit?: string
  stockHistory?: StockHistoryEntry[]
}

interface AdjustStockProps {
  item: Item
  onSuccess?: () => void
  variant?: "dropdown" | "button"
}

const AdjustStock = ({
  item,
  onSuccess,
  variant = "dropdown",
}: AdjustStockProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<Mode>("add")
  const [, setItems] = useLocalStorage<Item[]>("items", [])
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(baseSchema) as any,
    mode: "onBlur",
    defaultValues: { qty: 0, reason: "" },
  })

  const onSubmit = (data: FormValues) => {
    const qty = data.qty
    const currentStock = item.stock ?? 0

    let newStock: number
    let historyType: "add" | "remove" | "set"
    if (mode === "add") {
      newStock = currentStock + qty
      historyType = "add"
    } else if (mode === "remove") {
      if (qty > currentStock) {
        showErrorToast(`Cannot remove ${qty} — only ${currentStock} in stock`)
        return
      }
      newStock = currentStock - qty
      historyType = "remove"
    } else {
      newStock = qty
      historyType = "set"
    }

    const historyEntry: StockHistoryEntry = {
      date: new Date().toISOString(),
      type: historyType,
      qty:
        mode === "set"
          ? newStock - currentStock
          : mode === "remove"
            ? -qty
            : qty,
      reason: data.reason || "",
    }

    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== item.id) return i
        return {
          ...i,
          stock: newStock,
          stockHistory: [...(i.stockHistory ?? []), historyEntry],
        }
      }),
    )

    showSuccessToast(`Stock updated to ${newStock}`)
    form.reset()
    setIsOpen(false)
    onSuccess?.()
  }

  const activeMode = MODES.find((m) => m.key === mode)

  const trigger =
    variant === "button" ? (
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <SlidersHorizontal className="mr-2 h-4 w-4" />
        Adjust Stock
      </Button>
    ) : (
      <DropdownMenuItem
        onSelect={(e) => e.preventDefault()}
        onClick={() => setIsOpen(true)}
      >
        <SlidersHorizontal className="mr-2 h-4 w-4" />
        Adjust Stock
      </DropdownMenuItem>
    )

  return (
    <>
      {trigger}
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open)
          if (!open) {
            form.reset()
            setMode("add")
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              Current stock:{" "}
              <span className="font-semibold text-foreground">
                {item.stock ?? 0} {item.unit || "pcs"}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-2">
            {MODES.map((m) => {
              const Icon = m.icon
              const isActive = mode === m.key
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => {
                    setMode(m.key)
                    form.reset()
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-all",
                    isActive
                      ? `${m.bg} ${m.color} border-current`
                      : "border-border text-muted-foreground hover:bg-muted/50",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {m.label}
                </button>
              )
            })}
          </div>

          {mode === "remove" && (item.stock ?? 0) === 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              This item is already out of stock.
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="qty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {mode === "set" ? "New Stock Quantity" : "Quantity"}
                      <span className="text-destructive"> *</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={mode === "set" ? "0" : "1"}
                        placeholder={
                          mode === "set" ? "Enter exact quantity" : "How many?"
                        }
                        className={cn(
                          "transition-colors",
                          activeMode && `focus-visible:ring-1`,
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Reason{" "}
                      <span className="text-muted-foreground text-xs">
                        (optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. Restocked from supplier, Damaged goods..."
                        rows={2}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  className={cn(
                    mode === "add" &&
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                    mode === "remove" &&
                      "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
                    mode === "set" && "",
                  )}
                >
                  {mode === "add"
                    ? "Add Stock"
                    : mode === "remove"
                      ? "Remove Stock"
                      : "Set Stock"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AdjustStock
