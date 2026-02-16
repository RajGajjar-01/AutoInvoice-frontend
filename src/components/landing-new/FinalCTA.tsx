export function FinalCTA() {
  return (
    <section className="bg-gradient-to-br from-[#0a4a5c] to-[#0d6580] py-24">
      <div className="max-w-[1200px] mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-semibold text-white mb-6">
          Run Your Business on Autopilot
        </h2>
        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
          Join thousands of Indian MSMEs who've automated their operations and 
          gained complete visibility into their business
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <button className="bg-white text-[#0a4a5c] px-10 py-4 rounded-lg hover:bg-gray-100 transition-colors text-lg font-medium shadow-lg">
            Start Free Trial
          </button>
          <button className="border-2 border-white text-white px-10 py-4 rounded-lg hover:bg-white/10 transition-colors text-lg font-medium">
            Book Demo
          </button>
        </div>

        <p className="text-white/75 text-sm mt-6">
          No credit card required • Setup in 5 minutes • Cancel anytime
        </p>
      </div>
    </section>
  );
}
