// Which archetype, palette, and variant each enemy uses.
const palettes = {
  flesh: { main: '#c66b5a', dark: '#5a2620', light: '#f0b39a', eye: '#ffe66a', accent: '#f4ecd8' },
  purple: { main: '#6c3f8f', dark: '#26123a', light: '#a67fc8', eye: '#ff5b6e', accent: '#d9b14a' },
  acid: { main: '#7cc04a', dark: '#2b5a1a', light: '#c9f08a', eye: '#1d2a10', accent: '#e9ff9a' },
  red: { main: '#c23a3a', dark: '#4a1010', light: '#f08a7a', eye: '#ffe66a', accent: '#ffc24a' },
  spore: { main: '#b0663a', dark: '#4a2414', light: '#f4d8a8', eye: '#2a1a0a', accent: '#f4d8a8' },
  leather: { main: '#7a5a3a', dark: '#2e2016', light: '#b48b5e', eye: '#ffcf5a', accent: '#a83a2a' },
  blue: { main: '#3a5f9a', dark: '#14233e', light: '#86a8d8', eye: '#ffe66a', accent: '#c9d6e6' },
  fungus: { main: '#8a6aa0', dark: '#30203e', light: '#d4b8e8', eye: '#ffe66a', accent: '#b7e07a' },
  green: { main: '#5f8a3a', dark: '#22361a', light: '#a9d07a', eye: '#ffef7a', accent: '#d8c06a' },
  stone: { main: '#8a8a80', dark: '#3a3a34', light: '#c8c6ba', eye: '#5ad8ff', accent: '#e8d38a' },
  bronze: { main: '#b07a3a', dark: '#4a2e12', light: '#e8c07a', eye: '#5ae8ff', accent: '#ffd87a' },
  ghost: { main: '#4a7a6a', dark: '#0e2a22', light: '#9ef0c8', eye: '#ffffff', accent: '#7dffb0' },
  ember: { main: '#c25a2a', dark: '#3a0e06', light: '#ffb86a', eye: '#fff4c8', accent: '#ff8a2a' },
  teal: { main: '#2f8a8a', dark: '#0e3030', light: '#86d8d0', eye: '#ffe66a', accent: '#f0d8a0' },
  bone: { main: '#b8ae96', dark: '#4a4234', light: '#ece4cc', eye: '#ff4a3a', accent: '#6a2a2a' },
  shadow: { main: '#3a3150', dark: '#0e0b18', light: '#7a6aa0', eye: '#c8ff5a', accent: '#a08ad8' },
  gold: { main: '#b8902a', dark: '#4a3608', light: '#f4d87a', eye: '#ff5a5a', accent: '#ffe8a0' },
  void: { main: '#2a1a3a', dark: '#08040e', light: '#6a4a8a', eye: '#ff3a6a', accent: '#c84aff' },
}

const enemyLooks = {
  'Jaw Worm': ['worm', 'flesh'],
  Cultist: ['caster', 'purple', { beak: true }],
  'Acid Slime': ['slime', 'acid'],
  'Red Louse': ['bug', 'red'],
  'Spore Beast': ['mushroom', 'spore', { spores: true }],
  Looter: ['knight', 'leather', { hood: true }],
  'Blue Slaver': ['knight', 'blue', { hood: true, shield: true }],
  'Fungal Brute': ['mushroom', 'fungus', { vines: true }],
  'Gremlin Nob': ['brute', 'green'],
  'Sentinel Golem': ['construct', 'stone'],
  'Ancient Sentry': ['sentry', 'bronze'],
  Hexaghost: ['wraith', 'ghost', { flames: true }],
  'Slime King': ['slime', 'acid', { big: true, crown: true }],
  Shrieker: ['bird', 'teal'],
  Centurion: ['knight', 'red', { shield: true, plume: true }],
  'Snake Plant': ['mushroom', 'green', { vines: true }],
  Chosen: ['caster', 'purple', { staff: true }],
  Snecko: ['serpent', 'teal'],
  'Book of Stabbing': ['book', 'leather'],
  'Bronze Golem': ['construct', 'bronze'],
  'Bone Knight': ['knight', 'bone', { bone: true }],
  'The Collector': ['caster', 'shadow', { orbs: true }],
  'Bronze Automaton': ['construct', 'bronze', { antenna: true }],
  Darkling: ['wraith', 'shadow', { small: true }],
  'Orb Walker': ['construct', 'stone', { orb: true }],
  'Writhing Mass': ['mass', 'flesh'],
  'Giant Head': ['head', 'stone'],
  Spiker: ['bug', 'bone', { spikes: true }],
  Nemesis: ['wraith', 'void', { scythe: true }],
  Reptomancer: ['caster', 'green', { staff: true }],
  'Time Eater': ['clock', 'gold'],
  'Awakened One': ['wraith', 'void', { wings: true }],
}

export const getEnemyLook = (name) => {
  const [type, palette, variant] = enemyLooks[name] ?? ['slime', 'purple']
  return { type, palette: palettes[palette], variant: variant ?? {} }
}

export const enemyArtNames = Object.keys(enemyLooks)
