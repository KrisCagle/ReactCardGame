// Pure combat engine. Every function takes a combat state (plus an rng when it
// needs randomness) and returns a new state - no React, no mutation of inputs.
import { enemies } from '../data/gameData'
import { createCombatCard } from './cards'
import { pickOne, shuffle } from './rng'

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
const DURATION_DEBUFFS = ['vulnerable', 'weak', 'frail']

const sumOf = (items, key) => items.reduce((total, item) => total + (item[key] ?? 0), 0)

const addLog = (combat, messages) => ({ ...combat, log: [...messages, ...combat.log].slice(0, LOG_LENGTH) })

const scaleMove = (move, nodeType, rowIndex, act) => {
  const actBoost = Math.max(0, act - 1)
  const damageScale = nodeType === 'boss' ? 2 + actBoost : nodeType === 'elite' ? 1 + actBoost : actBoost

  return {
    ...move,
    damage: move.damage ? move.damage + Math.floor(rowIndex / 2) + damageScale : undefined,
    block: move.block ? move.block + Math.floor(rowIndex / 3) : undefined,
    strength: move.strength ? move.strength + Math.floor(rowIndex / 4) : undefined,
  }
}

const scaleHp = (baseHp, nodeType, rowIndex, act) => {
  const actBoost = Math.max(0, act - 1)
  const hpScale = nodeType === 'boss' ? 14 + actBoost * 8 : nodeType === 'elite' ? 8 + actBoost * 5 : 4 + actBoost * 3
  return baseHp + hpScale + rowIndex * (nodeType === 'boss' ? 4 : 2)
}

export const createEnemy = (nodeType, rowIndex, act, rng, enemyName) => {
  const pool = enemies[nodeType] ?? enemies.fight
  const template = pool.find((enemy) => enemy.name === enemyName) ?? pickOne(rng, pool)
  const maxHp = scaleHp(template.maxHp, nodeType, rowIndex, act)

  return {
    ...template,
    ...noStatuses,
    maxHp,
    hp: maxHp,
    block: 0,
    strength: 0,
    moveIndex: 0,
    moves: template.moves.map((move) => scaleMove(move, nodeType, rowIndex, act)),
  }
}

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

// setup: { deck, player: { hp, maxHp }, relics, startingDraw, node, rowIndex, act }
export const createCombat = (setup, rng) => {
  const { deck, player, relics = [], startingDraw = 0, node, rowIndex = 0, act = 1 } = setup
  const cards = shuffle(rng, deck.map((card, index) => createCombatCard(card, `${node.id}-${index}`)))

  const combat = {
    node,
    act,
    player: {
      ...noStatuses,
      hp: player.hp,
      maxHp: player.maxHp,
      block: sumOf(relics, 'block'),
      energy: BASE_ENERGY + sumOf(relics, 'energy'),
      maxEnergy: BASE_ENERGY,
      strength: sumOf(relics, 'strength'),
      blockPerTurn: 0,
    },
    enemy: createEnemy(node.type, rowIndex, act, rng, node.enemyName),
    drawPile: cards,
    hand: [],
    discardPile: [],
    // Powers stay in play for the rest of the fight instead of being reshuffled.
    powerPile: [],
    turn: 1,
    log: [`${node.label} blocks the path.`],
    outcome: 'playing',
  }

  return drawCards(combat, HAND_SIZE + startingDraw, rng)
}

export const getEnemyIntent = (combat) => combat.enemy.moves[combat.enemy.moveIndex % combat.enemy.moves.length]

// Damage numbers are shown as they would actually land on the player right now.
export const describeIntent = (move, enemy, player) => {
  const parts = []
  if (move.damage) parts.push(`${calculateAttackDamage(move.damage, enemy, player)} damage`)
  if (move.block) parts.push(`${move.block} block`)
  if (move.strength) parts.push(`+${move.strength} strength`)
  DURATION_DEBUFFS.forEach((status) => {
    if (move[status]) parts.push(`${move[status]} ${status}`)
  })
  return parts.join(', ')
}

export const calculateAttackDamage = (baseDamage, attacker, defender) => {
  let damage = baseDamage + (attacker.strength ?? 0)
  if (attacker.weak > 0) damage *= WEAK_MULTIPLIER
  if (defender.vulnerable > 0) damage *= VULNERABLE_MULTIPLIER
  return Math.max(0, Math.floor(damage))
}

export const calculateBlock = (baseBlock, target) => Math.floor(baseBlock * (target.frail > 0 ? FRAIL_MULTIPLIER : 1))

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

// Block absorbs damage first; returns the updated target and the HP it lost.
export const applyDamage = (target, amount) => {
  const blocked = Math.min(target.block, amount)
  const hpLoss = amount - blocked
  return { target: { ...target, block: target.block - blocked, hp: Math.max(0, target.hp - hpLoss) }, hpLoss }
}

export const canPlayCard = (combat, card) => combat.outcome === 'playing' && card.cost <= combat.player.energy

