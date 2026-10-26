// Player character portraits, drawn facing right on a 200x240 canvas with
// their feet on the bottom edge. Gradient ids are prefixed per character so
// several portraits can share a page.

function Ironclad() {
  return (
    <>
      <defs>
        <linearGradient id="ic-steel" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#d9e1e4" />
          <stop offset="0.55" stopColor="#7d8b91" />
          <stop offset="1" stopColor="#3b4448" />
        </linearGradient>
        <linearGradient id="ic-cape" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#c8372d" />
          <stop offset="1" stopColor="#5e1410" />
        </linearGradient>
        <linearGradient id="ic-blade" x1="0" x2="1">
          <stop offset="0" stopColor="#f4f7f8" />
          <stop offset="1" stopColor="#9aa6ab" />
        </linearGradient>
      </defs>
      {/* cape */}
      <path d="M62 78 C40 120 34 180 44 236 L128 236 C120 180 116 120 104 80 Z" fill="url(#ic-cape)" />
      {/* legs */}
      <path d="M76 168 L70 236 H90 L94 176 Z" fill="#2c3236" />
      <path d="M102 170 L108 236 H128 L118 168 Z" fill="#363d42" />
      <path d="M66 226 h28 v10 h-30 z M104 226 h28 v10 h-30z" fill="#1b1f22" />
      {/* torso */}
      <path d="M64 90 C62 130 66 160 72 176 L122 176 C128 156 130 128 124 92 C110 80 78 80 64 90 Z" fill="url(#ic-steel)" />
      <path d="M72 140 h50 v10 h-50z" fill="#5a2a18" />
      <rect x="92" y="138" width="12" height="14" rx="2" fill="#e0b44c" />
      {/* pauldrons */}
      <ellipse cx="66" cy="92" rx="20" ry="14" fill="url(#ic-steel)" />
      <ellipse cx="122" cy="92" rx="20" ry="14" fill="url(#ic-steel)" />
      {/* sword arm + sword */}
      <path d="M128 98 C140 112 144 126 140 140 L130 142 C130 128 124 116 118 106 Z" fill="#6f7c82" />
      <rect x="138" y="22" width="9" height="118" rx="2" fill="url(#ic-blade)" />
      <rect x="128" y="132" width="29" height="7" rx="3" fill="#c79a3a" />
      <rect x="139" y="139" width="7" height="18" fill="#4b2a16" />
      <circle cx="142.5" cy="160" r="5" fill="#c79a3a" />
      {/* helmet */}
      <path d="M74 48 C74 28 120 28 120 48 L122 78 C112 88 82 88 72 78 Z" fill="url(#ic-steel)" />
      <path d="M80 60 h34 v6 h-34z" fill="#111" />
      <rect x="84" y="61" width="26" height="3" fill="#ff7a4a" className="art-glow" />
      <path d="M74 46 L56 30 L64 52 Z M120 46 L138 30 L130 52 Z" fill="#e8e0cf" />
    </>
  )
}

