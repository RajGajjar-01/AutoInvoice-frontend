import { ListRows } from "@/components/Common/ListRow"
import { NotificationCard } from "@/features/notifications/components/NotificationCard"
import { NotificationsEmpty } from "@/features/notifications/components/NotificationsEmpty"
import type { Notification } from "@/features/notifications/types"
import { groupByDate } from "@/features/notifications/utils"

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

  return (
    <div className="flex flex-col gap-5">
      {groupByDate(items).map((group) => (
        <section key={group.dateKey} aria-label={group.label}>
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {group.label}
          </h2>
          <ListRows>
            {group.items.map((n) => (
              <NotificationCard
                key={n.id}
                notif={n}
                onMarkRead={onMarkRead}
                onDelete={onDelete}
              />
            ))}
          </ListRows>
        </section>
      ))}
    </div>
  )
}
