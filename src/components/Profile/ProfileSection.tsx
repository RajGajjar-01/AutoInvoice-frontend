import type { LucideIcon } from "lucide-react"
import { Pencil, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProfileSectionProps {
  id: string
  icon: LucideIcon
  title: string
  description?: string
  isEditing: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  isSaving?: boolean
  viewContent: React.ReactNode
  editContent: React.ReactNode
  sectionRef?: React.Ref<HTMLElement>
}

export function ProfileSection({
  id,
  icon: Icon,
  title,
  description,
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
    <section
      id={id}
      ref={sectionRef}
      className="scroll-mt-24 border-b border-border/70 py-7 first:pt-0 last:border-0"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-lg border border-border bg-muted/40 p-2">
            <Icon className="h-4 w-4 text-foreground" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="h-9 gap-1"
                disabled={isSaving}
              >
                <X className="h-3.5 w-3.5" /> Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={onSave}
                disabled={isSaving}
                className="h-9 gap-1"
              >
                <Save className="h-3.5 w-3.5" /> {isSaving ? "Saving…" : "Save"}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-9 gap-1 text-muted-foreground hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit {title.toLowerCase()}
            </Button>
          )}
        </div>
      </div>
      <div>{isEditing ? editContent : viewContent}</div>
    </section>
  )
}
