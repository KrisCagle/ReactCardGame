import { describe, expect, it } from 'vitest'
import { diffCombat, withFx } from './fx'

const combatant = (overrides) => ({ hp: 50, block: 0, vulnerable: 0, weak: 0, frail: 0, poison: 0, strength: 0, ...overrides })
const combat = (player, enemy, intent = { intent: 'Bite', damage: 6 }) => ({
  player: combatant(player),
  enemy: combatant({ moves: [intent], moveIndex: 0, ...enemy }),
})

describe('diffCombat', () => {
  it('reports damage, heals, block, and new debuffs', () => {
    const events = diffCombat(combat({ hp: 50 }, { hp: 40 }), combat({ hp: 52, block: 5 }, { hp: 31, vulnerable: 2 }), 'playCard')
    expect(events).toEqual(
      expect.arrayContaining([
        { side: 'player', kind: 'heal', amount: 2 },
        { side: 'player', kind: 'block', amount: 5 },
        { side: 'enemy', kind: 'damage', amount: 9 },
        { side: 'enemy', kind: 'status', status: 'vulnerable', amount: 2 },
      ]),
    )
  })

  it('reports a fully blocked hit', () => {
    expect(diffCombat(combat({}, { block: 10 }), combat({}, { block: 4 }), 'playCard')).toContainEqual({ side: 'enemy', kind: 'blocked' })
  })

  it('shows the enemy attacking on end turn, but not the player block reset', () => {
    const events = diffCombat(combat({ block: 3 }, {}), combat({ hp: 44, block: 6 }, {}), 'endTurn')
    expect(events).toContainEqual({ side: 'enemy', kind: 'attack' })
    expect(events).toContainEqual({ side: 'player', kind: 'damage', amount: 6 })
    expect(events.some((event) => event.side === 'player' && event.kind === 'block')).toBe(false)
  })

  it('numbers fx batches so the UI can replay animations', () => {
    const first = combat({}, {})
    const second = withFx(first, combat({}, { hp: 45 }), 'playCard')
    const third = withFx(second, combat({}, { hp: 40 }), 'playCard')
    expect([second.fx.id, third.fx.id]).toEqual([1, 2])
    expect(withFx(third, third, 'playCard')).toBe(third)
  })
})
