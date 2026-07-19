import { ArrowRight } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"

export function CTA() {
  return (
    <section className="py-14 md:py-20 bg-primary">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl text-foreground">
          Start sending professional invoices today
        </h2>
        <p className="mt-4 text-lg text-foreground/70 max-w-xl mx-auto">
          Join 500+ Indian businesses already using AutoInvoice to save time,
          stay GST-compliant, and get paid faster.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="h-12 px-8 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            asChild
          >
            <Link to="/signup">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            className="h-12 px-8 border-1 border-black bg-white/30 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
            asChild
          >
            <Link to="/login">Already have an account?</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
