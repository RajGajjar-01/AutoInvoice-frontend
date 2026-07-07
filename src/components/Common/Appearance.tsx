import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

export const SidebarAppearance = () => {
  const { setTheme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const Icon = isDark ? Sun : Moon
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip="Appearance"
        data-testid="theme-button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
      >
        <Icon className="size-4 text-muted-foreground" />
        <span>Appearance</span>
        <span className="sr-only">Toggle theme</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export const Appearance = () => {
  const { setTheme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  return (
    <div className="flex items-center justify-center">
      <Button
        data-testid="theme-button"
        variant="outline"
        size="icon"
        onClick={() => setTheme(isDark ? "light" : "dark")}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  )
}
