import { Check, Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      description: "Perfect for getting started with basic invoice management",
      features: [
        "Up to 50 invoices per month",
        "Email invoice capture",
        "Basic manual entry",
        "Excel export",
        "Single user access",
        "Email support"
      ],
      cta: "Start Free",
      ctaLink: "/signup",
      popular: false
    },
    {
      name: "Advanced",
      price: "₹999",
      period: "per month",
      description: "For growing businesses that need more power and flexibility",
      features: [
        "Unlimited invoices",
        "AI-powered invoice extraction",
        "Custom fields & columns",
        "Multiple category tables",
        "Task & payment reminders",
        "Advanced filters & reports",
        "Up to 5 users",
        "Priority email support",
        "GST reports"
      ],
      cta: "Start 14-Day Trial",
      ctaLink: "/signup",
      popular: true
    },
    {
      name: "Premium",
      price: "₹2,499",
      period: "per month",
      description: "For accountants and businesses managing multiple clients",
      features: [
        "Everything in Advanced",
        "Unlimited users",
        "Multi-client management",
        "White-label reports",
        "API access",
        "Custom integrations",
        "Dedicated account manager",
        "24/7 phone support",
        "Advanced analytics dashboard"
      ],
      cta: "Contact Sales",
      ctaLink: "/signup",
      popular: false
    }
  ];

  return (
    <section id="pricing" className="bg-gradient-to-b from-white to-gray-50 py-20">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 animate-fadeIn">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your business needs. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards - Horizontal Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 bg-white ${plan.popular
                  ? 'shadow-2xl ring-2 ring-[#0a4a5c] transform md:scale-105'
                  : 'shadow-lg hover:shadow-xl'
                }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#0a4a5c] to-[#0d6580] text-white px-4 py-3 text-center font-semibold flex items-center justify-center gap-2 shadow-lg">
                  <Zap className="w-4 h-4 fill-current" />
                  <span className="text-sm">Most Popular</span>
                </div>
              )}

              {/* Card Content */}
              <div className={`p-8 flex flex-col h-full ${plan.popular ? 'pt-16' : ''}`}>
                {/* Plan Name */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-600 min-h-[40px]">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-8 pb-8 border-b border-gray-200">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {plan.period}
                  </div>
                </div>

                {/* Features List */}
                <div className="flex-1 space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-green-600" strokeWidth={3} />
                      </div>
                      <span className="text-sm text-gray-700 leading-relaxed">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  asChild
                  size="lg"
                  className={`w-full ${plan.popular
                      ? 'bg-gradient-to-r from-[#0a4a5c] to-[#0d6580] text-white hover:from-[#0d6580] hover:to-[#0a4a5c]'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                    } px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  <Link to={plan.ctaLink}>
                    {plan.cta}
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-12 animate-fadeIn" style={{ animationDelay: '400ms' }}>
          <p className="text-gray-600">
            All plans include a <span className="font-semibold text-[#0a4a5c]">14-day free trial</span>. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
}
