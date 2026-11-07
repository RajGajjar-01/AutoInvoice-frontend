import { Eye, EyeOff } from "lucide-react"
import { type ComponentProps, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type PasswordInputProps = ComponentProps<typeof Input>

function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        className={className}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
        // keep focus in the field so the phone keyboard stays open
        onPointerDown={(e) => e.preventDefault()}
        onClick={() => setShowPassword((prev) => !prev)}
        aria-pressed={showPassword}
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Eye className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="sr-only">
          {showPassword ? "Hide password" : "Show password"}
        </span>
      </Button>
    </div>
  )
}

export { PasswordInput, type PasswordInputProps }
