import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Clock, FileText, Palette, ShieldCheck, Zap } from "lucide-react"
import { useLayoutEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"

gsap.registerPlugin(ScrollTrigger)

interface Benefit {
  icon: typeof Zap
  title: string
  description: string
}

const benefits: Benefit[] = [
  {
    icon: Zap,
    title: "Invoice in 60 seconds",
    description:
      "No learning curve. Open AutoInvoice, fill in the details, send — done.",
  },
  {
    icon: ShieldCheck,
    title: "100% GST Compliant",
    description:
      "CGST, SGST, IGST, reverse charge — handled correctly every time, automatically.",
  },
  {
    icon: Clock,
    title: "Save 5+ hours a week",
    description:
      "Stop re-entering data across spreadsheets. Customers, items, and totals are always ready.",
  },
  {
    icon: Palette,
    title: "Looks like your brand",
    description:
      "Add your logo, pick your colors, and send invoices that clients actually remember.",
  },
]

export function Benefits() {
  const benefitsRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray(".benefit-item")

      items.forEach((item, i) => {
        gsap.from(item as Element, {
          opacity: 0,
          x: -20,
          duration: 0.25,
          delay: i * 0.06,
          ease: "power2.out",
          scrollTrigger: {
            trigger: item as Element,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        })
      })

      gsap.from(".benefits-title", {
        y: 20,
        opacity: 0,
        duration: 0.25,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".benefits-title",
          start: "top 90%",
          toggleActions: "play none none none",
        },
      })

      gsap.from(".benefits-card", {
        y: 30,
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".benefits-card",
          start: "top 90%",
          toggleActions: "play none none none",
        },
      })

      gsap.to(".benefits-glow", {
        opacity: 0.5,
        scale: 1.05,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })
    }, benefitsRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={benefitsRef} className="py-20 bg-muted/50">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-2">
            <h2 className="benefits-title font-display text-3xl font-semibold tracking-tight md:text-4xl mb-6">
              Why 500+ Indian businesses choose AutoInvoice
            </h2>
            <div className="space-y-6">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="benefit-item group flex gap-4 items-start"
                >
                  <div className="benefit-icon rounded-lg p-2.5 bg-primary/10 shrink-0 transition-transform duration-200 ease-out supports-[hover:hover]:group-hover:scale-110">
                    <benefit.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 transition-colors duration-200 ease-out group-hover:text-primary">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative lg:col-span-3">
            <div className="benefits-glow absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-500/10 dark:from-primary/5 dark:to-blue-500/5 rounded-3xl blur-2xl" />
            <Card className="benefits-card relative border-2 shadow-xl">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Invoice Template</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Clean Teal Design
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">From</span>
                    <span className="font-medium">Your Company</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bill To</span>
                    <span className="font-medium">Client Name</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Item Total</span>
                      <span>₹50,000</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Tax (18%)</span>
                      <span>₹9,000</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                      <span>Grand Total</span>
                      <span className="text-primary">₹59,000</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
