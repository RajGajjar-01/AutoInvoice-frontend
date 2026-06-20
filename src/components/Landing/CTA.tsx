import { ArrowRight } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"

export function CTA() {
  return (
    <section className="py-20 bg-primary/10">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl text-foreground">
          Ready to simplify your invoicing?
        </h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
          Join thousands of businesses already using AutoInvoice to save time
          and get paid faster.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="h-12 px-8" asChild>
            <Link to="/signup">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 px-8 border-border"
            asChild
          >
            <Link to="/login">Already have an account?</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
