// Triggered relic logic, keyed by relic id. Each hook is a pure function of the
// combat state that returns an effects object (applied by applyEffects in
// combat.js) or null. Keeping relics as data + hooks means relics in run state
// stay plain, serializable objects.
//
// Hooks: combatStart, turnStart, turnEnd, cardPlayed(combat, card),
// attackBonus(combat) -> extra damage per hit for the attack being played.
export const relicTriggers = {
  'bag-of-marbles': { combatStart: () => ({ enemyStatus: { vulnerable: 1 } }) },
  'hex-mask': { combatStart: () => ({ enemyStatus: { weak: 1 } }) },
  'happy-flower': { turnStart: (combat) => (combat.turn % 3 === 0 ? { energy: 1 } : null) },
  'horn-cleat': { turnStart: (combat) => (combat.turn === 2 ? { block: 14 } : null) },
  'mercury-hourglass': { turnStart: () => ({ damageEnemy: 3 }) },
  orichalcum: { turnEnd: (combat) => (combat.player.block === 0 ? { block: 6 } : null) },
  shuriken: {
    cardPlayed: (combat, card) => (card.type === 'Attack' && combat.counters.attacksThisTurn % 3 === 0 ? { strength: 1 } : null),
  },
  'ornamental-fan': {
    cardPlayed: (combat, card) => (card.type === 'Attack' && combat.counters.attacksThisTurn % 3 === 0 ? { block: 4 } : null),
  },
  'letter-opener': {
    cardPlayed: (combat, card) => (card.type === 'Skill' && combat.counters.skillsThisTurn % 3 === 0 ? { damageEnemy: 5 } : null),
  },
  akabeko: { attackBonus: (combat) => (combat.counters.attacksThisCombat === 0 ? 8 : 0) },
}

export const hasTrigger = (relic) => Boolean(relicTriggers[relic.id])
