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
import { forwardRef, useLayoutEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

gsap.registerPlugin(ScrollTrigger)

interface Feature {
  icon: typeof FileText
  title: string
  description: string
  color: string
  bg: string
  stat?: string
}

// Wide (col-span-2) features: 0, 3, 5
// Narrow (col-span-1) features: 1, 2, 4
const features: Feature[] = [
  {
    icon: FileText,
    title: "Professional GST Invoices",
    description:
      "Create GST-compliant invoices, quotations, proformas, and delivery challans in seconds — ready to share as PDF or email directly to clients.",
    color: "text-primary",
    bg: "bg-primary/10",
    stat: "Ready in under 60 seconds",
  },
  {
    icon: LayoutTemplate,
    title: "Multiple Templates",
    description:
      "Clean Teal, Geometric, Circle Studio, and more — pick a design that fits your brand.",
    color: "text-blue-500 dark:text-blue-400",
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
  },
  {
    icon: Users,
    title: "Customer Management",
    description:
      "Organise customers, suppliers, and parties with GST details and contact info.",
    color: "text-emerald-500 dark:text-emerald-400",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
  },
  {
    icon: Package,
    title: "Inventory Tracking",
    description:
      "Track stock levels across your product catalogue, get low-stock alerts, and adjust quantities — all linked to your invoices automatically.",
    color: "text-violet-500 dark:text-violet-400",
    bg: "bg-violet-500/10 dark:bg-violet-500/20",
    stat: "Real-time stock alerts",
  },
  {
    icon: IndianRupee,
    title: "Payment Tracking",
    description:
      "See paid, unpaid, and overdue invoices at a glance. Know your receivables without digging through spreadsheets.",
    color: "text-amber-500 dark:text-amber-400",
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
  },
  {
    icon: BarChart3,
    title: "Business Dashboard",
    description:
      "Revenue trends, top customers, outstanding receivables, and KPIs — everything you need to understand how your business is performing at a glance.",
    color: "text-rose-500 dark:text-rose-400",
    bg: "bg-rose-500/10 dark:bg-rose-500/20",
    stat: "Full revenue insights",
  },
]

const FeatureCard = forwardRef<
  HTMLDivElement,
  { feature: Feature; wide?: boolean; className?: string }
>(function FeatureCard({ feature, wide, className }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        "feature-card rounded-xl border bg-card p-6 transition-shadow duration-200 hover:shadow-md",
        wide ? "flex gap-5 items-start" : "flex flex-col",
        className,
      )}
    >
      <div
        className={cn(
          "rounded-lg p-3 shrink-0",
          feature.bg,
          wide ? "mt-0.5" : "mb-4",
        )}
      >
        <feature.icon className={cn("h-6 w-6", feature.color)} />
      </div>
      <div className="min-w-0">
        <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {feature.description}
        </p>
        {wide && feature.stat && (
          <p className="mt-3 text-xs font-medium text-muted-foreground/70">
            {feature.stat}
          </p>
        )}
      </div>
    </div>
  )
})

/* Mobile-only: horizontal snap-scroll carousel of the same features.
   Keeps content identical to desktop, but far less vertical scrolling. */
function FeatureCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  const handleScroll = () => {
    const el = scrollRef.current
    const slide = el?.firstElementChild as HTMLElement | null
    if (!el || !slide) return
    // slide width + gap (gap-4 = 16px)
    const step = slide.offsetWidth + 16
    setActive(Math.round(el.scrollLeft / step))
  }

  const goTo = (i: number) => {
    const el = scrollRef.current
    const slide = el?.children[i] as HTMLElement | undefined
    if (!el || !slide) return
    // account for scroll-px-6 (24px) so the snapped slide aligns to the edge
    el.scrollTo({ left: slide.offsetLeft - 24, behavior: "smooth" })
  }

  return (
    <div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {features.map((feature) => (
          <article
            key={feature.title}
            className="flex snap-start shrink-0 basis-[82%] flex-col rounded-xl border bg-card p-6"
          >
            <div className={cn("mb-4 w-fit rounded-lg p-3", feature.bg)}>
              <feature.icon className={cn("h-6 w-6", feature.color)} />
            </div>
            <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
            {feature.stat && (
              <p className="mt-3 text-xs font-medium text-muted-foreground/70">
                {feature.stat}
              </p>
            )}
          </article>
        ))}
      </div>

      {/* Pagination dots */}
      <div className="mt-6 flex justify-center gap-2">
        {features.map((feature, i) => (
          <button
            key={feature.title}
            type="button"
            aria-label={`Go to ${feature.title}`}
            onClick={() => goTo(i)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              i === active ? "w-5 bg-primary" : "w-2 bg-muted-foreground/25",
            )}
          />
        ))}
      </div>
    </div>
  )
}

const WIDE_BASIS_START = "50%"
const WIDE_BASIS_END = "66.6667%"

export function Features() {
  const featuresRef = useRef<HTMLDivElement>(null)
  const wideCardRefs = useRef<(HTMLDivElement | null)[]>([])

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".feature-card")

      cards.forEach((card, i) => {
        gsap.from(card as Element, {
          opacity: 0,
          y: 24,
          duration: 0.18,
          delay: i * 0.03,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card as Element,
            start: "top 95%",
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

      ScrollTrigger.matchMedia({
        "(min-width: 768px)": () => {
          for (const card of wideCardRefs.current) {
            if (!card) continue
            gsap.fromTo(
              card,
              { flexBasis: WIDE_BASIS_START },
              {
                flexBasis: WIDE_BASIS_END,
                duration: 1.2,
                ease: "elastic.out(1, 0.65)",
                scrollTrigger: {
                  trigger: card.parentElement ?? card,
                  start: "top 90%",
                  toggleActions: "play none none none",
                },
              },
            )
          }
        },
      })
    }, featuresRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={featuresRef} className="py-14 md:py-20 bg-muted/50">
      <div className="mx-auto max-w-6xl px-6">
        <div className="features-heading text-center mb-12">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            All the tools your business needs
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            GST-ready billing, inventory, customers, and insights — built for
            Indian small businesses and freelancers.
          </p>
        </div>

        {/* Alternating bento rows: wide-narrow, narrow-wide, narrow-wide.
            Wide cards grow from half-width to their final two-thirds width
            as each row scrolls into view. Desktop only — mobile uses a carousel. */}
        <div className="hidden space-y-4 md:block lg:space-y-5">
          <div className="flex flex-col gap-4 md:flex-row lg:gap-5">
            <FeatureCard
              ref={(el) => {
                wideCardRefs.current[0] = el
              }}
              feature={features[0]}
              wide
              className="md:shrink-0 md:grow-0 md:basis-2/3"
            />
            <FeatureCard
              feature={features[1]}
              className="md:min-w-0 md:flex-1"
            />
          </div>

          <div className="flex flex-col gap-4 md:flex-row lg:gap-5">
            <FeatureCard
              feature={features[2]}
              className="md:min-w-0 md:flex-1"
            />
            <FeatureCard
              ref={(el) => {
                wideCardRefs.current[1] = el
              }}
              feature={features[3]}
              wide
              className="md:shrink-0 md:grow-0 md:basis-2/3"
            />
          </div>

          <div className="flex flex-col gap-4 md:flex-row lg:gap-5">
            <FeatureCard
              feature={features[4]}
              className="md:min-w-0 md:flex-1"
            />
            <FeatureCard
              ref={(el) => {
                wideCardRefs.current[2] = el
              }}
              feature={features[5]}
              wide
              className="md:shrink-0 md:grow-0 md:basis-2/3"
            />
          </div>
        </div>
      </div>

      {/* Mobile carousel — full-bleed, replaces the bento grid below md */}
      <div className="md:hidden">
        <FeatureCarousel />
      </div>
    </section>
  )
}
