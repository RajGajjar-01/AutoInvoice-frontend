import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { CustomerDetail } from "@/components/Customers/CustomerDetail"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { customerDetailQueryOptions } from "@/features/customers/queries"

export const Route = createFileRoute("/_layout/customers/$customerId")({
    component: CustomerDetailPage,
    head: () => ({
        meta: [{ title: "Party Profile" }],
    }),
})

function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="rounded-full bg-muted p-5 mb-5">
                <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Party not found</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
                This customer or supplier no longer exists, or the link may be incorrect.
            </p>
            <Link to="/customers">
                <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Customers
                </Button>
            </Link>
        </div>
    )
}

function CustomerDetailPage() {
    const { customerId } = Route.useParams()
    const navigate = useNavigate()

    const { data: customer, isLoading } = useQuery(customerDetailQueryOptions(customerId))

    if (!isLoading && !customer) {
        return <NotFound />
    }

    const handleDeleted = () => {
        navigate({ to: "/customers" })
    }

    if (!customer) return null

    return <CustomerDetail customer={customer} onDeleted={handleDeleted} />
}
