import type { LucideIcon } from "lucide-react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface InsightsKpiCardProps {
  icon: LucideIcon
  title: string
  value: string
  sub?: string
  trend?: number | null
  trendUp?: boolean
  iconClass: string
  valueClass?: string
}

export function InsightsKpiCard({
  icon: Icon,
  title,
  value,
  sub,
  trend,
  trendUp,
  iconClass,
  valueClass,
}: InsightsKpiCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`rounded-lg p-2 ${iconClass}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueClass ?? ""}`}>{value}</div>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {trend !== null && trend !== undefined && (
            <Badge
              variant={trendUp ? "default" : "destructive"}
              className="text-xs font-medium gap-0.5 px-1.5"
            >
              {trendUp ? (
                <TrendingUp className="h-2.5 w-2.5" />
              ) : (
                <TrendingDown className="h-2.5 w-2.5" />
              )}
              {Math.abs(trend)}%
            </Badge>
          )}
          {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
        </div>
      </CardContent>
    </Card>
  )
}
