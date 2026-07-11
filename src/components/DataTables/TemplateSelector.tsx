import {
  BadgeDollarSign,
  Building2,
  ClipboardList,
  FileText,
  FolderKanban,
  Receipt,
  RefreshCw,
  ScrollText,
  UserRoundSearch,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DATA_TABLE_TEMPLATES,
  type DataTableTemplate,
} from "@/features/data-tables/templates"

// Map of icon name string → lucide component
const ICON_MAP: Record<string, typeof FileText> = {
  BadgeDollarSign,
  Building2,
  ClipboardList,
  FileText,
  FolderKanban,
  Users,
  Receipt,
  RefreshCw,
  ScrollText,
  UserRoundSearch,
}

interface TemplateSelectorProps {
  onSelectTemplate: (template: DataTableTemplate) => void
}

/**
 * Props:
 *   onSelectTemplate – (template) => void
 */
export function TemplateSelector({ onSelectTemplate }: TemplateSelectorProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-semibold tracking-tight text-foreground/90">
          Choose a Template
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Start with a pre-built table structure for common business needs.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {DATA_TABLE_TEMPLATES.map((template) => {
          const Icon = ICON_MAP[template.icon] ?? FileText

          return (
            <Card
              key={template.id}
              className="relative rounded-2xl border border-border/30 bg-card/30 dark:bg-[#151922]/40 backdrop-blur-md shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:-translate-y-1 overflow-hidden flex flex-col justify-between group"
            >
              {/* Uniform top indicator bar */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary/40 group-hover:bg-primary transition-colors duration-300" />

              <CardHeader className="pb-3 pt-6 px-5">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-muted p-2.5 shrink-0 border border-border/40 transition-all duration-300 group-hover:scale-105 group-hover:border-border/80">
                    <Icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors duration-300" />
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <CardTitle className="text-sm font-bold leading-none tracking-tight text-foreground/90">
                      {template.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                      {template.description}
                    </p>
                    <Badge className="mt-2.5 w-fit text-[9px] font-semibold uppercase tracking-wider bg-muted text-muted-foreground border-none shadow-none hover:bg-muted">
                      {template.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-5 pb-5 pt-1 flex items-center justify-between gap-3 border-t border-border/20 mt-2 bg-muted/10 dark:bg-muted/5">
                <Badge
                  variant="outline"
                  className="text-[10px] font-medium text-muted-foreground/80 bg-background/50 border-border/40 px-2 py-0.5 rounded-md"
                >
                  {template.columns.length} column
                  {template.columns.length !== 1 ? "s" : ""}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs font-medium shrink-0 h-8 border-border/40 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shadow-sm"
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
