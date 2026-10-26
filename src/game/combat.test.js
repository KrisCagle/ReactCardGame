import { describe, expect, it } from 'vitest'
import { cardLibrary } from '../data/gameData'
import {
  MAX_HAND_SIZE,
  VULNERABLE_BONUS,
  calculateAttackDamage,
  countCombatCards,
  createCombat,
  drawCards,
  endTurn,
  playCard,
} from './combat'
import { createCombatCard } from './cards'
import { createRng } from './rng'

const node = { id: 'test-node', type: 'fight', label: 'Test Room' }

const makeCombat = (deck, overrides = {}) => {
  const combat = createCombat({ deck, player: { hp: 50, maxHp: 50 }, node }, createRng(1))
  return {
    ...combat,
    ...overrides,
    player: { ...combat.player, ...overrides.player },
    enemy: { ...combat.enemy, ...overrides.enemy },
  }
}

// Puts exactly these cards in hand with an empty draw and discard pile.
const withHand = (combat, cards) => ({
  ...combat,
  hand: cards.map((card, index) => createCombatCard(card, `hand-${index}`)),
  drawPile: [],
  discardPile: [],
})

const strikes = (count) => Array.from({ length: count }, () => cardLibrary.strike)

describe('createCombat', () => {
  it('draws a 5-card opening hand and keeps the rest in the draw pile', () => {
    const combat = makeCombat(strikes(8))
    expect(combat.hand).toHaveLength(5)
    expect(combat.drawPile).toHaveLength(3)
    expect(combat.player.energy).toBe(3)
  })

  it('applies relic bonuses and extra opening draw', () => {
    const relics = [{ id: 'a', block: 8 }, { id: 'b', energy: 1, strength: 2 }]
    const combat = createCombat({ deck: strikes(10), player: { hp: 50, maxHp: 50 }, relics, startingDraw: 2, node }, createRng(1))
    expect(combat.hand).toHaveLength(7)
    expect(combat.player).toMatchObject({ block: 8, energy: 4, strength: 2, maxEnergy: 3 })
  })
})

describe('drawCards', () => {
  it('stops at the hand limit and leaves the remaining cards in the draw pile', () => {
    const combat = makeCombat(strikes(14))
    const drawn = drawCards(combat, 20, createRng(2))
    expect(drawn.hand).toHaveLength(MAX_HAND_SIZE)
    expect(drawn.drawPile).toHaveLength(4)
    expect(countCombatCards(drawn)).toBe(14)
    expect(drawn.log[0]).toBe('Your hand is full.')
  })

  it('reshuffles the discard pile when the draw pile runs out', () => {
    const combat = { ...makeCombat(strikes(6)), hand: [], drawPile: [createCombatCard(cardLibrary.guard, 'd')] }
    combat.discardPile = strikes(3).map((card, index) => createCombatCard(card, `x-${index}`))
    const drawn = drawCards(combat, 3, createRng(3))
    expect(drawn.hand).toHaveLength(3)
    expect(drawn.hand[0].id).toBe('guard')
    expect(drawn.discardPile).toHaveLength(0)
    expect(drawn.drawPile).toHaveLength(1)
  })
})

describe('calculateAttackDamage', () => {
  it('adds strength and the vulnerable bonus', () => {
    expect(calculateAttackDamage(6, 0, 0)).toBe(6)
    expect(calculateAttackDamage(6, 2, 0)).toBe(8)
    expect(calculateAttackDamage(6, 2, 1)).toBe(8 + VULNERABLE_BONUS)
  })

  it('never goes below zero', () => {
    expect(calculateAttackDamage(3, -5, 0)).toBe(0)
  })
})

