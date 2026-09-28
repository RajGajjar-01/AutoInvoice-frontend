// Flowing contour lines for brand-blue panels (auth side panel, landing CTA), computed once at module load.
// Control points spread with the index, so the lines fan out into a ribbon.
const WAVE_PATHS = Array.from({ length: 26 }, (_, i) => {
  const y = 430 + i * 16
  return `M-80 ${y} C 180 ${y - 300 + i * 16}, 470 ${y + 260 - i * 14}, 880 ${y - 180 + i * 9}`
})

export function BrandWaves() {
  return (
    <svg
      aria-hidden="true"
      className="brand-waves absolute inset-0 h-full w-full"
      viewBox="0 0 800 900"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      <defs>
        <linearGradient id="brand-wave-stroke" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="white" stopOpacity="0" />
          <stop offset="0.45" stopColor="white" stopOpacity="0.6" />
          <stop offset="1" stopColor="white" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <g className="brand-waves-drift" stroke="url(#brand-wave-stroke)">
        {WAVE_PATHS.map((d, i) => (
          <path key={d} d={d} strokeWidth={i % 4 === 0 ? 1.4 : 0.8} />
        ))}
      </g>
    </svg>
  )
}
