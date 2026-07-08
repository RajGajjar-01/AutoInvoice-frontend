import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ChevronDown, Plus } from "lucide-react"
import { useLayoutEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"

gsap.registerPlugin(ScrollTrigger)

/* ------------------------------------------------------------------ */
/*  Inline toggle (CSS-only style, no Switch dependency)              */
/* ------------------------------------------------------------------ */
function Toggle({ on }: { on: boolean }) {
  return (
    <div
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${on ? "bg-primary" : "bg-muted-foreground/20"}`}
    >
      <span
        className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5 ${on ? "translate-x-[18px] ml-0.5" : "translate-x-0.5"}`}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Bar chart mockup (pure CSS/inline)                                */
/* ------------------------------------------------------------------ */
const chartData = [
  { label: "Jul", value: 40, accent: false },
  { label: "Aug", value: 65, accent: false },
  { label: "Sep", value: 85, accent: true },
  { label: "Oct", value: 55, accent: false },
  { label: "Nov", value: 70, accent: false },
  { label: "Dec", value: 50, accent: false },
  { label: "Jan", value: 60, accent: false },
]

const yLabels = ["10K", "8K", "6K", "4K", "2K", "0"]

function BarChart() {
  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-end gap-1.5 h-[140px] relative">
        {/* Y-axis labels */}
        <div className="absolute -left-1 top-0 bottom-0 flex flex-col justify-between text-[10px] text-muted-foreground/60 -translate-x-full pr-2">
          {yLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {yLabels.map((label) => (
            <div
              key={label}
              className="chart-gridline border-t border-dashed border-muted-foreground/10 w-full origin-left"
            />
          ))}
        </div>
        {/* Bars */}
        {chartData.map((bar) => (
          <div
            key={bar.label}
            className="flex-1 flex flex-col items-center justify-end h-full relative z-10"
          >
            <div
              className={`chart-bar w-full max-w-[28px] rounded-t-md ${bar.accent ? "bg-primary" : "bg-foreground/10 dark:bg-foreground/15"}`}
              style={{ height: `${bar.value}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Notification items                                                */
/* ------------------------------------------------------------------ */
const notifications = [
  { label: "New invoices, payments, or reminders", on: true },
  { label: "Marketing emails", on: false },
  { label: "Announcement and Update", on: true },
  { label: "Reminders", on: true },
]

/* ------------------------------------------------------------------ */
/*  Activity feed                                                     */
/* ------------------------------------------------------------------ */
const activities = [
  {
    name: "Raj Patel",
    initials: "RP",
    color: "bg-primary/15 text-primary",
    message: "Could you send the invoice for March 12? Thank you in advance 😊",
    hasBar: true,
  },
  {
    name: "Priya Sharma",
    initials: "PS",
    color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    message: null,
    action: "Uploaded new invoice",
    hasBar: false,
  },
]

/* ================================================================== */
/*  Main component                                                    */
/* ================================================================== */
export function TechnologyShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      // Heading
      gsap.from(".tech-heading", {
        y: 20,
        opacity: 0,
        duration: 0.25,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".tech-heading",
          start: "top 90%",
          toggleActions: "play none none none",
        },
      })

      // Cards stagger
      const cards = gsap.utils.toArray<Element>(".tech-card")
      cards.forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          y: 30,
          duration: 0.35,
          delay: i * 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 92%",
            toggleActions: "play none none none",
          },
        })
      })

      // Dashboard chart: gridlines sweep in, then bars grow from the baseline
      gsap.from(".chart-gridline", {
        scaleX: 0,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".tech-card",
          start: "top 85%",
          toggleActions: "play none none none",
        },
      })

      gsap.from(".chart-bar", {
        scaleY: 0,
        transformOrigin: "bottom",
        duration: 0.6,
        delay: 0.2,
        stagger: 0.07,
        ease: "back.out(1.6)",
        scrollTrigger: {
          trigger: ".tech-card",
          start: "top 85%",
          toggleActions: "play none none none",
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        {/* ---- Header ---- */}
        <div className="tech-heading text-center mb-14">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl max-w-lg mx-auto">
            Latest advanced technologies to ensure everything you need
          </h2>
          <p className="mt-4 text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Maximize your team's productivity and security with our affordable,
            user-friendly invoice management system.
          </p>
        </div>

        {/* ---- Bento Grid ---- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
          {/* ===== Card 1: Dynamic Dashboard (full width) ===== */}
          <div className="tech-card md:col-span-2 rounded-2xl border border-primary/20 bg-primary p-6 md:p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Left: text */}
              <div className="flex flex-col justify-between h-full">
                <div>
                  <h3 className="font-display text-2xl md:text-[1.65rem] font-semibold tracking-tight mb-3 text-primary-foreground">
                    Dynamic dashboard
                  </h3>
                  <p className="text-sm text-primary-foreground/70 leading-relaxed max-w-sm">
                    AutoInvoice helps you work faster, smarter and more
                    efficiently, delivering the visibility and data-driven
                    insights to track revenue and manage invoices.
                  </p>
                </div>
                <button
                  type="button"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground text-primary px-5 py-2.5 text-sm font-medium transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] w-fit"
                >
                  Explore all
                </button>
              </div>

              {/* Right: chart mockup */}
              <div className="rounded-xl border bg-background p-5 text-foreground">
                {/* Chart header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span>Your Company</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <AvatarGroup>
                    {["AK", "BN", "CR", "DM"].map((initials) => (
                      <Avatar key={initials} size="sm">
                        <AvatarFallback className="text-[9px] font-medium bg-muted">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </AvatarGroup>
                </div>
                {/* Chart body */}
                <div className="pl-8">
                  <BarChart />
                </div>
              </div>
            </div>
          </div>

          {/* ===== Card 2: Smart Notifications (half) ===== */}
          <div className="tech-card rounded-2xl border bg-card p-6 md:p-8 shadow-sm flex flex-col">
            <h3 className="font-display text-xl md:text-2xl font-semibold tracking-tight mb-2">
              Smart notifications
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Easily accessible from the notifications center, calendar or email
              with the relevant activities.
            </p>

            {/* Email notification settings */}
            <div className="rounded-xl border bg-background/60 p-4 flex-1">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Email notification</span>
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Save
                </button>
              </div>
              <div className="space-y-4">
                {notifications.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-4"
                  >
                    <span className="text-xs text-muted-foreground leading-snug">
                      {item.label}
                    </span>
                    <Toggle on={item.on} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ===== Card 3: Invoice Activity (half) ===== */}
          <div className="tech-card rounded-2xl border bg-card p-6 md:p-8 shadow-sm flex flex-col">
            <h3 className="font-display text-xl md:text-2xl font-semibold tracking-tight mb-2">
              Invoice activity
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Discuss invoice queries, manage tasks, track approvals and
              progress in the workspace.
            </p>

            {/* Activity feed */}
            <div className="rounded-xl border bg-background/60 p-4 flex-1">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Activity</span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <Plus className="h-3 w-3" />
                  Message
                </button>
              </div>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.name} className="flex gap-3 items-start">
                    <Avatar size="sm" className="mt-0.5 shrink-0">
                      <AvatarFallback
                        className={`text-[9px] font-semibold ${activity.color}`}
                      >
                        {activity.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold">
                          {activity.name}
                        </span>
                        {activity.hasBar && (
                          <span className="ml-auto h-2.5 w-10 rounded-full bg-muted" />
                        )}
                      </div>
                      {activity.message ? (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Hello{" "}
                          <span className="font-semibold text-foreground">
                            @You
                          </span>
                          , {activity.message}
                        </p>
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="ml-auto h-2 w-16 rounded-full bg-muted" />
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-primary/10">
                              <svg
                                className="h-3 w-3 text-primary"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                              </svg>
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {activity.action}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
