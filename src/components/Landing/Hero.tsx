import gsap from "gsap"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { useLayoutEffect, useRef } from "react"
import { Link } from "react-router"
import { InteractiveDotGrid } from "@/components/Landing/InteractiveDotGrid"
import { Button } from "@/components/ui/button"

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline()

      tl.from(".hero-badge", {
        y: 16,
        opacity: 0,
        duration: 0.25,
        ease: "power2.out",
      })
      tl.from(
        ".hero-title",
        {
          y: 32,
          opacity: 0,
          duration: 0.3,
          ease: "power3.out",
        },
        "-=0.1",
      )
      tl.from(
        ".hero-subtitle",
        {
          y: 16,
          opacity: 0,
          duration: 0.25,
          ease: "power2.out",
        },
        "-=0.1",
      )
      tl.from(
        ".hero-buttons",
        {
          y: 12,
          opacity: 0,
          duration: 0.2,
          ease: "power2.out",
        },
        "-=0.05",
      )
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[calc(100svh-4rem)] items-center overflow-hidden"
    >
      <InteractiveDotGrid />
      <div className="absolute top-0 left-1/2 -z-10 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-primary/6 blur-3xl" />

      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="flex flex-col items-center text-center">
          <div className="hero-badge inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-sm mb-6">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              Trusted by 500+ Indian businesses
            </span>
          </div>

          <h1 className="hero-title font-display text-4xl font-medium tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-3xl leading-[1.1]">
            GST invoicing made <span className="text-primary">effortless</span>{" "}
            for your{" "}
            <span className="underline decoration-primary decoration-2 underline-offset-4">
              business
            </span>
          </h1>

          <p className="hero-subtitle mt-6 text-lg text-muted-foreground md:text-xl max-w-2xl leading-relaxed">
            Create GST-compliant invoices, quotations, and challans in seconds.
            Manage customers, track payments, and grow your business — all in
            one place.
          </p>

          <div className="hero-buttons mt-10 flex flex-col sm:flex-row gap-3">
            <Button size="lg" className="h-12 px-8" asChild>
              <Link to="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
