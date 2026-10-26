// Barrel for all static game data. Each kind of content lives in its own file.
export * from './cards.js'
export * from './characters.js'
export * from './enemies.js'
export * from './events.js'
export * from './keywords.js'
export * from './potions.js'
export * from './relics.js'

export const ACT_COUNT = 3

export const actNames = { 1: 'Ember Road', 2: 'The Hollow City', 3: "Spire's Crown" }

// Map room types: icon name (see art/icons.jsx) and legend label.
export const roomTypes = {
  fight: { icon: 'sword', label: 'Enemy' },
  elite: { icon: 'skull', label: 'Elite' },
  mystery: { icon: 'question', label: 'Unknown' },
  rest: { icon: 'campfire', label: 'Campfire' },
  shop: { icon: 'bag', label: 'Merchant' },
  treasure: { icon: 'chest', label: 'Treasure' },
  boss: { icon: 'crown', label: 'Boss' },
}
