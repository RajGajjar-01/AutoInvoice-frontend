import { Appearance } from "@/components/Common/Appearance";
import { Logo } from "@/components/Common/Logo";
import { Footer } from "./Footer";

export function AuthLayout({ children }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left Side - Image Background with Overlay */}
      <div className="relative hidden lg:flex lg:flex-col lg:items-center lg:justify-center overflow-hidden bg-[#0a4a5c] dark:bg-[#083a48]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/assets/images/Purani dukaan.jpg"
            alt="Indian business"
            className="w-full h-full object-cover opacity-50 dark:opacity-40"
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a4a5c]/40 via-[#0a4a5c]/30 to-[#0d6580]/40 dark:from-[#083a48]/50 dark:via-[#083a48]/40 dark:to-[#0a4a5c]/50"></div>

        {/* Content */}
        <div className="relative z-10 text-center px-8 max-w-md">
          <h2 className="text-3xl font-bold text-white mb-4">
            From Small Shop to Smart Business
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Join 10,000+ Indian businesses automating their operations
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-col gap-3 text-white/90 text-sm">
            <div className="flex items-center gap-2 justify-center">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Setup in 5 minutes</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form Area */}
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-white dark:bg-zinc-950">
        <div className="flex justify-between items-center lg:justify-end">
          <Logo variant="full" className="h-10 lg:hidden dark:brightness-0 dark:invert" asLink={true} />
          <Appearance />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">{children}</div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
