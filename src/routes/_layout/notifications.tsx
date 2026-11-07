import { CheckCheck, Trash2 } from "lucide-react"
import { FilterChips } from "@/components/Common/FilterChips"
import { PageHeader } from "@/components/Common/PageHeader"
import { SearchInput } from "@/components/Common/SearchInput"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GroupedList } from "@/features/notifications/components/GroupedList"
import { HowItWorks } from "@/features/notifications/components/HowItWorks"
import { TYPE_CONFIG } from "@/features/notifications/constants"
import { useNotifications } from "@/features/notifications/hooks/useNotifications"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

function NotificationsPage() {
  useDocumentTitle("Notifications")
  const {
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    tab,
    setTab,
    totalCount,
    unreadCount,
    readCount,
    filtered,
    filteredUnread,
    filteredRead,
    typeCounts,
    markRead,
    markAllRead,
    deleteNotification,
    clearAll,
  } = useNotifications()

  const types = Object.entries(TYPE_CONFIG).filter(
    ([key]) => (typeCounts[key] ?? 0) > 0,
  )
  const items =
    tab === "unread"
      ? filteredUnread
      : tab === "history"
        ? filteredRead
        : filtered

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <PageHeader
        title="Notifications"
        description={
          unreadCount > 0
            ? `${unreadCount} unread · reminders from your data tables`
            : "Reminders and alerts from your data tables"
        }
        actions={
          totalCount > 0 && (
            <>
              {unreadCount > 0 && (
                <Button
                  id="notif-mark-all-btn"
                  variant="outline"
                  onClick={markAllRead}
                >
                  <CheckCheck /> Mark all read
                </Button>
              )}
              <Button
                id="notif-clear-all-btn"
                variant="ghost"
                size="icon"
                aria-label="Clear all"
                title="Clear all"
                className="size-11 text-muted-foreground hover:text-destructive sm:size-9"
                onClick={clearAll}
              >
                <Trash2 />
              </Button>
            </>
          )
        }
      />

      {totalCount === 0 ? (
        <HowItWorks />
      ) : (
        <>
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList className="grid h-11 w-full grid-cols-3 sm:h-9 sm:w-80">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread{unreadCount > 0 && ` (${unreadCount})`}
              </TabsTrigger>
              <TabsTrigger value="history">Read ({readCount})</TabsTrigger>
            </TabsList>
          </Tabs>

          <SearchInput
            id="notif-search-input"
            value={search}
            onChange={setSearch}
            placeholder="Search notifications…"
          />

          {types.length > 1 && (
            <FilterChips
              label="Notification type"
              value={typeFilter ?? "all"}
              onChange={(v) => setTypeFilter(v === "all" ? null : v)}
              options={[
                { value: "all", label: "All types" },
                ...types.map(([key, cfg]) => ({
                  value: key,
                  label: cfg.label,
                  icon: cfg.Icon,
                  count: typeCounts[key],
                })),
              ]}
            />
          )}

          <GroupedList
            items={items}
            onMarkRead={markRead}
            onDelete={deleteNotification}
            filtered={!!(search.trim() || typeFilter)}
          />
        </>
      )}
    </div>
  )
}

export default NotificationsPage
