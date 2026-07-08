import { Bell, Calendar, Check, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router"

export function HowItWorks() {
  const navigate = useNavigate()

  const steps = [
    {
      icon: Bell,
      color: "text-primary",
      bg: "bg-primary/10",
      text: "Open any Data Table and click the bell icon on a row",
    },
    {
      icon: Calendar,
      color: "text-rose-500",
      bg: "bg-rose-50 dark:bg-rose-950/40",
      text: "Set a reminder date and title",
    },
    {
      icon: Check,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      text: "Notifications appear here on the due date",
    },
  ]

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-in">
      <div className="rounded-2xl bg-gradient-to-b from-primary/10 to-primary/5 p-5 mb-6 ring-1 ring-primary/20">
        <Inbox className="h-10 w-10 text-primary/60" />
      </div>
      <h3 className="text-base font-semibold mb-1">No notifications yet</h3>
      <p className="text-xs text-muted-foreground/70 max-w-sm leading-relaxed mb-8">
        Reminders and alerts from your data tables will appear here. Get started
        by setting up a reminder.
      </p>

      <div className="flex flex-col gap-4 max-w-sm w-full">
        {steps.map(({ icon: Icon, color, bg, text }, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5 text-left"
          >
            <div
              className={`shrink-0 h-9 w-9 rounded-lg flex items-center justify-center ${bg}`}
            >
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground/80">
                Step {index + 1}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{text}</p>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="mt-6 gap-1.5 text-xs"
        onClick={() => navigate("/data-tables")}
      >
        <Inbox className="h-3.5 w-3.5" />
        Go to Data Tables
      </Button>
    </div>
  )
}
