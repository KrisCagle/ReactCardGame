// Enemy art: a set of drawn archetypes (worm, slime, caster...) that take a
// palette and a few variant flags, so 30+ enemies can each look distinct
// without 30 separate drawings. Canvas is 220x220, facing left, feet on the
// bottom edge.
import { getEnemyLook } from './enemyLooks'

const Eyes = ({ x1, x2, y, r = 5, color }) => (
  <g className="art-glow" fill={color}>
    <circle cx={x1} cy={y} r={r} />
    <circle cx={x2} cy={y} r={r} />
  </g>
)

const Shade = ({ id, p }) => (
  <defs>
    <linearGradient id={id} x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stopColor={p.light} />
      <stop offset="0.5" stopColor={p.main} />
      <stop offset="1" stopColor={p.dark} />
    </linearGradient>
  </defs>
)

const archetypes = {
  worm: ({ p, id }) => (
    <>
      <Shade id={id} p={p} />
      <path d="M200 220 C200 150 170 110 120 92 C80 80 52 92 44 120 L70 132 C80 116 100 116 118 124 C150 140 160 180 158 220 Z" fill={`url(#${id})`} />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M${150 - i * 22} ${200 - i * 26} q14 -6 24 4`} stroke={p.dark} strokeWidth="4" fill="none" opacity="0.6" />
      ))}
      <path d="M44 120 C30 96 44 70 72 72 C96 74 104 98 96 112 Z" fill={`url(#${id})`} />
      <path d="M40 112 L96 112 L84 136 C70 142 54 138 44 128 Z" fill="#2a0e0e" />
      <path d="M46 112 l6 10 6 -10 6 10 6 -10 6 10 6 -10 6 10 6 -10" fill="#f4ecd8" />
      <Eyes x1={62} x2={80} y={88} color={p.eye} />
    </>
  ),
  caster: ({ p, id, v }) => (
    <>
      <Shade id={id} p={p} />
      <path d="M110 40 C70 60 54 140 44 220 H176 C166 140 150 60 110 40 Z" fill={`url(#${id})`} />
      <path d="M110 22 C82 24 72 56 74 84 C88 100 132 100 146 84 C148 56 138 24 110 22 Z" fill={`url(#${id})`} />
      <path d="M84 66 C84 50 136 50 136 66 C136 84 124 92 110 92 C96 92 84 84 84 66 Z" fill="#0d0b12" />
      {v.beak && <path d="M92 70 L60 80 L92 84 Z" fill={p.accent} />}
      <Eyes x1={100} x2={120} y={68} r={4} color={p.eye} />
      <path d="M62 140 C40 130 30 110 34 96 L46 98 C46 112 58 124 72 128 Z" fill={p.dark} />
      {v.orbs && (
        <g className="art-float">
          <circle cx="30" cy="80" r="11" fill={p.accent} opacity="0.85" />
          <circle cx="190" cy="70" r="9" fill={p.accent} opacity="0.7" />
          <circle cx="40" cy="160" r="7" fill={p.accent} opacity="0.6" />
        </g>
      )}
      {v.staff && <rect x="34" y="60" width="7" height="160" rx="3" fill="#4a3424" />}
      {v.staff && <circle cx="37.5" cy="56" r="10" fill={p.accent} className="art-pulse" />}
    </>
  ),
  slime: ({ p, id, v }) => (
    <>
      <Shade id={id} p={p} />
      <path d={v.big ? 'M20 220 C10 150 50 70 110 70 C170 70 210 150 200 220 Z' : 'M40 220 C30 170 60 110 110 110 C160 110 190 170 180 220 Z'} fill={`url(#${id})`} opacity="0.92" />
      <ellipse cx={v.big ? 80 : 88} cy={v.big ? 110 : 138} rx="22" ry="12" fill="#fff" opacity="0.35" />
      <circle cx="140" cy="190" r="8" fill="#fff" opacity="0.2" />
      <Eyes x1={v.big ? 86 : 92} x2={v.big ? 128 : 124} y={v.big ? 140 : 160} r={v.big ? 8 : 6} color={p.eye} />
      <path d={v.big ? 'M84 170 Q107 186 130 170' : 'M94 182 Q108 192 122 182'} stroke={p.dark} strokeWidth="5" fill="none" />
      {v.crown && <path d="M70 76 L80 40 L96 64 L110 30 L124 64 L140 40 L150 76 Z" fill="#e7b93f" stroke="#8a6416" strokeWidth="3" />}
    </>
  ),
  bug: ({ p, id, v }) => (
    <>
      <Shade id={id} p={p} />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${80 + i * 30} 180 l-16 40 M${90 + i * 30} 180 l14 40`} stroke={p.dark} strokeWidth="5" strokeLinecap="round" />
      ))}
      <ellipse cx="120" cy="160" rx="72" ry="42" fill={`url(#${id})`} />
      {v.spikes &&
        [0, 1, 2, 3, 4, 5, 6].map((i) => (
          <path key={i} d={`M${66 + i * 18} ${132 - Math.abs(3 - i) * -2} l8 -30 8 30z`} fill={p.light} />
        ))}
      <path d="M70 150 C90 130 150 128 180 150" stroke={p.dark} strokeWidth="4" fill="none" opacity="0.5" />
      <circle cx="56" cy="160" r="26" fill={`url(#${id})`} />
      <path d="M34 168 q-14 4 -14 16 M36 176 q-8 10 -2 20" stroke={p.dark} strokeWidth="4" fill="none" />
      <Eyes x1={46} x2={62} y={152} r={4} color={p.eye} />
    </>
  ),
  mushroom: ({ p, id, v }) => (
    <>
      <Shade id={id} p={p} />
      <path d="M82 220 C80 180 84 140 90 120 L140 120 C146 140 150 180 148 220 Z" fill="#e8dcc4" />
      <path d="M82 220 C80 180 84 140 90 120 L104 120 C100 150 98 190 100 220 Z" fill="#c9b99c" />
      {v.vines ? (
        <path d="M30 220 C40 170 20 140 40 110 M190 220 C180 170 200 140 180 110" stroke={p.dark} strokeWidth="9" fill="none" strokeLinecap="round" />
      ) : null}
      <path d="M24 128 C24 70 70 40 115 40 C160 40 206 70 206 128 C170 120 60 120 24 128 Z" fill={`url(#${id})`} />
      {[[70, 80, 12], [120, 62, 9], [160, 92, 14], [100, 100, 7]].map(([cx, cy, r]) => (
        <circle key={cx} cx={cx} cy={cy} r={r} fill={p.light} opacity="0.85" />
      ))}
      <Eyes x1={100} x2={128} y={150} r={5} color={p.eye} />
      <path d="M100 176 Q114 168 128 176" stroke="#3a2a1a" strokeWidth="4" fill="none" />
      {v.spores && (
        <g className="art-float" fill={p.light} opacity="0.7">
          <circle cx="30" cy="40" r="4" />
          <circle cx="196" cy="30" r="5" />
          <circle cx="60" cy="18" r="3" />
        </g>
      )}
    </>
  ),
  knight: ({ p, id, v }) => (
    <>
      <Shade id={id} p={p} />
      <path d="M86 160 L80 220 H100 L104 166 Z M120 166 L124 220 H144 L136 160 Z" fill={p.dark} />
      <path d="M78 84 C74 120 78 150 86 168 L138 168 C146 150 150 120 144 84 C126 72 96 72 78 84 Z" fill={`url(#${id})`} />
      {v.bone && <path d="M92 100 h40 M92 116 h40 M92 132 h40" stroke="#eee5d0" strokeWidth="5" />}
      <path d="M80 92 C62 106 52 124 50 140 L62 144 C66 128 74 116 86 106 Z" fill={p.dark} />
      <rect x="26" y="40" width="8" height="110" rx="3" fill="#cfd8db" transform="rotate(-12 30 95)" />
      <rect x="18" y="130" width="26" height="7" rx="3" fill={p.accent} transform="rotate(-12 30 133)" />
      {v.shield && <path d="M130 100 L176 108 L170 160 C160 176 146 180 136 176 Z" fill={p.accent} stroke={p.dark} strokeWidth="4" />}
      {v.hood ? (
        <path d="M86 70 C80 36 100 22 112 22 C128 22 144 38 138 70 C130 82 94 82 86 70 Z" fill={p.dark} />
      ) : (
        <path d="M88 44 C88 22 136 22 136 44 L138 74 C126 84 98 84 86 74 Z" fill={`url(#${id})`} />
      )}
      <path d={v.hood ? 'M96 52 h30 v14 h-30z' : 'M92 52 h38 v6 h-38z'} fill="#0d0d10" />
      <Eyes x1={102} x2={118} y={v.hood ? 59 : 55} r={3} color={p.eye} />
      {v.plume && <path d="M112 24 C120 0 150 4 156 14 C140 12 128 18 118 30 Z" fill={p.accent} />}
    </>
  ),
  brute: ({ p, id }) => (
    <>
      <Shade id={id} p={p} />
      <path d="M70 170 L60 220 H92 L98 176 Z M132 176 L138 220 H170 L156 170 Z" fill={p.dark} />
      <path d="M50 96 C40 140 54 170 74 180 L160 180 C184 168 194 136 180 96 C158 70 72 70 50 96 Z" fill={`url(#${id})`} />
      <path d="M52 100 C30 120 22 150 26 176 L46 178 C46 156 52 132 64 116 Z" fill={`url(#${id})`} />
      <rect x="4" y="120" width="28" height="70" rx="12" fill="#5c3a22" transform="rotate(-24 18 155)" />
      {[0, 1, 2].map((i) => <circle key={i} cx={14 + i * 4} cy={132 + i * 18} r="4" fill="#9aa4a8" transform="rotate(-24 18 155)" />)}
      <path d="M80 84 C80 50 150 50 150 84 C150 104 136 112 115 112 C94 112 80 104 80 84 Z" fill={`url(#${id})`} />
      <path d="M84 62 C70 40 66 26 74 14 C82 30 92 42 100 56 Z M146 62 C160 40 164 26 156 14 C148 30 138 42 130 56 Z" fill="#efe5cf" />
      <Eyes x1={102} x2={126} y={82} r={5} color={p.eye} />
      <path d="M98 100 l6 -6 6 6 6 -6 6 6 6 -6" stroke="#f4ecd8" strokeWidth="3" fill="none" />
    </>
  ),
  construct: ({ p, id, v }) => (
    <>
      <Shade id={id} p={p} />
      {v.orb ? (
        <>
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${70 + i * 40} 160 L${50 + i * 50} 220`} stroke={p.dark} strokeWidth="9" strokeLinecap="round" />
          ))}
          <circle cx="110" cy="110" r="66" fill={`url(#${id})`} />
          <circle cx="110" cy="110" r="24" fill={p.eye} className="art-pulse" />
          <circle cx="110" cy="110" r="10" fill="#fff" />
        </>
      ) : (
        <>
          <path d="M70 170 h34 v50 h-34z M118 170 h34 v50 h-34z" fill={p.dark} />
          <rect x="54" y="70" width="114" height="110" rx="14" fill={`url(#${id})`} />
          <rect x="22" y="84" width="34" height="90" rx="12" fill={`url(#${id})`} />
          <rect x="166" y="84" width="34" height="90" rx="12" fill={`url(#${id})`} />
          <path d="M70 100 h82 M70 150 h82" stroke={p.dark} strokeWidth="4" opacity="0.5" />
          <circle cx="111" cy="126" r="16" fill={p.eye} className="art-pulse" />
          <rect x="80" y="26" width="62" height="48" rx="10" fill={`url(#${id})`} />
          <rect x="88" y="44" width="46" height="9" rx="3" fill={p.eye} className="art-glow" />
          {v.antenna && <path d="M111 26 V6" stroke={p.accent} strokeWidth="4" />}
          {v.antenna && <circle cx="111" cy="6" r="5" fill={p.eye} className="art-pulse" />}
        </>
      )}
    </>
  ),
  sentry: ({ p, id }) => (
    <>
      <Shade id={id} p={p} />
      <path d="M110 220 L90 190 H130 Z" fill={p.dark} opacity="0.6" />
      <g className="art-float">
        <path d="M110 30 L180 100 L110 170 L40 100 Z" fill={`url(#${id})`} />
        <path d="M110 54 L156 100 L110 146 L64 100 Z" fill={p.dark} />
        <circle cx="110" cy="100" r="18" fill={p.eye} className="art-pulse" />
        <circle cx="110" cy="100" r="7" fill="#fff" />
      </g>
    </>
  ),
  wraith: ({ p, id, v }) => (
    <>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor={p.light} />
          <stop offset="0.6" stopColor={p.main} />
          <stop offset="1" stopColor={p.dark} stopOpacity="0.4" />
        </radialGradient>
      </defs>
      {v.flames &&
        [0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i / 6) * Math.PI * 2
          const x = 110 + Math.cos(angle) * 82
          const y = 112 + Math.sin(angle) * 70
          return <path key={i} className="art-flicker" d={`M${x} ${y + 14} c-12 -6 -10 -22 0 -34 c10 12 12 28 0 34z`} fill={p.accent} style={{ animationDelay: `${i * 0.15}s` }} />
        })}
      <path
        d={v.small ? 'M110 120 C70 120 60 170 66 220 L84 200 L98 220 L112 200 L126 220 L140 200 L154 220 C160 170 150 120 110 120 Z' : 'M110 40 C56 40 40 120 50 220 L72 190 L92 220 L112 190 L132 220 L152 190 L172 220 C182 120 164 40 110 40 Z'}
        fill={`url(#${id})`}
        className="art-float"
      />
      <Eyes x1={v.small ? 98 : 90} x2={v.small ? 122 : 128} y={v.small ? 150 : 100} r={v.small ? 5 : 8} color={p.eye} />
      {v.scythe && (
        <>
          <rect x="20" y="20" width="7" height="200" rx="3" fill="#3a2f2a" transform="rotate(-10 24 120)" />
          <path d="M18 24 C50 8 92 18 110 42 C82 30 50 28 24 40 Z" fill="#d8dde0" />
        </>
      )}
      {v.wings && (
        <path d="M60 90 C20 60 0 100 6 150 C24 120 40 116 56 120 Z M160 90 C200 60 220 100 214 150 C196 120 180 116 164 120 Z" fill={p.dark} opacity="0.9" />
      )}
    </>
  ),
  bird: ({ p, id }) => (
    <>
      <Shade id={id} p={p} />
      <path d="M100 190 l-6 30 M120 190 l6 30" stroke="#d9a34a" strokeWidth="5" />
      <ellipse cx="114" cy="150" rx="52" ry="44" fill={`url(#${id})`} />
      <path d="M150 130 C190 90 210 110 214 140 C190 132 174 140 160 160 Z" fill={p.dark} className="art-flap" />
      <circle cx="74" cy="112" r="30" fill={`url(#${id})`} />
      <path d="M46 108 L14 120 L46 126 Z" fill="#e8b13c" />
      <Eyes x1={66} x2={82} y={104} r={4} color={p.eye} />
      <path d="M70 84 l-6 -20 14 14 4 -18 6 22" fill={p.light} />
    </>
  ),
  serpent: ({ p, id }) => (
    <>
      <Shade id={id} p={p} />
      <ellipse cx="120" cy="196" rx="80" ry="24" fill={`url(#${id})`} />
      <path d="M170 190 C190 150 150 130 120 140 C80 154 80 110 110 92 L130 110 C110 120 116 130 130 126 C176 112 210 160 186 200 Z" fill={`url(#${id})`} />
      <path d="M96 100 C80 60 110 30 136 44 C160 58 150 96 126 108 Z" fill={`url(#${id})`} />
      <circle cx="116" cy="66" r="16" fill="#fff6cf" />
      <circle cx="140" cy="70" r="12" fill="#fff6cf" />
      <circle cx="112" cy="68" r="7" fill="#1b1b1b" />
      <circle cx="136" cy="72" r="5" fill="#1b1b1b" />
      <path d="M104 96 l-10 8 m4 -2 l-6 -6" stroke="#d14b5a" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  book: ({ p, id }) => (
    <>
      <Shade id={id} p={p} />
      <g className="art-float">
        <path d="M110 70 L40 50 L40 170 L110 190 Z" fill={`url(#${id})`} />
        <path d="M110 70 L180 50 L180 170 L110 190 Z" fill={p.main} />
        <path d="M110 76 L48 58 L48 162 L110 180 Z M110 76 L172 58 L172 162 L110 180 Z" fill="#efe4c8" />
        <path d="M60 80 l36 10 M60 96 l36 10 M60 112 l30 8 M124 90 l36 -10 M124 106 l36 -10" stroke="#8b7a5a" strokeWidth="3" />
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`rotate(${-30 + i * 20} 110 80)`}>
            <rect x="107" y="0" width="6" height="56" fill="#d6dde0" />
            <rect x="100" y="54" width="20" height="6" fill="#8a6a2a" />
          </g>
        ))}
        <Eyes x1={92} x2={128} y={140} r={6} color={p.eye} />
      </g>
    </>
  ),
  clock: ({ p, id }) => (
    <>
      <Shade id={id} p={p} />
      <path d="M70 180 L56 220 H86 L92 186 Z M150 180 L164 220 H134 L128 186 Z" fill={p.dark} />
      <circle cx="110" cy="116" r="80" fill={`url(#${id})`} />
      <circle cx="110" cy="116" r="58" fill="#f3e9cf" />
      {[...Array(12)].map((_, i) => {
        const a = (i / 12) * Math.PI * 2
        return <circle key={i} cx={110 + Math.cos(a) * 48} cy={116 + Math.sin(a) * 48} r="3.5" fill="#3a2f22" />
      })}
      <g className="art-spin">
        <path d="M110 116 L110 72" stroke="#2a2018" strokeWidth="6" strokeLinecap="round" />
        <path d="M110 116 L142 128" stroke="#2a2018" strokeWidth="5" strokeLinecap="round" />
      </g>
      <circle cx="110" cy="116" r="6" fill={p.eye} />
      <Eyes x1={70} x2={150} y={58} r={6} color={p.eye} />
    </>
  ),
  head: ({ p, id }) => (
    <>
      <Shade id={id} p={p} />
      <path d="M30 220 C24 120 50 30 110 30 C170 30 196 120 190 220 Z" fill={`url(#${id})`} />
      <path d="M60 100 h36 v16 h-36z M124 100 h36 v16 h-36z" fill="#1a1a1a" />
      <rect x="64" y="104" width="28" height="8" fill={p.eye} className="art-glow" />
      <rect x="128" y="104" width="28" height="8" fill={p.eye} className="art-glow" />
      <path d="M104 120 L96 160 H124 L116 120 Z" fill={p.dark} />
      <path d="M70 186 h80 v12 h-80z" fill="#1a1a1a" />
      <path d="M50 70 l20 14 M170 70 l-20 14 M60 150 l14 4 M160 150 l-14 4" stroke={p.dark} strokeWidth="4" />
    </>
  ),
  mass: ({ p, id }) => (
    <>
      <Shade id={id} p={p} />
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          className="art-sway"
          style={{ animationDelay: `${i * 0.2}s` }}
          d={`M${60 + i * 26} 150 C${40 + i * 30} ${100 - i * 6} ${70 + i * 20} ${60 + (i % 2) * 20} ${50 + i * 30} ${30 + (i % 3) * 14}`}
          stroke={p.main}
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
        />
      ))}
      <path d="M20 220 C20 150 60 120 110 120 C160 120 200 150 200 220 Z" fill={`url(#${id})`} />
      {[[70, 170], [110, 150], [150, 176], [100, 196]].map(([cx, cy]) => (
        <g key={cx}>
          <circle cx={cx} cy={cy} r="11" fill="#f6efd8" />
          <circle cx={cx - 2} cy={cy} r="5" fill={p.eye} />
        </g>
      ))}
    </>
  ),
}

export function EnemyArt({ name, className = '' }) {
  const { type, palette, variant } = getEnemyLook(name)
  const Archetype = archetypes[type]
  const id = `enemy-${name.replace(/\W/g, '')}`
  return (
    <svg aria-hidden="true" className={`enemy-art ${className}`} viewBox="0 0 220 220">
      <g className="art-idle">
        <Archetype id={id} p={palette} v={variant} />
      </g>
    </svg>
  )
}

