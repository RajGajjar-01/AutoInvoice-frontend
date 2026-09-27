import { Appearance } from "@/components/Common/Appearance"
import { Logo } from "@/components/Common/Logo"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-zinc-950 lg:flex lg:items-center lg:justify-center">
        <div className="absolute inset-0 hero-dot-grid opacity-40" />
        <div
          aria-hidden="true"
          className="auth-orb auth-orb-a absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/40 blur-[100px]"
        />
        <div
          aria-hidden="true"
          className="auth-orb auth-orb-b absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-emerald-500/30 blur-[100px]"
        />
        <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-6 px-8 text-center">
          <div className="animate-in">
            <Logo
              variant="full"
              className="h-14 brightness-0 invert"
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
          <div className="grid w-full grid-cols-3 gap-3 animate-in animate-in-delay-2">
            <div className="auth-float rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-md">
              <p className="font-display text-xl font-bold text-white">60s</p>
              <p className="mt-1 text-[11px] text-zinc-400">invoice creation</p>
            </div>
            <div
              className="auth-float rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-md"
              style={{ animationDelay: "1.2s" }}
            >
              <p className="font-display text-xl font-bold text-white">5/mo</p>
              <p className="mt-1 text-[11px] text-zinc-400">free to start</p>
            </div>
            <div
              className="auth-float rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-md"
              style={{ animationDelay: "2.4s" }}
            >
              <p className="font-display text-xl font-bold text-white">GST</p>
              <p className="mt-1 text-[11px] text-zinc-400">
                compliant billing
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-zinc-500 animate-in animate-in-delay-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              UPI & bank details on invoices
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Payment reminders
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
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
