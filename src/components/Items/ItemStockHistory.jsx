import { TrendingUp, TrendingDown, Minus, Clock, PackageX } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const TYPE_CONFIG = {
    add: {
        icon: TrendingUp,
        label: "Stock Added",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        badgeCls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        sign: "+",
    },
    remove: {
        icon: TrendingDown,
        label: "Stock Removed",
        color: "text-destructive",
        bg: "bg-destructive/10",
        badgeCls: "border-destructive/40 bg-destructive/10 text-destructive",
        sign: "−",
    },
    set: {
        icon: Minus,
        label: "Stock Set",
        color: "text-primary",
        bg: "bg-primary/10",
        badgeCls: "border-primary/40 bg-primary/10 text-primary",
        sign: "→",
    },
    invoice: {
        icon: TrendingDown,
        label: "Invoice Deduction",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        badgeCls: "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400",
        sign: "−",
    },
}

function TimelineEntry({ entry, isLast }) {
    const config = TYPE_CONFIG[entry.type] ?? TYPE_CONFIG.set
    const Icon = config.icon
    const absQty = Math.abs(entry.qty)
    const sign = entry.qty > 0 ? "+" : entry.qty < 0 ? "−" : "→"

    return (
        <div className="flex gap-4">
            {/* Timeline connector */}
            <div className="flex flex-col items-center">
                <div className={cn("rounded-full p-2 shrink-0", config.bg)}>
                    <Icon className={cn("h-3.5 w-3.5", config.color)} />
                </div>
                {!isLast && <div className="w-px flex-1 bg-border mt-1 mb-1 min-h-[1.5rem]" />}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{config.label}</span>
                    <Badge
                        variant="outline"
                        className={cn("font-mono text-xs", config.badgeCls)}
                    >
                        {sign} {absQty}
                    </Badge>
                </div>
                {entry.reason && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{entry.reason}</p>
                )}
                <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground/60" />
                    <time className="text-xs text-muted-foreground/60">
                        {new Date(entry.date).toLocaleString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                        })}
                    </time>
                </div>
            </div>
        </div>
    )
}

export function ItemStockHistory({ item }) {
    const history = [...(item.stockHistory ?? [])].reverse() // newest first

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Stock History</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="rounded-full bg-muted p-4 mb-3">
                            <PackageX className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">No stock history yet</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Use "Adjust Stock" to record movements.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-0">
                        {history.map((entry, idx) => (
                            <TimelineEntry
                                key={idx}
                                entry={entry}
                                isLast={idx === history.length - 1}
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
