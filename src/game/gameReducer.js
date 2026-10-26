// The single entry point for game state changes. The UI dispatches actions;
// this reducer routes them to the pure combat and run rules.
import { createCombat, endTurn, playCard } from './combat'
import { createRng, randomSeed } from './rng'
import {
  applyOpeningBoon,
  createInitialRun,
  createRunFromCharacter,
  getAvailableNodeIds,
  getCardRewardChoices,
  getCombatSetup,
  getRelicChoices,
  leaveReward,
  offerReward,
  restAtNode,
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

const enterNode = (state, node, rng) => {
  if (state.run.screen !== 'map' || !getAvailableNodeIds(state.run).includes(node.id)) return state

  if (node.type === 'rest') return { ...state, run: restAtNode(state.run, node) }

  if (node.type === 'shop') {
    return {
      ...state,
      run: offerReward(visitNode(state.run, node), {
        kind: 'shop',
        title: 'Merchant Wares',
        source: 'shop',
        choices: getCardRewardChoices(state.run, 5, rng),
        message: 'Take one card from the merchant while gold is still imaginary.',
      }),
    }
  }

  if (node.type === 'mystery') return resolveMystery(state, node, rng)

  return startFight(state, node, `${node.label}: survive the fight.`, rng)
}

const reduce = (state, action, rng) => {
  switch (action.type) {
    case 'chooseCharacter':
      return { ...state, run: createRunFromCharacter(action.character, rng), combat: null }

    case 'chooseOpeningBoon':
      return {
        ...state,
        run: {
          ...applyOpeningBoon(state.run, action.boon),
          screen: 'map',
          openingChoices: [],
          message: `${action.boon.title} chosen. Choose your first room.`,
        },
      }

    case 'enterNode':
      return enterNode(state, action.node, rng)

    case 'playCard': {
      if (!state.combat) return state
      const combat = playCard(state.combat, action.instanceId, rng)
      if (combat.outcome === 'won') return { ...state, run: winCombat(state.run, combat, rng), combat: null }
      return { ...state, combat }
    }

    case 'endTurn':
      if (!state.combat) return state
      return { ...state, combat: endTurn(state.combat, rng) }

    case 'chooseReward':
      if (state.run.screen !== 'reward') return state
      return { ...state, run: takeReward(state.run, action.reward) }

    case 'skipReward':
      if (state.run.screen !== 'reward') return state
      return { ...state, run: leaveReward(state.run, 'You move on empty-handed.') }

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
