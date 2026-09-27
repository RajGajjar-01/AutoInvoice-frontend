import { Building2, Camera, Eye, EyeOff, Trash2, Upload } from "lucide-react"
import { useId, useRef, useState } from "react"
import { useController, useFormContext } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { maskAccountNumber, maskPan } from "@/lib/validation"

export function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string
  value?: string | null
  mono?: boolean
}) {
  if (!value) return null
  return (
    <div className="grid gap-1 border-b border-border/40 py-3 last:border-0 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`text-sm font-medium break-words ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  )
}

export function MaskedInfoRow({
  label,
  value,
  maskType = "account",
}: {
  label: string
  value?: string | null
  maskType?: "account" | "pan"
}) {
  const [revealed, setRevealed] = useState(false)
  if (!value) return null

  const displayedValue = revealed
    ? value
    : maskType === "account"
      ? maskAccountNumber(value)
      : maskPan(value)

  return (
    <div className="grid gap-1 border-b border-border/40 py-3 last:border-0 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium font-mono">{displayedValue}</span>
        <button
          type="button"
          onClick={() => setRevealed((prev) => !prev)}
          className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
          aria-label={
            revealed
              ? `Hide ${label.toLowerCase()}`
              : `Reveal ${label.toLowerCase()}`
          }
        >
          {revealed ? (
            <EyeOff className="h-3.5 w-3.5" />
          ) : (
            <Eye className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-dashed px-4 py-5 text-sm text-muted-foreground">
      {message}
    </p>
  )
}

export function Field({
  name,
  label,
  placeholder,
  type = "text",
  required,
  helperText,
  mono,
  multiline = false,
  autoComplete,
}: {
  name: string
  label: string
  placeholder?: string
  type?: string
  required?: boolean
  helperText?: string
  mono?: boolean
  multiline?: boolean
  autoComplete?: string
}) {
  const { control } = useFormContext()
  const { field, fieldState } = useController({ name, control })
  const id = useId()
  return (
    <div className="space-y-1.5 min-w-0">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {multiline ? (
        <Textarea
          id={id}
          value={field.value ?? ""}
          onChange={field.onChange}
          onBlur={field.onBlur}
          name={field.name}
          ref={field.ref}
          placeholder={placeholder}
          aria-invalid={fieldState.invalid}
          aria-describedby={
            fieldState.error
              ? `${id}-error`
              : helperText
                ? `${id}-help`
                : undefined
          }
          className={mono ? "font-mono" : ""}
        />
      ) : (
        <Input
          id={id}
          type={type}
          value={field.value ?? ""}
          onChange={field.onChange}
          onBlur={field.onBlur}
          name={field.name}
          ref={field.ref}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={fieldState.invalid}
          aria-describedby={
            fieldState.error
              ? `${id}-error`
              : helperText
                ? `${id}-help`
                : undefined
          }
          className={mono ? "font-mono" : ""}
        />
      )}
      {fieldState.error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {fieldState.error.message}
        </p>
      ) : helperText ? (
        <p id={`${id}-help`} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      ) : null}
    </div>
  )
}

export function LogoUpload({
  logo,
  onLogoChange,
}: {
  logo: string | null
  onLogoChange: (value: string | null) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      toast.error("Logo must be a PNG, JPG, or WebP image.")
      e.target.value = ""
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo is larger than 2 MB. Choose a smaller image.")
      e.target.value = ""
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      onLogoChange(ev.target?.result as string)
      e.target.value = ""
    }
    reader.onerror = () =>
      toast.error("Could not read the logo file. Try another image.")
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          aria-label={logo ? "Change business logo" : "Add business logo"}
          className="h-20 w-20 rounded-xl border-2 border-dashed border-border bg-muted/40 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
        >
          {logo ? (
            <img
              src={logo}
              alt="Business logo preview"
              className="h-full w-full object-contain p-1"
            />
          ) : (
            <Building2 className="h-7 w-7 text-muted-foreground/50" />
          )}
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          aria-label="Choose business logo"
          className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow hover:opacity-90"
        >
          <Camera className="h-3 w-3" />
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFile}
      />
      <div className="flex flex-col gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-3 w-3 mr-1.5" /> Choose logo
        </Button>
        {logo && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-destructive hover:text-destructive"
            onClick={() => onLogoChange(null)}
          >
            <Trash2 className="h-3 w-3 mr-1.5" /> Remove
          </Button>
        )}
        <p className="text-xs text-muted-foreground">
          PNG, JPG, or WebP up to 2 MB
        </p>
      </div>
    </div>
  )
}
