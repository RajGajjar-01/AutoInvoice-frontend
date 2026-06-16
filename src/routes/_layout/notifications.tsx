import { useQueries, useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import type { LucideIcon } from "lucide-react"
import {
  Bell,
  BellOff,
  Calendar,
  Check,
  CheckCheck,
  Clock,
  Info,
  Search,
  Trash2,
  X,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  type Notification,
  useNotificationStore,
} from "@/features/data-tables/notification-store"
import {
  tableDetailQueryOptions,
  tablesListQueryOptions,
} from "@/features/data-tables/queries"
import { queryClient } from "@/queryClient"

export const Route = createFileRoute("/_layout/notifications")({
  component: NotificationsPage,
  loader: () =>
    queryClient.ensureQueryData(tablesListQueryOptions({ limit: 100 })),
  head: () => ({
    meta: [{ title: "Notifications" }],
  }),
})

interface TableColumn {
  name: string
  type: string
}

interface TableRow {
  id: string
  [key: string]: unknown
}

interface ReminderDetail {
  id: string
  title?: unknown
  description?: unknown
  date?: unknown
  rowId?: unknown
}

interface TableDetail {
  id: string
  name: string
  columns: TableColumn[]
  rows: TableRow[]
  reminders?: ReminderDetail[]
}

interface ReminderSyncTable {
  id: string
  name: string
  reminders?: Array<{
    id: string
    date?: string
    title: string
    description?: string
    rowLabel?: string
  }>
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined
}

function getRowLabel(
  table: TableDetail,
  rowId: string | undefined,
): string | undefined {
  if (!rowId) return undefined

  const rowIndex = table.rows.findIndex((row) => row.id === rowId)
  if (rowIndex === -1) return undefined

  const firstTextColumn = table.columns.find((column) => column.type === "Text")
  const row = table.rows[rowIndex]
  const primaryValue = firstTextColumn ? row[firstTextColumn.name] : undefined

  return primaryValue ? String(primaryValue) : `Row #${rowIndex + 1}`
}

function buildReminderTables(tables: TableDetail[]): ReminderSyncTable[] {
  return tables.map((table) => ({
    id: table.id,
    name: table.name,
    reminders: (table.reminders ?? []).map((reminder) => {
      const rowId = asOptionalString(reminder.rowId)

      return {
        id: reminder.id,
        date: asOptionalString(reminder.date),
        title: asOptionalString(reminder.title) ?? "Reminder",
        description: asOptionalString(reminder.description),
        rowLabel: getRowLabel(table, rowId),
      }
    }),
  }))
}

function formatTimeAgo(iso: string | undefined): string {
  if (!iso) return ""
  const diff = Date.now() - new Date(iso).getTime()
  const secs = Math.floor(diff / 1000)
  if (secs < 60) return "just now"
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatDateLabel(iso: string | undefined): string {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

interface TypeConfig {
  label: string
  Icon: LucideIcon
  color: string
  bg: string
}

const TYPE_CONFIG: Record<string, TypeConfig> = {
  reminder: {
    label: "Reminder",
    Icon: Bell,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  due_date: {
    label: "Due Date",
    Icon: Calendar,
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-950/40",
  },
  expiry: {
    label: "Expiry",
    Icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/40",
  },
  info: {
    label: "Info",
    Icon: Info,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
}

function getType(t: string): TypeConfig {
  return TYPE_CONFIG[t] ?? TYPE_CONFIG.info
}

interface StatCardProps {
  label: string
  value: number
  icon: LucideIcon
  iconClass: string
  bgClass: string
  active: boolean
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconClass,
  bgClass,
  active,
}: StatCardProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-all ${
        active
          ? "border-primary/40 bg-primary/5 dark:bg-primary/10 shadow-sm"
          : "border-border bg-card"
      }`}
    >
      <div
        className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${bgClass}`}
      >
        <Icon className={`h-4 w-4 ${iconClass}`} />
      </div>
      <div>
        <p className="text-xl font-bold leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  )
}

interface NotificationCardProps {
  notif: Notification
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
}

function NotificationCard({
  notif,
  onMarkRead,
  onDelete,
}: NotificationCardProps) {
  const isUnread = !notif.read
  const cfg = getType(notif.type)
  const Icon = cfg.Icon

  return (
    <div
      className={`group relative flex gap-3.5 rounded-xl border px-4 py-3.5 transition-all cursor-default ${
        isUnread
          ? "border-primary/25 bg-primary/[0.03] dark:bg-primary/[0.07] shadow-sm"
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

      <div className="flex-1 min-w-0 pr-16">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <p
            className={`text-sm leading-snug ${isUnread ? "font-semibold text-foreground" : "font-medium text-foreground/75"}`}
          >
            {notif.title}
          </p>
          {isUnread && (
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
          )}
          <Badge
            variant="outline"
            className={`text-[10px] h-4 px-1.5 shrink-0 ml-auto ${isUnread ? `${cfg.color} border-current/40` : ""}`}
          >
            {cfg.label}
          </Badge>
        </div>

        {notif.description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {notif.description}
          </p>
        )}

        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {notif.tableName && (
            <span className="text-[10px] font-medium text-muted-foreground bg-muted/80 px-2 py-0.5 rounded border border-border/50">
              📋 {notif.tableName}
            </span>
          )}
          {notif.rowLabel && (
            <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/40">
              {notif.rowLabel}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground/60 ml-auto">
            {formatTimeAgo(notif.createdAt)}
          </span>
        </div>
      </div>

      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {isUnread && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
            title="Mark as read"
            onClick={() => onMarkRead(notif.id)}
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          title="Remove"
          onClick={() => onDelete(notif.id)}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

interface GroupedItem {
  dateKey: string
  label: string
  items: Notification[]
}

interface GroupedListProps {
  items: Notification[]
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
}

function GroupedList({ items, onMarkRead, onDelete }: GroupedListProps) {
  if (items.length === 0) return <EmptyState />

  const groups: GroupedItem[] = []
  const seen = new Map<string, number>()

  for (const notification of items) {
    const dateKey = notification.createdAt
      ? notification.createdAt.split("T")[0]
      : "unknown"

    if (!seen.has(dateKey)) {
      seen.set(dateKey, groups.length)
      groups.push({
        dateKey,
        label: formatDateLabel(`${dateKey}T00:00:00`),
        items: [],
      })
    }

    groups[seen.get(dateKey)!].items.push(notification)
  }

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <div key={group.dateKey} className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
              {group.label}
            </p>
            <Separator className="flex-1" />
          </div>
          <div className="flex flex-col gap-2">
            {group.items.map((notification) => (
              <NotificationCard
                key={notification.id}
                notif={notification}
                onMarkRead={onMarkRead}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

interface EmptyStateProps {
  filtered?: boolean
}

function EmptyState({ filtered = false }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        {filtered ? (
          <Search className="h-6 w-6 text-muted-foreground" />
        ) : (
          <BellOff className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
      <h3 className="text-sm font-semibold mb-1">
        {filtered ? "No matching notifications" : "No notifications yet"}
      </h3>
      <p className="text-xs text-muted-foreground max-w-xs">
        {filtered
          ? "Try adjusting your search query."
          : "Reminders and alerts from your data tables will appear here."}
      </p>
    </div>
  )
}

function NotificationsPage() {
  const [search, setSearch] = useState("")
  const {
    checkOverdueReminders,
    clearAll,
    deleteNotification,
    markAllRead,
    markRead,
    notifications,
  } = useNotificationStore((state) => ({
    checkOverdueReminders: state.checkOverdueReminders,
    clearAll: state.clearAll,
    deleteNotification: state.delete,
    markAllRead: state.markAllRead,
    markRead: state.markRead,
    notifications: state.notifications,
  }))

  const {
    data: tablesList,
    isError: isTablesError,
    isLoading: isLoadingTables,
  } = useQuery(tablesListQueryOptions({ limit: 100 }))
  const tables = tablesList?.data ?? []

  const tableDetails = useQueries({
    queries: tables.map((table) => tableDetailQueryOptions(table.id)),
    combine: (results) => ({
      data: results
        .map((result) => result.data)
        .filter(Boolean) as TableDetail[],
      isError: results.some((result) => result.isError),
      isPending: results.some((result) => result.isPending),
    }),
  })

  const reminderTables = useMemo(
    () => buildReminderTables(tableDetails.data),
    [tableDetails.data],
  )
  const isSyncing = isLoadingTables || tableDetails.isPending
  const hasSyncError = isTablesError || tableDetails.isError

  useEffect(() => {
    if (isSyncing || hasSyncError) return
    checkOverdueReminders(reminderTables)
  }, [checkOverdueReminders, hasSyncError, isSyncing, reminderTables])

  const totalCount = notifications.length
  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length
  const readCount = totalCount - unreadCount

  const unread = useMemo(
    () => notifications.filter((notification) => !notification.read),
    [notifications],
  )
  const read = useMemo(
    () => notifications.filter((notification) => notification.read),
    [notifications],
  )

  const query = search.trim().toLowerCase()
  const matchesSearch = (notification: Notification) =>
    !query ||
    notification.title.toLowerCase().includes(query) ||
    notification.description?.toLowerCase().includes(query) ||
    notification.tableName?.toLowerCase().includes(query) ||
    notification.rowLabel?.toLowerCase().includes(query)

  const filtered = notifications.filter(matchesSearch)
  const filteredUnread = unread.filter(matchesSearch)
  const filteredRead = read.filter(matchesSearch)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Reminders and alerts from your data tables
          </p>
        </div>
        {totalCount > 0 && (
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                id="notif-mark-all-btn"
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={markAllRead}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </Button>
            )}
            <Button
              id="notif-clear-all-btn"
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
              onClick={clearAll}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear all
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard
          label="Total"
          value={totalCount}
          icon={Bell}
          iconClass="text-primary"
          bgClass="bg-primary/10"
          active={false}
        />
        <StatCard
          label="Unread"
          value={unreadCount}
          icon={Bell}
          iconClass="text-amber-500"
          bgClass="bg-amber-50 dark:bg-amber-950/40"
          active={unreadCount > 0}
        />
        <StatCard
          label="Read"
          value={readCount}
          icon={Check}
          iconClass="text-green-600"
          bgClass="bg-green-50 dark:bg-green-950/40"
          active={false}
        />
      </div>

      {(isSyncing || hasSyncError) && (
        <div
          className={`rounded-xl border px-4 py-3 ${
            hasSyncError
              ? "border-destructive/30 bg-destructive/5"
              : "border-border bg-muted/30"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 rounded-md p-1 ${
                hasSyncError ? "bg-destructive/10" : "bg-background"
              }`}
            >
              <Info
                className={`h-4 w-4 ${
                  hasSyncError ? "text-destructive" : "text-muted-foreground"
                }`}
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                {hasSyncError ? "Reminder sync failed" : "Syncing reminders"}
              </p>
              <p
                className={`text-xs mt-0.5 ${
                  hasSyncError ? "text-destructive/80" : "text-muted-foreground"
                }`}
              >
                {hasSyncError
                  ? "Could not refresh data table reminders right now. Existing notifications are still available."
                  : "Checking due reminders from your data tables."}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 items-start">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="notif-search-input"
              placeholder="Search…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {totalCount > 0 &&
            (() => {
              const typeEntries = Object.entries(TYPE_CONFIG)
                .map(([key, cfg]) => ({
                  key,
                  cfg,
                  count: notifications.filter(
                    (notification) => notification.type === key,
                  ).length,
                }))
                .filter((entry) => entry.count > 0)

              if (typeEntries.length === 0) return null

              return (
                <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    By Type
                  </p>
                  {typeEntries.map(({ key, cfg, count }) => {
                    const Icon = cfg.Icon

                    return (
                      <div
                        key={key}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div
                          className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 ${cfg.bg}`}
                        >
                          <Icon className={`h-3 w-3 ${cfg.color}`} />
                        </div>
                        <span className="text-muted-foreground flex-1 text-xs">
                          {cfg.label}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] h-4 px-1.5"
                        >
                          {count}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )
            })()}

          {totalCount === 0 && (
            <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                How it works
              </p>
              {[
                {
                  icon: Bell,
                  color: "text-primary",
                  bg: "bg-primary/10",
                  text: "Open any Data Table and click the 🔔 bell icon on a row",
                },
                {
                  icon: Calendar,
                  color: "text-rose-500",
                  bg: "bg-rose-50 dark:bg-rose-950/40",
                  text: "Set a reminder date and title",
                },
                {
                  icon: Check,
                  color: "text-green-600",
                  bg: "bg-green-50 dark:bg-green-950/40",
                  text: "Notifications appear here automatically",
                },
              ].map(({ icon: Icon, color, bg, text }, index) => (
                <div key={index} className="flex items-start gap-2.5">
                  <div
                    className={`shrink-0 h-6 w-6 rounded-md flex items-center justify-center ${bg}`}
                  >
                    <Icon className={`h-3 w-3 ${color}`} />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="min-w-0">
          {totalCount === 0 ? (
            <EmptyState />
          ) : (
            <Tabs defaultValue="all">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <TabsList>
                  <TabsTrigger value="all" className="gap-1.5 text-xs">
                    All
                    <Badge
                      variant="secondary"
                      className="text-[10px] h-4 px-1.5"
                    >
                      {filtered.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="unread" className="gap-1.5 text-xs">
                    Unread
                    {unread.length > 0 && (
                      <Badge className="text-[10px] h-4 px-1.5 bg-primary text-primary-foreground">
                        {unread.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="history" className="gap-1.5 text-xs">
                    History
                    <Badge
                      variant="secondary"
                      className="text-[10px] h-4 px-1.5"
                    >
                      {read.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                {search && (
                  <p className="text-xs text-muted-foreground">
                    {filtered.length} result{filtered.length !== 1 ? "s" : ""}{" "}
                    for &ldquo;{search}&rdquo;
                  </p>
                )}
              </div>

              <TabsContent value="all" className="mt-0">
                {filtered.length === 0 ? (
                  <EmptyState filtered />
                ) : (
                  <GroupedList
                    items={filtered}
                    onMarkRead={markRead}
                    onDelete={deleteNotification}
                  />
                )}
              </TabsContent>

              <TabsContent value="unread" className="mt-0">
                {filteredUnread.length === 0 ? (
                  <EmptyState filtered={!!search} />
                ) : (
                  <GroupedList
                    items={filteredUnread}
                    onMarkRead={markRead}
                    onDelete={deleteNotification}
                  />
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                {filteredRead.length === 0 ? (
                  <EmptyState filtered={!!search} />
                ) : (
                  <GroupedList
                    items={filteredRead}
                    onMarkRead={markRead}
                    onDelete={deleteNotification}
                  />
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationsPage
