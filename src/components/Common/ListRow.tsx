import type { ReactNode } from "react"
import { Link } from "react-router"
import { cn } from "@/lib/utils"

interface ListRowProps {
  /** The whole row opens this page. */
  to: string
  title: ReactNode
  subtitle?: ReactNode
  /** Avatar or icon at the start. */
  leading?: ReactNode
  /** Amount, badge or other short facts at the end. */
  trailing?: ReactNode
  /** Row menu. Stays clickable above the row link. */
  actions?: ReactNode
  /** view-transition-name for the title, matched on the detail page. */
  transitionName?: string
  className?: string
}

/** One phone list row: tap anywhere to open, menu at the end. */
export function ListRow({
  to,
  title,
  subtitle,
  leading,
  trailing,
  actions,
  transitionName,
  className,
}: ListRowProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-[4.5rem] items-center gap-3 bg-card px-4 py-3 transition-colors has-[a:active]:bg-accent",
        className,
      )}
    >
      {leading}
      <div className="min-w-0 flex-1">
        <Link
          to={to}
          viewTransition
          style={
            transitionName ? { viewTransitionName: transitionName } : undefined
          }
          className="block truncate font-semibold outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-inset"
        >
          {title}
        </Link>
        {subtitle && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      {trailing && (
        <div className="flex shrink-0 flex-col items-end gap-1 text-sm">
          {trailing}
        </div>
      )}
      {actions && <div className="relative z-10 -mr-2 shrink-0">{actions}</div>}
    </div>
  )
}

/** Bordered container for ListRows. */
export function ListRows({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "divide-y overflow-hidden rounded-xl border bg-card",
        className,
      )}
    >
      {children}
    </div>
  )
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?"

/** Round initials badge for people and businesses. */
export function InitialsAvatar({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary",
        className,
      )}
    >
      {initials(name)}
    </span>
  )
}
