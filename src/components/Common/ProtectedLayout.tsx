import { useEffect } from "react"
import { Outlet, useNavigate } from "react-router"
import AppSidebar from "@/components/Sidebar/AppSidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import useAuth from "@/hooks/useAuth"

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
        <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur-md md:hidden">
          <SidebarTrigger />
          <span className="truncate text-sm font-medium">UnifiedDesk</span>
        </header>
        <main className="flex w-full min-w-0 max-w-full flex-1 flex-col overflow-x-clip p-4 animate-in">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default ProtectedLayout
