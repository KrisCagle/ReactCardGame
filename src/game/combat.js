// Pure combat engine. Every function takes a combat state (plus an rng when it
// needs randomness) and returns a new state - no React, no mutation of inputs.
import { ACT_COUNT, WEAK_FIGHT_FLOORS, enemiesByAct } from '../data/gameData.js'
import { createCombatCard } from './cards.js'
import { relicTriggers } from './relics.js'
import { pickOne, shuffle } from './rng.js'

export const HAND_SIZE = 5
export const MAX_HAND_SIZE = 10
export const BASE_ENERGY = 3
// Status multipliers, matching Slay the Spire.
export const VULNERABLE_MULTIPLIER = 1.5 // takes 50% more attack damage
export const WEAK_MULTIPLIER = 0.75 // deals 25% less attack damage
export const FRAIL_MULTIPLIER = 0.75 // gains 25% less block from cards
const LOG_LENGTH = 6

// Debuffs every combatant carries. Duration debuffs tick down at the end of
// their owner's turn; poison deals its value at the start of the owner's turn.
const noStatuses = { vulnerable: 0, weak: 0, frail: 0, poison: 0 }
export const DURATION_DEBUFFS = ['vulnerable', 'weak', 'frail']
const freshTurnCounters = { attacksThisTurn: 0, skillsThisTurn: 0 }

const sumOf = (items, key) => items.reduce((total, item) => total + (item[key] ?? 0), 0)

const addLog = (combat, messages) => (messages.length ? { ...combat, log: [...messages, ...combat.log].slice(0, LOG_LENGTH) } : combat)

// Settles the fight once either side reaches 0 HP. Called after every step that deals damage.
const checkOutcome = (combat) => {
  if (combat.outcome !== 'playing') return combat
  if (combat.enemy.hp <= 0) return addLog({ ...combat, outcome: 'won' }, [`${combat.enemy.name} is defeated.`])
  if (combat.player.hp <= 0) return addLog({ ...combat, outcome: 'lost' }, ['You fall, but the next climb begins here.'])
  return combat
}

// --- Enemies ---

export const getEnemyPool = (nodeType, act, floor = 0) => {
  const pools = enemiesByAct[act] ?? enemiesByAct[ACT_COUNT]
  if (nodeType === 'elite' || nodeType === 'boss') return pools[nodeType]
  return floor < WEAK_FIGHT_FLOORS ? pools.weak : pools.strong
}

// Random-pattern enemies pick by weight and never use one move three times in a row.
const chooseMoveIndex = (enemy, rng) => {
  if (enemy.pattern !== 'random') return (enemy.moveIndex + 1) % enemy.moves.length

  const [last, secondLast] = enemy.moveHistory
  const options = enemy.moves.map((move, index) => ({ index, weight: move.weight ?? 1 })).filter(({ index }) => !(index === last && index === secondLast))
  const total = options.reduce((sum, option) => sum + option.weight, 0)
  let roll = rng.next() * total
  for (const option of options) {
    roll -= option.weight
    if (roll < 0) return option.index
  }
  return options[0].index
}

// setup: { nodeType, act, floor, enemyName?, avoid?: names to skip (no repeat fights) }
export const createEnemy = ({ nodeType, act, floor = 0, enemyName, avoid = [] }, rng) => {
  const pool = getEnemyPool(nodeType, act, floor)
  const fresh = pool.filter((enemy) => !avoid.includes(enemy.name))
  const template = pool.find((enemy) => enemy.name === enemyName) ?? pickOne(rng, fresh.length ? fresh : pool)
  // A little HP variance so repeat fights don't feel identical.
  const maxHp = Math.round(template.maxHp * (0.95 + rng.next() * 0.1))

  const enemy = {
    ...template,
    ...noStatuses,
    thorns: template.passive?.thorns ?? 0,
    enrage: template.passive?.enrage ?? 0,
    metallicize: template.passive?.metallicize ?? 0,
    ritual: template.passive?.ritual ?? 0,
    maxHp,
    hp: maxHp,
    block: 0,
    strength: 0,
    moveIndex: -1,
    moveHistory: [],
  }
  const moveIndex = template.pattern === 'random' ? chooseMoveIndex(enemy, rng) : 0
  return { ...enemy, moveIndex, moveHistory: [moveIndex] }
}

export const getEnemyIntent = (combat) => combat.enemy.moves[combat.enemy.moveIndex]

export const describeEnemyPassive = (enemy) => {
  const parts = []
  if (enemy.thorns) parts.push(`Thorns ${enemy.thorns}: deals ${enemy.thorns} damage back each time you hit it.`)
  if (enemy.enrage) parts.push(`Enrage ${enemy.enrage}: gains ${enemy.enrage} strength whenever you play a skill.`)
  if (enemy.metallicize) parts.push(`Metallicize ${enemy.metallicize}: gains ${enemy.metallicize} block at the end of its turn.`)
  if (enemy.ritual) parts.push(`Ritual ${enemy.ritual}: gains ${enemy.ritual} strength at the end of its turn.`)
  return parts
}

