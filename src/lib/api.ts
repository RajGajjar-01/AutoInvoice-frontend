import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"
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

const attachCsrfInterceptor = (
  instance: typeof axios | ReturnType<typeof axios.create>,
): void => {
  instance.interceptors.request.use((config) => {
    const method = (config.method || "get").toLowerCase()
    if (!["get", "head", "options"].includes(method)) {
      const csrf = getCookie("csrf_token")
      if (csrf) {
        if (config.headers instanceof axios.AxiosHeaders) {
          config.headers.set("X-CSRF-Token", csrf)
        } else {
          config.headers = Object.assign(config.headers ?? {}, {
            "X-CSRF-Token": csrf,
          })
        }
      }
    }
    return config
  })
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

attachCsrfInterceptor(axios)
attachCsrfInterceptor(api)

let refreshPromise: Promise<void> | null = null

const attachRefreshInterceptor = (
  instance: typeof axios | ReturnType<typeof axios.create>,
): void => {
  instance.interceptors.response.use(
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
        return instance.request(config)
      } catch {
        return Promise.reject(error)
      }
    },
  )
}

attachRefreshInterceptor(axios)
attachRefreshInterceptor(api)

export { api }
