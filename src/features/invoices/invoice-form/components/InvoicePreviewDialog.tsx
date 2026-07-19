import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface InvoicePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  html: string
  onDownload: () => void
  title?: string
}

export function InvoicePreviewDialog({
  open,
  onOpenChange,
  html,
  onDownload,
  title,
}: InvoicePreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title ?? "Document Preview"}</DialogTitle>
        </DialogHeader>
        <iframe
          title="invoice-preview"
          srcDoc={open ? html : ""}
          className="w-full flex-1 rounded-md border bg-background"
          style={{ minHeight: "65vh" }}
          sandbox="allow-same-origin"
        />
        <div className="flex justify-end gap-2 mt-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={onDownload}>
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
