import { type RefObject, useEffect, useRef } from "react"
import { Appearance } from "@/components/Common/Appearance"
import { BrandWaves } from "@/components/Common/BrandWaves"
import { Logo } from "@/components/Common/Logo"
import { usePhoneLayout } from "@/hooks/use-mobile"

interface AuthLayoutProps {
  children: React.ReactNode
}

/**
 * Tracks the visible area (visualViewport) so the sheet rides up with the
 * on-screen keyboard instead of the browser jumping the page around. Works the
 * same on iOS Safari and Android Chrome, and needs no global viewport change.
 */
function useVisibleArea(ref: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current
    const vv = window.visualViewport
    if (!el || !vv) return
    let frame = 0
    const sync = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        el.style.height = `${vv.height}px`
        el.style.transform = `translateY(${vv.offsetTop}px)`
        // Pinch-zoom also shrinks the visual viewport; only a keyboard counts.
        el.dataset.keyboard = String(
          vv.scale <= 1.01 && window.innerHeight - vv.height > 120,
        )
      })
    }
    sync()
    vv.addEventListener("resize", sync)
    vv.addEventListener("scroll", sync)
    return () => {
      cancelAnimationFrame(frame)
      vv.removeEventListener("resize", sync)
      vv.removeEventListener("scroll", sync)
    }
  }, [ref])
}

/** Phones only: brand area on top, form in a bottom sheet within thumb reach. */
function PhoneAuthLayout({ children }: AuthLayoutProps) {
  const ref = useRef<HTMLDivElement>(null)
  useVisibleArea(ref)
  return (
    <div
      ref={ref}
      style={{ height: "100dvh" }}
      onFocusCapture={(e) => {
        const field = e.target
        // Wait for the keyboard animation, then nudge the field into view.
        setTimeout(() => {
          field.scrollIntoView({
            block: "nearest",
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
              .matches
              ? "auto"
              : "smooth",
          })
        }, 300)
      }}
      className="group fixed inset-x-0 top-0 flex flex-col overflow-y-auto overscroll-none transition-[height] duration-200 ease-out motion-reduce:transition-none"
    >
      <div className="relative flex min-h-44 flex-1 flex-col justify-end overflow-hidden brand-panel px-6 pt-[max(4.5rem,calc(env(safe-area-inset-top)+3.5rem))] pb-12 group-data-[keyboard=true]:min-h-20 group-data-[keyboard=true]:pb-4">
        <BrandWaves />
        <p className="relative z-10 font-display text-xl font-bold leading-tight tracking-tight text-white group-data-[keyboard=true]:hidden">
          Free GST invoices for Indian businesses
        </p>
      </div>
      <div className="absolute inset-x-0 top-[max(1rem,env(safe-area-inset-top))] z-20 flex items-center justify-between pr-5 pl-6">
        <Logo
          variant="full"
          className="h-8 w-fit brightness-0 invert"
          asLink={false}
        />
        <Appearance />
      </div>
      <div className="relative z-10 -mt-7 flex min-w-0 shrink-0 flex-col rounded-t-[2rem] bg-card px-6 pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_-12px_rgb(0_0_0/0.25)]">
        <div className="animate-in">{children}</div>
      </div>
    </div>
  )
}

// Tablets and desktop keep the original layout below, unchanged.
export function AuthLayout({ children }: AuthLayoutProps) {
  if (usePhoneLayout()) return <PhoneAuthLayout>{children}</PhoneAuthLayout>
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden overflow-hidden border-r border-white/10 brand-panel lg:flex lg:flex-col">
        <BrandWaves />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
        />
        <div className="relative z-10 mx-auto flex h-full w-full max-w-xl flex-col justify-center gap-8 px-10 py-10">
          <Logo
            variant="full"
            className="h-12 w-fit brightness-0 invert animate-in"
            asLink={false}
          />
          <h2 className="font-display text-[2.75rem] font-bold leading-[1.1] tracking-tight text-white animate-in animate-in-delay-1">
            Free GST invoices for Indian businesses
          </h2>
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-6 px-5 py-6 md:p-10">
        <div className="flex items-center justify-between gap-3">
          <div className="lg:hidden">
            <Logo variant="full" className="h-8" asLink={false} />
          </div>
          <div className="ml-auto">
            <Appearance />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm py-6 animate-in">{children}</div>
        </div>
      </div>
    </div>
  )
}
