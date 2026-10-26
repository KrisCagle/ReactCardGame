import { describe, expect, it } from 'vitest'
import { characters } from '../data/gameData'
import { canUpgrade } from './cards'
import { canPlayCard, countCombatCards } from './combat'
import { createInitialGameState, gameReducer } from './gameReducer'
import { getAvailableNodeIds } from './runState'

const SEEDS = Array.from({ length: 40 }, (_, seed) => seed)

// A deliberately simple bot: play the first affordable card, otherwise end
// the turn; take the first option everywhere else. It alternates resting and
// smithing at campfires and buys the first card it can afford at shops.
const nextBotAction = ({ run, combat }) => {
  switch (run.screen) {
    case 'characterSelect':
      return null
    case 'openingBoon':
      return { type: 'chooseOpeningBoon', boon: run.openingChoices[0] }
    case 'map':
      return { type: 'enterNode', nodeId: getAvailableNodeIds(run)[0] }
    case 'reward':
      return run.rewardChoices.length ? { type: 'chooseReward', reward: run.rewardChoices[0] } : { type: 'skipReward' }
    case 'rest': {
      const upgradable = run.deck.find(canUpgrade)
      if (upgradable && run.player.hp > run.player.maxHp / 2) return { type: 'smithCard', deckId: upgradable.deckId }
      return { type: 'restHeal' }
    }
    case 'shop': {
      const index = run.shop.cards.findIndex((offer) => !offer.sold && offer.price <= run.gold)
      return index >= 0 ? { type: 'buyShopCard', index } : { type: 'leaveShop' }
    }
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

const startedRun = (seed) => {
  const state = gameReducer(createInitialGameState(seed), { type: 'chooseCharacter', character: characters[0] })
  return gameReducer(state, { type: 'chooseOpeningBoon', boon: state.run.openingChoices[0] })
}

describe('gameReducer', () => {
  it('is deterministic for a given seed', () => {
    const first = playRun(42, characters[0]).at(-1)
    const second = playRun(42, characters[0]).at(-1)
    expect(second).toEqual(first)
  })

  it('ignores clicks on map nodes that are not reachable', () => {
    const state = startedRun(1)
    const boss = state.run.map.rows.at(-1)[0]
    expect(gameReducer(state, { type: 'enterNode', nodeId: boss.id })).toBe(state)
  })

  it('ignores shop and campfire actions on the wrong screen', () => {
    const state = startedRun(1)
    expect(gameReducer(state, { type: 'restHeal' })).toBe(state)
    expect(gameReducer(state, { type: 'buyShopCard', index: 0 })).toBe(state)
  })

  it('puts a lost fight on the defeat screen until the run restarts', () => {
    const lost = SEEDS.map((seed) => playRun(seed, characters[1]).at(-1)).find((state) => state.combat?.outcome === 'lost')
    expect(lost).toBeDefined()
    const restarted = gameReducer(lost, { type: 'restart' })
    expect(restarted.run.screen).toBe('characterSelect')
    expect(restarted.combat).toBeNull()
  })

  // Fuzz test: hundreds of bot runs through the real reducer, checking the
  // invariants that the old code broke (cards vanishing, duplicate offers).
  it.each(characters.map((character) => [character.name, character]))('keeps game invariants across many %s runs', (_name, character) => {
    for (const seed of SEEDS) {
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
        expect(run.gold).toBeGreaterThanOrEqual(0)
        expect(new Set(run.deck.map((card) => card.deckId)).size).toBe(run.deck.length)
        expect(run.player.hp).toBeLessThanOrEqual(run.player.maxHp)
      }
    }
  })

  it('visits every room type during bot runs', () => {
    const screens = new Set(SEEDS.flatMap((seed) => playRun(seed, characters[0]).map((state) => state.run.screen)))
    ;['map', 'combat', 'reward', 'rest', 'shop'].forEach((screen) => expect(screens.has(screen), screen).toBe(true))
  })
})
