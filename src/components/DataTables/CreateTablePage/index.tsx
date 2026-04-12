import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import {
  Calendar,
  Check,
  DollarSign,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Tag,
  User,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { TablesService } from "@/client"
import { ColumnEditorPanel } from "@/components/DataTables/CreateTablePage/ColumnEditorPanel"
import { TablePreview } from "@/components/DataTables/CreateTablePage/TablePreview"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { getDataTableTemplateById } from "@/features/data-tables/templates"

interface Column {
  name: string
  type: string
  mandatory: boolean
  options: string[]
  _id: string
  _isBlank?: boolean
  _isDuplicate?: boolean
}

interface QuickAddField {
  label: string
  icon: typeof User
  type: string
}

// ─── Quick Add field presets ──────────────────────────────────────────────────
const QUICK_ADD_FIELDS: QuickAddField[] = [
  { label: "Name", icon: User, type: "Text" },
  { label: "Email", icon: Mail, type: "Text" },
  { label: "Phone", icon: Phone, type: "Text" },
  { label: "Amount", icon: DollarSign, type: "Amount (₹)" },
  { label: "Date", icon: Calendar, type: "Date" },
  { label: "Status", icon: Tag, type: "Status" },
  { label: "Notes", icon: MessageSquare, type: "Text" },
  { label: "Address", icon: MapPin, type: "Text" },
]

interface CreateTablePageProps {
  templateId?: string
}

// ─── CreateTablePage ──────────────────────────────────────────────────────────
export function CreateTablePage({ templateId }: CreateTablePageProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const tableNameRef = useRef<HTMLInputElement>(null)

  const [tableName, setTableName] = useState("")
  const [description, setDescription] = useState("")
  const [tableNameError, setTableNameError] = useState(false)
  const [columns, setColumns] = useState<Column[]>([
    {
      name: "",
      type: "Text",
      mandatory: false,
      options: [],
      _id: crypto.randomUUID(),
    },
  ])
  // Maps quick-add label → column _id so we can detect when it's deleted
  const [quickAddIds, setQuickAddIds] = useState<Record<string, string>>({})

  // Derived: which labels are currently present in the columns array
  const addedQuickFields = new Set(
    Object.entries(quickAddIds)
      .filter(([, id]) => columns.some((c) => c._id === id))
      .map(([label]) => label),
  )

  // Pre-fill from template
  useEffect(() => {
    if (!templateId) return
    const tpl = getDataTableTemplateById(templateId)
    if (!tpl) return
    setTableName(tpl.name)
    setColumns(tpl.columns.map((col) => ({ ...col, _id: crypto.randomUUID() })))
  }, [templateId])

  const handleAddColumn = () => {
    setColumns((prev) => [
      ...prev,
      {
        name: "",
        type: "Text",
        mandatory: false,
        options: [],
        _id: crypto.randomUUID(),
      },
    ])
  }

  // ── Quick Add handler ─────────────────────────────────────────────────────
  const handleQuickAdd = (field: QuickAddField) => {
    if (addedQuickFields.has(field.label)) return
    const newId = crypto.randomUUID()
    setColumns((prev) => [
      ...prev,
      {
        name: field.label,
        type: field.type,
        mandatory: false,
        options: [],
        _id: newId,
      },
    ])
    // Store the _id so we can track if this column gets deleted later
    setQuickAddIds((prev) => ({ ...prev, [field.label]: newId }))
  }

  // ── Validation & Submission ───────────────────────────────────────────────
  const validate = () => {
    if (!tableName.trim()) {
      setTableNameError(true)
      toast.error("Table name is required.")
      tableNameRef.current?.focus()
      return false
    }
    const names = columns.map((c) => c.name.trim())
    for (let i = 0; i < columns.length; i++) {
      if (!names[i]) {
        toast.error(
          `Column ${i + 1} has no name. Please fill in all field names.`,
        )
        return false
      }
    }
    const uniqueNames = new Set(names)
    if (uniqueNames.size !== names.length) {
      toast.error("Duplicate column names are not allowed.")
      return false
    }
    for (const col of columns) {
      if (
        col.type === "Dropdown" &&
        (!col.options || col.options.length === 0)
      ) {
        toast.error(
          `Dropdown column "${col.name}" must have at least one option.`,
        )
        return false
      }
    }
    return true
  }

  const createTableMutation = useMutation({
    mutationFn: async ({
      name,
      description,
      columns,
    }: {
      name: string
      description: string
      columns: Omit<Column, "_id" | "_isBlank" | "_isDuplicate">[]
    }) => {
      return TablesService.createTable({
        requestBody: {
          name,
          description: description || undefined,
          columns,
        },
      })
    },
    onSuccess: async (createdTable) => {
      await queryClient.invalidateQueries({ queryKey: ["tables"] })
      toast.success(`Table "${createdTable.name}" created successfully!`)
      navigate({
        to: "/data-tables/$tableId",
        params: { tableId: createdTable.id },
      })
    },
    onError: () => {
      toast.error("Failed to create table")
    },
  })

  const handleSave = () => {
    if (!validate()) return
    const cleanedColumns = columns.map(
      ({ _id, _isBlank, _isDuplicate, ...rest }) => rest,
    )
    createTableMutation.mutate({
      name: tableName.trim(),
      description: description.trim(),
      columns: cleanedColumns,
    })
  }

  const handleCancel = () => navigate({ to: "/data-tables" })

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-background">
      {/* ══════════════════════════════════════════════════════
                TOP BAR — title, subtitle, actions
            ══════════════════════════════════════════════════════ */}
      <div className="shrink-0 border-b border-border bg-background/95 backdrop-blur-sm">
        {/* Title row */}
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Create New Table
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Define your custom data structure. Fields you add will become
              columns in your table.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 px-4 text-muted-foreground"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-9 px-5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all active:scale-[0.98]"
              onClick={handleSave}
            >
              Save Table
            </Button>
          </div>
        </div>

        {/* Table Name + Description */}
        <div className="flex items-end gap-4 px-6 pb-4">
          <div className="flex flex-col gap-1.5 flex-1 max-w-sm">
            <Label htmlFor="table-name" className="text-xs font-medium">
              Table Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="table-name"
              ref={tableNameRef}
              placeholder="e.g. Invoice Tracker"
              value={tableName}
              onChange={(e) => {
                setTableName(e.target.value)
                if (tableNameError) setTableNameError(false)
              }}
              className={`h-9 text-sm ${tableNameError ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {tableNameError && (
              <p className="text-[11px] text-destructive">
                Table name is required
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5 flex-1 max-w-md">
            <Label
              htmlFor="table-desc"
              className="text-xs font-medium text-muted-foreground"
            >
              Description <span className="font-normal">(optional)</span>
            </Label>
            <Input
              id="table-desc"
              placeholder="What is this table used for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
                QUICK ADD STRIP
            ══════════════════════════════════════════════════════ */}
      <div className="shrink-0 border-b border-border bg-muted/30 px-6 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
            ⚡ Quick Add
          </span>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex flex-wrap gap-2">
            {QUICK_ADD_FIELDS.map((field) => {
              const added = addedQuickFields.has(field.label)
              const Icon = field.icon
              return (
                <button
                  key={field.label}
                  type="button"
                  disabled={added}
                  onClick={() => handleQuickAdd(field)}
                  className={`
                                        inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium
                                        transition-all duration-200
                                        ${
                                          added
                                            ? "border-primary/30 bg-primary/8 text-primary/60 cursor-not-allowed"
                                            : "border-border bg-background text-foreground hover:border-primary hover:bg-primary/5 hover:text-primary cursor-pointer active:scale-95"
                                        }
                                    `}
                >
                  {added ? (
                    <Check className="h-3 w-3 text-primary/60" />
                  ) : (
                    <Icon className="h-3 w-3" />
                  )}
                  {field.label}
                  {added ? (
                    <span className="text-[10px] text-primary/50 ml-0.5">
                      Added
                    </span>
                  ) : (
                    <Plus className="h-2.5 w-2.5 text-muted-foreground/60" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
                SPLIT CONTENT — Preview (flex-1) | Builder (w-80)
            ══════════════════════════════════════════════════════ */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <TablePreview
          columns={columns}
          setColumns={setColumns}
          onAddColumn={handleAddColumn}
        />

        <ColumnEditorPanel
          columns={columns}
          setColumns={setColumns}
          onAddColumn={handleAddColumn}
        />
      </div>
    </div>
  )
}

export default CreateTablePage
