import { Separator } from "@/components/ui/separator"
import { NotificationCard } from "@/features/notifications/components/NotificationCard"
import type { Notification } from "@/features/notifications/types"
import { groupByDate } from "@/features/notifications/utils"
import { NotificationsEmpty } from "@/features/notifications/components/NotificationsEmpty"

interface GroupedListProps {
  items: Notification[]
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
  filtered?: boolean
}

export function GroupedList({
  items,
  onMarkRead,
  onDelete,
  filtered = false,
}: GroupedListProps) {
  if (items.length === 0) {
    return <NotificationsEmpty filtered={filtered} />
  }

  const groups = groupByDate(items)

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group, gi) => (
        <div key={group.dateKey} className="flex flex-col gap-2">
          <div className="flex items-center gap-3 animate-in animate-in-delay-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 whitespace-nowrap">
              {group.label}
            </p>
            <Separator className="flex-1" />
          </div>
          <div className="flex flex-col gap-2">
            {group.items.map((notification, ni) => (
              <div
                key={notification.id}
                className="animate-in"
                style={{ animationDelay: `${(gi * 3 + ni) * 50}ms` }}
              >
                <NotificationCard
                  notif={notification}
                  onMarkRead={onMarkRead}
                  onDelete={onDelete}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
