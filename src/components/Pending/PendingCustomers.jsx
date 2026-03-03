import { Skeleton } from "@/components/ui/skeleton"

function PendingCustomers() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-36" />
            </div>
            <Skeleton className="h-10 w-64" />
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                ))}
            </div>
        </div>
    )
}

export default PendingCustomers
