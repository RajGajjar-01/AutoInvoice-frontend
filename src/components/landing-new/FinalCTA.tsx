import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="relative bg-gradient-to-br from-[#0a4a5c] via-[#0d6580] to-[#0a4a5c] py-24 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fadeIn">
          Run Your Business on Autopilot
        </h2>
        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto animate-fadeIn" style={{ animationDelay: '200ms' }}>
          Join thousands of Indian MSMEs who've automated their operations and
          gained complete visibility into their business
        </p>

        <div className="flex flex-wrap gap-4 justify-center animate-fadeIn" style={{ animationDelay: '400ms' }}>
          <Button asChild variant="default" size="lg" className="group bg-white text-[#0a4a5c] hover:bg-gray-100 px-10 py-4 text-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <Link to="/signup">
              <span className="flex items-center gap-2">
                Start Free Trial
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="border-2 border-white bg-white text-[#0a4a5c] hover:bg-transparent hover:text-white px-10 py-4 text-lg hover:scale-105 transition-all duration-300">
            Book Demo
          </Button>
        </div>

        <p className="text-white/75 text-sm mt-6 animate-fadeIn" style={{ animationDelay: '600ms' }}>
          No credit card required • 14-day free trial • Cancel anytime
        </p>
      </div>
    </section>
  );
}
