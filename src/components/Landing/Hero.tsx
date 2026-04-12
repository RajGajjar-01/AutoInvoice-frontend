import { Link } from "@tanstack/react-router"
import gsap from "gsap"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { useLayoutEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { DashboardPreview } from "./DashboardPreview"

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
        y: 20,
        opacity: 0,
        duration: 0.25,
        ease: "power2.out",
      })
      tl.from(
        ".hero-title",
        {
          y: 40,
          opacity: 0,
          duration: 0.3,
          ease: "power3.out",
        },
        "-=0.1",
      )
      tl.from(
        ".hero-title .text-primary",
        {
          opacity: 0,
          duration: 0.25,
          ease: "power2.out",
        },
        "-=0.15",
      )
      tl.from(
        ".hero-subtitle",
        {
          y: 20,
          opacity: 0,
          duration: 0.25,
          ease: "power2.out",
        },
        "-=0.1",
      )
      tl.from(
        ".hero-buttons .hero-btn-primary",
        {
          y: 12,
          opacity: 0,
          duration: 0.2,
          ease: "power2.out",
        },
        "-=0.05",
      )
      tl.from(
        ".hero-buttons .hero-btn-secondary",
        {
          y: 12,
          opacity: 0,
          duration: 0.2,
          ease: "power2.out",
        },
        "-=0.15",
      )
      tl.from(
        ".hero-visual",
        {
          y: 30,
          opacity: 0,
          duration: 0.35,
          ease: "power2.out",
        },
        "-=0.1",
      )

      gsap.to(".hero-blob-1", {
        x: 30,
        y: -20,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })
      gsap.to(".hero-blob-2", {
        x: -30,
        y: 20,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={heroRef} className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="hero-blob-1 absolute top-0 left-1/4 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl" />
        <div className="hero-blob-2 absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28 lg:py-32">
        <div className="flex flex-col items-center text-center">
          <div className="hero-badge inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm mb-6">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              Trusted by 500+ businesses
            </span>
          </div>

          <h1 className="hero-title text-4xl font-medium tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl">
            Invoicing made <span className="text-primary">effortless</span> for
            your{" "}
            <span className="underline decoration-primary decoration-2 underline-offset-4">
              business
            </span>
          </h1>

          <p className="hero-subtitle mt-6 text-lg text-muted-foreground max-w-2xl md:text-xl">
            Create professional invoices, track payments, manage inventory, and
            grow your business. All in one beautiful, easy-to-use platform.
          </p>

          <div className="hero-buttons mt-8 flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="hero-btn-primary h-11 px-8" asChild>
              <Link to="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="hero-btn-secondary h-11 px-8"
              asChild
            >
              <Link to="/login">Sign In</Link>
            </Button>
          </div>

          <div className="hero-visual mt-12 w-full max-w-4xl">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  )
}