export const playCard = (combat, instanceId, rng) => {
  const card = combat.hand.find((item) => item.instanceId === instanceId)
  if (!card || !canPlayCard(combat, card)) return combat

  let player = { ...combat.player, energy: combat.player.energy - card.cost }
  let enemy = { ...combat.enemy }
  const messages = []

  if (card.damage) {
    const hits = card.hits ?? 1
    let totalLoss = 0
    for (let i = 0; i < hits && enemy.hp > 0; i += 1) {
      const result = applyDamage(enemy, calculateAttackDamage(card.damage, player, enemy))
      enemy = result.target
      totalLoss += result.hpLoss
    }
    messages.push(`${card.name} hits for ${totalLoss}.`)
  }
  if (card.vulnerable) {
    enemy.vulnerable += card.vulnerable
    messages.push(`${card.name} applies ${card.vulnerable} vulnerable.`)
  }
  if (card.weak) {
    enemy.weak += card.weak
    messages.push(`${card.name} applies ${card.weak} weak.`)
  }
  if (card.poison) {
    enemy.poison += card.poison
    messages.push(`${card.name} applies ${card.poison} poison.`)
  }
  if (card.block) {
    const gained = calculateBlock(card.block, player)
    player.block += gained
    messages.push(`${card.name} adds ${gained} block.`)
  }
  if (card.strength) {
    player.strength += card.strength
    messages.push(`${card.name} grants ${card.strength} strength.`)
  }
  if (card.energy) player.energy += card.energy
  if (card.heal) {
    player.hp = Math.min(player.maxHp, player.hp + card.heal)
    messages.push(`${card.name} restores ${card.heal} HP.`)
  }
  if (card.blockPerTurn) {
    player.blockPerTurn += card.blockPerTurn
    messages.push(`${card.name} takes hold.`)
  }

  let next = { ...combat, player, enemy, hand: combat.hand.filter((item) => item.instanceId !== instanceId) }

  // Draw before the played card hits the discard pile, so it can't be reshuffled
  // and drawn by its own effect.
  if (card.draw) next = drawCards(next, card.draw, rng)

  next = card.type === 'Power'
    ? { ...next, powerPile: [...next.powerPile, card] }
    : { ...next, discardPile: [...next.discardPile, card] }

  if (next.enemy.hp <= 0) {
    next = { ...next, outcome: 'won' }
    messages.unshift(`${next.enemy.name} is defeated.`)
  }

  return addLog(next, messages)
}

const runEnemyTurn = (combat) => {
  const move = getEnemyIntent(combat)
  const poisoned = tickPoison({ ...combat.enemy, block: 0 })
  let enemy = poisoned.combatant
  let player = { ...combat.player }
  const messages = []

  if (poisoned.hpLoss) messages.push(`${enemy.name} takes ${poisoned.hpLoss} poison damage.`)
  if (enemy.hp <= 0) {
    return addLog({ ...combat, enemy, outcome: 'won' }, [`${enemy.name} is defeated.`, ...messages])
  }

  if (move.block) {
    enemy.block += move.block
    messages.push(`${enemy.name} gains ${move.block} block.`)
  }
  if (move.strength) {
    enemy.strength += move.strength
    messages.push(`${enemy.name} grows stronger.`)
  }
  if (move.damage) {
    const result = applyDamage(player, calculateAttackDamage(move.damage, enemy, player))
    player = result.target
    messages.push(`${enemy.name} uses ${move.intent} for ${result.hpLoss}.`)
  }
  DURATION_DEBUFFS.forEach((status) => {
    if (!move[status]) return
    player = { ...player, [status]: player[status] + move[status] }
    messages.push(`${enemy.name} applies ${move[status]} ${status}.`)
  })

  enemy = { ...tickDebuffs(enemy), moveIndex: enemy.moveIndex + 1 }

  return addLog({ ...combat, player, enemy }, messages)
}

const startPlayerTurn = (combat, rng) => {
  const turn = combat.turn + 1
  const poisoned = tickPoison(combat.player)
  const player = { ...poisoned.combatant, block: combat.player.blockPerTurn, energy: combat.player.maxEnergy }
  const messages = poisoned.hpLoss ? [`You take ${poisoned.hpLoss} poison damage.`, `Turn ${turn} begins.`] : [`Turn ${turn} begins.`]
  const next = addLog({ ...combat, turn, player }, messages)

  if (player.hp <= 0) return addLog({ ...next, outcome: 'lost' }, ['You fall, but the next climb begins here.'])
  return drawCards(next, HAND_SIZE, rng)
}

export const endTurn = (combat, rng) => {
  if (combat.outcome !== 'playing') return combat

  // End of the player's turn: discard the hand and tick the player's debuffs.
  const discarded = {
    ...combat,
    player: tickDebuffs(combat.player),
    discardPile: [...combat.discardPile, ...combat.hand],
    hand: [],
  }
  const afterEnemy = runEnemyTurn(discarded)
  if (afterEnemy.outcome === 'won') return afterEnemy

  if (afterEnemy.player.hp <= 0) {
    return addLog({ ...afterEnemy, outcome: 'lost' }, ['You fall, but the next climb begins here.'])
  }

  return startPlayerTurn(afterEnemy, rng)
}

export const countCombatCards = (combat) =>
  combat.drawPile.length + combat.hand.length + combat.discardPile.length + combat.powerPile.length
