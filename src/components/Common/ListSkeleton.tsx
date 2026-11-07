import { Skeleton } from "@/components/ui/skeleton"

/** Loading state shaped like PageHeader + search + ListRows / table. */
export function ListSkeleton({
  rows = 6,
  avatar = false,
}: {
  rows?: number
  avatar?: boolean
}) {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="hidden h-8 w-44 md:block" />
          <Skeleton className="h-4 w-60" />
        </div>
        <Skeleton className="hidden h-9 w-32 md:block" />
      </div>
      <Skeleton className="h-11 w-full md:h-9 md:max-w-sm" />
      <div className="flex gap-2">
        {[64, 80, 72, 60].map((w) => (
          <Skeleton
            key={w}
            className="h-10 rounded-full md:h-8"
            style={{ width: w }}
          />
        ))}
      </div>
      <div className="divide-y overflow-hidden rounded-xl border bg-card">
        {Array.from({ length: rows }, (_, i) => (
          <div
            key={i}
            className="flex min-h-[4.5rem] items-center gap-3 px-4 py-3"
          >
            {avatar && <Skeleton className="size-10 shrink-0 rounded-full" />}
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3 max-w-60" />
              <Skeleton className="h-3 w-1/2 max-w-40" />
            </div>
            <div className="flex flex-col items-end gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
