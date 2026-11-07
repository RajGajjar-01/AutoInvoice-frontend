import { ArrowLeft, ArrowUpRight, Check, LockKeyhole } from "lucide-react"
import type { ReactNode } from "react"
import { Link } from "react-router"
import { Appearance } from "@/components/Common/Appearance"
import { AuthLayout } from "@/components/Common/AuthLayout"
import { Logo } from "@/components/Common/Logo"
import { usePhoneLayout } from "@/hooks/use-mobile"

/** Phones get the shared bottom-sheet AuthLayout; tablets and desktop keep the entry design below. */
export function AuthEntryLayout({
  children,
  signup = false,
}: {
  children: ReactNode
  signup?: boolean
}) {
  if (usePhoneLayout()) return <AuthLayout>{children}</AuthLayout>
  return (
    <div
      className={`auth-entry ${signup ? "auth-entry-signup" : "auth-entry-login"}`}
    >
      <header className="auth-entry-header">
        <Link to="/landing" aria-label="Back to home" className="auth-back">
          <ArrowLeft size={19} aria-hidden="true" />
        </Link>
        <Logo variant="full" className="h-8" asLink={false} />
        <Appearance />
      </header>
      <div className="auth-entry-body">
        <aside className="auth-story" aria-label="Your business workspace">
          <div className="auth-story-copy">
            <span className="auth-eyebrow">
              <span /> LESS ADMIN. MORE POSSIBILITY.
            </span>
            <h2>
              Your business.
              <br />A little more
              <br />
              <span>in balance.</span>
            </h2>
            <p>
              Invoices, customers, and the everyday.
              <br />
              Give it all a place to come together.
            </p>
          </div>
          <div className="auth-artwork" aria-hidden="true">
            <span className="auth-art-orbit" />
            <div className="auth-receipt-stack">
              <span className="auth-receipt-back" />
              <div className="auth-receipt">
                <div className="auth-receipt-top">
                  <span className="auth-receipt-mark">
                    <Check size={12} />
                  </span>
                  <span>INVOICE</span>
                  <span>↗</span>
                </div>
                <span className="auth-receipt-line auth-receipt-line-title" />
                <span className="auth-receipt-line auth-receipt-line-short" />
                <div className="auth-receipt-rows">
                  {[0, 1, 2].map((row) => (
                    <div key={row}>
                      <span />
                      <span />
                    </div>
                  ))}
                </div>
                <div className="auth-receipt-bottom">
                  <span />
                  <span />
                </div>
              </div>
              <span className="auth-receipt-seal">
                <Check size={22} strokeWidth={2.5} />
              </span>
            </div>
            <span className="auth-art-note">
              <span className="auth-note-check">
                <Check size={14} />
              </span>{" "}
              A little less paperwork.
              <ArrowUpRight size={15} />
            </span>
          </div>
          <div className="auth-story-footer">
            <span>MADE FOR YOUR EVERYDAY</span>
            <span>UnifiedDesk © {new Date().getFullYear()}</span>
          </div>
        </aside>
        <main className="auth-entry-main" id="auth-main">
          <div className="auth-form-content">{children}</div>
          <p className="auth-security">
            <LockKeyhole size={13} aria-hidden="true" />
            Your workspace. Your information.
          </p>
        </main>
      </div>
    </div>
  )
}
