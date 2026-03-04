import { Skeleton } from "@/components/ui/skeleton"

function PendingCustomers() {
    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-36" />
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-lg border border-border p-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-8 rounded-lg" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex gap-3">
                <Skeleton className="h-10 flex-1 max-w-sm" />
                <Skeleton className="h-10 w-36" />
            </div>

            {/* Table */}
            <div className="space-y-2">
                <Skeleton className="h-10 w-full rounded-md" />
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-md" />
                ))}
            </div>
        </div>
    )
}

export default PendingCustomers
