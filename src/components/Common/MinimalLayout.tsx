import { useEffect } from "react"
import { Outlet, useNavigate } from "react-router"
import useAuth from "@/hooks/useAuth"

export function MinimalLayout() {
  const { isLoading, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login", { replace: true })
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

  return (
    <main className="flex-1 flex flex-col p-4">
      <Outlet />
    </main>
  )
}

export default MinimalLayout
