// Relics are plain data so run state stays serializable.
// - Stat fields (block, energy, strength, thorns, maxEnergy, startingDraw, ...)
//   are summed at combat start or read by run rules.
// - Relics with triggers (turn start, card played, ...) have their logic in
//   game/relics.js, keyed by id.
// rarity: common | uncommon | rare | boss
export const relicLibrary = [
  // Common
  { id: 'vajra', name: 'Vajra', rarity: 'common', text: 'Start each combat with 1 strength.', strength: 1 },
  { id: 'anchor', name: 'Anchor', rarity: 'common', text: 'Start each combat with 8 block.', block: 8 },
  { id: 'lantern', name: 'Lantern', rarity: 'common', text: 'Start each combat with 1 extra energy.', energy: 1 },
  { id: 'bag-of-prep', name: 'Bag of Prep', rarity: 'common', text: 'Draw 2 extra cards on turn 1.', startingDraw: 2 },
  { id: 'tea-kettle', name: 'Tea Kettle', rarity: 'common', text: 'Heal 4 HP after every combat.', healAfterFight: 4 },
  { id: 'bronze-scales', name: 'Bronze Scales', rarity: 'common', text: 'Whenever an enemy attacks you, deal 3 damage back.', thorns: 3 },
  { id: 'bag-of-marbles', name: 'Bag of Marbles', rarity: 'common', text: 'At the start of each combat, apply 1 vulnerable to the enemy.' },
  { id: 'hex-mask', name: 'Hex Mask', rarity: 'common', text: 'At the start of each combat, apply 1 weak to the enemy.' },
  { id: 'strawberry', name: 'Strawberry', rarity: 'common', text: 'Gain 7 max HP when picked up.', maxHpOnObtain: 7 },
  { id: 'happy-flower', name: 'Happy Flower', rarity: 'common', text: 'Every 3 turns, gain 1 energy.' },
  { id: 'orichalcum', name: 'Orichalcum', rarity: 'common', text: 'If you end your turn without block, gain 6 block.' },
  { id: 'akabeko', name: 'Akabeko', rarity: 'common', text: 'Your first attack each combat deals 8 extra damage.' },
  { id: 'ceramic-fish', name: 'Ceramic Fish', rarity: 'common', text: 'Whenever you add a card to your deck, gain 9 gold.', goldPerCardAdded: 9 },

  // Uncommon
  { id: 'burning-blood', name: 'Burning Blood', rarity: 'uncommon', text: 'Heal 6 HP after elite and boss fights.' },
  { id: 'lucky-charm', name: 'Lucky Charm', rarity: 'uncommon', text: 'See 1 extra card in future card rewards.', rewardChoicesBonus: 1 },
  { id: 'ruby-idol', name: 'Ruby Idol', rarity: 'uncommon', text: 'Start each combat with 2 strength.', strength: 2 },
  { id: 'guard-shell', name: 'Guard Shell', rarity: 'uncommon', text: 'Start each combat with 12 block.', block: 12 },
  { id: 'horn-cleat', name: 'Horn Cleat', rarity: 'uncommon', text: 'At the start of your 2nd turn, gain 14 block.' },
  { id: 'shuriken', name: 'Shuriken', rarity: 'uncommon', text: 'Every time you play 3 attacks in a turn, gain 1 strength.' },
  { id: 'ornamental-fan', name: 'Ornamental Fan', rarity: 'uncommon', text: 'Every time you play 3 attacks in a turn, gain 4 block.' },
  { id: 'letter-opener', name: 'Letter Opener', rarity: 'uncommon', text: 'Every time you play 3 skills in a turn, deal 5 damage to the enemy.' },
  { id: 'meat-on-the-bone', name: 'Meat on the Bone', rarity: 'uncommon', text: 'If you end a combat at or below 50% HP, heal 12 HP.', lowHpHeal: 12 },
  { id: 'regal-pillow', name: 'Regal Pillow', rarity: 'uncommon', text: 'Heal an extra 15 HP when you rest.', restHealBonus: 15 },
  { id: 'pear', name: 'Pear', rarity: 'uncommon', text: 'Gain 10 max HP when picked up.', maxHpOnObtain: 10 },

  // Rare
  { id: 'storm-vial', name: 'Storm Vial', rarity: 'rare', text: 'Start each combat with 1 extra energy and 1 strength.', energy: 1, strength: 1 },
  { id: 'mercury-hourglass', name: 'Mercury Hourglass', rarity: 'rare', text: 'At the start of your turn, deal 3 damage to the enemy.' },
  { id: 'old-coin', name: 'Old Coin', rarity: 'rare', text: 'Gain 300 gold when picked up.', goldOnObtain: 300 },
  { id: 'membership-card', name: 'Membership Card', rarity: 'rare', text: 'Shop prices are 30% lower.', shopDiscount: 0.3 },
  { id: 'thread-and-needle', name: 'Thread and Needle', rarity: 'rare', text: 'At the start of each turn, gain 3 block.', blockPerTurn: 3 },

  // Boss - one extra energy every turn, each with a drawback.
  { id: 'coffee-dripper', name: 'Coffee Dripper', rarity: 'boss', text: 'Gain 1 energy every turn. You can no longer rest at campfires.', maxEnergy: 1, noRest: true },
  { id: 'fusion-hammer', name: 'Fusion Hammer', rarity: 'boss', text: 'Gain 1 energy every turn. You can no longer smith at campfires.', maxEnergy: 1, noSmith: true },
  { id: 'ectoplasm', name: 'Ectoplasm', rarity: 'boss', text: 'Gain 1 energy every turn. You can no longer gain gold.', maxEnergy: 1, noGold: true },
  { id: 'busted-crown', name: 'Busted Crown', rarity: 'boss', text: 'Gain 1 energy every turn. Card rewards offer 2 fewer cards.', maxEnergy: 1, rewardChoicesBonus: -2 },
  { id: 'sozu', name: 'Sozu', rarity: 'boss', text: 'Gain 1 energy every turn. You can no longer obtain potions.', maxEnergy: 1, noPotions: true },
]

export const relicById = Object.fromEntries(relicLibrary.map((relic) => [relic.id, relic]))
