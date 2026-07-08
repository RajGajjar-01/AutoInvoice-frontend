import { FilePlus, FileText, Search } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"

interface HistoryEmptyStateProps {
  hasSearch: boolean
}

export function HistoryEmptyState({ hasSearch }: HistoryEmptyStateProps) {
  if (hasSearch) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Search className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-1">No results found</h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search or filter.
        </p>
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="rounded-full bg-muted p-5 mb-5">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-xs">
        Create your first invoice to see it here in your history.
      </p>
      <Link to="/create-invoice">
        <Button>
          <FilePlus className="mr-2 h-4 w-4" /> Create Invoice
        </Button>
      </Link>
    </div>
  )
}
