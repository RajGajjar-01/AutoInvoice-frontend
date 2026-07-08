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

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Logo variant="full" asLink={false} />
          <div className="flex items-center gap-3">
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
                <Button size="sm" asChild>
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
    </div>
  )
}

export default LandingPage
