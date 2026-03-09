import {
    Bell,
    BellOff,
    Calendar,
    Check,
    CheckCheck,
    Clock,
    Info,
    Trash2,
    X,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { notificationStore } from "@/components/DataTables/notificationStore"
import { tablesStore } from "@/components/DataTables/tableStore"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"

// ─── Icon map per type ────────────────────────────────────────────────────────
function NotifIcon({ type }) {
    const cls = "h-4 w-4 shrink-0"
    switch (type) {
        case "reminder":
            return <Bell className={`${cls} text-primary`} />
        case "due_date":
            return <Calendar className={`${cls} text-rose-500`} />
        case "expiry":
            return <Clock className={`${cls} text-amber-500`} />
        default:
            return <Info className={`${cls} text-blue-500`} />
    }
}

// ─── Single notification row ──────────────────────────────────────────────────
function NotifRow({ notif, onMarkRead, onDelete }) {
    const timeAgo = formatTimeAgo(notif.createdAt)
    return (
        <div
            className={`relative flex gap-3 px-4 py-3 transition-colors group cursor-pointer ${notif.read
                ? "bg-transparent hover:bg-muted/40"
                : "bg-primary/5 hover:bg-primary/10 border-l-2 border-primary"
                }`}
            onClick={() => !notif.read && onMarkRead(notif.id)}
        >
            {/* Icon */}
            <div className="mt-0.5">
                <NotifIcon type={notif.type} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug ${notif.read ? "text-muted-foreground" : "text-foreground font-medium"}`}>
                    {notif.title}
                </p>
                {notif.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notif.description}
                    </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                    {notif.tableName && (
                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-medium">
                            {notif.tableName}
                        </span>
                    )}
                    <span className="text-[10px] text-muted-foreground">{timeAgo}</span>
                </div>
            </div>

            {/* Actions (visible on hover) */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                {!notif.read && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-primary"
                        title="Mark as read"
                        onClick={(e) => { e.stopPropagation(); onMarkRead(notif.id) }}
                    >
                        <Check className="h-3.5 w-3.5" />
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    title="Delete"
                    onClick={(e) => { e.stopPropagation(); onDelete(notif.id) }}
                >
                    <X className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function NotificationCenter() {
    const [open, setOpen] = useState(false)
    const [notifications, setNotifications] = useState([])
    const navigate = useNavigate()

    // Subscribe to store
    useEffect(() => {
        const unsub = notificationStore.subscribe(setNotifications)
        // On mount, check for overdue reminders
        notificationStore.checkOverdueReminders(tablesStore.getAll())
        return unsub
    }, [])

    const unreadCount = notifications.filter((n) => !n.read).length

    const handleMarkRead = (id) => notificationStore.markRead(id)
    const handleDelete = (id) => notificationStore.delete(id)
    const handleMarkAllRead = () => notificationStore.markAllRead()
    const handleClearAll = () => notificationStore.clearAll()

    const handleViewAll = () => {
        setOpen(false)
        navigate({ to: "/notifications" })
    }

    return (
        <>
            {/* ── Bell button ── */}
            <Button
                id="notification-bell-btn"
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
                onClick={() => setOpen(true)}
                aria-label="View notifications"
            >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground leading-none">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </Button>

            {/* ── Sheet panel ── */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="right" className="w-[380px] sm:w-[420px] p-0 flex flex-col">
                    {/* Header */}
                    <SheetHeader className="px-5 py-4 border-b border-border flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <SheetTitle className="text-base font-semibold">Notifications</SheetTitle>
                            {unreadCount > 0 && (
                                <Badge className="h-5 px-1.5 text-[10px] bg-primary text-primary-foreground">
                                    {unreadCount} new
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
                                    onClick={handleMarkAllRead}
                                    title="Mark all as read"
                                >
                                    <CheckCheck className="h-3.5 w-3.5" />
                                    Mark all read
                                </Button>
                            )}
                            {notifications.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs text-muted-foreground hover:text-destructive gap-1"
                                    onClick={handleClearAll}
                                    title="Clear all notifications"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Clear all
                                </Button>
                            )}
                        </div>
                    </SheetHeader>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center px-6">
                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                    <BellOff className="h-6 w-6 text-muted-foreground/50" />
                                </div>
                                <p className="text-sm font-medium text-foreground">No notifications yet</p>
                                <p className="text-xs text-muted-foreground">
                                    Set reminders on rows in the Data Tables and they will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/50">
                                {/* Unread section */}
                                {notifications.some((n) => !n.read) && (
                                    <>
                                        <div className="px-4 py-2 bg-muted/30">
                                            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                Unread
                                            </p>
                                        </div>
                                        {notifications
                                            .filter((n) => !n.read)
                                            .map((n) => (
                                                <NotifRow
                                                    key={n.id}
                                                    notif={n}
                                                    onMarkRead={handleMarkRead}
                                                    onDelete={handleDelete}
                                                />
                                            ))}
                                    </>
                                )}

                                {/* Read / history section */}
                                {notifications.some((n) => n.read) && (
                                    <>
                                        <div className="px-4 py-2 bg-muted/20">
                                            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                History
                                            </p>
                                        </div>
                                        {notifications
                                            .filter((n) => n.read)
                                            .map((n) => (
                                                <NotifRow
                                                    key={n.id}
                                                    notif={n}
                                                    onMarkRead={handleMarkRead}
                                                    onDelete={handleDelete}
                                                />
                                            ))}
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-border px-5 py-3 bg-muted/20 flex items-center justify-between gap-2">
                        <p className="text-[11px] text-muted-foreground">
                            {notifications.length === 0
                                ? "No notifications"
                                : `${notifications.length} total${unreadCount > 0 ? ` · ${unreadCount} unread` : ""}`}
                        </p>
                        <Button
                            id="view-all-notifications-btn"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-primary hover:text-primary/80 gap-1 px-2"
                            onClick={handleViewAll}
                        >
                            View all →
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    )
}

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
    return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
}

export default NotificationCenter
