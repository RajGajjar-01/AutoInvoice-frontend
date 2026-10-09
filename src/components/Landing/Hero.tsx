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

      tl.fromTo(
        ".hero-badge",
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.25, ease: "power2.out" },
      )
      tl.fromTo(
        ".hero-title",
        { y: 32, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: "power3.out" },
        "-=0.1",
      )
      tl.fromTo(
        ".hero-subtitle",
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.25, ease: "power2.out" },
        "-=0.1",
      )
      tl.fromTo(
        ".hero-buttons",
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.2, ease: "power2.out" },
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

      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-8 pt-12 pb-16 md:px-12 md:pt-16 md:pb-24 lg:grid-cols-2 lg:gap-10 lg:pt-20 lg:pb-28">
        <div className="flex min-w-0 flex-col items-center text-center lg:items-start lg:text-left">
          <div className="hero-badge inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-sm mb-6">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              Now in beta. Built for Indian businesses
            </span>
          </div>

          <h1 className="hero-title font-display text-4xl font-medium tracking-tight sm:text-5xl md:text-6xl max-w-3xl leading-[1.1]">
            GST invoicing made <span className="text-primary">effortless</span>{" "}
            for your{" "}
            <span className="underline decoration-primary decoration-2 underline-offset-4">
              business
            </span>
          </h1>

          <p className="hero-subtitle mt-6 text-lg text-muted-foreground md:text-xl max-w-2xl leading-relaxed">
            Create GST-compliant invoices, quotations, and challans. Manage
            customers, track payments, and grow your business, all in one place.
          </p>

          <div className="hero-buttons mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button size="lg" className="h-12 w-full px-8 sm:w-auto" asChild>
              <Link to="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 w-full px-8 sm:w-auto"
              asChild
            >
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
        <img
          src="/assets/illustrations/business-workspace.webp"
          srcSet="/assets/illustrations/business-workspace-small.webp 480w, /assets/illustrations/business-workspace.webp 960w"
          sizes="(min-width: 1280px) 30rem, (min-width: 1024px) 28rem, (min-width: 480px) 24rem, calc(100vw - 64px)"
          width={960}
          height={640}
          alt="A business owner at a cozy desk, organizing invoices with a laptop and a cup of tea."
          decoding="async"
          fetchPriority="high"
          className="pointer-events-none mx-auto h-auto w-full max-w-[22rem] select-none sm:max-w-[24rem] lg:mx-0 lg:max-w-[28rem] lg:justify-self-center xl:max-w-[30rem]"
        />
      </div>
    </section>
  )
}
