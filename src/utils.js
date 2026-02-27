import { AxiosError } from "axios"
import { ApiError } from "@/client"

function extractErrorMessage(err) {
  // Handle ApiError from the SDK client (most API errors)
  if (err instanceof ApiError) {
    const errDetail = err.body?.detail
    if (Array.isArray(errDetail) && errDetail.length > 0) {
      return errDetail[0].msg
    }
    if (typeof errDetail === "string") {
      return errDetail
    }
    return err.message || "Something went wrong."
  }
  // Handle raw Axios network errors
  if (err instanceof AxiosError) {
    return err.response?.data?.detail || err.message || "Network error."
  }
  // Fallback for any other error shape
  const errDetail = err?.body?.detail
  if (Array.isArray(errDetail) && errDetail.length > 0) {
    return errDetail[0].msg
  }
  return errDetail || err?.message || "Something went wrong."
}

export const handleError = function (err) {
  const errorMessage = extractErrorMessage(err)
  this(errorMessage)
}
export const getInitials = (name) => {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
}
