import { CircleDashed } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { statusIcon, statusVariant } from "../constants"

interface StatusBadgeProps {
  status: string
  onClick?: () => void
}

export function StatusBadge({ status, onClick }: StatusBadgeProps) {
  const Icon = statusIcon[status] ?? CircleDashed
  return (
    <Badge
      variant={statusVariant[status] ?? "outline"}
      className={`capitalize gap-1 text-xs ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  )
}
