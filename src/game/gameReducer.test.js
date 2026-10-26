import { describe, expect, it } from 'vitest'
import { POTION_SLOTS, characters } from '../data/gameData'
import { nextBotAction } from './bot'
import { countCombatCards } from './combat'
import { createInitialGameState, gameReducer } from './gameReducer'

const SEEDS = Array.from({ length: 40 }, (_, seed) => seed)

const MAX_STEPS = 8000

const playRun = (seed, character) => {
  let state = gameReducer(createInitialGameState(seed), { type: 'chooseCharacter', character })
  const states = [state]

  for (let step = 0; step <= MAX_STEPS; step += 1) {
    const action = nextBotAction(state)
    if (!action) break
    // A run that never ends means an infinite combo or a stuck screen.
    if (step === MAX_STEPS) throw new Error(`Run never finished (seed ${seed}, ${character.name}, on ${state.run.screen})`)
    const next = gameReducer(state, action)
    // A bot action that changes nothing means the game is stuck.
    if (next === state) throw new Error(`Stuck on ${state.run.screen} with ${JSON.stringify(action)} (seed ${seed})`)
    state = next
    states.push(state)
  }

  return states
}

const startedRun = (seed) => {
  const state = gameReducer(createInitialGameState(seed), { type: 'chooseCharacter', character: characters[0] })
  return gameReducer(state, { type: 'chooseOpeningBoon', boon: state.run.openingChoices[0] })
}

describe('gameReducer', () => {
  it('is deterministic for a given seed', () => {
    expect(playRun(42, characters[0]).at(-1)).toEqual(playRun(42, characters[0]).at(-1))
  })

  it('ignores clicks on map nodes that are not reachable', () => {
    const state = startedRun(1)
    const boss = state.run.map.rows.at(-1)[0]
    expect(gameReducer(state, { type: 'enterNode', nodeId: boss.id })).toBe(state)
  })

  it('ignores actions meant for other screens', () => {
    const state = startedRun(1)
    ;['restHeal', 'leaveShop', 'skipRewards', 'continueEvent', 'endTurn'].forEach((type) => {
      expect(gameReducer(state, { type })).toBe(state)
    })
    expect(gameReducer(state, { type: 'usePotion', index: 0 })).toBe(state)
  })

  it('puts a lost fight on the defeat screen until the run restarts', () => {
    const lost = SEEDS.map((seed) => playRun(seed, characters[1]).at(-1)).find((state) => state.combat?.outcome === 'lost')
    expect(lost).toBeDefined()
    const restarted = gameReducer(lost, { type: 'restart' })
    expect(restarted.run.screen).toBe('characterSelect')
    expect(restarted.combat).toBeNull()
  })

  // Fuzz test: many bot runs through the real reducer, checking invariants that
  // must always hold (no lost cards, no duplicate offers, no negative gold...).
  it.each(characters.map((character) => [character.name, character]))('keeps game invariants across many %s runs', (_name, character) => {
    for (const seed of SEEDS) {
      for (const { run, combat } of playRun(seed, character)) {
        if (combat && run.screen === 'combat') {
          expect(countCombatCards(combat)).toBe(run.deck.length)
          expect(combat.hand.length).toBeLessThanOrEqual(10)
          expect(combat.player.hp).toBeGreaterThanOrEqual(0)
        }
        if (run.screen === 'reward') {
          expect(run.rewards.items.length).toBeGreaterThan(0)
          run.rewards.items.forEach((item) => {
            if (!item.choices) return
            const ids = item.choices.map((choice) => choice.id)
            expect(new Set(ids).size).toBe(ids.length)
          })
        }
        expect(run.gold).toBeGreaterThanOrEqual(0)
        expect(run.potions.length).toBeLessThanOrEqual(POTION_SLOTS)
        expect(new Set(run.relics.map((relic) => relic.id)).size).toBe(run.relics.length)
        expect(new Set(run.deck.map((card) => card.deckId)).size).toBe(run.deck.length)
        expect(run.player.hp).toBeLessThanOrEqual(run.player.maxHp)
      }
    }
  })

  it('reaches every screen during bot runs', () => {
    const screens = new Set(SEEDS.flatMap((seed) => characters.flatMap((character) => playRun(seed, character).map((state) => state.run.screen))))
    ;['map', 'combat', 'reward', 'rest', 'shop', 'event'].forEach((screen) => expect(screens.has(screen), screen).toBe(true))
  })
})
