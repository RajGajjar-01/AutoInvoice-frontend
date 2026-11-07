import { registerSW } from "virtual:pwa-register"
import { QueryClientProvider } from "@tanstack/react-query"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider } from "react-router"
import { toast } from "sonner"
import { OpenAPI } from "./client"
import { ThemeProvider } from "./components/theme-provider"
import { Toaster } from "./components/ui/sonner"
import "./index.css"
import { queryClient } from "./queryClient"
import { router } from "./router"

OpenAPI.BASE = import.meta.env.VITE_API_URL || ""
OpenAPI.WITH_CREDENTIALS = true

import "./lib/api"
import { trackKeyboard } from "./hooks/useKeyboardInset"

trackKeyboard()

const updateSW = registerSW({
  onNeedRefresh() {
    toast("A new version is ready", {
      id: "pwa-update",
      duration: Number.POSITIVE_INFINITY,
      action: { label: "Reload", onClick: () => updateSW(true) },
    })
  },
})

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster richColors />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
