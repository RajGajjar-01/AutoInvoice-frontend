import {
  ArrowRightToLine,
  Briefcase,
  Home,
  PanelLeft,
  Table2,
  UserCircle,
  Users,
} from "lucide-react"
import { useState } from "react"
import { SidebarAppearance } from "@/components/Common/Appearance"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"
import useAuth from "@/hooks/useAuth"
import { Main } from "./Main"
import { User } from "./User"

const baseItems = [
  { icon: Home, title: "Dashboard", path: "/dashboard" },
  { icon: Briefcase, title: "Items", path: "/items" },
  { icon: Table2, title: "Data Tables", path: "/data-tables" },
  { icon: UserCircle, title: "Account", path: "/profile" },
]

export function AppSidebar() {
  const [isHeaderHovered, setIsHeaderHovered] = useState(false)
  const { user: currentUser } = useAuth()
  const { state, setOpen, isMobile, toggleSidebar } = useSidebar()
  const items = currentUser?.is_superuser
    ? [...baseItems, { icon: Users, title: "Admin", path: "/admin" }]
    : baseItems

  const handleSidebarClick = (e) => {
    if (state === "expanded" || isMobile) return
    const isInteractive = e.target.closest("a") || e.target.closest("button")
    if (!isInteractive) {
      setOpen(true)
    }
  }

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="group-data-[state=collapsed]:cursor-pointer"
      onClick={handleSidebarClick}
    >
      <SidebarHeader
        className="relative flex h-16 shrink-0 flex-row items-center px-4 group-data-[collapsible=icon]:px-0"
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => setIsHeaderHovered(false)}
      >
        <span className="text-lg tracking-tight transition-opacity group-data-[collapsible=icon]:hidden">
          AutoInvoice
        </span>
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={toggleSidebar}
          >
            <PanelLeft
              className={
                state === "collapsed"
                  ? isHeaderHovered
                    ? "block"
                    : "group-hover:hidden"
                  : ""
              }
            />
            <ArrowRightToLine
              className={
                state === "collapsed"
                  ? isHeaderHovered
                    ? "hidden"
                    : "hidden group-hover:block"
                  : "hidden"
              }
            />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent className="py-4">
        <Main items={items} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarAppearance />
        <User user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
