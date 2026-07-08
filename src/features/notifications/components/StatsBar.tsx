import { Bell, Check } from "lucide-react"

interface StatsBarProps {
  totalCount: number
  unreadCount: number
  readCount: number
}

export function StatsBar({ totalCount, unreadCount, readCount }: StatsBarProps) {
  const items = [
    {
      label: "Total",
      value: totalCount,
      icon: Bell,
      accent: "from-primary/20 to-primary/5 border-primary/20",
      iconBg: "bg-primary/15",
      iconColor: "text-primary",
    },
    {
      label: "Unread",
      value: unreadCount,
      icon: Bell,
      accent: unreadCount > 0
        ? "from-amber-500/20 to-amber-500/5 border-amber-500/20"
        : "from-amber-500/5 to-transparent border-amber-500/10",
      iconBg: unreadCount > 0 ? "bg-amber-500/15" : "bg-amber-500/5",
      iconColor: unreadCount > 0 ? "text-amber-500" : "text-muted-foreground/50",
    },
    {
      label: "Read",
      value: readCount,
      icon: Check,
      accent: readCount > 0
        ? "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20"
        : "from-emerald-500/5 to-transparent border-emerald-500/10",
      iconBg: readCount > 0 ? "bg-emerald-500/15" : "bg-emerald-500/5",
      iconColor: readCount > 0 ? "text-emerald-500" : "text-muted-foreground/50",
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item, i) => {
        const Icon = item.icon
        return (
          <div
            key={item.label}
            className={`animate-in animate-in-delay-${i + 1} relative overflow-hidden rounded-xl border bg-gradient-to-b ${item.accent} p-4 transition-all hover:shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold tracking-tight">
                  {item.value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.label}
                </p>
              </div>
              <div className={`rounded-lg p-2 ${item.iconBg}`}>
                <Icon className={`h-4 w-4 ${item.iconColor}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
