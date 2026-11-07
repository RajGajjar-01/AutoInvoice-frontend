import type { ReactNode } from "react"

interface PageHeaderProps {
  title: string
  description?: string
  /** One or two buttons. Phones show them beside the description. */
  actions?: ReactNode
}

/**
 * Page title row. On phones the title is in the sticky app header, so here it
 * is only for screen readers and the description sits beside the actions.
 */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 animate-in">
      <div className="min-w-0 flex-1 basis-40">
        <h1 className="font-display text-2xl font-bold tracking-tight max-md:sr-only">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground md:mt-1">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  )
}
