import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-in">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-36" />
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
          <Skeleton className="h-5 w-32 mb-6" />
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full mb-3" />
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-48 rounded-xl border bg-card p-6">
            <Skeleton className="h-5 w-24 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="h-36 rounded-xl border bg-card p-6">
            <Skeleton className="h-5 w-24 mb-4" />
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-full mb-2" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
