import { Appearance } from "@/components/Common/Appearance"
import { BrandWaves } from "@/components/Common/BrandWaves"
import { Logo } from "@/components/Common/Logo"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-dvh flex-col lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Phones: brand area on top, form in a bottom sheet within thumb reach. */}
      <div className="relative flex min-h-44 flex-1 flex-col justify-end overflow-hidden brand-panel px-6 pt-[max(4.5rem,calc(env(safe-area-inset-top)+3.5rem))] pb-12 lg:hidden">
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
      <div className="absolute top-[max(1rem,env(safe-area-inset-top))] right-5 z-20 lg:top-10 lg:right-10">
        <Appearance />
      </div>
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
      <div className="relative z-10 -mt-7 flex min-w-0 shrink-0 flex-col rounded-t-[2rem] bg-card px-6 pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_-12px_rgb(0_0_0/0.25)] lg:mt-0 lg:gap-6 lg:rounded-none lg:bg-transparent lg:p-10 lg:shadow-none">
        {/* Keeps the desktop form where it was now that the toggle floats. */}
        <div aria-hidden="true" className="hidden h-9 lg:block" />
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm animate-in lg:py-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