// --- Damage and block ---

export const calculateAttackDamage = (baseDamage, attacker, defender, bonus = 0) => {
  let damage = baseDamage + bonus + (attacker.strength ?? 0)
  if (attacker.weak > 0) damage *= WEAK_MULTIPLIER
  if (defender.vulnerable > 0) damage *= VULNERABLE_MULTIPLIER
  return Math.max(0, Math.floor(damage))
}

export const calculateBlock = (baseBlock, target) => Math.floor(baseBlock * (target.frail > 0 ? FRAIL_MULTIPLIER : 1))

// Block absorbs damage first; returns the updated target and the HP it lost.
export const applyDamage = (target, amount) => {
  const blocked = Math.min(target.block, amount)
  const hpLoss = amount - blocked
  return { target: { ...target, block: target.block - blocked, hp: Math.max(0, target.hp - hpLoss) }, hpLoss }
}

// Damage numbers are shown as they would actually land on the player right now.
export const describeIntent = (move, enemy, player) => {
  const parts = []
  if (move.damage) {
    const damage = calculateAttackDamage(move.damage, enemy, player)
    parts.push(move.hits > 1 ? `${damage}x${move.hits} damage` : `${damage} damage`)
  }
  if (move.block) parts.push(`${move.block} block`)
  if (move.strength) parts.push(`+${move.strength} strength`)
  if (move.ritualGain) parts.push(`ritual ${move.ritualGain}`)
  DURATION_DEBUFFS.forEach((status) => {
    if (move[status]) parts.push(`${move[status]} ${status}`)
  })
  return parts.join(', ')
}

const tickDebuffs = (combatant) => {
  const next = { ...combatant }
  DURATION_DEBUFFS.forEach((status) => {
    next[status] = Math.max(0, next[status] - 1)
  })
  return next
}

// Poison ignores block, then loses one stack.
const tickPoison = (combatant) => {
  if (combatant.poison <= 0) return { combatant, hpLoss: 0 }
  return {
    combatant: { ...combatant, hp: Math.max(0, combatant.hp - combatant.poison), poison: combatant.poison - 1 },
    hpLoss: combatant.poison,
  }
}

// --- Cards ---

// Draws up to `amount` cards, reshuffling the discard pile into the draw pile
// when it runs out. Stops (leaving cards in the draw pile) once the hand is full.
export const drawCards = (combat, amount, rng) => {
  let drawPile = [...combat.drawPile]
  let discardPile = [...combat.discardPile]
  const hand = [...combat.hand]
  let handWasFull = false

  for (let i = 0; i < amount; i += 1) {
    if (hand.length >= MAX_HAND_SIZE) {
      handWasFull = true
      break
    }
    if (drawPile.length === 0) {
      if (discardPile.length === 0) break
      drawPile = shuffle(rng, discardPile)
      discardPile = []
    }
    hand.push(drawPile[0])
    drawPile = drawPile.slice(1)
  }

  const next = { ...combat, drawPile, discardPile, hand }
  return handWasFull ? addLog(next, ['Your hand is full.']) : next
}

// --- Generic effects (relic triggers and potions) ---

export const applyEffects = (combat, effects, rng, source) => {
  if (!effects || combat.outcome !== 'playing') return combat
  let player = { ...combat.player }
  let enemy = { ...combat.enemy }
  const messages = [`${source} activates.`]

  if (effects.block) player.block += effects.block
  if (effects.energy) player.energy += effects.energy
  if (effects.strength) player.strength += effects.strength
  if (effects.heal) player.hp = Math.min(player.maxHp, player.hp + effects.heal)
  if (effects.healPercent) player.hp = Math.min(player.maxHp, player.hp + Math.floor(player.maxHp * effects.healPercent))
  if (effects.damageEnemy) {
    const result = applyDamage(enemy, effects.damageEnemy)
    enemy = result.target
    messages.push(`${source} deals ${result.hpLoss} damage.`)
  }
  Object.entries(effects.enemyStatus ?? {}).forEach(([status, amount]) => {
    enemy = { ...enemy, [status]: enemy[status] + amount }
  })

  let next = addLog({ ...combat, player, enemy }, messages)
  if (effects.draw) next = drawCards(next, effects.draw, rng)
  return checkOutcome(next)
}

const runRelicHook = (combat, hook, rng, ...args) =>
  combat.relics.reduce((current, relic) => {
    const trigger = relicTriggers[relic.id]?.[hook]
    return trigger ? applyEffects(current, trigger(current, ...args), rng, relic.name) : current
  }, combat)

