import { cn } from "@/lib/utils"

// Each frame shows one scene from the shared sheet; the browser downloads it once.
const scenes = {
  invoices: { left: 0, width: 408, top: 128 },
  customers: { left: 408, width: 347, top: 128 },
  inventory: { left: 755, width: 383, top: 128 },
  payments: { left: 1138, width: 398, top: 128 },
  quotations: { left: 0, width: 398, top: 544 },
  reminders: { left: 398, width: 355, top: 544 },
  insights: { left: 753, width: 416, top: 544 },
  profile: { left: 1169, width: 367, top: 544 },
} as const

export type LandingIllustrationScene = keyof typeof scenes

export function LandingIllustration({
  scene,
  className,
}: {
  scene: LandingIllustrationScene
  className?: string
}) {
  const { left, width, top } = scenes[scene]
  return (
    <span
      aria-hidden="true"
      style={{ aspectRatio: `${width} / 384` }}
      className={cn(
        "pointer-events-none relative block shrink-0 overflow-hidden select-none",
        className,
      )}
    >
      <img
        src="/assets/illustrations/business-spots.webp"
        width={1536}
        height={1024}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute h-auto max-w-none"
        style={{
          width: `${(1536 / width) * 100}%`,
          left: `${(-left / width) * 100}%`,
          top: `${(-top / 384) * 100}%`,
        }}
      />
    </span>
  )
}
