import { BellOff, Search } from "lucide-react"

interface NotificationsEmptyProps {
  filtered?: boolean
}

export function NotificationsEmpty({
  filtered = false,
}: NotificationsEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in">
      <div className="rounded-2xl bg-gradient-to-b from-muted/80 to-muted/30 p-5 mb-5 ring-1 ring-border/50">
        {filtered ? (
          <Search className="h-8 w-8 text-muted-foreground/40" />
        ) : (
          <BellOff className="h-8 w-8 text-muted-foreground/40" />
        )}
      </div>
      <h3 className="text-sm font-semibold mb-1">
        {filtered ? "No matching notifications" : "No notifications yet"}
      </h3>
      <p className="text-xs text-muted-foreground/70 max-w-xs leading-relaxed">
        {filtered
          ? "Try adjusting your search or filters."
          : "Open any Data Table, click the bell icon on a row, and set a reminder. Notifications will appear here automatically."}
      </p>
    </div>
  )
}
