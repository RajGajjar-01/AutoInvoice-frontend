import { ArrowRight } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"

export function FinalCTA() {
  return (
    <section className="relative bg-gradient-to-br from-[#0a4a5c] via-[#0d6580] to-[#0a4a5c] py-24 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-8">
          Run Your Business on Autopilot
        </h2>
        <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto font-medium">
          Join thousands of Indian MSMEs who've automated their operations and
          gained complete visibility into their business
        </p>

        <div className="flex flex-wrap gap-6 justify-center">
          <Button
            asChild
            size="lg"
            variant="default"
            className="h-14 px-10 text-lg font-bold bg-white text-[#0a4a5c] hover:bg-gray-100 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
          >
            <Link to="/signup">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-14 px-10 text-lg font-bold border-2 border-white bg-transparent text-white hover:bg-white/10 hover:text-white hover:scale-105 transition-all duration-300"
          >
            Book Demo
          </Button>
        </div>

        <p className="text-white/70 text-sm mt-10 font-medium">
          No credit card required • 14-day free trial • Cancel anytime
        </p>
      </div>
    </section>
  )
}
