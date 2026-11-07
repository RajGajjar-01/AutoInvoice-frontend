import type { LucideIcon } from "lucide-react"
import { Link } from "react-router"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface QuickAction {
  label: string
  icon: LucideIcon
  /** In-app route. */
  to?: string
  /** External or tel:/mailto: link. */
  href?: string
  onClick?: () => void
  primary?: boolean
  destructive?: boolean
}

/**
 * The main actions of a detail page. Phones: equal tiles in one row, icon over
 * label, like a contact card. Wider screens: a row of normal buttons.
 */
export function QuickActions({
  actions,
  className,
}: {
  actions: (QuickAction | false | null | undefined)[]
  className?: string
}) {
  const list = actions.filter(Boolean) as QuickAction[]
  return (
    <div
      className={cn(
        "grid gap-2 sm:flex sm:flex-wrap",
        list.length > 3 ? "grid-cols-4" : "grid-cols-3",
        className,
      )}
    >
      {list.map(
        ({ label, icon: Icon, to, href, onClick, primary, destructive }) => {
          const inner = (
            <>
              <Icon aria-hidden="true" />
              <span className="max-sm:text-xs">{label}</span>
            </>
          )
          const className = cn(
            buttonVariants({
              variant: primary ? "default" : "outline",
              size: "lg",
            }),
            "max-sm:h-auto max-sm:flex-col max-sm:gap-1.5 max-sm:rounded-xl max-sm:px-1 max-sm:py-3 max-sm:[&_svg]:size-5",
            destructive &&
              "text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10",
          )
          return to ? (
            <Link key={label} to={to} className={className}>
              {inner}
            </Link>
          ) : href ? (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className={className}
            >
              {inner}
            </a>
          ) : (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className={className}
            >
              {inner}
            </button>
          )
        },
      )}
    </div>
  )
}
