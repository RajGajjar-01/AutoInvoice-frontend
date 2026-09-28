import { Link as RouterLink } from "react-router"
import { Logo } from "@/components/Common/Logo"

const productLinks = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-6">
        <div className="py-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <Logo variant="full" asLink={false} />
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              GST invoicing for Indian small businesses and freelancers. Create,
              track, and send invoices from one place.
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
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <RouterLink
                  to="/privacy-policy"
                  className="text-sm text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground"
                >
                  Privacy Policy
                </RouterLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t py-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear} UnifiedDesk. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
