import type { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatCardProps {
  icon: LucideIcon
  title: string
  value: string | number
  sub?: string
  iconClass?: string
  valueClass?: string
}

export function StatCard({
  icon: Icon,
  title,
  value,
  sub,
  iconClass,
  valueClass,
}: StatCardProps) {
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
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  )
}
