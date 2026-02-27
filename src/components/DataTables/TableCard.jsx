import { Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function TableCard({ table, onDelete, onRename, onDuplicate, onOpen }) {
  const [renameOpen, setRenameOpen] = useState(false)
  const [renameValue, setRenameValue] = useState("")

  const openRename = () => {
    setRenameValue(table.name)
    setRenameOpen(true)
  }

  const commitRename = () => {
    const trimmed = renameValue.trim()
    if (trimmed && trimmed !== table.name) {
      onRename(table.id, trimmed)
    }
    setRenameOpen(false)
  }

  const previewColumns = table.columns.slice(0, 4)

  return (
    <>
      <div
        className="group relative aspect-square cursor-pointer"
        onClick={() => onOpen?.(table.id)}
      >
        <Card className="h-full w-full rounded-xl border shadow-sm transition-all duration-200 group-hover:shadow-md overflow-hidden">
          <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold truncate leading-snug">
              {table.name}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Table options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    openRename()
                  }}
                >
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onDuplicate(table.id)
                  }}
                >
                  <Copy className="mr-2 h-3.5 w-3.5" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(table.id)
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>

          <CardContent className="flex flex-col gap-1.5 px-4 pb-4">
            {/* Description — show if present */}
            {table.description && (
              <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2 mb-0.5">
                {table.description}
              </p>
            )}
            {previewColumns.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No columns</p>
            ) : (
              previewColumns.map((col, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-2 rounded bg-muted px-2 py-1"
                >
                  <span className="text-xs text-muted-foreground truncate">
                    {col.name || "Untitled"}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 shrink-0"
                  >
                    {col.type}
                  </Badge>
                </div>
              ))
            )}
            {table.columns.length > 4 && (
              <p className="text-xs text-muted-foreground mt-1">
                +{table.columns.length - 4} more column
                {table.columns.length - 4 > 1 ? "s" : ""}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Hover overlay — bottom strip only, never covers the header */}
        <div className="absolute inset-x-0 bottom-0 rounded-b-xl flex items-end justify-center pb-4 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none bg-gradient-to-t from-background/80 to-transparent">
          <Button
            variant="secondary"
            size="sm"
            className="shadow-sm pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation()
              onOpen?.(table.id)
            }}
          >
            Open table →
          </Button>
        </div>
      </div>

      {/* ── Rename Dialog ── */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename table</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <Label htmlFor="rename-input" className="text-sm">Table name</Label>
            <Input
              id="rename-input"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") commitRename() }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={commitRename}
              disabled={!renameValue.trim() || renameValue.trim() === table.name}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default TableCard