const relicAttackBonus = (combat) =>
  combat.relics.reduce((total, relic) => total + (relicTriggers[relic.id]?.attackBonus?.(combat) ?? 0), 0)

// Not named usePotion: the `use` prefix is reserved for React hooks.
export const drinkPotion = (combat, potion, rng) => applyEffects(combat, potion.effects, rng, potion.name)

// --- Combat setup ---

// setup: { deck, player: { hp, maxHp }, relics, startingDraw, node, act, avoidEnemies }
export const createCombat = (setup, rng) => {
  const { deck, player, relics = [], startingDraw = 0, node, act = 1, avoidEnemies = [] } = setup
  const cards = shuffle(rng, deck.map((card, index) => createCombatCard(card, `${node.id}-${index}`)))
  const maxEnergy = BASE_ENERGY + sumOf(relics, 'maxEnergy')
  const blockPerTurn = sumOf(relics, 'blockPerTurn')

  let combat = {
    node,
    act,
    relics,
    player: {
      ...noStatuses,
      hp: player.hp,
      maxHp: player.maxHp,
      block: sumOf(relics, 'block') + blockPerTurn,
      energy: maxEnergy + sumOf(relics, 'energy'),
      maxEnergy,
      strength: sumOf(relics, 'strength'),
      thorns: sumOf(relics, 'thorns'),
      blockPerTurn,
      strengthPerTurn: 0,
      poisonPerTurn: 0,
      energyPerTurn: 0,
    },
    enemy: createEnemy({ nodeType: node.type, act, floor: node.floor ?? 0, enemyName: node.enemyName, avoid: avoidEnemies }, rng),
    drawPile: cards,
    hand: [],
    discardPile: [],
    // Powers stay in play for the rest of the fight; exhausted cards are gone until next fight.
    powerPile: [],
    exhaustPile: [],
    turn: 1,
    counters: { ...freshTurnCounters, attacksThisCombat: 0 },
    log: [`${node.label} blocks the path.`],
    outcome: 'playing',
  }

  combat = runRelicHook(combat, 'combatStart', rng)
  combat = runRelicHook(combat, 'turnStart', rng)
  return drawCards(combat, HAND_SIZE + startingDraw, rng)
}

// --- Playing cards ---

export const canPlayCard = (combat, card) => combat.outcome === 'playing' && !card.unplayable && card.cost <= combat.player.energy

export const playCard = (combat, instanceId, rng) => {
  const card = combat.hand.find((item) => item.instanceId === instanceId)
  if (!card || !canPlayCard(combat, card)) return combat

  let player = { ...combat.player, energy: combat.player.energy - card.cost }
  let enemy = { ...combat.enemy }
  const messages = []

  if (card.hpLoss) {
    player.hp = Math.max(0, player.hp - card.hpLoss)
    messages.push(`${card.name} costs ${card.hpLoss} HP.`)
  }
  if (card.damage) {
    const hits = card.hits ?? 1
    const bonus = relicAttackBonus(combat)
    let totalLoss = 0
    for (let i = 0; i < hits && enemy.hp > 0 && player.hp > 0; i += 1) {
      const result = applyDamage(enemy, calculateAttackDamage(card.damage, player, enemy, bonus))
      enemy = result.target
      totalLoss += result.hpLoss
      if (enemy.thorns) player = applyDamage(player, enemy.thorns).target
    }
    messages.push(`${card.name} hits for ${totalLoss}.`)
  }
  if (card.vulnerable) enemy.vulnerable += card.vulnerable
  if (card.weak) enemy.weak += card.weak
  if (card.poison) enemy.poison += card.poison
  if (card.multiplyPoison) enemy.poison *= card.multiplyPoison
  if (card.block) {
    const gained = calculateBlock(card.block, player)
    player.block += gained
    messages.push(`${card.name} adds ${gained} block.`)
  }
  if (card.strength) player.strength += card.strength
  if (card.energy) player.energy += card.energy
  if (card.heal) player.hp = Math.min(player.maxHp, player.hp + card.heal)
  ;['blockPerTurn', 'strengthPerTurn', 'poisonPerTurn', 'energyPerTurn'].forEach((key) => {
    if (card[key]) player[key] += card[key]
  })
  if (card.type === 'Skill' && enemy.enrage) {
    enemy.strength += enemy.enrage
    messages.push(`${enemy.name} is enraged.`)
  }

  const counters = {
    ...combat.counters,
    attacksThisTurn: combat.counters.attacksThisTurn + (card.type === 'Attack' ? 1 : 0),
    skillsThisTurn: combat.counters.skillsThisTurn + (card.type === 'Skill' ? 1 : 0),
    attacksThisCombat: combat.counters.attacksThisCombat + (card.type === 'Attack' ? 1 : 0),
  }
  let next = addLog({ ...combat, player, enemy, counters, hand: combat.hand.filter((item) => item.instanceId !== instanceId) }, messages)

  // Draw before the played card hits the discard pile, so it can't be reshuffled
  // and drawn by its own effect.
  if (card.draw) next = drawCards(next, card.draw, rng)

  if (card.type === 'Power') next = { ...next, powerPile: [...next.powerPile, card] }
  else if (card.exhaust) next = { ...next, exhaustPile: [...next.exhaustPile, card] }
  else next = { ...next, discardPile: [...next.discardPile, card] }

  next = checkOutcome(next)
  return runRelicHook(next, 'cardPlayed', rng, card)
}

