// Proxies /api/* to the Lambda backend so auth cookies are first-party.
// Safari/iOS (ITP) drops third-party cookies, which broke login cross-site.

interface Env {
  API_ORIGIN: string
  ASSETS: {
    fetch: (request: Request) => Promise<Response>
  }
}

// CSP is limited to frame-ancestors: a full script/style policy can't be verified without a browser.
const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": "frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
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
    const res = await env.ASSETS.fetch(request)
    const out = new Response(res.body, res)
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) out.headers.set(k, v)
    return out
  },
}
