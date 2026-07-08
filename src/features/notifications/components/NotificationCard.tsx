import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Notification } from "@/features/notifications/types"
import { formatTimeAgo, getType } from "@/features/notifications/utils"

interface NotificationCardProps {
  notif: Notification
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
}

export function NotificationCard({
  notif,
  onMarkRead,
  onDelete,
}: NotificationCardProps) {
  const isUnread = !notif.read
  const cfg = getType(notif.type)
  const Icon = cfg.Icon!

  return (
    <div
      className={`animate-in relative flex gap-3.5 rounded-xl border px-4 py-3.5 transition-all ${
        isUnread
          ? "border-primary/25 bg-gradient-to-r from-primary/[0.03] to-transparent dark:from-primary/[0.07] shadow-sm"
          : "border-border/60 bg-card hover:bg-muted/20"
      }`}
    >
      {isUnread && (
        <span className="absolute -left-px top-3 bottom-3 w-0.5 rounded-full bg-primary" />
      )}

      <div
        className={`shrink-0 mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center ${cfg.bg}`}
      >
        <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p
                className={`text-sm leading-snug ${
                  isUnread
                    ? "font-semibold text-foreground"
                    : "font-medium text-muted-foreground"
                }`}
              >
                {notif.title}
              </p>
              {isUnread && (
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              )}
            </div>

            {notif.description && (
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mt-0.5">
                {notif.description}
              </p>
            )}

            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {notif.tableName && (
                <span className="text-[10px] font-medium text-muted-foreground/70 bg-muted/80 px-2 py-0.5 rounded-md border border-border/50">
                  {notif.tableName}
                </span>
              )}
              {notif.rowLabel && (
                <span className="text-[10px] text-muted-foreground/60 bg-muted/50 px-2 py-0.5 rounded-md border border-border/40">
                  {notif.rowLabel}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground/50 ml-auto">
                {formatTimeAgo(notif.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-0.5 shrink-0 ml-2">
            {isUnread && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground/50 hover:text-primary hover:bg-primary/10"
                title="Mark as read"
                onClick={() => onMarkRead(notif.id)}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10"
              title="Remove"
              onClick={() => onDelete(notif.id)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
