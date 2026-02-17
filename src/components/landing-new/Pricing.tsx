import { Check, Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
<<<<<<< Updated upstream
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
=======
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
>>>>>>> Stashed changes

export function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      name: "Free",
      price: billingCycle === "monthly" ? "₹0" : "₹0",
      period: billingCycle === "monthly" ? "/month" : "/year",
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
      price: billingCycle === "monthly" ? "₹999" : "₹9,999",
      period: billingCycle === "monthly" ? "/month" : "/year",
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
      price: billingCycle === "monthly" ? "₹2,499" : "₹24,999",
      period: billingCycle === "monthly" ? "/month" : "/year",
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
    <section id="pricing" className="bg-gradient-to-b from-white to-gray-50 py-24">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your business needs. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-16">
          <Tabs
            defaultValue="monthly"
            className="w-[400px] flex flex-col items-center"
            onValueChange={(v) => setBillingCycle(v as "monthly" | "yearly")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">
                Yearly
                <span className="ml-2 rounded-full bg-[#4ade80]/20 px-2 py-0.5 text-[10px] font-bold text-[#0a4a5c]">
                  Save 20%
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
<<<<<<< Updated upstream
              className={`relative transition-all duration-500 hover:scale-105 ${plan.popular
                ? 'shadow-2xl ring-2 ring-[#0a4a5c] transform md:scale-105 border-[#0a4a5c]'
                : 'shadow-lg hover:shadow-xl'
=======
              className={`relative flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${plan.popular ? "border-[#0a4a5c] shadow-xl md:scale-105 z-10" : ""
>>>>>>> Stashed changes
                }`}
            >
              {plan.popular && (
<<<<<<< Updated upstream
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
=======
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#0a4a5c]" />
              )}

              <CardHeader className="pb-8">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="mt-2 min-h-[40px]">
                      {plan.description}
                    </CardDescription>
                  </div>
                  {plan.popular && (
                    <span className="inline-flex items-center rounded-full bg-[#0a4a5c] px-2.5 py-0.5 text-xs font-semibold text-white">
                      <Zap className="mr-1 h-3 w-3 fill-current" />
                      Popular
>>>>>>> Stashed changes
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 pb-8">
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground font-medium">{plan.period}</span>
                </div>

<<<<<<< Updated upstream
                {/* Features List */}
                <div className="space-y-3">
=======
                <ul className="space-y-4">
>>>>>>> Stashed changes
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <div className="rounded-full bg-green-100 p-1">
                        <Check className="h-3 w-3 text-green-600" strokeWidth={3} />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
<<<<<<< Updated upstream
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
=======
                </ul>
              </CardContent>

              <CardFooter className="pt-8 border-t">
                <Button
                  asChild
                  className={`w-full py-6 text-base font-semibold ${plan.popular
                      ? "bg-[#0a4a5c] hover:bg-[#083a48]"
                      : "variant-outline"
                    }`}
                  variant={plan.popular ? "default" : "outline"}
>>>>>>> Stashed changes
                >
                  <Link to={plan.ctaLink}>{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            All plans include a <span className="font-semibold text-[#0a4a5c]">14-day free trial</span>. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
}
