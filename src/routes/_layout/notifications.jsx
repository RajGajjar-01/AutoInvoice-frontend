import { createFileRoute } from "@tanstack/react-router"
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
import { notificationStore } from "@/components/DataTables/notificationStore"
import { tablesStore } from "@/components/DataTables/tableStore"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const Route = createFileRoute("/_layout/notifications")({
  component: NotificationsPage,
  head: () => ({
    meta: [{ title: "Notifications" }],
  }),
})

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTimeAgo(iso) {
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

function formatDateLabel(iso) {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

// ─── Type config ──────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
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
function getType(t) {
  return TYPE_CONFIG[t] ?? TYPE_CONFIG.info
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, iconClass, bgClass, active }) {
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

// ─── Notification card ────────────────────────────────────────────────────────
function NotificationCard({ notif, onMarkRead, onDelete }) {
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
      {/* Unread left accent stripe */}
      {isUnread && (
        <span className="absolute -left-px top-3 bottom-3 w-0.5 rounded-full bg-primary" />
      )}

      {/* Icon */}
      <div
        className={`shrink-0 mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center ${cfg.bg}`}
      >
        <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0 pr-16">
        {/* Row 1: title + type badge */}
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

        {/* Row 2: description */}
        {notif.description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {notif.description}
          </p>
        )}

        {/* Row 3: meta chips + time */}
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

      {/* Actions */}
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

// ─── Grouped list with date separators ───────────────────────────────────────
function GroupedList({ items, onMarkRead, onDelete }) {
  if (items.length === 0) return <EmptyState />

  // Group by date
  const groups = []
  const seen = new Map()
  for (const n of items) {
    const dateKey = n.createdAt ? n.createdAt.split("T")[0] : "unknown"
    if (!seen.has(dateKey)) {
      seen.set(dateKey, groups.length)
      groups.push({
        dateKey,
        label: formatDateLabel(`${n.createdAt}T00:00:00`),
        items: [],
      })
    }
    groups[seen.get(dateKey)].items.push(n)
  }

  return (
    <div className="flex flex-col gap-5">
      {groups.map((g) => (
        <div key={g.dateKey} className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
              {g.label}
            </p>
            <Separator className="flex-1" />
          </div>
          <div className="flex flex-col gap-2">
            {g.items.map((n) => (
              <NotificationCard
                key={n.id}
                notif={n}
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

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ filtered = false }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center rounded-xl border border-dashed border-border bg-muted/10">
      <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
        <BellOff className="h-6 w-6 text-muted-foreground/40" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">
          {filtered ? "No results found" : "All clear!"}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 max-w-[220px] mx-auto">
          {filtered
            ? "Try adjusting your search."
            : "Notifications from reminders will appear here."}
        </p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    notificationStore.checkOverdueReminders(tablesStore.getAll())
    const unsub = notificationStore.subscribe(setNotifications)
    return unsub
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length
  const readCount = notifications.filter((n) => n.read).length
  const totalCount = notifications.length

  const filtered = useMemo(() => {
    if (!search.trim()) return notifications
    const q = search.trim().toLowerCase()
    return notifications.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        (n.description ?? "").toLowerCase().includes(q) ||
        (n.tableName ?? "").toLowerCase().includes(q) ||
        (n.rowLabel ?? "").toLowerCase().includes(q),
    )
  }, [notifications, search])

  const unread = filtered.filter((n) => !n.read)
  const read = filtered.filter((n) => n.read)

  const handleMarkRead = (id) => notificationStore.markRead(id)
  const handleDelete = (id) => notificationStore.delete(id)
  const handleMarkAllRead = () => notificationStore.markAllRead()
  const handleClearAll = () => notificationStore.clearAll()

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your reminders and activity alerts in one place
          </p>
        </div>
        {totalCount > 0 && (
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                id="notif-mark-all-btn"
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={handleMarkAllRead}
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
              onClick={handleClearAll}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* ── Stats row ───────────────────────────────────────────────── */}
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

      {/* ── Two-column layout ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 items-start">
        {/* Left panel — search + filter info */}
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="notif-search-input"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {/* By Type breakdown */}
          {totalCount > 0 &&
            (() => {
              const typeEntries = Object.entries(TYPE_CONFIG)
                .map(([key, cfg]) => ({
                  key,
                  cfg,
                  count: notifications.filter((n) => n.type === key).length,
                }))
                .filter((e) => e.count > 0)
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

          {/* Tips card (only when no notifications) */}
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
              ].map(({ icon: Icon, color, bg, text }, i) => (
                <div key={i} className="flex items-start gap-2.5">
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

        {/* Right panel — notification list */}
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
                    onMarkRead={handleMarkRead}
                    onDelete={handleDelete}
                  />
                )}
              </TabsContent>

              <TabsContent value="unread" className="mt-0">
                {unread.length === 0 ? (
                  <EmptyState filtered={!!search} />
                ) : (
                  <GroupedList
                    items={unread}
                    onMarkRead={handleMarkRead}
                    onDelete={handleDelete}
                  />
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                {read.length === 0 ? (
                  <EmptyState filtered={!!search} />
                ) : (
                  <GroupedList
                    items={read}
                    onMarkRead={handleMarkRead}
                    onDelete={handleDelete}
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
