import {
  ArrowLeft,
  Bell,
  Briefcase,
  FileText,
  Home,
  LayoutTemplate,
  LineChart,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  Table2,
  UserCircle,
  Users,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router"
import { Logo } from "@/components/Common/Logo"
import AppSidebar from "@/components/Sidebar/AppSidebar"
import { useTheme } from "@/components/theme-provider"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useNotificationStore } from "@/features/data-tables/notification-store"
import useAuth from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

const mobileLinks = [
  { label: "Home", to: "/dashboard", icon: Home },
  { label: "Invoices", to: "/invoices", icon: FileText },
  { label: "Customers", to: "/customers", icon: Users },
  { label: "Items", to: "/items", icon: Briefcase },
]

const moreLinks = [
  { label: "Data Tables", to: "/data-tables", icon: Table2 },
  { label: "Templates", to: "/invoice-templates", icon: LayoutTemplate },
  { label: "Template Builder", to: "/template-builder", icon: FileText },
  { label: "Insights", to: "/insights", icon: LineChart },
  { label: "Notifications", to: "/notifications", icon: Bell },
]

function MobileNavigation({ isAdmin }: { isAdmin: boolean }) {
  const { pathname } = useLocation()
  const { logout } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <Drawer open={moreOpen} onOpenChange={setMoreOpen} showSwipeHandle>
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <div className="grid h-16 grid-cols-5 items-stretch">
          {mobileLinks.map(({ label, to, icon: Icon }) => {
            const active =
              pathname === to ||
              (to !== "/dashboard" && pathname.startsWith(`${to}/`))
            return (
              <Link
                key={to}
                to={to}
                aria-current={active ? "page" : undefined}
                className={`group flex min-w-0 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors duration-150 ${active ? "text-primary" : "text-muted-foreground"}`}
              >
                <span
                  className={`grid h-7 w-12 place-items-center rounded-full transition-[background-color,transform] duration-200 motion-safe:group-active:scale-90 ${active ? "bg-accent" : ""}`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span>{label}</span>
              </Link>
            )
          })}
          <DrawerTrigger
            render={
              <button
                type="button"
                className="group flex min-w-0 flex-col items-center justify-center gap-1 text-[11px] font-semibold text-muted-foreground"
                aria-label="Open all navigation"
              />
            }
          >
            <span className="grid h-7 w-12 place-items-center rounded-full transition-transform duration-200 motion-safe:group-active:scale-90">
              <Menu className="size-5" aria-hidden="true" />
            </span>
            <span>More</span>
          </DrawerTrigger>
        </div>
      </nav>
      <DrawerContent className="rounded-t-3xl pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
        <DrawerHeader>
          <DrawerTitle>More</DrawerTitle>
          <DrawerDescription>Other pages and account options</DrawerDescription>
        </DrawerHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain pb-2">
          <nav aria-label="More pages" className="grid gap-1 px-4">
            {[
              ...moreLinks,
              ...(isAdmin
                ? [{ label: "Admin", to: "/admin", icon: Users }]
                : []),
            ].map(({ label, to, icon: Icon }) => (
              <Link
                to={to}
                onClick={() => setMoreOpen(false)}
                key={to}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "h-12 justify-start rounded-xl",
                )}
              >
                <Icon aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>
          <Separator />
          <div className="grid gap-1 px-4">
            <Link
              to="/profile"
              onClick={() => setMoreOpen(false)}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "h-12 justify-start rounded-xl",
              )}
            >
              <UserCircle aria-hidden="true" />
              Profile
            </Link>
            <Link
              to="/settings"
              onClick={() => setMoreOpen(false)}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "h-12 justify-start rounded-xl",
              )}
            >
              <Settings aria-hidden="true" />
              Settings
            </Link>
            <Button
              variant="ghost"
              className="h-12 justify-start rounded-xl"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
            >
              {resolvedTheme === "dark" ? (
                <Sun aria-hidden="true" />
              ) : (
                <Moon aria-hidden="true" />
              )}
              Appearance
            </Button>
            <Button
              variant="ghost"
              className="h-12 justify-start rounded-xl"
              onClick={() => {
                setMoreOpen(false)
                void logout()
              }}
            >
              <LogOut aria-hidden="true" />
              Log out
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

