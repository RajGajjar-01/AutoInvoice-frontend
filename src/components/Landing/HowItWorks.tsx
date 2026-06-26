import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useLayoutEffect, useRef } from "react"

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    number: "01",
    title: "Set up your profile",
    description:
      "Add your business name, GST number, logo, and address once.",
  },
  {
    number: "02",
    title: "Create your invoice",
    description:
      "Pick a template, add items with GST rates, and preview instantly.",
  },
  {
    number: "03",
    title: "Send and get paid",
    description:
      "Email the PDF or download it. Track payment status in real time.",
  },
]

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      gsap.from(".hiw-heading", {
        y: 20,
        opacity: 0,
        duration: 0.25,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".hiw-heading",
          start: "top 90%",
          toggleActions: "play none none none",
        },
      })

      const stepEls = gsap.utils.toArray<Element>(".hiw-step")
      stepEls.forEach((step, i) => {
        gsap.from(step, {
          opacity: 0,
          y: 20,
          duration: 0.3,
          delay: i * 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: step,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-20 bg-muted/20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="hiw-heading text-center mb-20">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Up and running in three steps
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            No accountant needed. No spreadsheets. Just your business details
            and you are ready.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-2">
          {steps.map((step) => (
            <div
              key={step.number}
              className="hiw-step relative flex flex-col items-center text-center"
            >
              <span
                aria-hidden="true"
                className="font-display absolute inset-x-0 -top-6 text-center text-[8rem] font-semibold leading-none text-foreground/[0.04] select-none pointer-events-none"
              >
                {step.number}
              </span>
              <div className="relative z-10 pt-14 flex flex-col items-center px-6">
                <div className="w-10 h-10 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center mb-5">
                  <span className="text-xs font-semibold text-primary tracking-wider">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-base font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px]">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
