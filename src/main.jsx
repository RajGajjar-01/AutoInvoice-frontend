import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import axios from "axios"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { ApiError, OpenAPI } from "./client"
import { ThemeProvider } from "./components/theme-provider"
import { Toaster } from "./components/ui/sonner"
import "./index.css"
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

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status
    const originalRequest = error?.config

    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        await axios.post(
          `${OpenAPI.BASE}/api/v1/login/refresh`,
          {},
          { withCredentials: true },
        )
        return axios(originalRequest)
      } catch (refreshError) {
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

// Redirect to /login on any 401/403 that comes from a non-public page
const handleApiError = (error) => {
  const publicPages = [
    "/",
    "/login",
    "/signup",
    "/recover-password",
    "/reset-password",
  ]
  if (error instanceof ApiError && [401, 403].includes(error.status)) {
    if (!publicPages.includes(window.location.pathname)) {
      window.location.href = "/login"
    }
  }
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleApiError,
  }),
  mutationCache: new MutationCache({
    onError: handleApiError,
  }),
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