// Phone page titles. Detail pages (deeper paths) draw their own header.
const PAGE_TITLES: Record<string, string> = {
  invoices: "Invoices",
  "create-invoice": "New invoice",
  "create-quotation": "New quotation",
  "create-proforma": "New proforma",
  "create-challan": "New challan",
  customers: "Customers",
  items: "Items",
  "data-tables": "Data Tables",
  "invoice-templates": "Templates",
  "template-builder": "Template Builder",
  "invoice-history": "Invoice History",
  insights: "Insights",
  notifications: "Notifications",
  profile: "Profile",
  settings: "Settings",
  admin: "Admin",
}

const iconBtn =
  "grid size-10 shrink-0 place-items-center rounded-full border bg-card outline-none transition-[transform,background-color] hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/30 motion-safe:active:scale-95"

// Demo-style phone header: logo on Home, round back button + title elsewhere.
function MobileHeader() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const unread = useNotificationStore(
    (state) => state.notifications.filter((n) => !n.read).length,
  )
  const segments = pathname.split("/").filter(Boolean)
  const base =
    "sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 bg-background/95 px-4 pt-[env(safe-area-inset-top)] backdrop-blur md:hidden"

  if (pathname === "/dashboard") {
    return (
      <header className={base}>
        <Logo variant="full" className="h-8" />
        <Link
          to="/notifications"
          aria-label={
            unread ? `Notifications, ${unread} unread` : "Notifications"
          }
          className={`${iconBtn} relative ml-auto`}
        >
          <Bell className="size-[18px]" aria-hidden="true" />
          {unread > 0 && (
            <span className="absolute top-2 right-2.5 size-2 rounded-full bg-pop ring-2 ring-card" />
          )}
        </Link>
        <Link to="/settings" aria-label="Settings" className={iconBtn}>
          <Settings className="size-[18px]" aria-hidden="true" />
        </Link>
      </header>
    )
  }

  const title = segments.length === 1 ? PAGE_TITLES[segments[0]] : undefined
  if (!title) return null
  return (
    <header className={base}>
      <button
        type="button"
        aria-label="Back"
        className={iconBtn}
        onClick={() =>
          // history.state.idx is 0 on a cold start (installed app), where -1 would leave the app.
          window.history.state?.idx > 0
            ? navigate(-1)
            : navigate("/dashboard", { replace: true })
        }
      >
        <ArrowLeft className="size-[18px]" aria-hidden="true" />
      </button>
      <span className="text-xl font-bold tracking-tight">{title}</span>
    </header>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex h-screen">
      <div className="hidden w-16 shrink-0 animate-pulse border-r bg-sidebar md:block lg:w-64" />
      <div className="flex-1 flex flex-col p-6 gap-6">
        <div className="h-8 w-56 skeleton-loading" />
        <div className="h-4 w-72 skeleton-loading" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl skeleton-loading" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
          <div className="lg:col-span-2 h-64 rounded-xl skeleton-loading" />
          <div className="h-64 rounded-xl skeleton-loading" />
        </div>
      </div>
    </div>
  )
}

export function ProtectedLayout() {
  const { isLoading, user } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login", { replace: true })
    }
  }, [isLoading, user, navigate])

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (!user) {
    return null
  }

  // Settings is a pushed screen on phones: full slide from the right, no tab bar.
  const isSettings = pathname === "/settings"

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex min-w-0 max-w-full flex-col overflow-hidden">
        <MobileHeader />
        <main
          className={cn(
            "workspace-content flex w-full min-w-0 max-w-full flex-1 flex-col px-4 pt-2 md:p-4",
            isSettings
              ? "pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
              : "pb-[calc(5.5rem+env(safe-area-inset-bottom))]",
          )}
        >
          <div
            key={pathname}
            className={cn(
              "route-content flex min-w-0 flex-1 flex-col",
              isSettings && "route-push",
            )}
          >
            <Outlet />
          </div>
        </main>
        {!isSettings && (
          <MobileNavigation isAdmin={user.is_superuser ?? false} />
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}

export default ProtectedLayout
