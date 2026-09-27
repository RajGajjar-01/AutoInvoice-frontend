import { Appearance } from "@/components/Common/Appearance"
import { Logo } from "@/components/Common/Logo"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden border-r border-white/10 bg-zinc-950 lg:flex lg:items-center lg:justify-center">
        <div className="absolute inset-0 hero-dot-grid opacity-25" />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
        />
        <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-6 px-8 text-center">
          <div className="animate-in">
            <Logo
              variant="full"
              className="h-12 brightness-0 invert"
              asLink={false}
            />
          </div>
          <div className="animate-in animate-in-delay-1 space-y-3">
            <h2 className="font-display text-3xl font-bold tracking-tight text-white">
              Free GST invoices for Indian businesses
            </h2>
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-zinc-400">
              Create professional invoices in 60 seconds, track payments, and
              get paid faster. No credit card required.
            </p>
          </div>
          <div className="w-full rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left backdrop-blur-sm animate-in animate-in-delay-2">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  INV-001 · Sharma Enterprises
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Sent 2 days ago · UPI linked
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                Paid
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="auth-paybar h-full w-3/4 rounded-full bg-emerald-400/80" />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-zinc-500">₹59,000 received</span>
              <span className="text-zinc-400">GST included</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-zinc-500 animate-in animate-in-delay-2">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
              60-second invoicing
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
              Payment reminders
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
              Works on mobile
            </span>
          </div>
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
        <p className="text-center text-xs text-muted-foreground lg:hidden">
          Free GST invoices for Indian businesses. No credit card required.
        </p>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs animate-in">{children}</div>
        </div>
      </div>
    </div>
  )
}
