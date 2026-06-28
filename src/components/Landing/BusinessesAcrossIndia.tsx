import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Calculator, Factory, Package, Pill, Store, Users } from "lucide-react"
import { useLayoutEffect, useRef } from "react"

gsap.registerPlugin(ScrollTrigger)

const businessTypes = [
  {
    icon: Store,
    label: "Retail Stores",
  },
  {
    icon: Package,
    label: "Kirana Shops",
  },
  {
    icon: Pill,
    label: "Medical Stores",
  },
  {
    icon: Users,
    label: "Distributors",
  },
  {
    icon: Factory,
    label: "Manufacturers",
  },
  {
    icon: Calculator,
    label: "Accountants",
  },
]

export function BusinessesAcrossIndia() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      gsap.from(".bai-heading", {
        y: 20,
        opacity: 0,
        duration: 0.25,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".bai-heading",
          start: "top 90%",
          toggleActions: "play none none none",
        },
      })

      const cards = gsap.utils.toArray<Element>(".bai-card")
      cards.forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          y: 24,
          duration: 0.3,
          delay: i * 0.05,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 92%",
            toggleActions: "play none none none",
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-14 bg-muted/50">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="bai-heading font-display text-3xl font-semibold tracking-tight text-center mb-10 md:text-4xl">
          Built for Businesses Across India
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {businessTypes.map((biz) => (
            <div
              key={biz.label}
              className="bai-card group flex flex-col items-center justify-center p-6 rounded-xl border bg-card transition-shadow duration-200 hover:shadow-md"
            >
              <div className="rounded-lg p-3 bg-primary/10 mb-4 transition-transform duration-200 ease-out group-hover:scale-110">
                <biz.icon className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-center text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                {biz.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
