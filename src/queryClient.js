import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query"
import { ApiError } from "./client"

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

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleApiError,
  }),
  mutationCache: new MutationCache({
    onError: handleApiError,
  }),
})
