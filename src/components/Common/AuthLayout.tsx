import { Appearance } from "@/components/Common/Appearance"
import { BrandWaves } from "@/components/Common/BrandWaves"
import { Logo } from "@/components/Common/Logo"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
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
      <div className="flex min-w-0 flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center justify-between gap-3">
          <div className="lg:hidden">
            <Logo variant="full" className="h-8" asLink={false} />
          </div>
          <div className="ml-auto">
            <Appearance />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs animate-in">{children}</div>
        </div>
      </div>
    </div>
  )
}
