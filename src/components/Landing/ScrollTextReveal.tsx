import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useLayoutEffect, useRef } from "react"

gsap.registerPlugin(ScrollTrigger)

const REVEAL_TEXT =
  "Most invoices take longer to format than they do to get paid. Manual GST calculations, mismatched templates, and follow-up emails eat into hours you don't have. AutoInvoice turns that into a few clicks, so every invoice looks professional, stays compliant, and gets you paid faster."

const words = REVEAL_TEXT.split(" ")

export function ScrollTextReveal() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      gsap.to(wordRefs.current, {
        opacity: 1,
        duration: 0.4,
        stagger: 0.03,
        ease: "power1.out",
        scrollTrigger: {
          trigger: textRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-6">
        <p
          ref={textRef}
          className="font-display text-2xl font-medium leading-snug tracking-tight text-center md:text-4xl"
        >
          {words.map((word, i) => (
            <span
              key={`${word}-${i}`}
              ref={(el) => {
                wordRefs.current[i] = el
              }}
              className="text-foreground opacity-20"
            >
              {word}{" "}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}
