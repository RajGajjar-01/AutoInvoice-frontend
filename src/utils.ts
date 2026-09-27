import { AxiosError } from "axios"
import { ApiError } from "@/client"

export function getSafeErrorMessage(err: unknown): string {
  const status =
    err instanceof ApiError
      ? err.status
      : err instanceof AxiosError
        ? err.response?.status
        : err &&
            typeof err === "object" &&
            "status" in err &&
            typeof err.status === "number"
          ? err.status
          : undefined

  switch (status) {
    case 400:
    case 422:
      return "Some details were rejected. Check the form and try again."
    case 401:
      return "Your session or credentials were rejected. Sign in and try again."
    case 403:
      return "You do not have permission to complete this action."
    case 404:
      return "The requested item could not be found. Refresh the page and try again."
    case 409:
      return "These details conflict with information already saved."
    case 413:
      return "The uploaded file is too large."
    case 429:
      return "Too many requests were sent. Wait a moment and try again."
    default:
      return status && status >= 500
        ? "The service could not complete the request. Try again shortly."
        : "Could not connect to the service. Check your connection and try again."
  }
}

export const handleError = function (
  this: (message: string) => void,
  err: unknown,
): void {
  const errorMessage = getSafeErrorMessage(err)
  this(errorMessage)
}

export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
}