// --- Turn flow ---

const runEnemyTurn = (combat) => {
  const move = getEnemyIntent(combat)
  const poisoned = tickPoison({ ...combat.enemy, block: 0 })
  let enemy = poisoned.combatant
  let player = { ...combat.player }
  const messages = []
  // Ritual gained this turn starts paying out next turn.
  const ritualBefore = enemy.ritual

  if (poisoned.hpLoss) messages.push(`${enemy.name} takes ${poisoned.hpLoss} poison damage.`)
  if (enemy.hp <= 0) return checkOutcome(addLog({ ...combat, enemy }, messages))

  if (move.damage) {
    const hits = move.hits ?? 1
    let totalLoss = 0
    for (let i = 0; i < hits && player.hp > 0 && enemy.hp > 0; i += 1) {
      const result = applyDamage(player, calculateAttackDamage(move.damage, enemy, player))
      player = result.target
      totalLoss += result.hpLoss
      if (player.thorns) enemy = applyDamage(enemy, player.thorns).target
    }
    messages.push(`${enemy.name} uses ${move.intent} for ${totalLoss}.`)
  }
  if (move.block) enemy.block += move.block
  if (move.strength) enemy.strength += move.strength
  if (move.ritualGain) enemy.ritual += move.ritualGain
  DURATION_DEBUFFS.forEach((status) => {
    if (move[status]) player = { ...player, [status]: player[status] + move[status] }
  })
  if (!move.damage) messages.push(`${enemy.name} uses ${move.intent}.`)

  // End of the enemy's turn.
  enemy = { ...tickDebuffs(enemy), block: enemy.block + enemy.metallicize, strength: enemy.strength + ritualBefore }
  return checkOutcome(addLog({ ...combat, player, enemy }, messages))
}

const advanceEnemyMove = (combat, rng) => {
  const moveIndex = chooseMoveIndex(combat.enemy, rng)
  return { ...combat, enemy: { ...combat.enemy, moveIndex, moveHistory: [moveIndex, ...combat.enemy.moveHistory].slice(0, 2) } }
}

const startPlayerTurn = (combat, rng) => {
  const turn = combat.turn + 1
  const poisoned = tickPoison(combat.player)
  const base = combat.player
  const player = {
    ...poisoned.combatant,
    block: base.blockPerTurn,
    energy: base.maxEnergy + base.energyPerTurn,
    strength: base.strength + base.strengthPerTurn,
  }
  const enemy = { ...combat.enemy, poison: combat.enemy.poison + base.poisonPerTurn }
  const messages = poisoned.hpLoss ? [`You take ${poisoned.hpLoss} poison damage.`, `Turn ${turn} begins.`] : [`Turn ${turn} begins.`]

  let next = checkOutcome(addLog({ ...combat, turn, player, enemy, counters: { ...combat.counters, ...freshTurnCounters } }, messages))
  if (next.outcome !== 'playing') return next
  next = drawCards(next, HAND_SIZE, rng)
  return runRelicHook(next, 'turnStart', rng)
}

export const endTurn = (combat, rng) => {
  if (combat.outcome !== 'playing') return combat

  // End of the player's turn: relic triggers, discard the hand, tick the player's debuffs.
  const afterRelics = runRelicHook(combat, 'turnEnd', rng)
  if (afterRelics.outcome !== 'playing') return afterRelics
  const discarded = {
    ...afterRelics,
    player: tickDebuffs(afterRelics.player),
    discardPile: [...afterRelics.discardPile, ...afterRelics.hand],
    hand: [],
  }

  const afterEnemy = runEnemyTurn(discarded)
  if (afterEnemy.outcome !== 'playing') return afterEnemy

  return startPlayerTurn(advanceEnemyMove(afterEnemy, rng), rng)
}

export const countCombatCards = (combat) =>
  combat.drawPile.length + combat.hand.length + combat.discardPile.length + combat.powerPile.length + combat.exhaustPile.length
