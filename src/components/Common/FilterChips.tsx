import type { Icon as LucideIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

export interface FilterChip<T extends string> {
  value: T
  label: string
  count?: number
  icon?: LucideIcon
}

interface FilterChipsProps<T extends string> {
  label: string
  options: FilterChip<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

/** One-line row of filter chips. Scrolls sideways on narrow screens. */
export function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: FilterChipsProps<T>) {
  return (
    <fieldset
      aria-label={label}
      className={cn(
        "-mx-4 flex min-w-0 gap-2 border-0 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:px-0",
        className,
      )}
    >
      {options.map(({ value: v, label: text, count, icon: Icon }) => {
        const active = v === value
        return (
          <button
            key={v}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(v)}
            className={cn(
              "inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors motion-safe:active:scale-95 sm:min-h-8",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {Icon && <Icon className="size-3.5" aria-hidden="true" />}
            {text}
            {count !== undefined && (
              <span
                className={cn(
                  "min-w-5 rounded-full px-1.5 text-center text-xs tabular-nums",
                  active ? "bg-primary-foreground/20" : "bg-muted",
                )}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </fieldset>
  )
}
