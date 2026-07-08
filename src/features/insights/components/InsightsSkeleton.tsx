import { Skeleton } from "@/components/ui/skeleton"

export function InsightsSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl border bg-card p-6">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-72 rounded-xl border bg-card p-6">
          <Skeleton className="h-5 w-40 mb-4" />
          <Skeleton className="h-full w-full" />
        </div>
        <div className="h-72 rounded-xl border bg-card p-6">
          <Skeleton className="h-5 w-28 mb-4" />
          <Skeleton className="h-48 w-full rounded-full" />
        </div>
      </div>
    </div>
  )
}
