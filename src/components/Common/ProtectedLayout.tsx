import { FilePlus2, FileText, Home, Menu, Users } from "lucide-react"
import { useEffect } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router"
import AppSidebar from "@/components/Sidebar/AppSidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import useAuth from "@/hooks/useAuth"

const mobileLinks = [
  { label: "Home", to: "/dashboard", icon: Home },
  { label: "Invoices", to: "/invoices", icon: FileText },
  { label: "New", to: "/create-invoice", icon: FilePlus2 },
  { label: "Customers", to: "/customers", icon: Users },
]

function MobileNavigation() {
  const { pathname } = useLocation()
  const { setOpenMobile } = useSidebar()

  return (
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
        <button
          type="button"
          onClick={() => setOpenMobile(true)}
          className="flex min-w-0 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground active:bg-accent"
          aria-label="Open all navigation"
        >
          <Menu className="size-5" aria-hidden="true" />
          <span>More</span>
        </button>
      </div>
    </nav>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex h-screen">
      <div className="w-16 lg:w-64 bg-sidebar border-r shrink-0 animate-pulse" />
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
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur-md md:hidden">
          <SidebarTrigger className="size-11" />
          <span className="truncate text-sm font-medium">UnifiedDesk</span>
        </header>
        <main className="flex w-full min-w-0 max-w-full flex-1 flex-col overflow-x-clip px-4 pt-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] animate-in md:p-4">
          <Outlet />
        </main>
        <MobileNavigation />
      </SidebarInset>
    </SidebarProvider>
  )
}

export default ProtectedLayout
