// Barrel for all static game data. Each kind of content lives in its own file.
export * from './cards.js'
export * from './characters.js'
export * from './enemies.js'
export * from './events.js'
export * from './potions.js'
export * from './relics.js'

export const ACT_COUNT = 3

export const actNames = { 1: 'Ember Road', 2: 'The Hollow City', 3: "Spire's Crown" }

export const nodeIcons = { fight: 'x', mystery: '?', shop: '$', elite: '!', rest: '+', treasure: '*', boss: 'B' }
