import type { LucideIcon } from "lucide-react"
import { ChevronRight } from "lucide-react"
import { Link } from "react-router"

interface QuickActionRowProps {
  icon: LucideIcon
  iconClass?: string
  title: string
  description: string
  to: string
}

export function QuickActionRow({
  icon: Icon,
  iconClass,
  title,
  description,
  to,
}: QuickActionRowProps) {
  return (
    <Link to={to} className="group">
      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer">
        <div className={`rounded-lg p-2 shrink-0 ${iconClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground truncate">
            {description}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
      </div>
    </Link>
  )
}
