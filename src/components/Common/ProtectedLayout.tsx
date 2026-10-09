import {
  Bell,
  Briefcase,
  FilePlus2,
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
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import useAuth from "@/hooks/useAuth"

const mobileLinks = [
  { label: "Home", to: "/dashboard", icon: Home },
  { label: "Invoices", to: "/invoices", icon: FileText },
  { label: "New", to: "/create-invoice", icon: FilePlus2 },
  { label: "Customers", to: "/customers", icon: Users },
]

const moreLinks = [
  { label: "Items", to: "/items", icon: Briefcase },
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
    <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
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
                className={`flex min-w-0 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors active:bg-accent ${active ? "text-primary" : "text-muted-foreground"}`}
              >
                <Icon className="size-5" aria-hidden="true" />
                <span>{label}</span>
              </Link>
            )
          })}
          <SheetTrigger asChild>
            <button
              type="button"
              className="flex min-w-0 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground active:bg-accent"
              aria-label="Open all navigation"
            >
              <Menu className="size-5" aria-hidden="true" />
              <span>More</span>
            </button>
          </SheetTrigger>
        </div>
      </nav>
      <SheetContent
        side="bottom"
        className="max-h-[85dvh] rounded-t-2xl pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden"
      >
        <SheetHeader>
          <SheetTitle>More</SheetTitle>
          <SheetDescription>Other pages and account options</SheetDescription>
        </SheetHeader>
        <nav aria-label="More pages" className="grid gap-1 px-4">
          {[
            ...moreLinks,
            ...(isAdmin ? [{ label: "Admin", to: "/admin", icon: Users }] : []),
          ].map(({ label, to, icon: Icon }) => (
            <Button
              key={to}
              variant="ghost"
              asChild
              className="h-11 justify-start"
            >
              <Link to={to} onClick={() => setMoreOpen(false)}>
                <Icon aria-hidden="true" />
                {label}
              </Link>
            </Button>
          ))}
        </nav>
        <Separator />
        <div className="grid gap-1 px-4">
          <Button variant="ghost" asChild className="h-11 justify-start">
            <Link to="/profile" onClick={() => setMoreOpen(false)}>
              <UserCircle aria-hidden="true" />
              Profile
            </Link>
          </Button>
          <Button variant="ghost" asChild className="h-11 justify-start">
            <Link to="/settings" onClick={() => setMoreOpen(false)}>
              <Settings aria-hidden="true" />
              Settings
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="h-11 justify-start"
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
            className="h-11 justify-start"
            onClick={() => {
              setMoreOpen(false)
              void logout()
            }}
          >
            <LogOut aria-hidden="true" />
            Log out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
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

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex min-w-0 max-w-full flex-col overflow-hidden">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center border-b bg-background/95 px-4 backdrop-blur-md md:hidden">
          <Logo variant="full" className="h-8" asLink={false} />
        </header>
        <main className="workspace-content flex w-full min-w-0 max-w-full flex-1 flex-col px-4 pt-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:p-4">
          <Outlet />
        </main>
        <MobileNavigation isAdmin={user.is_superuser ?? false} />
      </SidebarInset>
    </SidebarProvider>
  )
}

export default ProtectedLayout
