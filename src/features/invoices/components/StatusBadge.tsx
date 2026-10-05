import { CircleDashed } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { statusIcon, statusVariant } from "../constants"

interface StatusBadgeProps {
  status: string
  onClick?: () => void
}

export function StatusBadge({ status, onClick }: StatusBadgeProps) {
  const Icon = statusIcon[status] ?? CircleDashed
  if (onClick) {
    return (
      <Badge
        asChild
        variant={statusVariant[status] ?? "outline"}
        className="min-h-11 gap-1 px-3 capitalize sm:min-h-0 sm:px-2"
      >
        <button
          type="button"
          onClick={onClick}
          aria-label={`Change status from ${status}`}
        >
          <Icon className="h-3 w-3" />
          {status}
        </button>
      </Badge>
    )
  }
  return (
    <Badge
      variant={statusVariant[status] ?? "outline"}
      className="capitalize gap-1 text-xs"
    >
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  )
}
