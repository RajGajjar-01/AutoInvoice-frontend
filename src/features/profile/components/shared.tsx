import { Building2, Camera, Eye, EyeOff, Trash2, Upload } from "lucide-react"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0 w-36">
        {label}
      </span>
      <span
        className={`text-sm font-medium text-right break-all ${mono ? "font-mono" : ""}`}
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
    <div className="flex items-center justify-between gap-4 py-2 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0 w-36">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium font-mono">{displayedValue}</span>
        <button
          type="button"
          onClick={() => setRevealed((prev) => !prev)}
          className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
          title={revealed ? "Hide details" : "Reveal full number"}
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
  return <p className="text-sm text-muted-foreground italic py-1">{message}</p>
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  helperText,
  mono,
}: {
  label: string
  value: string | null
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  required?: boolean
  helperText?: string
  mono?: boolean
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      <Input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-9 text-sm ${mono ? "font-mono" : ""}`}
      />
      {helperText && (
        <p className="text-[11px] text-muted-foreground">{helperText}</p>
      )}
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
    if (file.size > 2 * 1024 * 1024) {
      alert("Logo must be under 2MB")
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => onLogoChange(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="h-20 w-20 rounded-xl border-2 border-dashed border-border bg-muted/40 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
        >
          {logo ? (
            <img
              src={logo}
              alt="logo"
              className="h-full w-full object-contain p-1"
            />
          ) : (
            <Building2 className="h-7 w-7 text-muted-foreground/50" />
          )}
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow hover:opacity-90"
        >
          <Camera className="h-3 w-3" />
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
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
          <Upload className="h-3 w-3 mr-1.5" /> Upload Logo
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
        <p className="text-[11px] text-muted-foreground">PNG, JPG up to 2MB</p>
      </div>
    </div>
  )
}
