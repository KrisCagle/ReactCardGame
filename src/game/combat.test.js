import { describe, expect, it } from 'vitest'
import { cardLibrary } from '../data/gameData'
import {
  MAX_HAND_SIZE,
  calculateAttackDamage,
  calculateBlock,
  describeIntent,
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
  const plain = { strength: 0, weak: 0, vulnerable: 0 }

  it('adds strength', () => {
    expect(calculateAttackDamage(6, plain, plain)).toBe(6)
    expect(calculateAttackDamage(6, { ...plain, strength: 2 }, plain)).toBe(8)
  })

  it('applies vulnerable (+50%) and weak (-25%), rounding down', () => {
    expect(calculateAttackDamage(6, plain, { ...plain, vulnerable: 1 })).toBe(9)
    expect(calculateAttackDamage(7, plain, { ...plain, vulnerable: 1 })).toBe(10)
    expect(calculateAttackDamage(10, { ...plain, weak: 1 }, plain)).toBe(7)
    expect(calculateAttackDamage(10, { ...plain, strength: 2, weak: 1 }, { ...plain, vulnerable: 2 })).toBe(13)
  })

  it('never goes below zero', () => {
    expect(calculateAttackDamage(3, { ...plain, strength: -5 }, plain)).toBe(0)
  })
})

describe('calculateBlock', () => {
  it('reduces block from cards by 25% while frail', () => {
    expect(calculateBlock(8, { frail: 0 })).toBe(8)
    expect(calculateBlock(8, { frail: 1 })).toBe(6)
    expect(calculateBlock(5, { frail: 2 })).toBe(3)
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
    expect(afterBash.enemy.hp).toBe(60 - 8)
    expect(afterBash.enemy.vulnerable).toBe(2)
    const afterStrike = playCard(afterBash, afterBash.hand[0].instanceId, createRng(4))
    expect(afterStrike.enemy.hp).toBe(60 - 8 - 9)
  })

  it('applies weak and poison to the enemy', () => {
    const combat = withHand(makeCombat(strikes(5)), [cardLibrary.clothesline, cardLibrary.deadlyPoison])
    const afterLine = playCard(combat, combat.hand[0].instanceId, createRng(4))
    const afterPoison = playCard(afterLine, afterLine.hand[0].instanceId, createRng(4))
    expect(afterPoison.enemy).toMatchObject({ weak: 2, poison: 5 })
  })

  it('gains less block while frail', () => {
    const combat = withHand(makeCombat(strikes(5), { player: { frail: 1 } }), [cardLibrary.guard])
    expect(playCard(combat, combat.hand[0].instanceId, createRng(4)).player.block).toBe(3)
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

  it('poisons the enemy at the start of its turn, ignoring block, then reduces poison', () => {
    const combat = makeCombat(strikes(10), { enemy: { hp: 30, block: 10, poison: 4, moves: [attackMove] } })
    const next = endTurn(combat, createRng(5))
    expect(next.enemy.hp).toBe(26)
    expect(next.enemy.poison).toBe(3)
  })

  it('wins the fight when poison finishes the enemy, before it can act', () => {
    const combat = makeCombat(strikes(10), { enemy: { hp: 3, poison: 5, moves: [attackMove] } })
    const next = endTurn(combat, createRng(5))
    expect(next.outcome).toBe('won')
    expect(next.player.hp).toBe(50)
  })

  it('lets enemies apply debuffs that last through the player\'s next turn', () => {
    const lick = { intent: 'Lick', weak: 1, frail: 1 }
    const afterEnemy = endTurn(makeCombat(strikes(10), { enemy: { moves: [lick, attackMove] } }), createRng(5))
    expect(afterEnemy.player).toMatchObject({ weak: 1, frail: 1 })
    // They wear off at the end of the player's turn.
    expect(endTurn(afterEnemy, createRng(6)).player).toMatchObject({ weak: 0, frail: 0 })
  })

  it('makes weakened enemies hit softer', () => {
    const combat = makeCombat(strikes(10), { enemy: { weak: 1, moves: [attackMove] } })
    expect(endTurn(combat, createRng(5)).player.hp).toBe(50 - 7)
  })

  it('marks the fight lost when the player drops to 0 HP', () => {
    const combat = makeCombat(strikes(10), { player: { hp: 5 }, enemy: { moves: [attackMove] } })
    const next = endTurn(combat, createRng(5))
    expect(next.player.hp).toBe(0)
    expect(next.outcome).toBe('lost')
    expect(endTurn(next, createRng(5))).toBe(next)
  })
})

describe('describeIntent', () => {
  it('shows the damage the player would actually take, plus debuffs', () => {
    const enemy = { strength: 2, weak: 0, vulnerable: 0 }
    const player = { strength: 0, weak: 0, vulnerable: 1 }
    expect(describeIntent({ damage: 10, vulnerable: 2 }, enemy, player)).toBe('18 damage, 2 vulnerable')
  })
})
