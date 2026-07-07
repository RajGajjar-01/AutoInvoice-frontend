import { useQuery } from "@tanstack/react-query"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router"
import { CustomerDetail } from "@/components/Customers/CustomerDetail"
import { Button } from "@/components/ui/button"
import { customerDetailQueryOptions } from "@/features/customers/queries"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="rounded-full bg-muted p-5 mb-5">
        <AlertTriangle className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Party not found</h2>
      <p className="text-muted-foreground text-sm mb-6 max-w-xs">
        This customer or supplier no longer exists, or the link may be
        incorrect.
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
  useDocumentTitle("Party Profile")
  const { customerId } = useParams<{ customerId: string }>()
  const navigate = useNavigate()

  const { data: customer, isLoading } = useQuery(
    customerDetailQueryOptions(customerId),
  )

  if (!isLoading && !customer) {
    return <NotFound />
  }

  const handleDeleted = () => {
    navigate("/customers")
  }

  if (!customer) return null

  return <CustomerDetail customer={customer} onDeleted={handleDeleted} />
}

export default CustomerDetailPage
