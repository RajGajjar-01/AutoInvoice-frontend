import { Braces, Download, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TableColumn {
  name: string
  type: string
}

interface Table {
  name: string
  columns: TableColumn[]
}

interface Row {
  [key: string]: unknown
}

// ─── Download helper ──────────────────────────────────────────────────────────
function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── CSV export ───────────────────────────────────────────────────────────────
function exportAsCSV(table: Table, rows: Row[]) {
  const cols = table.columns.map((c) => c.name)
  const escape = (val: unknown) => {
    const str = val == null ? "" : String(val)
    return str.includes(",") || str.includes('"') || str.includes("\n")
      ? `"${str.replace(/"/g, '""')}"`
      : str
  }

  const header = cols.map(escape).join(",")
  const dataRows = rows.map((row) =>
    cols.map((col) => escape(row[col])).join(","),
  )
  const csv = [header, ...dataRows].join("\n")
  triggerDownload(csv, `${table.name}.csv`, "text/csv;charset=utf-8;")
}

// ─── JSON export ──────────────────────────────────────────────────────────────
function exportAsJSON(table: Table, rows: Row[]) {
  const json = JSON.stringify(rows, null, 2)
  triggerDownload(json, `${table.name}.json`, "application/json")
}

interface ExportMenuProps {
  table: Table
  rows: Row[]
}

/**
 * Props:
 *   table – table object (with .name and .columns)
 *   rows  – currently visible/filtered rows array
 */
export function ExportMenu({ table, rows }: ExportMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {/* CSV */}
        <DropdownMenuItem
          onClick={() => exportAsCSV(table, rows)}
          className="gap-2 cursor-pointer"
        >
          <FileText className="h-4 w-4 shrink-0" />
          Export as CSV
        </DropdownMenuItem>

        {/* JSON */}
        <DropdownMenuItem
          onClick={() => exportAsJSON(table, rows)}
          className="gap-2 cursor-pointer"
        >
          <Braces className="h-4 w-4 shrink-0" />
          Export as JSON
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Excel — coming soon */}
        <DropdownMenuItem disabled className="gap-2">
          <FileText className="h-4 w-4 shrink-0 opacity-50" />
          <span className="opacity-50">Export as Excel</span>
          <Badge
            variant="outline"
            className="ml-auto text-[10px] py-0 px-1 opacity-60"
          >
            Soon
          </Badge>
        </DropdownMenuItem>

        {/* PDF — coming soon */}
        <DropdownMenuItem disabled className="gap-2">
          <FileText className="h-4 w-4 shrink-0 opacity-50" />
          <span className="opacity-50">Export as PDF</span>
          <Badge
            variant="outline"
            className="ml-auto text-[10px] py-0 px-1 opacity-60"
          >
            Soon
          </Badge>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ExportMenu
