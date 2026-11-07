import {
  ArrowLeft,
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
import {
  Link,
  Outlet,
  ScrollRestoration,
  useLocation,
  useNavigate,
} from "react-router"
import { Logo } from "@/components/Common/Logo"
import { OfflineBanner } from "@/components/Common/OfflineBanner"
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
                {to === "/create-invoice" ? (
                  <span className="-mt-5 grid size-12 place-items-center rounded-full bg-pop text-white shadow-lg ring-4 ring-background transition-transform duration-150 motion-safe:group-active:scale-90">
                    <Icon className="size-[22px]" aria-hidden="true" />
                  </span>
                ) : (
                  <span
                    className={`grid h-7 w-12 place-items-center rounded-full transition-[background-color,transform] duration-200 motion-safe:group-active:scale-90 ${active ? "bg-accent" : ""}`}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                )}
                <span>{label}</span>
              </Link>
            )
          })}
          <SheetTrigger asChild>
            <button
              type="button"
              className="group flex min-w-0 flex-col items-center justify-center gap-1 text-[11px] font-semibold text-muted-foreground"
              aria-label="Open all navigation"
            >
              <span className="grid h-7 w-12 place-items-center rounded-full transition-transform duration-200 motion-safe:group-active:scale-90">
                <Menu className="size-5" aria-hidden="true" />
              </span>
              <span>More</span>
            </button>
          </SheetTrigger>
        </div>
      </nav>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="max-h-[85dvh] transform-gpu overscroll-contain rounded-t-3xl pb-[max(1rem,env(safe-area-inset-bottom))] transition-[transform,opacity] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform data-[state=closed]:duration-150 data-[state=open]:duration-200 md:hidden"
      >
        <div
          aria-hidden="true"
          className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/25"
        />
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
              className="h-12 justify-start rounded-xl"
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
          <Button
            variant="ghost"
            asChild
            className="h-12 justify-start rounded-xl"
          >
            <Link to="/profile" onClick={() => setMoreOpen(false)}>
              <UserCircle aria-hidden="true" />
              Profile
            </Link>
          </Button>
          <Button
            variant="ghost"
            asChild
            className="h-12 justify-start rounded-xl"
          >
            <Link to="/settings" onClick={() => setMoreOpen(false)}>
              <Settings aria-hidden="true" />
              Settings
            </Link>
          </Button>
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
      </SheetContent>
    </Sheet>
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
  const segments = pathname.split("/").filter(Boolean)
  const base =
    "sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 bg-background/95 px-4 pt-[env(safe-area-inset-top)] backdrop-blur md:hidden"

  if (pathname === "/dashboard") {
    return (
      <header className={base}>
        <Logo variant="full" className="h-8" />
        <Link
          to="/settings"
          aria-label="Settings"
          className={`${iconBtn} ml-auto`}
        >
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

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex min-w-0 max-w-full flex-col overflow-hidden">
        <MobileHeader />
        <main className="workspace-content flex w-full min-w-0 max-w-full flex-1 flex-col px-4 pt-2 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:p-4">
          <div
            key={pathname}
            className="route-content flex min-w-0 flex-1 flex-col"
          >
            <Outlet />
          </div>
        </main>
        <MobileNavigation isAdmin={user.is_superuser ?? false} />
        <OfflineBanner />
        <ScrollRestoration />
      </SidebarInset>
    </SidebarProvider>
  )
}

export default ProtectedLayout