function Huntress() {
  return (
    <>
      <defs>
        <linearGradient id="hu-cloak" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#4f8f6c" />
          <stop offset="1" stopColor="#173226" />
        </linearGradient>
        <linearGradient id="hu-leather" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#8a5b36" />
          <stop offset="1" stopColor="#4a2e19" />
        </linearGradient>
      </defs>
      {/* quiver */}
      <rect x="54" y="70" width="16" height="70" rx="6" fill="url(#hu-leather)" transform="rotate(-18 62 105)" />
      <path d="M50 64 l4 -14 4 14z M58 62 l4 -16 4 16z M66 64 l4 -13 4 13z" fill="#e8dcc0" transform="rotate(-18 62 105)" />
      {/* cloak */}
      <path d="M70 60 C52 110 48 180 56 236 L136 236 C140 180 132 110 118 60 Z" fill="url(#hu-cloak)" />
      {/* legs */}
      <path d="M80 190 L76 236 H94 L96 192 Z M102 192 L106 236 H124 L118 190 Z" fill="#2a2620" />
      {/* bow arm + bow */}
      <path d="M118 100 C134 104 146 108 156 110 L156 120 C142 120 128 118 114 114 Z" fill="#3c6b52" />
      <path d="M160 40 C186 90 186 140 160 190" fill="none" stroke="#7a4b26" strokeWidth="7" strokeLinecap="round" />
      <path d="M160 40 L160 190" stroke="#efe6d2" strokeWidth="1.6" />
      <path d="M118 112 L172 112" stroke="#d9c7a0" strokeWidth="3" />
      <path d="M172 106 l10 6 -10 6z" fill="#c9d2d4" />
      {/* belt */}
      <path d="M68 146 h60 v9 h-60z" fill="url(#hu-leather)" />
      {/* hood + face */}
      <path d="M70 66 C64 30 84 14 98 14 C116 14 130 32 122 66 C114 78 80 78 70 66 Z" fill="url(#hu-cloak)" />
      <path d="M80 54 C80 40 114 40 114 54 C114 66 106 72 97 72 C88 72 80 66 80 54 Z" fill="#101a15" />
      <circle cx="91" cy="55" r="2.8" fill="#bff5d6" className="art-glow" />
      <circle cx="105" cy="55" r="2.8" fill="#bff5d6" className="art-glow" />
    </>
  )
}

function Arcanist() {
  return (
    <>
      <defs>
        <linearGradient id="ar-robe" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#6b7fd6" />
          <stop offset="1" stopColor="#21265a" />
        </linearGradient>
        <radialGradient id="ar-orb">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.4" stopColor="#ffe39a" />
          <stop offset="1" stopColor="#ff9c3a" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* staff */}
      <rect x="146" y="40" width="7" height="196" rx="3" fill="#6b4a2c" />
      <circle cx="149.5" cy="34" r="22" fill="url(#ar-orb)" className="art-pulse" />
      <circle cx="149.5" cy="34" r="8" fill="#fff6d8" />
      {/* robe */}
      <path d="M72 70 C56 120 46 190 44 236 L144 236 C140 190 132 120 120 70 Z" fill="url(#ar-robe)" />
      <path d="M96 80 L92 236 H102 L100 80 Z" fill="#e0b44c" opacity="0.8" />
      {/* staff arm */}
      <path d="M118 96 C132 104 140 112 146 118 L142 128 C132 122 122 116 112 110 Z" fill="#3c4799" />
      <circle cx="148" cy="122" r="6" fill="#e9d2b5" />
      {/* sash */}
      <path d="M66 140 C90 150 110 150 130 140 L132 150 C110 160 88 160 64 150 Z" fill="#b2402f" />
      {/* hat + face */}
      <path d="M96 0 C108 20 118 38 136 62 L56 62 C76 40 86 20 96 0 Z" fill="url(#ar-robe)" />
      <path d="M48 60 C70 54 124 54 144 60 C124 68 70 68 48 60 Z" fill="#2a2f6e" />
      <path d="M78 64 C78 84 114 84 114 64 Z" fill="#e9d2b5" />
      <path d="M82 70 C88 92 104 92 110 70 C104 80 88 80 82 70 Z" fill="#d8d8e8" />
      <circle cx="90" cy="68" r="2.4" fill="#26305a" />
      <circle cx="103" cy="68" r="2.4" fill="#26305a" />
      {/* floating runes */}
      <g className="art-float" fill="#ffe39a" opacity="0.8">
        <path d="M30 100 l5 -9 5 9z" />
        <circle cx="176" cy="96" r="3.5" />
        <path d="M24 150 h8 v8 h-8z" transform="rotate(45 28 154)" />
      </g>
    </>
  )
}

const portraits = { ironclad: Ironclad, huntress: Huntress, arcanist: Arcanist }

export function CharacterArt({ characterId, className = '' }) {
  const Portrait = portraits[characterId] ?? Ironclad
  return (
    <svg aria-hidden="true" className={`character-art ${className}`} viewBox="0 0 200 240">
      <g className="art-idle">
        <Portrait />
      </g>
    </svg>
  )
}
