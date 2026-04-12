import { Link } from "@tanstack/react-router"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const icon = "/assets/images/app-icon.svg?v=3"
const iconLight = "/assets/images/app-icon-light.svg?v=3"
const logo = "/assets/images/app-logo.svg?v=3"
const logoLight = "/assets/images/app-logo-light.svg?v=3"

interface LogoProps {
  variant?: "full" | "icon" | "responsive"
  className?: string
  asLink?: boolean
}

export function Logo({
  variant = "full",
  className,
  asLink = true,
}: LogoProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const fullLogo = isDark ? logoLight : logo
  const iconLogo = isDark ? iconLight : icon

  const content = (
    <div
      className={cn(
        "flex shrink-0 items-center justify-start",
        variant === "responsive" &&
          "group-data-[collapsible=icon]:justify-center",
        className,
      )}
    >
      {variant === "responsive" ? (
        <>
          <img
            src={fullLogo}
            alt="AutoInvoice logo"
            className={cn(
              "h-9 w-auto transition-all group-data-[collapsible=icon]:hidden",
              className,
            )}
          />
          <img
            src={iconLogo}
            alt="AutoInvoice icon"
            className={cn(
              "size-8 hidden transition-all group-data-[collapsible=icon]:block",
              className,
            )}
          />
        </>
      ) : (
        <img
          src={variant === "full" ? fullLogo : iconLogo}
          alt="AutoInvoice logo"
          className={cn(
            variant === "full" ? "h-9 w-auto" : "size-8",
            className,
          )}
        />
      )}
    </div>
  )

  if (!asLink) {
    return content
  }

  return (
    <Link to="/" className="inline-flex">
      {content}
    </Link>
  )
}
