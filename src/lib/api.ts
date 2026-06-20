import axios, {
  type AxiosError,
  type AxiosHeaders,
  type InternalAxiosRequestConfig,
} from "axios"
import { OpenAPI } from "@/client"

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

const getCookie = (name: string): string | undefined => {
  if (typeof document === "undefined") return undefined

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(";").shift()
  return undefined
}

const shouldAttemptRefresh = (
  config: RetriableRequestConfig,
  status?: number,
) => {
  if (![401, 403].includes(status ?? 0)) return false
  if (config._retry) return false

  const url = config.url ?? ""
  return ![
    "/api/v1/auth/refresh",
    "/api/v1/auth/login",
    "/api/v1/auth/signup",
    "/api/v1/auth/logout",
    "/api/v1/auth/forgot-password",
    "/api/v1/auth/reset-password",
  ].some((path) => url.includes(path))
}

const api = axios.create()

let refreshPromise: Promise<void> | null = null

api.interceptors.request.use((config) => {
  const nextConfig = config
  nextConfig.withCredentials ??= true

  const method = (nextConfig.method || "get").toLowerCase()
  if (!["get", "head", "options"].includes(method)) {
    const csrf = getCookie("csrf_token")
    if (csrf) {
      if (nextConfig.headers instanceof axios.AxiosHeaders) {
        nextConfig.headers.set("X-CSRF-Token", csrf)
      } else {
        nextConfig.headers = Object.assign(
          nextConfig.headers ?? {},
          { "X-CSRF-Token": csrf },
        ) as AxiosHeaders
      }
    }
  }

  return nextConfig
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableRequestConfig | undefined
    if (!config || !shouldAttemptRefresh(config, error.response?.status)) {
      return Promise.reject(error)
    }

    config._retry = true

    if (!refreshPromise) {
      refreshPromise = axios
        .post(`${OpenAPI.BASE}/api/v1/auth/refresh`, undefined, {
          withCredentials: true,
        })
        .then(() => undefined)
        .finally(() => {
          refreshPromise = null
        })
    }

    try {
      await refreshPromise
      return api.request(config)
    } catch {
      return Promise.reject(error)
    }
  },
)

export { api }
