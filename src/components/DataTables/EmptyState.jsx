import { Plus, Table2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function EmptyState({ onCreateClick }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="rounded-full bg-muted p-6">
        <Table2 className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">No tables yet</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Create your first smart table to track business data.
        </p>
      </div>
      <Button onClick={onCreateClick}>
        <Plus className="mr-2 h-4 w-4" />
        Create New Table
      </Button>
    </div>
  )
}

export default EmptyState
