import { Appearance } from "@/components/Common/Appearance"
import { Logo } from "@/components/Common/Logo"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden overflow-hidden border-r border-white/10 bg-zinc-950 lg:flex lg:flex-col">
        <div className="absolute inset-0 hero-dot-grid opacity-20" />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
        />
        <div className="relative z-10 mx-auto flex h-full w-full max-w-lg flex-col justify-between gap-8 px-10 py-10">
          <div className="flex items-center justify-between animate-in">
            <Logo
              variant="full"
              className="h-9 brightness-0 invert"
              asLink={false}
            />
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-medium text-zinc-300">
              Free plan · No credit card
            </span>
          </div>

          <div className="space-y-6">
            <div className="space-y-3 animate-in animate-in-delay-1">
              <h2 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-white">
                Free GST invoices for Indian businesses
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-zinc-400">
                Create professional invoices in 60 seconds, track payments, and
                get paid faster.
              </p>
            </div>

            <ul className="space-y-2.5 text-sm text-zinc-300 animate-in animate-in-delay-1">
              <li className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/15 text-xs text-emerald-300">
                  ✓
                </span>
                GST-compliant invoices with HSN and tax split
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/15 text-xs text-emerald-300">
                  ✓
                </span>
                UPI and bank details printed on every invoice
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/15 text-xs text-emerald-300">
                  ✓
                </span>
                Payment reminders over email and WhatsApp
              </li>
            </ul>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-sm animate-in animate-in-delay-2">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-white">
                    INV-001 · Sharma Enterprises
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Due in 3 days · UPI linked
                  </p>
                </div>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                  Paid
                </span>
              </div>
              <div className="space-y-2 px-5 py-4 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Web design services</span>
                  <span className="text-zinc-200">₹25,000</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>SEO package × 3</span>
                  <span className="text-zinc-200">₹15,000</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>CGST + SGST (9% + 9%)</span>
                  <span className="text-zinc-200">₹7,200</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2.5 font-semibold text-white">
                  <span>Total received</span>
                  <span>₹47,200</span>
                </div>
              </div>
              <div className="px-5 pb-4">
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="auth-paybar h-full rounded-full bg-emerald-400/80" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 animate-in animate-in-delay-2">
            <div className="flex -space-x-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-950 bg-zinc-700 text-[11px] font-semibold text-white">
                RS
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-950 bg-zinc-600 text-[11px] font-semibold text-white">
                PK
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-950 bg-zinc-500 text-[11px] font-semibold text-white">
                AM
              </span>
            </div>
            <div className="text-xs">
              <p className="font-semibold text-white">
                Trusted by 500+ Indian businesses
              </p>
              <p className="mt-0.5 text-zinc-500">★★★★★ 4.9 average rating</p>
            </div>
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
