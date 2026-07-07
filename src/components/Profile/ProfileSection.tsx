import type { LucideIcon } from "lucide-react"
import { Pencil, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProfileSectionProps {
  id: string
  icon: LucideIcon
  title: string
  isEditing: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  isSaving?: boolean
  viewContent: React.ReactNode
  editContent: React.ReactNode
  sectionRef?: React.Ref<HTMLDivElement>
}

export function ProfileSection({
  icon: Icon,
  title,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  viewContent,
  editContent,
  sectionRef,
}: ProfileSectionProps) {
  return (
    <div
      ref={sectionRef}
      className={cn(
        "rounded-xl border bg-card overflow-hidden transition-all duration-200",
        isEditing && "border-primary/40 shadow-sm ring-1 ring-primary/10",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between px-5 py-3 border-b",
          isEditing
            ? "bg-primary/5 border-primary/20"
            : "bg-muted/30 border-border",
        )}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "rounded-md p-1.5",
              isEditing ? "bg-primary/15" : "bg-primary/10",
            )}
          >
            <Icon className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-sm font-semibold">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="h-7 text-xs gap-1"
              >
                <X className="h-3.5 w-3.5" /> Cancel
              </Button>
              <Button
                size="sm"
                onClick={onSave}
                disabled={isSaving}
                className="h-7 text-xs gap-1"
              >
                <Save className="h-3.5 w-3.5" /> Save
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
          )}
        </div>
      </div>
      <div className="px-5 py-4">{isEditing ? editContent : viewContent}</div>
    </div>
  )
}
