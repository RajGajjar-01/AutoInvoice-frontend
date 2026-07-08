import {
  ArrowRightToLine,
  Bell,
  Briefcase,
  ChevronRight,
  ContactRound,
  FileText,
  Home,
  LayoutTemplate,
  LineChart,
  PanelLeft,
  PenLine,
  Table2,
  Users,
} from "lucide-react"
import { useState } from "react"
import { Link as RouterLink, useLocation } from "react-router"
import { SidebarAppearance } from "@/components/Common/Appearance"
import { Logo } from "@/components/Common/Logo"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import useAuth from "@/hooks/useAuth"
import { User } from "./User"

const topItems = [
  { icon: Home, title: "Dashboard", path: "/dashboard" },
  { icon: Briefcase, title: "Items", path: "/items" },
  { icon: Table2, title: "Data Tables", path: "/data-tables" },
  { icon: ContactRound, title: "Customers", path: "/customers" },
]

const invoiceSubItems = [
  { icon: FileText, title: "Invoices", path: "/invoices" },
  { icon: LayoutTemplate, title: "Templates", path: "/invoice-templates" },
  { icon: PenLine, title: "Template Builder", path: "/template-builder" },
]

const bottomItems = [
  { icon: LineChart, title: "Insights", path: "/insights" },
  { icon: Bell, title: "Notifications", path: "/notifications" },
]

const INVOICE_PATHS = [
  "/invoices",
  "/invoice-history",
  "/invoice-templates",
  "/template-builder",
  "/create-invoice",
  "/create-proforma",
  "/create-quotation",
  "/create-challan",
]
// ↑ /invoice-history stays here so the sidebar group stays highlighted
// when viewing an individual invoice detail page

export function AppSidebar() {
  const [isHeaderHovered, setIsHeaderHovered] = useState(false)
  const { user: currentUser } = useAuth()
  const { state, setOpen, isMobile, toggleSidebar } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname

  const isInvoiceActive = INVOICE_PATHS.some((p) => currentPath.startsWith(p))
  const [invoicesOpen, setInvoicesOpen] = useState(isInvoiceActive)

  const adminItems = currentUser?.is_superuser
    ? [{ icon: Users, title: "Admin", path: "/admin" }]
    : []

  const handleSidebarClick = (e: React.MouseEvent) => {
    if (state === "expanded" || isMobile) return
    const isInteractive =
      (e.target as HTMLElement).closest("a") ||
      (e.target as HTMLElement).closest("button")
    if (!isInteractive) {
      setOpen(true)
    }
  }

  const handleNavClick = () => {
    if (isMobile) {
      // close mobile sheet via useSidebar — not exported directly
    }
  }

  const isCollapsed = state === "collapsed"

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="group-data-[state=collapsed]:cursor-pointer transition-all duration-300"
      onClick={handleSidebarClick}
    >
      <SidebarHeader
        className="relative flex h-16 shrink-0 flex-row items-center px-4 group-data-[collapsible=icon]:px-0 transition-all duration-300"
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => setIsHeaderHovered(false)}
      >
        <Logo variant="responsive" className="px-4" />
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
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Top items */}
              {topItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={currentPath === item.path}
                    asChild
                  >
                    <RouterLink to={item.path} onClick={handleNavClick}>
                      <item.icon />
                      <span>{item.title}</span>
                    </RouterLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Invoices collapsible group */}
              <SidebarMenuItem>
                {isCollapsed ? (
                  /* In icon mode: show first sub-item icon as the trigger */
                  <SidebarMenuButton
                    tooltip="Invoices"
                    isActive={isInvoiceActive}
                    asChild
                  >
                    <RouterLink to="/invoices">
                      <FileText />
                      <span>Invoices</span>
                    </RouterLink>
                  </SidebarMenuButton>
                ) : (
                  <>
                    <SidebarMenuButton
                      isActive={isInvoiceActive && !invoicesOpen}
                      onClick={() => setInvoicesOpen((o) => !o)}
                      className="w-full"
                      tooltip="Invoices"
                    >
                      <FileText />
                      <span>Invoices</span>
                      <ChevronRight
                        className={`ml-auto h-4 w-4 shrink-0 transition-transform duration-200 ${
                          invoicesOpen ? "rotate-90" : ""
                        }`}
                      />
                    </SidebarMenuButton>
                    {invoicesOpen && (
                      <SidebarMenuSub>
                        {invoiceSubItems.map((sub) => (
                          <SidebarMenuSubItem key={sub.title}>
                            <SidebarMenuSubButton
                              isActive={currentPath === sub.path || currentPath.startsWith(sub.path + "/")}
                              asChild
                            >
                              <RouterLink to={sub.path} onClick={handleNavClick}>
                                <sub.icon className="h-3.5 w-3.5" />
                                <span>{sub.title}</span>
                              </RouterLink>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </>
                )}
              </SidebarMenuItem>

              {/* Bottom items */}
              {[...bottomItems, ...adminItems].map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={currentPath === item.path}
                    asChild
                  >
                    <RouterLink to={item.path} onClick={handleNavClick}>
                      <item.icon />
                      <span>{item.title}</span>
                    </RouterLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarAppearance />
        <User user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
