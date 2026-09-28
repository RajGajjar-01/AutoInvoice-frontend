import { useEffect } from "react"

// Title, canonical URL and (optionally) meta description for the current page.
// Pages without a description keep the site-wide one from index.html.
export function useDocumentTitle(title: string, description?: string) {
  useEffect(() => {
    document.title = `${title} | UnifiedDesk`
    const canonical = document.querySelector('link[rel="canonical"]')
    canonical?.setAttribute(
      "href",
      window.location.origin + window.location.pathname,
    )
    if (description) {
      document
        .querySelector('meta[name="description"]')
        ?.setAttribute("content", description)
    }
  }, [title, description])
}
