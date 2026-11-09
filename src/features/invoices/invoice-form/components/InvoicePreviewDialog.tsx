import { DownloadSimple as Download } from "@phosphor-icons/react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const PAGE_WIDTH = 794 // A4 at 96dpi, matches the template's .page max-width

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
  // Dialog content mounts only when open, so a callback ref re-measures each time.
  const [box, setBox] = useState<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ w: PAGE_WIDTH })
  useEffect(() => {
    if (!box) return
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width }))
    ro.observe(box)
    return () => ro.disconnect()
  }, [box])
  const [docH, setDocH] = useState(1123) // A4 height until the page reports its own
  const scale = Math.min(1, size.w / PAGE_WIDTH)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[88dvh] sm:max-w-3xl overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title ?? "Document Preview"}</DialogTitle>
        </DialogHeader>
        <div
          ref={setBox}
          className="min-h-0 flex-1 overflow-y-auto rounded-md bg-muted/60 p-0 sm:p-3"
        >
          <div
            className="mx-auto overflow-hidden bg-white shadow-md sm:rounded-sm"
            style={{ width: PAGE_WIDTH * scale, height: docH * scale }}
          >
            <iframe
              title="invoice-preview"
              srcDoc={open ? html : ""}
              sandbox="allow-same-origin"
              scrolling="no"
              onLoad={(e) =>
                setDocH(
                  e.currentTarget.contentDocument?.body.scrollHeight ?? 1123,
                )
              }
              className="block border-0 bg-white"
              style={{
                width: PAGE_WIDTH,
                height: docH,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            />
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-2 mt-3">
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
