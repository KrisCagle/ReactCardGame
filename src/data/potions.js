// Potions are single-use combat effects. Their effect fields are applied by
// applyEffects in game/combat.js, the same code relic triggers use.
export const POTION_SLOTS = 3

export const potionLibrary = [
  { id: 'fire-potion', name: 'Fire Potion', text: 'Deal 20 damage to the enemy.', effects: { damageEnemy: 20 } },
  { id: 'block-potion', name: 'Block Potion', text: 'Gain 12 block.', effects: { block: 12 } },
  { id: 'strength-potion', name: 'Strength Potion', text: 'Gain 2 strength.', effects: { strength: 2 } },
  { id: 'energy-potion', name: 'Energy Potion', text: 'Gain 2 energy.', effects: { energy: 2 } },
  { id: 'swift-potion', name: 'Swift Potion', text: 'Draw 3 cards.', effects: { draw: 3 } },
  { id: 'poison-potion', name: 'Poison Potion', text: 'Apply 6 poison to the enemy.', effects: { enemyStatus: { poison: 6 } } },
  { id: 'weak-potion', name: 'Weak Potion', text: 'Apply 3 weak to the enemy.', effects: { enemyStatus: { weak: 3 } } },
  { id: 'fear-potion', name: 'Fear Potion', text: 'Apply 3 vulnerable to the enemy.', effects: { enemyStatus: { vulnerable: 3 } } },
  { id: 'blood-potion', name: 'Blood Potion', text: 'Heal 20% of your max HP.', effects: { healPercent: 0.2 } },
]
