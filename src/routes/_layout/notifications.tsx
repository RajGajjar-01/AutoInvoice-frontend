import { CheckCheck, Search as SearchIcon, Trash2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GroupedList } from "@/features/notifications/components/GroupedList"
import { HowItWorks } from "@/features/notifications/components/HowItWorks"
import { StatsBar } from "@/features/notifications/components/StatsBar"
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

  const hasNotifications = totalCount > 0
  const activeFilters = search.trim() || typeFilter

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
      <div className="flex items-start justify-between animate-in">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <Badge className="rounded-full h-5 px-2 text-[10px] font-semibold bg-primary text-primary-foreground">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Reminders and alerts from your data tables
          </p>
        </div>
        {hasNotifications && (
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

      <div className="animate-in animate-in-delay-1">
        <StatsBar
          totalCount={totalCount}
          unreadCount={unreadCount}
          readCount={readCount}
        />
      </div>

      {!hasNotifications ? (
        <HowItWorks />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-3 animate-in animate-in-delay-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="notif-search-input"
                placeholder="Search notifications…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 pr-9"
              />
              {search && (
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                  onClick={() => setSearch("")}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex gap-1.5 flex-wrap">
              {Object.entries(TYPE_CONFIG)
                .filter(([key]) => (typeCounts[key] ?? 0) > 0)
                .map(([key, cfg]) => {
                  const Icon = cfg.Icon
                  const isActive = typeFilter === key
                  const count = typeCounts[key] ?? 0

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTypeFilter(isActive ? null : key)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
                        isActive
                          ? "border-primary/40 bg-primary/10 text-primary shadow-sm"
                          : "border-border/60 bg-card text-muted-foreground hover:border-border hover:bg-muted/50"
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      {cfg.label}
                      <Badge
                        variant={isActive ? "default" : "outline"}
                        className="text-[10px] h-3.5 px-1 min-w-[16px]"
                      >
                        {count}
                      </Badge>
                    </button>
                  )
                })}
            </div>
          </div>

          <div className="animate-in animate-in-delay-3">
            <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
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
                    {unreadCount > 0 && (
                      <Badge className="text-[10px] h-4 px-1.5 bg-primary text-primary-foreground">
                        {unreadCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="history" className="gap-1.5 text-xs">
                    History
                    <Badge
                      variant="secondary"
                      className="text-[10px] h-4 px-1.5"
                    >
                      {readCount}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                {search && (
                  <p className="text-xs text-muted-foreground">
                    {filtered.length} result
                    {filtered.length !== 1 ? "s" : ""} for &ldquo;{search}
                    &rdquo;
                  </p>
                )}
              </div>

              <TabsContent value="all" className="mt-0">
                <GroupedList
                  items={filtered}
                  onMarkRead={markRead}
                  onDelete={deleteNotification}
                  filtered={!!activeFilters}
                />
              </TabsContent>

              <TabsContent value="unread" className="mt-0">
                <GroupedList
                  items={filteredUnread}
                  onMarkRead={markRead}
                  onDelete={deleteNotification}
                  filtered={!!activeFilters}
                />
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                <GroupedList
                  items={filteredRead}
                  onMarkRead={markRead}
                  onDelete={deleteNotification}
                  filtered={!!activeFilters}
                />
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationsPage
