import { useMutation } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { ArrowLeft, Check, FileSpreadsheet, Upload } from "lucide-react"
import { useCallback, useState } from "react"
import { toast } from "sonner"
import { InvoiceTemplatesService } from "@/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"

interface ParsedColumn {
  name: string
  index: number
  mapped_to?: string
}

interface ParsedData {
  columns: ParsedColumn[]
  data: Record<string, unknown>[]
  total_rows: number
  column_mapping?: Record<string, string>
}

interface ExcelImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ExcelImportDialog({
  open,
  onOpenChange,
  onSuccess,
}: ExcelImportDialogProps) {
  const [step, setStep] = useState<"upload" | "preview" | "saving">("upload")
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [templateName, setTemplateName] = useState("")
  const [isDragging, setIsDragging] = useState(false)

  const parseMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)

      const response = await api.post<ParsedData>(
        "/api/v1/invoice-templates/parse-excel",
        formData,
      )
      return response.data
    },
    onSuccess: (data: ParsedData) => {
      setParsedData(data)
      setStep("preview")
    },
    onError: (error: Error) => {
      if (error instanceof AxiosError) {
        const detail =
          typeof error.response?.data === "object" &&
          error.response?.data &&
          "detail" in error.response.data
            ? String(error.response.data.detail)
            : error.message
        toast.error(detail || "Failed to parse Excel file")
        return
      }
      toast.error(error.message || "Failed to parse Excel file")
    },
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      return InvoiceTemplatesService.createInvoiceTemplate({
        requestBody: {
          name: templateName || "Imported Excel Template",
          kind: "imported_excel",
          imported_excel_columns: parsedData?.column_mapping,
          imported_excel_data: parsedData?.data,
          is_active: true,
        },
      })
    },
    onSuccess: () => {
      toast.success("Excel template imported successfully!")
      setStep("upload")
      setFile(null)
      setParsedData(null)
      setTemplateName("")
      onOpenChange(false)
      if (onSuccess) onSuccess()
    },
    onError: () => {
      toast.error("Failed to save template")
    },
  })

  const handleFileSelect = useCallback(
    (selectedFile: File | null) => {
      if (!selectedFile) return

      const allowedExtensions = [".xlsx", ".xls"]
      if (
        !allowedExtensions.some((ext) =>
          selectedFile.name.toLowerCase().endsWith(ext),
        )
      ) {
        toast.error("Please upload an Excel file (.xlsx or .xls)")
        return
      }

      setFile(selectedFile)
      setTemplateName(selectedFile.name.replace(/\.(xlsx|xls)$/i, ""))
      parseMutation.mutate(selectedFile)
    },
    [parseMutation],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) {
        handleFileSelect(droppedFile)
      }
    },
    [handleFileSelect],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleReset = () => {
    setStep("upload")
    setFile(null)
    setParsedData(null)
    setTemplateName("")
  }

  const handleClose = () => {
    handleReset()
    onOpenChange(false)
  }

  const mappedFields = parsedData?.columns?.filter((c) => c.mapped_to) || []
  const unmappedColumns = parsedData?.columns?.filter((c) => !c.mapped_to) || []

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            Import Excel Invoice Template
          </DialogTitle>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload an Excel file with your invoice data. The app will
              auto-detect columns like Item Name, Quantity, Price, Tax, etc.
            </p>

            <button
              type="button"
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer w-full ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-full bg-green-100 p-4">
                  <Upload className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">
                    Drag and drop your Excel file here
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or click to browse
                  </p>
                </div>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  id="excel-upload"
                  onChange={(e) =>
                    handleFileSelect(e.target.files?.[0] ?? null)
                  }
                />
                <Label htmlFor="excel-upload" className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <span>Browse Files</span>
                  </Button>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Supported formats: .xlsx, .xls
                </p>
              </div>
            </button>

            {parseMutation.isPending && (
              <div className="text-center py-4">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">
                  Parsing Excel file...
                </p>
              </div>
            )}
          </div>
        )}

        {step === "preview" && parsedData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Upload Different File
              </Button>
              <div className="text-sm text-muted-foreground">
                {parsedData.total_rows} rows found
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="My Excel Template"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-6">
                <FileSpreadsheet className="h-4 w-4" />
                {file?.name}
              </div>
            </div>

            {/* Detected columns */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">
                Auto-Detected Column Mappings
              </h4>

              {mappedFields.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {mappedFields.map((col, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-full text-xs"
                    >
                      <Check className="h-3 w-3 text-green-600" />
                      <span className="text-green-700 font-medium">
                        {col.mapped_to}:
                      </span>
                      <span className="text-green-600">{col.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {unmappedColumns.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">
                    Unmapped columns:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {unmappedColumns.map((col, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground"
                      >
                        {col.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {mappedFields.length === 0 && (
                <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                  No columns auto-detected. You can still save the template and
                  map columns manually.
                </p>
              )}
            </div>

            {/* Preview data */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">
                Data Preview (first 5 rows)
              </h4>
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted">
                    <tr>
                      {parsedData.columns?.slice(0, 6).map((col, idx) => (
                        <th
                          key={idx}
                          className="px-2 py-1.5 text-left font-medium"
                        >
                          {col.name}
                          {col.mapped_to && (
                            <span className="ml-1 text-green-600">
                              → {col.mapped_to}
                            </span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.data?.slice(0, 5).map((row, rowIdx) => (
                      <tr key={rowIdx} className="border-t">
                        {parsedData.columns?.slice(0, 6).map((col, colIdx) => (
                          <td key={colIdx} className="px-2 py-1.5">
                            {String(row[`col_${col.index}`] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Saving..." : "Save Template"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
