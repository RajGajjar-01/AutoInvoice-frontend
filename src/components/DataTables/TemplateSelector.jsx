import { FileText, Receipt, ScrollText, Users } from "lucide-react"
import { PREDEFINED_TEMPLATES } from "@/components/DataTables/tableStore"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Map of icon name string → lucide component
const ICON_MAP = {
  FileText,
  Users,
  Receipt,
  ScrollText,
}

/**
 * Props:
 *   onSelectTemplate – (template) => void
 */
export function TemplateSelector({ onSelectTemplate }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-medium">Choose a Template</p>
        <p className="text-sm text-muted-foreground mt-0.5">
          Start with a pre-built table structure for common business needs.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PREDEFINED_TEMPLATES.map((template) => {
          const Icon = ICON_MAP[template.icon] ?? FileText

          return (
            <Card
              key={template.id}
              className="rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/40"
            >
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-muted p-2 shrink-0">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <CardTitle className="text-sm font-semibold leading-snug">
                      {template.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {template.description}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-4 pb-4 flex items-center justify-between gap-3">
                <Badge variant="outline" className="text-xs font-normal">
                  {template.columns.length} column
                  {template.columns.length !== 1 ? "s" : ""}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs shrink-0"
                  onClick={() => onSelectTemplate(template)}
                >
                  Use Template
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default TemplateSelector
