import { QueryClientProvider } from "@tanstack/react-query"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider } from "react-router"
import { OpenAPI } from "./client"
import { ThemeProvider } from "./components/theme-provider"
import { Toaster } from "./components/ui/sonner"
import "./index.css"
import { queryClient } from "./queryClient"
import { router } from "./router"

const isProduction = import.meta.env.PROD

OpenAPI.BASE = import.meta.env.VITE_API_URL || ""
if (!isProduction && !import.meta.env.VITE_API_URL) {
  OpenAPI.BASE = "http://localhost:8000"
}
OpenAPI.WITH_CREDENTIALS = true

import "./lib/api"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster richColors closeButton />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
