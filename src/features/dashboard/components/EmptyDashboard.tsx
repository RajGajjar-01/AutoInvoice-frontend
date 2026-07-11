import { FilePlus } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"

/* ─────────────────────────────────────────────
   Animated SVG illustration – "blank workspace"
   A rocket launching from a desk with floating
   documents around it to convey "start here".
───────────────────────────────────────────── */
function WorkspaceIllustration() {
  return (
    <svg
      viewBox="0 0 420 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-sm mx-auto"
      aria-hidden="true"
    >

      {/* ── Monitor ── */}
      <rect
        x="148"
        y="148"
        width="124"
        height="80"
        rx="10"
        fill="url(#screenBg)"
        stroke="url(#monitorBorder)"
        strokeWidth="2"
      />

      {/* Screen content – placeholder bars / empty state */}
      <rect x="162" y="162" width="58" height="6" rx="3" fill="url(#barFade)" opacity="0.5" />
      <rect x="162" y="174" width="40" height="5" rx="2.5" fill="url(#barFade)" opacity="0.3" />
      <rect x="162" y="184" width="50" height="5" rx="2.5" fill="url(#barFade)" opacity="0.2" />
      {/* Tiny chart bars */}
      <rect x="214" y="194" width="7" height="14" rx="2" fill="url(#chartBar)" opacity="0.4" />
      <rect x="224" y="199" width="7" height="9" rx="2" fill="url(#chartBar)" opacity="0.3" />
      <rect x="234" y="191" width="7" height="17" rx="2" fill="url(#chartBar)" opacity="0.5" />
      <rect x="244" y="196" width="7" height="12" rx="2" fill="url(#chartBar)" opacity="0.35" />

      {/* ── Rocket – centered on screen ── */}
      <g
        style={{
          animation: "rocketFloat 3s ease-in-out infinite",
          transformOrigin: "210px 120px",
        }}
      >
        {/* Body */}
        <ellipse cx="210" cy="122" rx="16" ry="26" fill="url(#rocketBody)" />
        {/* Nose cone */}
        <path
          d="M194 106 Q210 72 226 106Z"
          fill="url(#rocketNose)"
        />
        {/* Left fin */}
        <path d="M194 140 L184 158 L202 148Z" fill="url(#finGrad)" />
        {/* Right fin */}
        <path d="M226 140 L236 158 L218 148Z" fill="url(#finGrad)" />
        {/* Window */}
        <circle cx="210" cy="116" r="7" fill="url(#windowGrad)" />
        <circle cx="210" cy="116" r="4" fill="url(#windowInner)" />
        {/* Flame – clipped so it peeks just below the fins */}
        <g clipPath="url(#flameClip)">
          <ellipse
            cx="210"
            cy="153"
            rx="7"
            ry="11"
            fill="url(#flameGrad)"
            style={{ animation: "flameFlicker 0.4s ease-in-out infinite alternate" }}
          />
          <ellipse cx="210" cy="156" rx="3.5" ry="6" fill="url(#flameCoreGrad)" />
        </g>
      </g>

      {/* ── Floating invoice cards ── */}
      {/* Card 1 – top left */}
      <g
        style={{
          animation: "floatCard1 4s ease-in-out infinite",
          transformOrigin: "90px 80px",
        }}
      >
        <rect x="52" y="58" width="76" height="52" rx="8" fill="url(#cardBg)" stroke="url(#cardBorder)" strokeWidth="1.5" />
        <rect x="64" y="72" width="36" height="5" rx="2.5" fill="url(#textLine)" opacity="0.7" />
        <rect x="64" y="82" width="52" height="4" rx="2" fill="url(#textLine)" opacity="0.4" />
        <rect x="64" y="91" width="44" height="4" rx="2" fill="url(#textLine)" opacity="0.3" />
        {/* Badge */}
        <rect x="96" y="68" width="24" height="12" rx="6" fill="url(#badgeGrad)" opacity="0.8" />
        <rect x="100" y="72" width="16" height="4" rx="2" fill="white" opacity="0.6" />
      </g>

      {/* Card 2 – top right */}
      <g
        style={{
          animation: "floatCard2 4.5s ease-in-out infinite",
          transformOrigin: "340px 90px",
        }}
      >
        <rect x="294" y="62" width="76" height="52" rx="8" fill="url(#cardBg)" stroke="url(#cardBorder)" strokeWidth="1.5" />
        <rect x="306" y="76" width="36" height="5" rx="2.5" fill="url(#textLine)" opacity="0.7" />
        <rect x="306" y="86" width="52" height="4" rx="2" fill="url(#textLine)" opacity="0.4" />
        <rect x="306" y="95" width="44" height="4" rx="2" fill="url(#textLine)" opacity="0.3" />
        <rect x="338" y="72" width="24" height="12" rx="6" fill="url(#badgeGrad2)" opacity="0.8" />
        <rect x="342" y="76" width="16" height="4" rx="2" fill="white" opacity="0.6" />
      </g>

      {/* Card 3 – bottom right smaller */}
      <g
        style={{
          animation: "floatCard3 5s ease-in-out infinite",
          transformOrigin: "355px 195px",
        }}
      >
        <rect x="318" y="172" width="62" height="42" rx="7" fill="url(#cardBg)" stroke="url(#cardBorder)" strokeWidth="1.5" opacity="0.8" />
        <rect x="328" y="183" width="28" height="4" rx="2" fill="url(#textLine)" opacity="0.6" />
        <rect x="328" y="192" width="40" height="3" rx="1.5" fill="url(#textLine)" opacity="0.35" />
        <rect x="328" y="200" width="34" height="3" rx="1.5" fill="url(#textLine)" opacity="0.25" />
      </g>



      {/* ─ Defs ─ */}
      <defs>
        {/* Gradients */}
        <linearGradient id="shadowGrad" x1="50" y1="270" x2="370" y2="270" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--primary)" stopOpacity="0.5" />
          <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="screenBg" x1="148" y1="148" x2="272" y2="228" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--card)" />
          <stop offset="1" stopColor="var(--muted)" />
        </linearGradient>
        <linearGradient id="monitorBorder" x1="148" y1="148" x2="272" y2="228" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--primary)" stopOpacity="0.4" />
          <stop offset="1" stopColor="var(--border)" stopOpacity="0.6" />
        </linearGradient>

        <linearGradient id="barFade" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
          <stop stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--primary)" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="chartBar" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--primary)" stopOpacity="0.2" />
        </linearGradient>

        <linearGradient id="rocketBody" x1="194" y1="96" x2="226" y2="148" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--primary)" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="rocketNose" x1="194" y1="72" x2="226" y2="106" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--primary)" stopOpacity="0.7" />
          <stop offset="1" stopColor="var(--primary)" />
        </linearGradient>
        <linearGradient id="finGrad" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
          <stop stopColor="var(--primary)" stopOpacity="0.9" />
          <stop offset="1" stopColor="var(--primary)" stopOpacity="0.5" />
        </linearGradient>
        <radialGradient id="windowGrad" cx="50%" cy="50%" r="50%" gradientUnits="objectBoundingBox">
          <stop stopColor="#f0f4ff" />
          <stop offset="1" stopColor="#cbd5e1" />
        </radialGradient>
        <radialGradient id="windowInner" cx="40%" cy="35%" r="50%" gradientUnits="objectBoundingBox">
          <stop stopColor="white" stopOpacity="0.95" />
          <stop offset="1" stopColor="#e2e8f0" stopOpacity="0.6" />
        </radialGradient>
        <linearGradient id="flameCoreGrad" x1="207" y1="150" x2="213" y2="162" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fef3c7" />
          <stop offset="1" stopColor="#fb9a24ff" stopOpacity="1" />
        </linearGradient>
        <clipPath id="flameClip">
          <rect x="200" y="148" width="20" height="16" />
        </clipPath>


        <linearGradient id="cardBorder" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
          <stop stopColor="var(--primary)" stopOpacity="0.25" />
          <stop offset="1" stopColor="var(--border)" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="textLine" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
          <stop stopColor="var(--muted-foreground)" />
          <stop offset="1" stopColor="var(--muted-foreground)" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="badgeGrad" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
          <stop stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--primary)" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="badgeGrad2" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
          <stop stopColor="#0ea5e9" />
          <stop offset="1" stopColor="var(--primary)" stopOpacity="0.8" />
        </linearGradient>

      </defs>

      {/* ── Keyframes injected inline via style tag ── */}
      <style>{`
        @keyframes flameFlicker {
          0%   { transform: scaleX(1) scaleY(1); opacity: 1; }
          100% { transform: scaleX(1.2) scaleY(0.9); opacity: 0.85; }
        }
        @keyframes rocketFloat {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50%       { transform: translateY(-12px) rotate(2deg); }
        }

        @keyframes floatCard1 {
          0%, 100% { transform: translateY(0px) rotate(-3deg); }
          50%       { transform: translateY(-8px) rotate(-1deg); }
        }
        @keyframes floatCard2 {
          0%, 100% { transform: translateY(0px) rotate(3deg); }
          50%       { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes floatCard3 {
          0%, 100% { transform: translateY(0px) rotate(2deg); }
          50%       { transform: translateY(-6px) rotate(4deg); }
        }

      `}</style>
    </svg>
  )
}



/* ─────────────────────────────────────────────
   Main export
───────────────────────────────────────────── */
export function EmptyDashboard() {
  return (
    <div className="flex flex-col items-center gap-6 py-6 animate-in fade-in duration-500">
      {/* Hero illustration + text */}
      <div className="flex flex-col items-center gap-5 text-center max-w-lg mx-auto">
        <WorkspaceIllustration />

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Your workspace is ready
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            Create your first invoice and your dashboard will light up with
            real-time revenue charts, invoice activity, and customer insights.
          </p>
        </div>

        <Link to="/create-invoice">
          <Button size="lg" className="shadow-md gap-2 mt-1">
            <FilePlus className="h-4 w-4" />
            Create Your First Invoice
          </Button>
        </Link>
      </div>
    </div>
  )
}
