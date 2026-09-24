import { useEffect } from "react"
import { useSearchParams } from "react-router"
import useCustomToast from "./useCustomToast"

const MESSAGES: Record<string, string> = {
  error: "Something went wrong signing in with Google. Please try again.",
  link_required:
    "An account with this email already exists. Log in with your password, then connect Google from Settings.",
  inactive: "This account has been deactivated.",
}

export function useGoogleAuthMessage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { showErrorToast } = useCustomToast()

  useEffect(() => {
    const code = searchParams.get("google")
    if (!code) return
    const message = MESSAGES[code]
    if (message) showErrorToast(message)

    const next = new URLSearchParams(searchParams)
    next.delete("google")
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams, showErrorToast])
}
