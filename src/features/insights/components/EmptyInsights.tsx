import { FileText, LineChart as LineChartIcon } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"

export function EmptyInsights() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-6 animate-in">
      <div className="rounded-full bg-muted p-6">
        <LineChartIcon className="h-10 w-10 text-muted-foreground" />
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">No financial data yet</h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Create your first invoice to see insights here.
        </p>
      </div>
      <div className="flex gap-3">
        <Link to="/create-invoice">
          <Button>
            <FileText className="mr-2 h-4 w-4" /> Create Invoice
          </Button>
        </Link>
      </div>
    </div>
  )
}
