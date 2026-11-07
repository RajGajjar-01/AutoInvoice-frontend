import { Appearance } from "@/components/Common/Appearance"
import { BrandWaves } from "@/components/Common/BrandWaves"
import { Logo } from "@/components/Common/Logo"
import { usePhoneLayout } from "@/hooks/use-mobile"

interface AuthLayoutProps {
  children: React.ReactNode
}

/** Phones only: brand area on top, form in a bottom sheet within thumb reach. */
function PhoneAuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <div className="relative flex min-h-44 flex-1 flex-col justify-end overflow-hidden brand-panel px-6 pt-[max(4.5rem,calc(env(safe-area-inset-top)+3.5rem))] pb-12">
        <BrandWaves />
        <div className="relative z-10 flex flex-col gap-3">
          <Logo
            variant="full"
            className="h-8 w-fit brightness-0 invert"
            asLink={false}
          />
          <p className="font-display text-xl font-bold leading-tight tracking-tight text-white">
            Free GST invoices for Indian businesses
          </p>
        </div>
      </div>
      <div className="absolute top-[max(1rem,env(safe-area-inset-top))] right-5 z-20">
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
