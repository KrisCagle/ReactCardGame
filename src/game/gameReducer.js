// The single entry point for game state changes. The UI dispatches actions;
// this reducer routes them to the pure combat and run rules.
import { createCombat, drinkPotion, endTurn, playCard } from './combat.js'
import { chooseEventOption, continueEvent, enterMystery, pickEventCard } from './events.js'
import { withFx } from './fx.js'
import { createRng, randomSeed } from './rng.js'
import {
  applyOpeningBoon,
  buyShopItem,
  claimReward,
  createInitialRun,
  createRunFromCharacter,
  enterRest,
  enterShop,
  findNode,
  getAvailableNodeIds,
  getCombatSetup,
  leaveRewards,
  openTreasure,
  rememberEnemy,
  removeCardAtShop,
  removePotion,
  restHeal,
  returnToMap,
  smithCard,
  visitNode,
  winCombat,
} from './runState.js'

export const createInitialGameState = (seed = randomSeed()) => ({ seed, run: createInitialRun(), combat: null })

// `run` has already been marked as visiting the node.
const startFight = (state, run, node, message, rng) => {
  const combat = createCombat(getCombatSetup(run, node), rng)
  return { ...state, run: { ...rememberEnemy(run, combat.enemy.name), screen: 'combat', message }, combat }
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
    case 'mystery': {
      const { run, fight } = enterMystery(state.run, node, rng)
      return fight ? startFight(state, run, fight, 'Something leaps from the dark.', rng) : { ...state, run }
    }
    default:
      return startFight(state, visitNode(state.run, node, { completed: false }), node, `${node.label}: survive the fight.`, rng)
  }
}

// Combat can end on the player's action (a killing blow), a potion, or end turn
// (poison, thorns). A won fight stays on screen so the UI can play the enemy's
// death, then the UI sends finishCombat to move on to rewards.
const afterCombatStep = (state, combat, actionType) => {
  if (combat === state.combat) return state
  return { ...state, run: { ...state.run, player: { ...state.run.player, hp: combat.player.hp } }, combat: withFx(state.combat, combat, actionType) }
}

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
      return afterCombatStep(state, playCard(state.combat, action.instanceId, rng), action.type)

    case 'endTurn':
      if (!state.combat) return state
      return afterCombatStep(state, endTurn(state.combat, rng), action.type)

    case 'usePotion': {
      const potion = state.run.potions[action.index]
      if (!state.combat || !potion || state.combat.outcome !== 'playing') return state
      return afterCombatStep({ ...state, run: removePotion(state.run, action.index) }, drinkPotion(state.combat, potion, rng), action.type)
    }

    case 'finishCombat':
      if (state.combat?.outcome !== 'won') return state
      return { ...state, run: winCombat(state.run, state.combat, rng), combat: null }

    case 'discardPotion':
      if (!state.run.potions[action.index]) return state
      return { ...state, run: removePotion(state.run, action.index) }

    case 'claimReward':
      return updateRun(state, 'reward', (run) => claimReward(run, action.itemId, action.choiceId, rng))

    case 'skipRewards':
      return updateRun(state, 'reward', (run) => leaveRewards(run, rng))

    case 'restHeal':
      return updateRun(state, 'rest', restHeal)

    case 'smithCard':
      return updateRun(state, 'rest', (run) => smithCard(run, action.deckId))

    case 'leaveRest':
      return updateRun(state, 'rest', (run) => returnToMap(run, 'You move on from the campfire.'))

    case 'buyShopItem':
      return updateRun(state, 'shop', (run) => buyShopItem(run, action.kind, action.index))

    case 'removeCard':
      return updateRun(state, 'shop', (run) => removeCardAtShop(run, action.deckId))

    case 'leaveShop':
      return updateRun(state, 'shop', (run) => returnToMap(run, 'You leave the merchant behind. Choose your next room.'))

    case 'chooseEventOption':
      return updateRun(state, 'event', (run) => chooseEventOption(run, action.index, rng))

    case 'pickEventCard':
      return updateRun(state, 'event', (run) => pickEventCard(run, action.deckId, rng))

    case 'continueEvent': {
      if (state.run.screen !== 'event') return state
      const { run, fight } = continueEvent(state.run, rng)
      if (fight) return startFight(state, run, fight, 'The fight is on!', rng)
      return run === state.run ? state : { ...state, run }
    }

    case 'restart':
      return { ...state, run: createInitialRun(), combat: null }

    default:
      return state
  }
}

export const gameReducer = (state, action) => {
  // A loaded save replaces everything, including its own rng seed.
  if (action.type === 'loadGame') return action.state

  const rng = createRng(state.seed)
  const next = reduce(state, action, rng)
  return next === state ? state : { ...next, seed: rng.seed }
}
