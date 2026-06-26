import { ArrowRight } from "lucide-react"
import { Link as RouterLink } from "react-router"
import { Logo } from "@/components/Common/Logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "Templates", href: "#templates" },
  { label: "Pricing", href: "#pricing" },
  { label: "Changelog", href: "#changelog" },
]

const companyLinks = [
  { label: "About", href: "#about" },
  { label: "Blog", href: "#blog" },
  { label: "Contact", href: "#contact" },
]

const legalLinks = [
  { label: "Privacy", href: "/privacy-policy", internal: true },
  { label: "Terms", href: "#terms", internal: false },
  { label: "Cookies", href: "#cookies", internal: false },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-6">
        <div className="py-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Logo variant="full" asLink={false} />
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Professional invoicing made simple. Create, track, and get paid
              faster.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Stay updated</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get the latest updates and tips.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="Enter your email"
                className="h-9 flex-1"
              />
              <Button type="submit" size="sm" className="h-9 px-3">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t py-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear} AutoInvoice. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {legalLinks.map((link) =>
              link.internal ? (
                <RouterLink
                  key={link.label}
                  to={link.href}
                  className="text-sm text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground"
                >
                  {link.label}
                </RouterLink>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground"
                >
                  {link.label}
                </a>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
