// Full-screen scenic backdrops, one mood per act (plus the menu).
// Pure SVG so there are no image downloads.
const themes = {
  menu: { sky: ['#0b0d18', '#1d1730', '#3a1f2a'], far: '#171326', near: '#0b0a12', glow: '#ff7a3a', particles: '#ffb86a' },
  1: { sky: ['#140b0c', '#3a1714', '#7a2e1a'], far: '#2a1210', near: '#120808', glow: '#ff8a3a', particles: '#ffb86a' },
  2: { sky: ['#071418', '#12323a', '#2a4a5a'], far: '#0e2228', near: '#060e10', glow: '#6ae0d0', particles: '#9ef0e0' },
  3: { sky: ['#140c22', '#3a2450', '#a0783a'], far: '#231436', near: '#0c0716', glow: '#ffd47a', particles: '#ffe8a0' },
}

const spires = (y, scale) =>
  [60, 170, 290, 420, 560, 700, 830, 960, 1100, 1230, 1360, 1490].map((x, i) => {
    const h = (80 + ((i * 53) % 90)) * scale
    const w = (34 + ((i * 17) % 30)) * scale
    return `M${x - w} ${y} L${x - w * 0.6} ${y - h * 0.7} L${x} ${y - h} L${x + w * 0.6} ${y - h * 0.7} L${x + w} ${y} Z`
  })

export function Backdrop({ act = 'menu' }) {
  const t = themes[act] ?? themes.menu
  const id = `backdrop-${act}`
  return (
    <svg aria-hidden="true" className="backdrop" preserveAspectRatio="xMidYMax slice" viewBox="0 0 1440 900">
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={t.sky[0]} />
          <stop offset="0.6" stopColor={t.sky[1]} />
          <stop offset="1" stopColor={t.sky[2]} />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.8" r="0.6">
          <stop offset="0" stopColor={t.glow} stopOpacity="0.45" />
          <stop offset="1" stopColor={t.glow} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1440" height="900" fill={`url(#${id}-sky)`} />
      <rect width="1440" height="900" fill={`url(#${id}-glow)`} />
      {/* the spire on the horizon */}
      <path d="M700 640 L708 260 L720 120 L732 260 L740 640 Z" fill={t.far} opacity="0.9" />
      <circle cx="720" cy="140" r="6" fill={t.glow} className="art-pulse" />
      {spires(700, 1.4).map((d) => (
        <path key={d} d={d} fill={t.far} opacity="0.85" />
      ))}
      <path d="M0 760 C240 700 420 740 720 720 C1020 700 1220 740 1440 710 V900 H0 Z" fill={t.near} />
      <g className="backdrop-particles" fill={t.particles}>
        {Array.from({ length: 24 }, (_, i) => (
          <circle
            key={i}
            cx={(i * 197) % 1440}
            cy={600 + ((i * 89) % 280)}
            r={1.5 + (i % 3)}
            style={{ animationDelay: `${(i % 8) * 0.9}s`, animationDuration: `${7 + (i % 5)}s` }}
          />
        ))}
      </g>
    </svg>
  )
}
