import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import {
  BarChart3,
  FileText,
  IndianRupee,
  LayoutTemplate,
  Package,
  Users,
} from "lucide-react"
import { useLayoutEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"

gsap.registerPlugin(ScrollTrigger)

const features = [
  {
    icon: FileText,
    title: "Professional Invoices",
    description:
      "Create stunning invoices, quotations, proformas, and delivery challans in seconds.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: LayoutTemplate,
    title: "Multiple Templates",
    description:
      "Choose from beautiful templates like Clean Teal, Geometric, Circle Studio, and more.",
    color: "text-blue-500 dark:text-blue-400",
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
  },
  {
    icon: Users,
    title: "Customer Management",
    description:
      "Organize customers, suppliers, and parties with GST details and contact info.",
    color: "text-emerald-500 dark:text-emerald-400",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
  },
  {
    icon: Package,
    title: "Inventory Tracking",
    description:
      "Track stock levels, get low-stock alerts, and manage your product catalogue.",
    color: "text-violet-500 dark:text-violet-400",
    bg: "bg-violet-500/10 dark:bg-violet-500/20",
  },
  {
    icon: IndianRupee,
    title: "Payment Tracking",
    description:
      "Monitor paid, unpaid, and overdue invoices. Know your receivables at a glance.",
    color: "text-amber-500 dark:text-amber-400",
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
  },
  {
    icon: BarChart3,
    title: "Business Dashboard",
    description:
      "Revenue insights, KPIs, and trends to understand your business performance.",
    color: "text-rose-500 dark:text-rose-400",
    bg: "bg-rose-500/10 dark:bg-rose-500/20",
  },
]

export function Features() {
  const featuresRef = useRef(null)

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".feature-card")

      cards.forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          y: 24,
          duration: 0.25,
          delay: i * 0.05,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        })
      })

      gsap.from(".features-heading", {
        y: 20,
        opacity: 0,
        duration: 0.25,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".features-heading",
          start: "top 90%",
          toggleActions: "play none none none",
        },
      })
    }, featuresRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={featuresRef} className="py-20 bg-muted/30">
      <div className="mx-auto max-w-6xl px-6">
        <div className="features-heading text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need to manage invoices
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed for small businesses, freelancers, and
            entrepreneurs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="feature-card group border bg-card cursor-pointer transition-[transform,box-shadow] duration-200 ease-out hover:shadow-lg active:scale-[0.98] @[supports(hover:hover)]:hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <div
                  className={`feature-icon rounded-lg p-3 w-fit ${feature.bg} mb-4 transition-transform duration-200 ease-out group-hover:scale-110`}
                >
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="feature-title text-lg font-semibold mb-2 transition-transform duration-200 ease-out group-hover:translate-x-0.5">
                  {feature.title}
                </h3>
                <p className="feature-desc text-sm text-muted-foreground transition-[transform,opacity] duration-200 ease-out group-hover:translate-x-0.5">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
