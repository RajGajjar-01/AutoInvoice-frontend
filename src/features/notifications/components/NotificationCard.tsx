import {
  Check,
  DotsThree as MoreHorizontal,
  Trash as Trash2,
} from "@phosphor-icons/react"
import { SwipeableRow } from "@/components/Common/SwipeableRow"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Notification } from "@/features/notifications/types"
import { formatTimeAgo, getType } from "@/features/notifications/utils"
import { cn } from "@/lib/utils"

interface NotificationCardProps {
  notif: Notification
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
}

/** One notification row. Swipe right: mark read. Swipe left: remove. */
export function NotificationCard({
  notif,
  onMarkRead,
  onDelete,
}: NotificationCardProps) {
  const unread = !notif.read
  const cfg = getType(notif.type)
  const Icon = cfg.Icon!
  const meta = [notif.tableName, notif.rowLabel, formatTimeAgo(notif.createdAt)]
    .filter(Boolean)
    .join(" · ")

  return (
    <SwipeableRow
      startActions={
        unread
          ? [
              {
                label: "Read",
                icon: Check,
                className: "bg-primary",
                onAction: () => onMarkRead(notif.id),
              },
            ]
          : []
      }
      endActions={[
        {
          label: "Remove",
          icon: Trash2,
          className: "bg-destructive",
          onAction: () => onDelete(notif.id),
        },
      ]}
    >
      <div
        className={cn(
          "flex items-start gap-3 px-4 py-3.5",
          unread && "bg-primary/[0.04] dark:bg-primary/[0.08]",
        )}
      >
        <span
          className={cn(
            "mt-0.5 grid size-9 shrink-0 place-items-center rounded-full",
            cfg.bg,
          )}
          aria-hidden="true"
        >
          <Icon className={cn("size-4", cfg.color)} />
        </span>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-sm leading-snug",
              unread ? "font-semibold" : "font-medium text-muted-foreground",
            )}
          >
            {unread && <span className="sr-only">Unread: </span>}
            {notif.title}
          </p>
          {notif.description && (
            <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
              {notif.description}
            </p>
          )}
          <p className="mt-1.5 truncate text-xs text-muted-foreground/80">
            {meta}
          </p>
        </div>

        <div className="-mr-2 -mt-1.5 flex shrink-0 items-center">
          {unread && (
            <span
              className="mr-1 size-2 rounded-full bg-primary"
              aria-hidden="true"
            />
          )}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-11 text-muted-foreground sm:size-9"
                  aria-label={`Actions for ${notif.title}`}
                />
              }
            >
              <MoreHorizontal className="size-5 sm:size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {unread && (
                <DropdownMenuItem onClick={() => onMarkRead(notif.id)}>
                  <Check /> Mark as read
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(notif.id)}
              >
                <Trash2 /> Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </SwipeableRow>
  )
}
