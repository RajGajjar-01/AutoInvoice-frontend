import { QueryClientProvider } from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import axios from "axios"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { OpenAPI } from "./client"
import { ThemeProvider } from "./components/theme-provider"
import { Toaster } from "./components/ui/sonner"
import "./index.css"
import { queryClient } from "./queryClient"
import { routeTree } from "./routeTree.gen"

OpenAPI.BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"
OpenAPI.WITH_CREDENTIALS = true

const getCookie = (name) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(";").shift()
  return undefined
}

axios.interceptors.request.use((config) => {
  const method = (config.method || "get").toLowerCase()
  if (!["get", "head", "options"].includes(method)) {
    const csrf = getCookie("csrf_token")
    if (csrf) {
      config.headers = config.headers ?? {}
      config.headers["X-CSRF-Token"] = csrf
    }
  }
  return config
})

const router = createRouter({ routeTree })

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster richColors closeButton />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
