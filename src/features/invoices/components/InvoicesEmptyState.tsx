import { FilePlus, FileText } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"

export function InvoicesEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <FileText className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold mb-1">No invoices yet</h3>
      <p className="text-xs text-muted-foreground mb-4 max-w-xs">
        Create your first invoice to see it here.
      </p>
      <Link to="/create-invoice">
        <Button size="sm">
          <FilePlus className="mr-2 h-3.5 w-3.5" />
          Create Invoice
        </Button>
      </Link>
    </div>
  )
}
