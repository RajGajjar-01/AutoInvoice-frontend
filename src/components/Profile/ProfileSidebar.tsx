import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { AlertCircle, Building2, CheckCircle2, Circle } from "lucide-react"

export type SectionStatus = "complete" | "incomplete" | "empty"

export interface NavSection {
  id: string
  label: string
  icon: LucideIcon
  status: SectionStatus
}

interface ProfileSidebarProps {
  logo: string | null
  name: string
  tagline: string
  sections: NavSection[]
  activeSection: string
  onNavClick: (id: string) => void
  completedCount: number
  totalCount: number
}

export function ProfileSidebar({
  logo,
  name,
  sections,
  activeSection,
  onNavClick,
  completedCount,
  totalCount,
}: ProfileSidebarProps) {
  const pct =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="flex flex-col gap-1">
      {/* Company identity — left-aligned, no card, no banner */}
      <div className="flex items-center gap-3 px-3 py-3 mb-1">
        <div className="h-9 w-9 rounded-lg border bg-muted flex items-center justify-center overflow-hidden shrink-0">
          {logo ? (
            <img
              src={logo}
              alt="logo"
              className="h-full w-full object-contain p-0.5"
            />
          ) : (
            <Building2 className="h-4 w-4 text-muted-foreground/50" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate leading-tight">
            {name || "Your Company"}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[11px] text-muted-foreground shrink-0">
              {completedCount}/{totalCount}
            </span>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5">
        {sections.map((section) => {
          const Icon = section.icon
          const isActive = activeSection === section.id
          return (
            <button
              key={section.id}
              onClick={() => onNavClick(section.id)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left w-full",
                isActive
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{section.label}</span>
              {section.status === "complete" && (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
              )}
              {section.status === "incomplete" && (
                <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              )}
              {section.status === "empty" && (
                <Circle className="h-3.5 w-3.5 text-muted-foreground/25 shrink-0" />
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
