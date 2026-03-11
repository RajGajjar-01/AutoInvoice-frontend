import { Link } from "@tanstack/react-router"
import { cn } from "@/lib/utils"

export function LogoIcon({ className, color = "default" }) {
  const isWhite = color === "white"
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(isWhite ? "text-white" : "text-[#10b981]", className)}
    >
      {/* Top Bar - Aligned Right */}
      <rect x="7.5" y="4" width="13.5" height="4.2" rx="0.8" fill="currentColor" />
      {/* Middle Bar - Shifted Left */}
      <rect x="3" y="10" width="13.5" height="4.2" rx="0.8" fill="currentColor" />
      {/* Bottom Bar - Aligned Right */}
      <rect x="7.5" y="16" width="13.5" height="4.2" rx="0.8" fill="currentColor" />
    </svg>
  )
}

export function Logo({ variant = "full", className, asLink = true, color = "default", showTagline = true }) {
  const isWhite = color === "white"
  
  const content = (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoIcon className="h-6 w-6 shrink-0" color={color} />
      {(variant === "full" || variant === "responsive") && (
        <div
          className={cn(
            "flex flex-col items-start transition-all duration-300 ease-in-out",
            variant === "responsive" && "group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:overflow-hidden",
          )}
        >
          <span className={cn(
            "text-[15px] font-bold tracking-tight leading-none",
            isWhite ? "text-white" : "text-slate-800 dark:text-slate-100"
          )}>
            UnifiedDesk
          </span>
          {showTagline && (
            <span className={cn(
              "text-[9px] leading-none mt-1 font-medium whitespace-nowrap opacity-80",
              isWhite ? "text-white/80" : "text-muted-foreground"
            )}>
              your all-in-one business workspace
            </span>
          )}
        </div>
      )}
    </div>
  )

  if (!asLink) {
    return content
  }
  return <Link to="/dashboard">{content}</Link>
}
