import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { MessageCircle } from "lucide-react"
import { useLayoutEffect, useRef } from "react"
import { Link } from "react-router"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"

gsap.registerPlugin(ScrollTrigger)

const faqs = [
  {
    question: "Is AutoInvoice really free to start?",
    answer:
      "Yes. The Free plan includes 5 invoices per month with no credit card required. Sign up and start sending invoices right away.",
  },
  {
    question: "Does it support GST (CGST, SGST, IGST)?",
    answer:
      "Yes. All GST types are supported, including inter-state IGST and intra-state CGST/SGST calculations. Reverse charge is also handled automatically.",
  },
  {
    question: "Can I export invoices as PDF?",
    answer:
      "Yes. Every invoice can be downloaded as a PDF or emailed directly to your client from within the app.",
  },
  {
    question: "Can I add my own logo and branding?",
    answer:
      "Yes. On Pro and Business plans you can upload your logo, pick brand colors, and customize invoice templates to match your business.",
  },
  {
    question: "Can I upgrade or downgrade my plan at any time?",
    answer:
      "Yes. You can change your plan anytime from your account settings. Changes take effect at the start of your next billing cycle.",
  },
  {
    question: "How many users can access one account?",
    answer:
      "Free and Pro plans support 1 user. The Business plan supports up to 5 team members, each with their own login.",
  },
  {
    question: "Is my business data safe?",
    answer:
      "Yes. All data is encrypted in transit and at rest. We do not share your data with third parties.",
  },
]

export function FAQ() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      gsap.from(".faq-heading", {
        y: 20,
        opacity: 0,
        duration: 0.25,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".faq-heading",
          start: "top 90%",
          toggleActions: "play none none none",
        },
      })

      gsap.from(".faq-accordion", {
        y: 20,
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".faq-accordion",
          start: "top 90%",
          toggleActions: "play none none none",
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-20 bg-muted/20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 items-start">
          {/* Left: sticky heading block (2/5) */}
          <div className="faq-heading lg:col-span-2 lg:sticky lg:top-24">
            <p className="text-sm font-medium text-primary mb-3">FAQ</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Questions you probably have
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Everything you need to know about AutoInvoice, GST, and billing.
              Cannot find your answer here?
            </p>
            <Button variant="outline" className="mt-6" asChild>
              <Link to="/signup">
                <MessageCircle className="mr-2 h-4 w-4" />
                Talk to us
              </Link>
            </Button>
          </div>

          {/* Right: accordion (3/5) */}
          <Accordion
            type="multiple"
            className="faq-accordion lg:col-span-3 space-y-2"
          >
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-lg border bg-background px-4"
              >
                <AccordionTrigger className="text-left text-sm font-medium py-4 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
