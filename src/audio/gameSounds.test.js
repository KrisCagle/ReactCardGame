import { describe, expect, it } from 'vitest'
import { soundsForTransition } from './gameSounds'

const run = (overrides = {}) => ({ screen: 'map', gold: 50, relics: [], potions: [], ...overrides })
const state = (runOverrides, combat = null) => ({ run: run(runOverrides), combat })
const combat = (overrides) => ({ turn: 1, outcome: 'playing', fx: { id: 0, events: [] }, ...overrides })

describe('soundsForTransition', () => {
  it('plays nothing when nothing changed', () => {
    const same = state()
    expect(soundsForTransition(same, same)).toEqual([])
  })

  it('plays a card swoosh and an impact when an attack lands', () => {
    const before = state({ screen: 'combat' }, combat())
    const after = state({ screen: 'combat' }, combat({ fx: { id: 1, events: [{ side: 'none', kind: 'cardPlayed' }, { side: 'enemy', kind: 'damage', amount: 6 }] } }))
    expect(soundsForTransition(before, after)).toEqual(['card', 'hit'])
  })

  it('plays a hurt sound and the turn gong when the enemy hits you', () => {
    const before = state({ screen: 'combat' }, combat())
    const after = state({ screen: 'combat' }, combat({ turn: 2, fx: { id: 1, events: [{ side: 'player', kind: 'damage', amount: 9 }] } }))
    expect(soundsForTransition(before, after)).toEqual(['hurt', 'turn'])
  })

  it('marks wins, losses, and screen changes', () => {
    const fighting = state({ screen: 'combat' }, combat())
    expect(soundsForTransition(fighting, state({ screen: 'combat' }, combat({ outcome: 'lost' })))).toContain('defeat')
    expect(soundsForTransition(fighting, state({ screen: 'combat' }, combat({ outcome: 'won' })))).toContain('win')
    expect(soundsForTransition(state(), state({ screen: 'shop' }))).toEqual(['coin'])
    expect(soundsForTransition(state(), state({ screen: 'victory' }))).toEqual(['victory'])
  })

  it('plays coins for gold and a chime for new relics', () => {
    expect(soundsForTransition(state({ screen: 'reward' }), state({ screen: 'reward', gold: 80, relics: [{ id: 'x' }] }))).toEqual(['coin', 'buff'])
  })

  it('never stacks more than three sounds at once', () => {
    const events = ['cardPlayed', 'damage', 'block', 'heal', 'blocked'].map((kind) => ({ side: 'enemy', kind }))
    const after = state({ screen: 'combat' }, combat({ fx: { id: 1, events } }))
    expect(soundsForTransition(state({ screen: 'combat' }, combat()), after)).toHaveLength(3)
  })
})
