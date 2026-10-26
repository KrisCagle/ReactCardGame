// Icon path data, drawn on a 24x24 grid. Rendered by <Icon> in icons.jsx.
export const iconPaths = {
  sword: (
    <>
      <path d="M19 3 9.5 12.5l2 2L21 5V3z" />
      <path d="m7 13 4 4-1.5 1.5-1.2-1.2L5.5 20l-1.5-1.5 2.7-2.8-1.2-1.2z" />
    </>
  ),
  swords: (
    <>
      <path d="M20 3 11 12l1.5 1.5L21.5 4.5V3z" />
      <path d="M4 3v1.5l9 9L14.5 12 5.5 3z" opacity="0.85" />
      <path d="m6 14 4 4-1.2 1.2-1-1L5.3 21 4 19.7l2.5-2.5-1-1zM18 14l-4 4 1.2 1.2 1-1 2.5 2.5L20 19.7l-2.5-2.5 1-1z" />
    </>
  ),
  shield: <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z" />,
  bolt: <path d="M13 2 4 14h6l-1 8 9-12h-6z" />,
  heart: <path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z" />,
  skull: (
    <path d="M12 2C7 2 4 5.4 4 9.6c0 2.6 1.2 4.4 3 5.5V19h2v-2h2v2h2v-2h2v2h2v-3.9c1.8-1.1 3-2.9 3-5.5C20 5.4 17 2 12 2zM9 13a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm6 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
  ),
  arrowUp: <path d="M12 3 4 12h5v9h6v-9h5z" />,
  arrowDown: <path d="M12 21 4 12h5V3h6v9h5z" />,
  drop: <path d="M12 2s-7 8-7 13a7 7 0 0 0 14 0c0-5-7-13-7-13z" />,
  flask: <path d="M9 2h6v2h-1v5l5.5 9.5A2.3 2.3 0 0 1 17.5 22h-11a2.3 2.3 0 0 1-2-3.5L10 9V4H9z" />,
  coin: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9.5 9.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4" fill="none" stroke="#000" strokeOpacity="0.35" strokeWidth="1.6" />
    </>
  ),
  cards: (
    <>
      <rect x="3" y="5" width="11" height="15" rx="2" opacity="0.6" transform="rotate(-10 8 12)" />
      <rect x="9" y="4" width="11" height="15" rx="2" />
    </>
  ),
  flame: <path d="M12 2c1 3.5 5 5.8 5 11a5 5 0 0 1-10 0c0-2.6 1.4-4.2 2.6-5.6.2 1.8 1 2.8 2 3.4C11.8 8.3 11 5.2 12 2z" />,
  fist: <path d="M7 7h2.5V5.5a1.5 1.5 0 0 1 3 0V7h1V5.8a1.5 1.5 0 0 1 3 0V8h.5a2 2 0 0 1 2 2v4.5A6.5 6.5 0 0 1 12.5 21h-1A5.5 5.5 0 0 1 6 15.5V8a1 1 0 0 1 1-1z" />,
  eye: (
    <>
      <path d="M12 5C6.5 5 2.5 9.5 1.5 12c1 2.5 5 7 10.5 7s9.5-4.5 10.5-7C21.5 9.5 17.5 5 12 5z" />
      <circle cx="12" cy="12" r="3.2" fill="#000" fillOpacity="0.45" />
    </>
  ),
  chest: (
    <>
      <path d="M3 10a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5z" />
      <path d="M3 11h18v9H3z" opacity="0.85" />
      <rect x="10.5" y="9.5" width="3" height="4" rx="0.8" fill="#000" fillOpacity="0.4" />
    </>
  ),
  campfire: (
    <>
      <path d="M12 2c.8 2.8 4 4.6 4 8.8a4 4 0 0 1-8 0c0-2 1.1-3.4 2-4.5.2 1.4.8 2.2 1.6 2.7.2-2.6-.4-4.9.4-7z" />
      <path d="M3 19.5 20 15l1 2.5-17 4.5zM21 19.5 4 15l-1 2.5 17 4.5z" opacity="0.8" />
    </>
  ),
  question: (
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 16h-2v-2h2zm2.1-7.7-.9.9c-.7.7-1.2 1.3-1.2 2.8h-2v-.5c0-1.1.5-2.1 1.2-2.8l1.2-1.3A2 2 0 1 0 10 8H8a4 4 0 1 1 7.1 2.3z" />
  ),
  crown: <path d="M3 7l4.5 4L12 4l4.5 7L21 7l-2 12H5z" />,
  bag: <path d="M9 3h6l-1.5 3h1A6.5 6.5 0 0 1 21 12.5V16a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-3.5A6.5 6.5 0 0 1 9.5 6h1z" />,
  star: <path d="m12 2 2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 21l1.6-7L2 9.2l7.1-.6z" />,
  scroll: <path d="M6 3h11a3 3 0 0 1 3 3v1h-3v11a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-1h3V6a3 3 0 0 1 0-3zm3 5v1.5h6V8zm0 4v1.5h6V12z" />,
  hourglass: <path d="M6 2h12v2c0 3-2.5 5.5-4.5 8 2 2.5 4.5 5 4.5 8v2H6v-2c0-3 2.5-5.5 4.5-8C8.5 9.5 6 7 6 4z" />,
  gem: <path d="M6 3h12l4 6-10 12L2 9z" />,
  brokenShield: (
    <>
      <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11V2z" />
      <path d="M13.5 2.5 20 5v6c0 4.4-2.6 8.4-6.5 10.3l1.5-6-2.5-2 2.5-3.3-1.5-3z" opacity="0.75" />
    </>
  ),
  spiral: <path d="M12 3a9 9 0 1 0 9 9h-2.5A6.5 6.5 0 1 1 12 5.5a4 4 0 1 1-4 4H10.5A1.5 1.5 0 1 0 12 8V3z" />,
  thorns: <path d="M12 2 14 8l6-2-3.5 5L22 14l-6.5 1 1 7-4.5-5-4.5 5 1-7L2 14l5.5-3L4 6l6 2z" />,
  gear: (
    <path d="m10.3 2h3.4l.5 2.6 1.8.8 2.2-1.5 2.4 2.4-1.5 2.2.8 1.8 2.6.5v3.4l-2.6.5-.8 1.8 1.5 2.2-2.4 2.4-2.2-1.5-1.8.8-.5 2.6h-3.4l-.5-2.6-1.8-.8-2.2 1.5-2.4-2.4 1.5-2.2-.8-1.8L2 13.7v-3.4l2.6-.5.8-1.8L3.9 5.8l2.4-2.4 2.2 1.5 1.8-.8zM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
  ),
  cross: <path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z" />,
  moon: <path d="M15 2a10 10 0 1 0 7 17A8 8 0 0 1 15 2z" />,
  speaker: (
    <>
      <path d="M3 9h4l5-5v16l-5-5H3z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </>
  ),
  speakerOff: (
    <>
      <path d="M3 9h4l5-5v16l-5-5H3z" />
      <path d="m15.5 9 5 6m0-6-5 6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </>
  ),
  save: <path d="M4 3h13l4 4v14H3V3zm3 2v5h9V5zm5 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />,
}

export const iconNames = Object.keys(iconPaths)
