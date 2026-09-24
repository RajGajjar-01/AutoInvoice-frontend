import { ArrowUpRight } from "lucide-react"
import { type PointerEvent, useRef } from "react"
import { Link } from "react-router"

export function CTA() {
  const glowRef = useRef<HTMLDivElement>(null)

  const moveGlow = (event: PointerEvent<HTMLElement>) => {
    if (
      event.pointerType === "touch" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return
    }

    const glow = glowRef.current
    if (!glow) return

    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left - bounds.width / 2) * 0.32
    const y = (event.clientY - bounds.top - bounds.height / 2) * 0.16
    glow.style.transform = `translate3d(calc(-50% + ${x}px), ${y}px, 0)`
  }

  const resetGlow = () => {
    if (glowRef.current) {
      glowRef.current.style.transform = "translate3d(-50%, 0, 0)"
    }
  }

  return (
    <section
      className="landing-cta relative isolate overflow-hidden text-center text-white"
      onPointerMove={moveGlow}
      onPointerLeave={resetGlow}
    >
      <div className="landing-cta-glow" ref={glowRef} aria-hidden="true" />
      <div className="relative z-10 mx-auto flex min-h-[470px] max-w-4xl flex-col items-center justify-center px-6 py-24 sm:min-h-[540px] sm:py-28">
        <h2 className="font-display max-w-3xl text-[clamp(2.25rem,4.2vw,3.5rem)] font-medium leading-[1.12] tracking-[-0.04em]">
          Make your next invoice your{" "}
          <span className="text-[#f2f5fc]">easiest one.</span>
        </h2>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
          Create professional GST invoices in minutes. Spend less time on
          paperwork and more time on your business.
        </p>
        <Link
          to="/signup"
          className="landing-cta-button mt-9 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-[#141822] shadow-[0_8px_28px_rgba(0,0,0,0.16)] outline-offset-4 transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-[#eef3ff] hover:shadow-[0_12px_34px_rgba(0,0,0,0.23)] focus-visible:outline-2 focus-visible:outline-white active:translate-y-0"
        >
          Start your free trial
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
        <p className="mt-5 text-sm text-white/65">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-white underline decoration-white/45 underline-offset-4 transition-colors hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Log in
          </Link>
        </p>
      </div>
    </section>
  )
}
