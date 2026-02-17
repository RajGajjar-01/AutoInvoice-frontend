import { Check, Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
            <Card
              key={index}
              className={`relative transition-all duration-500 hover:scale-105 ${plan.popular
                ? 'shadow-2xl ring-2 ring-[#0a4a5c] transform md:scale-105 border-[#0a4a5c]'
                : 'shadow-lg hover:shadow-xl'
                }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <Badge variant="default" className="bg-gradient-to-r from-[#0a4a5c] to-[#0d6580] text-white px-4 py-2 text-sm font-semibold shadow-lg flex items-center gap-2">
                    <Zap className="w-4 h-4 fill-current" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className={plan.popular ? 'pt-8' : ''}>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="min-h-[40px]">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Price */}
                <div className="pb-6 border-b border-gray-200">
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
                <div className="space-y-3">
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
              </CardContent>

              <CardFooter className="">
                <Button
                  asChild
                  variant="default"
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
              </CardFooter>
            </Card>
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
