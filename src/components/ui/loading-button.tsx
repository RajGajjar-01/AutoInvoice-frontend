import { Loader2 } from "lucide-react"
import type * as React from "react"
import { Button } from "@/components/ui/button"

type LoadingButtonProps = React.ComponentProps<typeof Button> & {
  loading?: boolean
}

function LoadingButton({
  loading,
  disabled,
  children,
  ...props
}: LoadingButtonProps) {
  return (
    <Button disabled={loading || disabled} {...props}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  )
}

export { LoadingButton, type LoadingButtonProps }