describe('playCard', () => {
  it('spends energy, deals damage through block, and discards the card', () => {
    const combat = withHand(makeCombat(strikes(5), { enemy: { hp: 40, block: 4 } }), [cardLibrary.strike])
    const next = playCard(combat, combat.hand[0].instanceId, createRng(4))
    expect(next.player.energy).toBe(2)
    expect(next.enemy.block).toBe(0)
    expect(next.enemy.hp).toBe(38)
    expect(next.hand).toHaveLength(0)
    expect(next.discardPile.map((card) => card.id)).toEqual(['strike'])
  })

  it('does nothing when the card costs more than the current energy', () => {
    const combat = withHand(makeCombat(strikes(5), { player: { energy: 1 } }), [cardLibrary.bloodForBlood])
    expect(playCard(combat, combat.hand[0].instanceId, createRng(4))).toBe(combat)
  })

  it('hits multiple times for multi-hit cards, applying strength to each hit', () => {
    const combat = withHand(makeCombat(strikes(5), { player: { strength: 1 }, enemy: { hp: 40 } }), [cardLibrary.twinStrike])
    const next = playCard(combat, combat.hand[0].instanceId, createRng(4))
    expect(next.enemy.hp).toBe(40 - 2 * 6)
  })

  it('applies vulnerable after the hit, so it boosts later attacks only', () => {
    const combat = withHand(makeCombat(strikes(5), { enemy: { hp: 60 } }), [cardLibrary.bash, cardLibrary.strike])
    const afterBash = playCard(combat, combat.hand[0].instanceId, createRng(4))
    expect(afterBash.enemy.hp).toBe(60 - 9)
    expect(afterBash.enemy.vulnerable).toBe(1)
    const afterStrike = playCard(afterBash, afterBash.hand[0].instanceId, createRng(4))
    expect(afterStrike.enemy.hp).toBe(60 - 9 - (6 + VULNERABLE_BONUS))
  })

  it('cannot redraw itself with its own draw effect', () => {
    const combat = withHand(makeCombat(strikes(5)), [cardLibrary.pommel])
    const next = playCard(combat, combat.hand[0].instanceId, createRng(4))
    expect(next.hand).toHaveLength(0)
    expect(next.discardPile.map((card) => card.id)).toEqual(['pommel'])
  })

  it('keeps powers in play instead of discarding them', () => {
    const combat = withHand(makeCombat(strikes(5)), [cardLibrary.inflame])
    const next = playCard(combat, combat.hand[0].instanceId, createRng(4))
    expect(next.player.strength).toBe(2)
    expect(next.powerPile.map((card) => card.id)).toEqual(['inflame'])
    expect(next.discardPile).toHaveLength(0)
  })

  it('refunds energy for energy cards', () => {
    const combat = withHand(makeCombat(strikes(5)), [cardLibrary.focus])
    const next = playCard(combat, combat.hand[0].instanceId, createRng(4))
    expect(next.player.energy).toBe(4)
  })

  it('marks the fight won when the enemy reaches 0 HP', () => {
    const combat = withHand(makeCombat(strikes(5), { enemy: { hp: 5 } }), [cardLibrary.strike])
    const next = playCard(combat, combat.hand[0].instanceId, createRng(4))
    expect(next.enemy.hp).toBe(0)
    expect(next.outcome).toBe('won')
  })
})

describe('endTurn', () => {
  const attackMove = { intent: 'Chomp', damage: 10 }

  it('discards the hand, resolves the enemy move against block, and starts a new turn', () => {
    const combat = makeCombat(strikes(10), {
      player: { block: 4, energy: 0 },
      enemy: { moves: [attackMove], moveIndex: 0 },
    })
    const next = endTurn(combat, createRng(5))
    expect(next.player.hp).toBe(50 - 6)
    expect(next.player.block).toBe(0)
    expect(next.player.energy).toBe(3)
    expect(next.turn).toBe(2)
    expect(next.hand).toHaveLength(5)
    expect(next.enemy.moveIndex).toBe(1)
    expect(countCombatCards(next)).toBe(10)
  })

  it('adds enemy strength to its attacks and ticks down vulnerable', () => {
    const combat = makeCombat(strikes(10), { enemy: { moves: [attackMove], strength: 3, vulnerable: 2 } })
    const next = endTurn(combat, createRng(5))
    expect(next.player.hp).toBe(50 - 13)
    expect(next.enemy.vulnerable).toBe(1)
  })

  it('grants block from powers at the start of the turn', () => {
    const combat = makeCombat(strikes(10), { player: { blockPerTurn: 3 }, enemy: { moves: [attackMove] } })
    expect(endTurn(combat, createRng(5)).player.block).toBe(3)
  })

  it('marks the fight lost when the player drops to 0 HP', () => {
    const combat = makeCombat(strikes(10), { player: { hp: 5 }, enemy: { moves: [attackMove] } })
    const next = endTurn(combat, createRng(5))
    expect(next.player.hp).toBe(0)
    expect(next.outcome).toBe('lost')
    expect(endTurn(next, createRng(5))).toBe(next)
  })
})
