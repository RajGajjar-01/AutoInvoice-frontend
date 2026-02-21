import { AxiosError } from "axios"

function extractErrorMessage(err) {
  if (err instanceof AxiosError) {
    return err.message
  }
  const errDetail = err.body?.detail
  if (Array.isArray(errDetail) && errDetail.length > 0) {
    return errDetail[0].msg
  }
  return errDetail || "Something went wrong."
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
