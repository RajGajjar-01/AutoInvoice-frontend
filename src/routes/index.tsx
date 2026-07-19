import { useEffect, useState } from "react"
import { Link } from "react-router"
import { Appearance } from "@/components/Common/Appearance"
import { Footer } from "@/components/Common/Footer"
import { Logo } from "@/components/Common/Logo"
import { Benefits } from "@/components/Landing/Benefits"
import { BusinessesAcrossIndia } from "@/components/Landing/BusinessesAcrossIndia"
import { CTA } from "@/components/Landing/CTA"
import { FAQ } from "@/components/Landing/FAQ"
import { Features } from "@/components/Landing/Features"
import { Hero } from "@/components/Landing/Hero"
import { HowItWorks } from "@/components/Landing/HowItWorks"
import { Pricing } from "@/components/Landing/Pricing"
import { ScrollTextReveal } from "@/components/Landing/ScrollTextReveal"
import { TechnologyShowcase } from "@/components/Landing/TechnologyShowcase"
import { Button } from "@/components/ui/button"
import useAuth from "@/hooks/useAuth"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

function LandingPage() {
  useDocumentTitle(
    "AutoInvoice — Free GST Invoice Software for Indian Businesses",
  )
  const { user, isLoading } = useAuth()

  // Reveal the mobile sticky CTA only after the hero (with its own CTA) is scrolled past
  const [showStickyCta, setShowStickyCta] = useState(false)
  useEffect(() => {
    const onScroll = () => {
      setShowStickyCta(window.scrollY > window.innerHeight * 0.8)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="flex min-h-svh flex-col bg-background pb-20 sm:pb-0">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-6">
          <Logo variant="full" asLink={false} />
          <div className="flex items-center gap-2 sm:gap-3">
            <Appearance />
            {isLoading ? null : user ? (
              <Button size="sm" asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Log In</Link>
                </Button>
                {/* Primary Sign Up lives in the sticky bottom bar on mobile */}
                <Button size="sm" className="hidden sm:inline-flex" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 animate-in">
        <Hero />
        <HowItWorks />
        <ScrollTextReveal />
        <Features />
        <BusinessesAcrossIndia />
        <TechnologyShowcase />
        <Benefits />
        <Pricing />
        <FAQ />
        <CTA />
      </main>

      <Footer />

      {/* App-like sticky CTA — mobile only, revealed after the hero, hidden once signed in */}
      {isLoading || user ? null : (
        <div
          className={`fixed inset-x-0 bottom-0 z-50 border-t bg-background/90 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md transition-transform duration-300 sm:hidden ${
            showStickyCta ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <Button size="lg" className="h-12 w-full text-base" asChild>
            <Link to="/signup">Start Free Trial</Link>
          </Button>
        </div>
      )}
    </div>
  )
}

export default LandingPage
