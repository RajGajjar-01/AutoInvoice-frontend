import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface Plan {
  name: string
  price: string
  period: string
  renewalDate: string
  color: string
}

interface UsageItem {
  label: string
  current: number
  max: number
}

const DEMO_PLAN: Plan = {
  name: "Starter",
  price: "₹0",
  period: "month",
  renewalDate: "—",
  color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
}

const DEMO_USAGE: UsageItem[] = [
  { label: "Invoices Created", current: 42, max: 100 },
  { label: "Tables Created", current: 2, max: 5 },
  { label: "Team Members", current: 1, max: 1 },
]

export function PlanDetailsCard() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold">Current Plan</p>
        <Separator />
        <p className="text-xs text-muted-foreground">
          Demo — live data coming soon
        </p>

        <div className="rounded-xl border bg-muted/30 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">{DEMO_PLAN.name}</span>
              <Badge className={`${DEMO_PLAN.color} border-transparent`}>
                Free
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {DEMO_PLAN.price} / {DEMO_PLAN.period} · Renewal:{" "}
              {DEMO_PLAN.renewalDate}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm">Upgrade Plan</Button>
            <Button variant="outline" size="sm">
              View Invoice History
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold">Usage Summary</p>
        <Separator />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {DEMO_USAGE.map(({ label, current, max }) => {
            const pct = Math.min(Math.round((current / max) * 100), 100)
            return (
              <div
                key={label}
                className="rounded-xl border bg-card p-4 flex flex-col gap-3"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-2xl font-bold tabular-nums">
                    {current}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      / {max}
                    </span>
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold">Billing Address</p>
        <Separator />
        <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground flex flex-col gap-1">
          <p>Not set — billing address is pulled from your Business Details.</p>
          <Link
            to="/profile?tab=business"
            className="text-primary underline-offset-4 hover:underline text-xs"
          >
            Edit in Business Details →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PlanDetailsCard
