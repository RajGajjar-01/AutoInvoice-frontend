import { MagnifyingGlass as Search, X } from "@phosphor-icons/react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
  id?: string
}

/** Search box with an icon and a clear button. */
export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
  id,
}: SearchInputProps) {
  return (
    <div className={cn("relative min-w-0 flex-1", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        id={id}
        type="search"
        enterKeyHint="search"
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-10 md:h-9 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute right-0 top-1/2 grid size-11 -translate-y-1/2 place-items-center text-muted-foreground hover:text-foreground sm:size-9"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
