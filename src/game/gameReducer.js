// The single entry point for game state changes. The UI dispatches actions;
// this reducer routes them to the pure combat and run rules.
import { createCombat, endTurn, playCard } from './combat'
import { createRng, randomSeed } from './rng'
import {
  applyOpeningBoon,
  buyShopCard,
  buyShopRelic,
  createInitialRun,
  createRunFromCharacter,
  enterRest,
  enterShop,
  findNode,
  getAvailableNodeIds,
  getCardRewardChoices,
  getCombatSetup,
  getRelicChoices,
  leaveReward,
  offerReward,
  openTreasure,
  removeCardAtShop,
  restHeal,
  returnToMap,
  smithCard,
  takeReward,
  visitNode,
  winCombat,
} from './runState'

export const MYSTERY_FIGHT_CHANCE = 0.45
export const MYSTERY_CARD_CHANCE = 0.3

export const createInitialGameState = (seed = randomSeed()) => ({ seed, run: createInitialRun(), combat: null })

const startFight = (state, node, message, rng) => ({
  run: { ...visitNode(state.run, node, { completed: false }), screen: 'combat', message },
  combat: createCombat(getCombatSetup(state.run, node), rng),
})

const resolveMystery = (state, node, rng) => {
  const roll = rng.next()

  if (roll < MYSTERY_FIGHT_CHANCE) {
    return startFight(state, { ...node, type: 'fight', label: 'Hidden Enemy' }, 'Something leaps from the dark.', rng)
  }

  const relicChoices = getRelicChoices(state.run, 3, rng)
  const offerCards = roll < MYSTERY_FIGHT_CHANCE + MYSTERY_CARD_CHANCE || relicChoices.length === 0
  const run = visitNode(state.run, node)

  return {
    ...state,
    run: offerCards
      ? offerReward(run, {
          kind: 'card',
          title: 'Forgotten Cache',
          source: 'mystery',
          choices: getCardRewardChoices(state.run, 4, rng),
          message: 'A hidden cache offers a card.',
        })
      : offerReward(run, {
          kind: 'relic',
          title: 'Strange Relic',
          source: 'mystery',
          choices: relicChoices,
          message: 'A strange power waits in the dust.',
        }),
  }
}

const enterNode = (state, nodeId, rng) => {
  const node = findNode(state.run, nodeId)
  if (state.run.screen !== 'map' || !node || !getAvailableNodeIds(state.run).includes(nodeId)) return state

  switch (node.type) {
    case 'rest':
      return { ...state, run: enterRest(state.run, node) }
    case 'shop':
      return { ...state, run: enterShop(state.run, node, rng) }
    case 'treasure':
      return { ...state, run: openTreasure(state.run, node, rng) }
    case 'mystery':
      return resolveMystery(state, node, rng)
    default:
      return startFight(state, node, `${node.label}: survive the fight.`, rng)
  }
}

// Combat can end on the player's action (a killing blow) or on end turn (poison).
const afterCombatStep = (state, combat, rng) =>
  combat.outcome === 'won' ? { ...state, run: winCombat(state.run, combat, rng), combat: null } : { ...state, combat }

const updateRun = (state, screen, update) => {
  if (state.run.screen !== screen) return state
  const run = update(state.run)
  return run === state.run ? state : { ...state, run }
}

const reduce = (state, action, rng) => {
  switch (action.type) {
    case 'chooseCharacter':
      return { ...state, run: createRunFromCharacter(action.character, rng), combat: null }

    case 'chooseOpeningBoon':
      return updateRun(state, 'openingBoon', (run) => ({
        ...applyOpeningBoon(run, action.boon),
        screen: 'map',
        openingChoices: [],
        message: `${action.boon.title} chosen. Choose your first room.`,
      }))

    case 'enterNode':
      return enterNode(state, action.nodeId, rng)

    case 'playCard':
      if (!state.combat) return state
      return afterCombatStep(state, playCard(state.combat, action.instanceId, rng), rng)

    case 'endTurn':
      if (!state.combat) return state
      return afterCombatStep(state, endTurn(state.combat, rng), rng)

    case 'chooseReward':
      return updateRun(state, 'reward', (run) => takeReward(run, action.reward, rng))

    case 'skipReward':
      return updateRun(state, 'reward', (run) => leaveReward(run, 'You move on empty-handed.', rng))

    case 'restHeal':
      return updateRun(state, 'rest', restHeal)

    case 'smithCard':
      return updateRun(state, 'rest', (run) => smithCard(run, action.deckId))

    case 'buyShopCard':
      return updateRun(state, 'shop', (run) => buyShopCard(run, action.index))

    case 'buyShopRelic':
      return updateRun(state, 'shop', (run) => buyShopRelic(run, action.index))

    case 'removeCard':
      return updateRun(state, 'shop', (run) => removeCardAtShop(run, action.deckId))

    case 'leaveShop':
      return updateRun(state, 'shop', (run) => returnToMap(run, 'You leave the merchant behind. Choose your next room.'))

    case 'restart':
      return { ...state, run: createInitialRun(), combat: null }

    default:
      return state
  }
}

export const gameReducer = (state, action) => {
  const rng = createRng(state.seed)
  const next = reduce(state, action, rng)
  return next === state ? state : { ...next, seed: rng.seed }
}
