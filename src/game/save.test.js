import { describe, expect, it } from 'vitest'
import { characters } from '../data/gameData'
import { nextBotAction } from './bot'
import { createInitialGameState, gameReducer } from './gameReducer'
import { SAVE_VERSION, describeSave, isSaveable, parseSave, serializeGame } from './save'

const advance = (state, steps) => {
  let current = state
  for (let i = 0; i < steps; i += 1) {
    const action = nextBotAction(current)
    if (!action) break
    current = gameReducer(current, action)
  }
  return current
}

const startRun = (seed, character = characters[0]) => gameReducer(createInitialGameState(seed), { type: 'chooseCharacter', character })

const roundTrip = (state) => parseSave(serializeGame(state)).state

describe('save files', () => {
  it('round-trips game state at every kind of screen', () => {
    const screens = new Set()
    let state = startRun(3)
    for (let i = 0; i < 600 && nextBotAction(state); i += 1) {
      if (isSaveable(state)) {
        expect(roundTrip(state)).toEqual(state)
        screens.add(state.run.screen)
      }
      state = gameReducer(state, nextBotAction(state))
    }
    ;['map', 'combat', 'reward'].forEach((screen) => expect(screens.has(screen), screen).toBe(true))
  })

  it('continues identically after loading, because the rng seed is saved', () => {
    const midRun = advance(startRun(11), 150)
    const original = advance(midRun, 400)
    const reloaded = advance(gameReducer(createInitialGameState(999), { type: 'loadGame', state: roundTrip(midRun) }), 400)
    expect(reloaded).toEqual(original)
  })

  it("doesn't save the title screen, a victory, or a lost fight", () => {
    expect(isSaveable(createInitialGameState(1))).toBe(false)
    const run = startRun(1)
    expect(isSaveable(run)).toBe(true)
    expect(isSaveable({ ...run, run: { ...run.run, screen: 'victory' } })).toBe(false)
    expect(isSaveable({ ...run, combat: { outcome: 'lost', hand: [] } })).toBe(false)
  })

  it('rejects missing, corrupt, outdated, or malformed saves', () => {
    const good = serializeGame(startRun(1))
    expect(parseSave(good)).not.toBeNull()
    expect(parseSave(null)).toBeNull()
    expect(parseSave('{not json')).toBeNull()
    expect(parseSave(good.replace(`"version":${SAVE_VERSION}`, '"version":999'))).toBeNull()
    expect(parseSave(JSON.stringify({ version: SAVE_VERSION, state: { seed: 1, run: { screen: 'map' } } }))).toBeNull()
  })

  it('describes a save for the continue button', () => {
    const state = advance(startRun(5), 3)
    expect(describeSave({ state })).toMatch(/^Ironclad - Act 1/)
  })
})
