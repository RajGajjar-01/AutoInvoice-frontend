import type { LucideIcon } from "lucide-react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface KpiCardProps {
  icon: LucideIcon
  title: string
  value: string | number
  sub?: string
  trend?: number
  trendUp?: boolean
  iconClass?: string
  valueClass?: string
  delay?: number
}

export function KpiCard({
  icon: Icon,
  title,
  value,
  sub,
  trend,
  trendUp,
  iconClass,
  valueClass,
  delay = 0,
}: KpiCardProps) {
  return (
    <Card
      className="hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
      style={{ animationDelay: `${delay}ms` }}
    >
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
        <div className="flex items-center gap-1.5 mt-1.5">
          {trend !== undefined && (
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
