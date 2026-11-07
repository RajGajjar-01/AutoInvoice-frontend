import type { LucideIcon } from "lucide-react"
import { Link as RouterLink, useLocation } from "react-router"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { prefetchPage } from "@/routes/pages"

interface SidebarItem {
  title: string
  path: string
  icon: LucideIcon
}

interface MainProps {
  items: SidebarItem[]
}

export function Main({ items }: MainProps) {
  const { isMobile, setOpenMobile } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const handleMenuClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = currentPath === item.path
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActive}
                  render={
                    <RouterLink
                      to={item.path}
                      onClick={handleMenuClick}
                      onPointerEnter={() => prefetchPage(item.path)}
                      onFocus={() => prefetchPage(item.path)}
                    />
                  }
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
