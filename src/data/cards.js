// Card text is generated from these effect fields (see describeCard in game/cards.js),
// so the description can never drift from what the card actually does.
// Rule: a card that draws for 0 net energy (cost - energy <= 0) must Exhaust,
// or two copies can draw each other forever. runState.test.js enforces this.
// `upgrade` lists the fields that change when the card is upgraded at a campfire.
// rarity: basic | common | uncommon | rare | curse
export const cardLibrary = {
  // Basics
  strike: { id: 'strike', name: 'Strike', type: 'Attack', rarity: 'basic', cost: 1, damage: 6, upgrade: { damage: 9 } },
  guard: { id: 'guard', name: 'Guard', type: 'Skill', rarity: 'basic', cost: 1, block: 5, upgrade: { block: 8 } },

  // Shared
  focus: { id: 'focus', name: 'Focus', type: 'Skill', rarity: 'common', cost: 0, draw: 1, energy: 1, exhaust: true, upgrade: { draw: 2 } },
  cleave: { id: 'cleave', name: 'Cleave', type: 'Attack', rarity: 'common', cost: 1, damage: 8, upgrade: { damage: 11 } },
  shrug: { id: 'shrug', name: 'Shrug It Off', type: 'Skill', rarity: 'common', cost: 1, block: 8, draw: 1, upgrade: { block: 11 } },
  pommel: { id: 'pommel', name: 'Pommel Strike', type: 'Attack', rarity: 'common', cost: 1, damage: 7, draw: 1, upgrade: { damage: 9, draw: 2 } },
  ironWave: { id: 'iron-wave', name: 'Iron Wave', type: 'Attack', rarity: 'common', cost: 1, damage: 5, block: 5, upgrade: { damage: 7, block: 7 } },
  twinStrike: { id: 'twin-strike', name: 'Twin Strike', type: 'Attack', rarity: 'common', cost: 1, damage: 5, hits: 2, upgrade: { damage: 7 } },
  recover: { id: 'recover', name: 'Second Wind', type: 'Skill', rarity: 'common', cost: 1, block: 9, heal: 2, upgrade: { block: 12, heal: 3 } },
  warcry: { id: 'warcry', name: 'Warcry', type: 'Skill', rarity: 'common', cost: 0, block: 3, draw: 2, exhaust: true, upgrade: { block: 5 } },
  volley: { id: 'volley', name: 'Volley', type: 'Attack', rarity: 'common', cost: 1, damage: 9, draw: 1, upgrade: { damage: 12 } },
  charge: { id: 'charge', name: 'Battle Trance', type: 'Skill', rarity: 'uncommon', cost: 0, draw: 3, exhaust: true, upgrade: { draw: 4 } },
  inflame: { id: 'inflame', name: 'Inflame', type: 'Power', rarity: 'uncommon', cost: 1, strength: 2, upgrade: { strength: 3 } },
  chargeUp: { id: 'charge-up', name: 'Charge Up', type: 'Skill', rarity: 'uncommon', cost: 1, block: 6, energy: 1, upgrade: { block: 9 } },
  bloodForBlood: { id: 'blood-for-blood', name: 'Blood For Blood', type: 'Attack', rarity: 'uncommon', cost: 3, damage: 18, upgrade: { cost: 2 } },

  // Ironclad
  bash: { id: 'bash', name: 'Bash', type: 'Attack', rarity: 'common', cost: 2, damage: 8, vulnerable: 2, upgrade: { damage: 10, vulnerable: 3 } },
  heavyBlade: { id: 'heavy-blade', name: 'Heavy Blade', type: 'Attack', rarity: 'common', cost: 2, damage: 18, upgrade: { damage: 24 } },
  fortify: { id: 'fortify', name: 'Fortify', type: 'Skill', rarity: 'common', cost: 1, block: 11, upgrade: { block: 15 } },
  shieldSlam: { id: 'shield-slam', name: 'Shield Slam', type: 'Attack', rarity: 'common', cost: 1, damage: 8, block: 5, upgrade: { damage: 10, block: 7 } },
  clothesline: { id: 'clothesline', name: 'Clothesline', type: 'Attack', rarity: 'common', cost: 2, damage: 12, weak: 2, upgrade: { damage: 14, weak: 3 } },
  uppercut: { id: 'uppercut', name: 'Uppercut', type: 'Attack', rarity: 'uncommon', cost: 2, damage: 12, weak: 1, vulnerable: 1, upgrade: { weak: 2, vulnerable: 2 } },
  battleRhythm: { id: 'battle-rhythm', name: 'Battle Rhythm', type: 'Skill', rarity: 'uncommon', cost: 1, block: 4, draw: 2, upgrade: { draw: 3 } },
  seeingRed: { id: 'seeing-red', name: 'Seeing Red', type: 'Skill', rarity: 'uncommon', cost: 1, energy: 2, exhaust: true, upgrade: { cost: 0 } },
  berserk: { id: 'berserk', name: 'Berserk', type: 'Power', rarity: 'uncommon', cost: 1, strength: 1, energy: 1, upgrade: { cost: 0 } },
  demonForm: { id: 'demon-form', name: 'Demon Form', type: 'Power', rarity: 'rare', cost: 3, strengthPerTurn: 2, upgrade: { strengthPerTurn: 3 } },
  bludgeon: { id: 'bludgeon', name: 'Bludgeon', type: 'Attack', rarity: 'rare', cost: 3, damage: 34, upgrade: { damage: 44 } },
  offering: { id: 'offering', name: 'Offering', type: 'Skill', rarity: 'rare', cost: 0, hpLoss: 6, energy: 2, draw: 3, exhaust: true, upgrade: { draw: 5 } },

  // Huntress
  quickstep: { id: 'quickstep', name: 'Quickstep', type: 'Skill', rarity: 'common', cost: 0, block: 4, draw: 1, exhaust: true, upgrade: { block: 6 } },
  aimedShot: { id: 'aimed-shot', name: 'Aimed Shot', type: 'Attack', rarity: 'common', cost: 1, damage: 8, vulnerable: 1, upgrade: { damage: 11 } },
  pinningShot: { id: 'pinning-shot', name: 'Pinning Shot', type: 'Attack', rarity: 'common', cost: 1, damage: 6, vulnerable: 2, upgrade: { damage: 9 } },
  ricochet: { id: 'ricochet', name: 'Ricochet', type: 'Attack', rarity: 'common', cost: 1, damage: 7, draw: 1, upgrade: { damage: 10 } },
  deadlyPoison: { id: 'deadly-poison', name: 'Deadly Poison', type: 'Skill', rarity: 'common', cost: 1, poison: 5, upgrade: { poison: 7 } },
  poisonedStab: { id: 'poisoned-stab', name: 'Poisoned Stab', type: 'Attack', rarity: 'common', cost: 1, damage: 6, poison: 3, upgrade: { damage: 8, poison: 4 } },
  smokeVeil: { id: 'smoke-veil', name: 'Smoke Veil', type: 'Skill', rarity: 'uncommon', cost: 0, block: 7, upgrade: { block: 10 } },
  quickPlan: { id: 'quick-plan', name: 'Quick Plan', type: 'Skill', rarity: 'uncommon', cost: 0, draw: 3, exhaust: true, upgrade: { draw: 4 } },
  toxicFlask: { id: 'toxic-flask', name: 'Toxic Flask', type: 'Skill', rarity: 'uncommon', cost: 2, poison: 9, upgrade: { poison: 12 } },
  noxiousFumes: { id: 'noxious-fumes', name: 'Noxious Fumes', type: 'Power', rarity: 'rare', cost: 1, poisonPerTurn: 2, upgrade: { poisonPerTurn: 3 } },
  catalyst: { id: 'catalyst', name: 'Catalyst', type: 'Skill', rarity: 'rare', cost: 1, multiplyPoison: 2, exhaust: true, upgrade: { multiplyPoison: 3 } },
  adrenaline: { id: 'adrenaline', name: 'Adrenaline', type: 'Skill', rarity: 'rare', cost: 0, energy: 1, draw: 2, exhaust: true, upgrade: { energy: 2 } },

  // Arcanist
  emberBolt: { id: 'ember-bolt', name: 'Ember Bolt', type: 'Attack', rarity: 'common', cost: 1, damage: 9, upgrade: { damage: 12 } },
  frostWard: { id: 'frost-ward', name: 'Frost Ward', type: 'Skill', rarity: 'common', cost: 1, block: 9, upgrade: { block: 12 } },
  meditate: { id: 'meditate', name: 'Meditate', type: 'Power', rarity: 'uncommon', cost: 1, blockPerTurn: 2, upgrade: { blockPerTurn: 3 } },
  arcShield: { id: 'arc-shield', name: 'Arc Shield', type: 'Skill', rarity: 'uncommon', cost: 1, block: 7, weak: 1, upgrade: { block: 10 } },
  sunLance: { id: 'sun-lance', name: 'Sun Lance', type: 'Attack', rarity: 'uncommon', cost: 2, damage: 15, upgrade: { damage: 20 } },
  hexingGlance: { id: 'hexing-glance', name: 'Hexing Glance', type: 'Skill', rarity: 'uncommon', cost: 1, weak: 2, upgrade: { weak: 3 } },
  manaBurst: { id: 'mana-burst', name: 'Mana Burst', type: 'Skill', rarity: 'rare', cost: 0, draw: 2, energy: 1, exhaust: true, upgrade: { draw: 3 } },
  overcharge: { id: 'overcharge', name: 'Overcharge', type: 'Power', rarity: 'rare', cost: 3, energyPerTurn: 1, upgrade: { cost: 2 } },
  starfall: { id: 'starfall', name: 'Starfall', type: 'Attack', rarity: 'rare', cost: 3, damage: 30, upgrade: { damage: 40 } },
  mirrorWard: { id: 'mirror-ward', name: 'Mirror Ward', type: 'Skill', rarity: 'rare', cost: 2, block: 30, exhaust: true, upgrade: { block: 40 } },

  // Curses come from events. They can't be played and clog your hand.
  doubt: { id: 'doubt', name: 'Doubt', type: 'Curse', rarity: 'curse', cost: 0, unplayable: true },
  regret: { id: 'regret', name: 'Regret', type: 'Curse', rarity: 'curse', cost: 0, unplayable: true },
}

const c = cardLibrary

export const sharedCardPool = [c.focus, c.cleave, c.shrug, c.pommel, c.ironWave, c.twinStrike, c.recover, c.warcry, c.volley, c.charge, c.inflame, c.chargeUp, c.bloodForBlood]

export const characterCardPools = {
  ironclad: [c.bash, c.heavyBlade, c.fortify, c.shieldSlam, c.clothesline, c.uppercut, c.battleRhythm, c.seeingRed, c.berserk, c.demonForm, c.bludgeon, c.offering],
  huntress: [c.quickstep, c.aimedShot, c.pinningShot, c.ricochet, c.deadlyPoison, c.poisonedStab, c.smokeVeil, c.quickPlan, c.toxicFlask, c.noxiousFumes, c.catalyst, c.adrenaline],
  arcanist: [c.emberBolt, c.frostWard, c.meditate, c.arcShield, c.sunLance, c.hexingGlance, c.manaBurst, c.overcharge, c.starfall, c.mirrorWard],
}

export const curses = [c.doubt, c.regret]
