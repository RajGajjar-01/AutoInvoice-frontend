import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"
import { Appearance } from "@/components/Common/Appearance"
import { Footer } from "@/components/Common/Footer"
import { Logo } from "@/components/Common/Logo"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      {
        title: "AutoInvoice",
      },
    ],
  }),
})

function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Logo variant="full" asLink={false} />
          <div className="flex items-center gap-3">
            <Appearance />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Log In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="flex max-w-2xl flex-col items-center gap-8 text-center">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Invoicing made <span className="text-primary">effortless</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Create, manage, and track your invoices in one place. Spend less
              time on paperwork and more time growing your business.
            </p>
          </div>

          <div className="flex gap-4">
            <Button size="lg" asChild>
              <Link to="/signup">
                Get Started
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/login">Log In</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
