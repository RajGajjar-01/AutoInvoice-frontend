import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Check, CheckCircle2 } from "lucide-react"
import { useLayoutEffect, useRef, useState } from "react"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

gsap.registerPlugin(ScrollTrigger)

interface PricingTier {
  name: string
  monthlyPrice: number
  annualPrice: number
  description: string
  features: string[]
  cta: string
  ctaLink: string
  highlighted: boolean
}

const tiers: PricingTier[] = [
  {
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "Try AutoInvoice with no commitment.",
    features: [
      "5 invoices per month",
      "1 user",
      "2 invoice templates",
      "PDF export",
      "Basic dashboard",
    ],
    cta: "Get Started Free",
    ctaLink: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    monthlyPrice: 499,
    annualPrice: 4990,
    description: "For growing businesses that need more.",
    features: [
      "Unlimited invoices",
      "1 user",
      "All templates with custom branding",
      "Customer and supplier management",
      "Inventory tracking with low-stock alerts",
      "Payment tracking (paid, pending, overdue)",
      "Full business dashboard",
      "Priority email support",
    ],
    cta: "Start Pro Trial",
    ctaLink: "/signup?plan=pro",
    highlighted: true,
  },
  {
    name: "Business",
    monthlyPrice: 999,
    annualPrice: 9990,
    description: "For teams that need more power and control.",
    features: [
      "Everything in Pro",
      "Up to 5 team members",
      "CSV and Excel data export",
      "Custom invoice number series",
      "Priority chat and email support",
    ],
    cta: "Start Business Trial",
    ctaLink: "/signup?plan=business",
    highlighted: false,
  },
]

export function Pricing() {
  const [annual, setAnnual] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      gsap.from(".pricing-heading", {
        y: 20,
        opacity: 0,
        duration: 0.25,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".pricing-heading",
          start: "top 90%",
          toggleActions: "play none none none",
        },
      })

      const cards = gsap.utils.toArray<Element>(".pricing-card")
      cards.forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          y: 24,
          duration: 0.25,
          delay: i * 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="pricing-heading text-center mb-12">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Simple pricing. No surprises.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Start free and upgrade when your business needs more.
          </p>

          <div className="mt-8 inline-flex items-center gap-1 rounded-full border bg-muted/30 p-1.5">
            <button
              onClick={() => setAnnual(false)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200",
                !annual
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 flex items-center gap-2",
                annual
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Annual
              <span className="text-xs font-medium text-primary bg-primary/10 rounded-full px-2 py-0.5">
                2 months free
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={cn(
                "pricing-card relative flex flex-col",
                tier.highlighted && "border-primary border-2 shadow-lg",
              )}
            >
              {tier.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="px-3 py-0.5 text-xs font-medium">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-4 pt-6">
                <h3 className="text-xl font-semibold">{tier.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {tier.description}
                </p>
                <div className="mt-4">
                  {tier.monthlyPrice === 0 ? (
                    <span className="font-display text-4xl font-semibold">Free</span>
                  ) : (
                    <>
                      <span className="font-display text-4xl font-semibold">
                        ₹
                        {annual
                          ? Math.round(tier.annualPrice / 12)
                          : tier.monthlyPrice}
                      </span>
                      <span className="text-muted-foreground ml-1 text-sm">
                        /month
                      </span>
                      {annual && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Billed as ₹
                          {tier.annualPrice.toLocaleString("en-IN")}/year
                        </p>
                      )}
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 pb-6">
                <ul className="space-y-3 flex-1">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm"
                    >
                      {tier.highlighted ? (
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      ) : (
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      )}
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-6 w-full"
                  variant={tier.highlighted ? "default" : "outline"}
                  asChild
                >
                  <Link to={tier.ctaLink}>{tier.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
