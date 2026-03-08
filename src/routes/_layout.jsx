import { createFileRoute, Outlet, useNavigate, useLocation } from "@tanstack/react-router"
import { useEffect } from "react"
import { Footer } from "@/components/Common/Footer"
import AppSidebar from "@/components/Sidebar/AppSidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout")({
  component: Layout,
})

function Layout() {
  const { isLoading, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: "/login", replace: true })
    }
  }, [isLoading, user, navigate])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isDataTablePage = location.pathname.startsWith('/data-tables')

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-hidden flex flex-col">
        <main className={`flex-1 flex flex-col ${!isDataTablePage ? 'p-4' : ''}`}>
          <Outlet />
        </main>
        {!isDataTablePage && <Footer />}
      </SidebarInset>
    </SidebarProvider>
  )
}

export default Layout
