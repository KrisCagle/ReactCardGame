import { describe, expect, it } from 'vitest'
import { characters } from '../data/gameData'
import { canPlayCard, countCombatCards } from './combat'
import { createInitialGameState, gameReducer } from './gameReducer'
import { getAvailableNodeIds, findNode } from './runState'

// A deliberately simple bot: play the first affordable card, otherwise end
// the turn; always take the first option everywhere else.
const nextBotAction = ({ run, combat }) => {
  switch (run.screen) {
    case 'characterSelect':
      return null
    case 'openingBoon':
      return { type: 'chooseOpeningBoon', boon: run.openingChoices[0] }
    case 'map':
      return { type: 'enterNode', node: findNode(getAvailableNodeIds(run)[0]) }
    case 'reward':
      return run.rewardChoices.length ? { type: 'chooseReward', reward: run.rewardChoices[0] } : { type: 'skipReward' }
    case 'combat': {
      if (combat.outcome === 'lost') return null
      const card = combat.hand.find((item) => canPlayCard(combat, item))
      return card ? { type: 'playCard', instanceId: card.instanceId } : { type: 'endTurn' }
    }
    default:
      return null
  }
}

const playRun = (seed, character) => {
  let state = gameReducer(createInitialGameState(seed), { type: 'chooseCharacter', character })
  const states = [state]

  for (let step = 0; step < 5000; step += 1) {
    const action = nextBotAction(state)
    if (!action) break
    state = gameReducer(state, action)
    states.push(state)
  }

  return states
}

describe('gameReducer', () => {
  it('is deterministic for a given seed', () => {
    const first = playRun(42, characters[0]).at(-1)
    const second = playRun(42, characters[0]).at(-1)
    expect(second).toEqual(first)
  })

  it('ignores clicks on map nodes that are not reachable', () => {
    let state = gameReducer(createInitialGameState(1), { type: 'chooseCharacter', character: characters[0] })
    state = gameReducer(state, { type: 'chooseOpeningBoon', boon: state.run.openingChoices[0] })
    expect(gameReducer(state, { type: 'enterNode', node: findNode('r16-a') })).toBe(state)
  })

  it('puts a lost fight on the defeat screen until the run restarts', () => {
    const final = playRun(7, characters[0]).at(-1)
    expect(final.combat.outcome).toBe('lost')
    const restarted = gameReducer(final, { type: 'restart' })
    expect(restarted.run.screen).toBe('characterSelect')
    expect(restarted.combat).toBeNull()
  })

  // Fuzz test: hundreds of bot runs through the real reducer, checking the
  // invariants that the old code broke (cards vanishing, duplicate offers).
  it.each(characters.map((character) => [character.name, character]))('keeps game invariants across many %s runs', (_name, character) => {
    for (let seed = 0; seed < 60; seed += 1) {
      for (const { run, combat } of playRun(seed, character)) {
        if (combat && run.screen === 'combat') {
          expect(countCombatCards(combat)).toBe(run.deck.length)
          expect(combat.hand.length).toBeLessThanOrEqual(10)
          expect(combat.player.hp).toBeGreaterThanOrEqual(0)
        }
        if (run.screen === 'reward') {
          const ids = run.rewardChoices.map((choice) => choice.id)
          expect(new Set(ids).size).toBe(ids.length)
          if (run.rewardKind === 'relic') {
            ids.forEach((id) => expect(run.relics.map((relic) => relic.id)).not.toContain(id))
          }
        }
        expect(run.player.hp).toBeLessThanOrEqual(run.player.maxHp)
      }
    }
  })
})
