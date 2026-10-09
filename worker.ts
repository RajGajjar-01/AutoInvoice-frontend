// Proxies /api/* to the Lambda backend so auth cookies are first-party.
// Safari/iOS (ITP) drops third-party cookies, which broke login cross-site.

interface Env {
  API_ORIGIN: string
  ASSETS: {
    fetch: (request: Request) => Promise<Response>
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname.startsWith("/api/")) {
      // manual: pass 3xx + Set-Cookie (Google OAuth) straight to the browser
      return fetch(
        new Request(env.API_ORIGIN + url.pathname + url.search, request),
        { redirect: "manual" },
      )
    }
    return env.ASSETS.fetch(request)
  },
}
