// Enemies by act. `weak` fights appear on the first floors of an act, `strong`
// fights after that.
//
// Move fields: damage (+ hits), block, strength, and debuffs applied to the
// player (weak / frail / vulnerable). Player debuffs tick down at the end of
// the player's turn, so vulnerable needs 2+ stacks to still be up when the
// enemy next attacks.
//
// pattern: 'cycle' (default) walks the moves in order; 'random' picks by
// `weight` and never uses the same move three times in a row.
// passive: thorns (damage back per hit taken), enrage (strength when you play
// a skill), metallicize (block at the end of its turn), ritual (strength at the
// end of its turn).
export const WEAK_FIGHT_FLOORS = 3

export const enemiesByAct = {
  1: {
    weak: [
      { name: 'Jaw Worm', maxHp: 40, pattern: 'random', moves: [{ intent: 'Chomp', damage: 11, weight: 2 }, { intent: 'Thrash', damage: 7, block: 5, weight: 2 }, { intent: 'Bellow', strength: 3, block: 6 }] },
      { name: 'Cultist', maxHp: 46, moves: [{ intent: 'Incantation', ritualGain: 3 }, { intent: 'Dark Strike', damage: 6 }] },
      { name: 'Acid Slime', maxHp: 30, pattern: 'random', moves: [{ intent: 'Lick', weak: 1 }, { intent: 'Corrosive Spit', damage: 7, weight: 2 }, { intent: 'Tackle', damage: 10 }] },
      { name: 'Red Louse', maxHp: 16, pattern: 'random', moves: [{ intent: 'Bite', damage: 7, weight: 3 }, { intent: 'Grow', strength: 3 }] },
    ],
    strong: [
      { name: 'Spore Beast', maxHp: 44, moves: [{ intent: 'Spore Cloud', frail: 2 }, { intent: 'Bite', damage: 10 }, { intent: 'Bite', damage: 10 }] },
      { name: 'Looter', maxHp: 46, moves: [{ intent: 'Mug', damage: 10 }, { intent: 'Lunge', damage: 12 }, { intent: 'Smoke Bomb', block: 8 }] },
      { name: 'Blue Slaver', maxHp: 48, pattern: 'random', moves: [{ intent: 'Stab', damage: 12, weight: 2 }, { intent: 'Rake', damage: 7, weak: 1 }] },
      { name: 'Fungal Brute', maxHp: 54, passive: { thorns: 2 }, moves: [{ intent: 'Slam', damage: 9 }, { intent: 'Swell', strength: 2, block: 8 }, { intent: 'Slam', damage: 9 }] },
    ],
    elite: [
      { name: 'Gremlin Nob', maxHp: 76, passive: { enrage: 2 }, moves: [{ intent: 'Bellow', strength: 2 }, { intent: 'Skull Bash', damage: 6, vulnerable: 2 }, { intent: 'Rush', damage: 14 }] },
      { name: 'Sentinel Golem', maxHp: 64, passive: { metallicize: 6 }, moves: [{ intent: 'Rest', block: 10 }, { intent: 'Smash', damage: 18 }, { intent: 'Drain', weak: 1, frail: 1, strength: 2 }] },
      { name: 'Ancient Sentry', maxHp: 58, passive: { thorns: 3 }, moves: [{ intent: 'Beam', damage: 9, hits: 2 }, { intent: 'Bolt', damage: 10, frail: 2 }] },
    ],
    boss: [
      { name: 'Hexaghost', maxHp: 150, moves: [{ intent: 'Sear', damage: 6, frail: 1 }, { intent: 'Inflame', strength: 2, block: 12 }, { intent: 'Divider', damage: 2, hits: 6 }, { intent: 'Tackle', damage: 5, hits: 2 }, { intent: 'Inferno', damage: 3, hits: 6 }] },
      { name: 'Slime King', maxHp: 140, moves: [{ intent: 'Goop Spray', weak: 2, frail: 2 }, { intent: 'Preparing', block: 10 }, { intent: 'Slam', damage: 32 }] },
    ],
  },
  2: {
    weak: [
      { name: 'Shrieker', maxHp: 34, pattern: 'random', moves: [{ intent: 'Peck', damage: 1, hits: 5, weight: 2 }, { intent: 'Swoop', damage: 12 }] },
      { name: 'Centurion', maxHp: 72, pattern: 'random', moves: [{ intent: 'Slash', damage: 12, weight: 2 }, { intent: 'Fury', damage: 6, hits: 3 }, { intent: 'Defend', block: 15 }] },
      { name: 'Snake Plant', maxHp: 70, passive: { metallicize: 3 }, moves: [{ intent: 'Chomp', damage: 7, hits: 3 }, { intent: 'Spores', weak: 2, frail: 2 }] },
    ],
    strong: [
      { name: 'Chosen', maxHp: 85, moves: [{ intent: 'Poke', damage: 5, hits: 2 }, { intent: 'Drain', weak: 3, strength: 3 }, { intent: 'Zap', damage: 18 }] },
      { name: 'Snecko', maxHp: 95, pattern: 'random', moves: [{ intent: 'Bite', damage: 15, weight: 2 }, { intent: 'Tail Whip', damage: 8, vulnerable: 2, weak: 2 }] },
      { name: 'Book of Stabbing', maxHp: 120, moves: [{ intent: 'Multi-Stab', damage: 5, hits: 3 }, { intent: 'Big Stab', damage: 18 }] },
    ],
    elite: [
      { name: 'Bronze Golem', maxHp: 140, passive: { metallicize: 8 }, moves: [{ intent: 'Crush', damage: 20 }, { intent: 'Fortify', block: 20, strength: 3 }] },
      { name: 'Bone Knight', maxHp: 110, passive: { enrage: 1 }, moves: [{ intent: 'Cleave', damage: 16 }, { intent: 'Taunt', vulnerable: 2, weak: 2 }, { intent: 'Execute', damage: 10, hits: 2 }] },
    ],
    boss: [
      { name: 'The Collector', maxHp: 220, moves: [{ intent: 'Fireball', damage: 18 }, { intent: 'Buff', strength: 3, block: 15 }, { intent: 'Mega Debuff', weak: 3, vulnerable: 3, frail: 3 }, { intent: 'Fireball', damage: 18 }] },
      { name: 'Bronze Automaton', maxHp: 240, moves: [{ intent: 'Flail', damage: 7, hits: 2 }, { intent: 'Boost', strength: 3, block: 9 }, { intent: 'Flail', damage: 7, hits: 2 }, { intent: 'Hyper Beam', damage: 40 }, { intent: 'Stunned', block: 10 }] },
    ],
  },
  3: {
    weak: [
      { name: 'Darkling', maxHp: 56, pattern: 'random', moves: [{ intent: 'Nip', damage: 10, weight: 2 }, { intent: 'Chomp', damage: 8, hits: 2 }, { intent: 'Harden', block: 12, strength: 2 }] },
      { name: 'Orb Walker', maxHp: 92, passive: { ritual: 1 }, pattern: 'random', moves: [{ intent: 'Laser', damage: 11, frail: 1 }, { intent: 'Claw', damage: 15 }] },
    ],
    strong: [
      { name: 'Writhing Mass', maxHp: 140, passive: { thorns: 3 }, pattern: 'random', moves: [{ intent: 'Flail', damage: 15 }, { intent: 'Wither', damage: 10, weak: 2, vulnerable: 2 }, { intent: 'Multi-Strike', damage: 7, hits: 3 }] },
      { name: 'Giant Head', maxHp: 170, moves: [{ intent: 'Glare', weak: 1 }, { intent: 'Count', damage: 13 }, { intent: 'Count', damage: 13 }, { intent: 'It Is Time', damage: 30 }] },
      { name: 'Spiker', maxHp: 70, passive: { thorns: 5 }, moves: [{ intent: 'Cut', damage: 9 }, { intent: 'Spike Up', block: 10, strength: 2 }] },
    ],
    elite: [
      { name: 'Nemesis', maxHp: 185, moves: [{ intent: 'Debilitate', weak: 2, frail: 2 }, { intent: 'Tri-Attack', damage: 6, hits: 3 }, { intent: 'Scythe', damage: 40 }] },
      { name: 'Reptomancer', maxHp: 180, pattern: 'random', moves: [{ intent: 'Snake Strike', damage: 13, hits: 2, weak: 1, weight: 2 }, { intent: 'Big Bite', damage: 30 }] },
    ],
    boss: [
      { name: 'Time Eater', maxHp: 320, moves: [{ intent: 'Reverberate', damage: 7, hits: 3 }, { intent: 'Head Slam', damage: 26, frail: 2 }, { intent: 'Ripple', block: 20, weak: 1, vulnerable: 2, frail: 1 }] },
      { name: 'Awakened One', maxHp: 300, passive: { ritual: 2 }, moves: [{ intent: 'Slash', damage: 20 }, { intent: 'Soul Strike', damage: 6, hits: 4 }] },
    ],
  },
}
