// Pure run-level rules: building a run, rewards, map progress, and act changes.
import { ACT_COUNT, cardLibrary, characterRewardPools, mapRows, openingBoonPool, relicLibrary, rewardPool } from '../data/gameData'
import { createDeckCard } from './cards'
import { takeRandom } from './rng'

export const REST_HEAL = 18
export const BURNING_BLOOD_HEAL = 6

export const findNode = (nodeId) => mapRows.flat().find((node) => node.id === nodeId)

export const getNodeRowIndex = (nodeId) => mapRows.findIndex((row) => row.some((node) => node.id === nodeId))

export const createInitialRun = () => ({
  screen: 'characterSelect',
  character: null,
  deck: [],
  relics: [],
  player: { maxHp: 0, hp: 0 },
  currentNodeId: null,
  completedNodeIds: [],
  selectedPath: [],
  rewardChoices: [],
  openingChoices: [],
  rewardKind: 'card',
  rewardTitle: 'Choose a Card',
  rewardSource: null,
  act: 1,
  message: 'Choose your champion.',
})

export const createRunFromCharacter = (character, rng) => ({
  ...createInitialRun(),
  screen: 'openingBoon',
  character,
  deck: character.starterDeck.map((card, index) => createDeckCard(card, `${character.id}-starter-${index}`)),
  relics: [...character.startingRelics],
  player: { maxHp: character.maxHp, hp: character.maxHp },
  openingChoices: takeRandom(rng, openingBoonPool, 3),
  message: `${character.name} enters the climb. Pick one opening boon.`,
})

const addCharacterModifier = (run, key) => ({
  ...run,
  character: {
    ...run.character,
    modifiers: { ...run.character.modifiers, [key]: (run.character.modifiers?.[key] ?? 0) + 1 },
  },
})

export const applyOpeningBoon = (run, boon) => {
  if (boon.kind === 'relic') {
    const relic = relicLibrary.find((item) => item.id === boon.relicId)
    return { ...run, relics: [...run.relics, relic] }
  }
  if (boon.kind === 'card') {
    const card = cardLibrary[boon.cardId]
    return { ...run, deck: [...run.deck, createDeckCard(card, `boon-${run.deck.length}`)] }
  }
  if (boon.effect === 'maxHp') {
    return { ...run, player: { maxHp: run.player.maxHp + 10, hp: run.player.hp + 10 } }
  }
  if (boon.effect === 'startingDraw' || boon.effect === 'rewardChoicesBonus') {
    return addCharacterModifier(run, boon.effect)
  }
  return run
}

export const getRunModifier = (run, key) => {
  const characterValue = run.character?.modifiers?.[key] ?? 0
  const relicValue = (run.relics ?? []).reduce((total, relic) => total + (relic[key] ?? 0), 0)
  return characterValue + relicValue
}

export const hasRelic = (run, relicId) => run.relics.some((relic) => relic.id === relicId)

export const getAvailableNodeIds = (run) => {
  if (!run.currentNodeId) return mapRows[0].map((node) => node.id)
  return findNode(run.currentNodeId)?.connections ?? []
}

export const getCombatSetup = (run, node) => ({
  deck: run.deck,
  player: run.player,
  relics: run.relics,
  startingDraw: getRunModifier(run, 'startingDraw'),
  node,
  rowIndex: getNodeRowIndex(node.id),
  act: run.act,
})

export const getRewardCount = (run, base) => base + getRunModifier(run, 'rewardChoicesBonus')

const uniqueById = (items) => [...new Map(items.map((item) => [item.id, item])).values()]

// The shared pool and character pools overlap, so dedupe before drawing -
// otherwise one reward screen can offer the same card twice.
export const getCardRewardPool = (run) => uniqueById([...rewardPool, ...(characterRewardPools[run.character?.id] ?? [])])

export const getCardRewardChoices = (run, baseCount, rng) =>
  takeRandom(rng, getCardRewardPool(run), getRewardCount(run, baseCount))

export const getRelicChoices = (run, count, rng) => {
  const unowned = relicLibrary.filter((relic) => !hasRelic(run, relic.id))
  return takeRandom(rng, unowned, count)
}

// Marks a node as visited. Combats only count as completed once won.
export const visitNode = (run, node, { completed = true } = {}) => ({
  ...run,
  currentNodeId: node.id,
  selectedPath: [...run.selectedPath, node.id],
  completedNodeIds: completed ? [...run.completedNodeIds, node.id] : run.completedNodeIds,
})

export const offerReward = (run, { kind, title, source, choices, message }) => ({
  ...run,
  screen: 'reward',
  rewardKind: kind,
  rewardTitle: title,
  rewardSource: source,
  rewardChoices: choices,
  message,
})

export const restAtNode = (run, node) => {
  const hp = Math.min(run.player.maxHp, run.player.hp + REST_HEAL)
  return {
    ...visitNode(run, node),
    player: { ...run.player, hp },
    message: `You rest at ${node.label} and recover ${hp - run.player.hp} HP.`,
  }
}

export const winCombat = (run, combat, rng) => {
  const { node } = combat
  const isEliteOrBoss = node.type === 'elite' || node.type === 'boss'
  const relicHeal = isEliteOrBoss && hasRelic(run, 'burning-blood') ? BURNING_BLOOD_HEAL : 0
  const hp = Math.min(run.player.maxHp, combat.player.hp + getRunModifier(run, 'healAfterFight') + relicHeal)
  const won = { ...run, player: { ...run.player, hp }, completedNodeIds: [...run.completedNodeIds, node.id] }

  if (node.type === 'boss' && run.act >= ACT_COUNT) {
    return { ...won, screen: 'victory', message: `${run.character.name} conquers the climb.` }
  }

  if (isEliteOrBoss) {
    return offerReward(won, {
      kind: 'relic',
      title: 'Claim a Relic',
      source: node.type,
      choices: getRelicChoices(run, 3, rng),
      message: node.type === 'boss' ? 'The boss falls. Claim a relic and climb again.' : 'The elite drops a relic.',
    })
  }

  return offerReward(won, {
    kind: 'card',
    title: 'Choose a Card',
    source: node.type,
    choices: getCardRewardChoices(run, 4, rng),
    message: 'Choose one card for your deck.',
  })
}

// Leaves the reward screen; after a boss reward the next act begins on a fresh map.
export const leaveReward = (run, message) => {
  const startsNewAct = run.rewardSource === 'boss'
  const nextAct = run.act + 1

  return {
    ...run,
    screen: 'map',
    currentNodeId: startsNewAct ? null : run.currentNodeId,
    completedNodeIds: startsNewAct ? [] : run.completedNodeIds,
    selectedPath: startsNewAct ? [] : run.selectedPath,
    rewardChoices: [],
    rewardKind: 'card',
    rewardTitle: 'Choose a Card',
    rewardSource: null,
    act: startsNewAct ? nextAct : run.act,
    message: startsNewAct ? `${message} Act ${nextAct} begins. Choose your first room.` : `${message} Choose your next room.`,
  }
}

export const takeReward = (run, reward) => {
  if (run.rewardKind === 'relic') {
    return leaveReward({ ...run, relics: [...run.relics, reward] }, `${reward.name} claimed.`)
  }
  const card = createDeckCard(reward, run.deck.length)
  return leaveReward({ ...run, deck: [...run.deck, card] }, `${reward.name} added.`)
}
