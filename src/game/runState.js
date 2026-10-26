// Pure run-level rules: building a run, rewards, map progress, shops, campfires, and acts.
import { ACT_COUNT, cardLibrary, characterRewardPools, enemies, openingBoonPool, relicLibrary, rewardPool } from '../data/gameData'
import { canUpgrade, createDeckCard, upgradeCard } from './cards'
import { generateMap } from './mapGen'
import { pickOne, randomInt, takeRandom } from './rng'

export const STARTING_GOLD = 99
export const REST_HEAL_PERCENT = 0.3
export const BURNING_BLOOD_HEAL = 6
export const GOLD_REWARDS = { fight: [10, 20], elite: [25, 35], boss: [95, 105] }
export const SHOP_CARD_COUNT = 5
export const SHOP_RELIC_COUNT = 2
export const CARD_PRICE = [45, 60]
export const RELIC_PRICE = [140, 170]
export const REMOVE_BASE_COST = 75
export const REMOVE_COST_STEP = 25
export const TREASURE_GOLD = [40, 60]

const rollRange = (rng, [min, max]) => min + randomInt(rng, max - min + 1)

const createActMap = (rng, act) => generateMap(rng, act, pickOne(rng, enemies.boss).name)

export const findNode = (run, nodeId) => run.map?.rows.flat().find((node) => node.id === nodeId)

export const createInitialRun = () => ({
  screen: 'characterSelect',
  character: null,
  deck: [],
  nextCardId: 0,
  relics: [],
  gold: 0,
  cardRemovals: 0,
  player: { maxHp: 0, hp: 0 },
  map: null,
  currentNodeId: null,
  completedNodeIds: [],
  selectedPath: [],
  rewardChoices: [],
  openingChoices: [],
  rewardKind: 'card',
  rewardTitle: 'Choose a Card',
  rewardSource: null,
  shop: null,
  act: 1,
  message: 'Choose your champion.',
})

// Every deck card gets a unique deckId from a counter, so removing cards can never cause collisions.
export const addCardToDeck = (run, card) => ({
  ...run,
  deck: [...run.deck, createDeckCard(card, run.nextCardId)],
  nextCardId: run.nextCardId + 1,
})

export const createRunFromCharacter = (character, rng) => {
  const base = {
    ...createInitialRun(),
    screen: 'openingBoon',
    character,
    relics: [...character.startingRelics],
    gold: STARTING_GOLD,
    player: { maxHp: character.maxHp, hp: character.maxHp },
    map: createActMap(rng, 1),
    openingChoices: takeRandom(rng, openingBoonPool, 3),
    message: `${character.name} enters the climb. Pick one opening boon.`,
  }
  return character.starterDeck.reduce(addCardToDeck, base)
}

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
  if (boon.kind === 'card') return addCardToDeck(run, cardLibrary[boon.cardId])
  if (boon.effect === 'maxHp') {
    return { ...run, player: { maxHp: run.player.maxHp + 10, hp: run.player.hp + 10 } }
  }
  if (boon.effect === 'gold') return { ...run, gold: run.gold + 100 }
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
  if (!run.map) return []
  if (!run.currentNodeId) return run.map.rows[0].map((node) => node.id)
  return findNode(run, run.currentNodeId)?.connections ?? []
}

export const getCombatSetup = (run, node) => ({
  deck: run.deck,
  player: run.player,
  relics: run.relics,
  startingDraw: getRunModifier(run, 'startingDraw'),
  node,
  rowIndex: node.floor ?? 0,
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

export const returnToMap = (run, message) => ({ ...run, screen: 'map', shop: null, message })

// --- Campfire ---

export const getRestHealAmount = (run) => Math.min(run.player.maxHp - run.player.hp, Math.floor(run.player.maxHp * REST_HEAL_PERCENT))

export const enterRest = (run, node) => ({
  ...visitNode(run, node),
  screen: 'rest',
  message: `The ${node.label.toLowerCase()} crackles. Rest, or sharpen a card.`,
})

export const restHeal = (run) => {
  const healed = getRestHealAmount(run)
  return returnToMap({ ...run, player: { ...run.player, hp: run.player.hp + healed } }, `You rest and recover ${healed} HP.`)
}

export const smithCard = (run, deckId) => {
  const card = run.deck.find((item) => item.deckId === deckId)
  if (!card || !canUpgrade(card)) return run
  const upgraded = upgradeCard(card)
  return returnToMap(
    { ...run, deck: run.deck.map((item) => (item.deckId === deckId ? upgraded : item)) },
    `${card.name} becomes ${upgraded.name}.`,
  )
}

// --- Shop ---

export const getRemoveCost = (run) => REMOVE_BASE_COST + run.cardRemovals * REMOVE_COST_STEP

export const enterShop = (run, node, rng) => ({
  ...visitNode(run, node),
  screen: 'shop',
  shop: {
    cards: takeRandom(rng, getCardRewardPool(run), SHOP_CARD_COUNT).map((card) => ({ item: card, price: rollRange(rng, CARD_PRICE), sold: false })),
    relics: getRelicChoices(run, SHOP_RELIC_COUNT, rng).map((relic) => ({ item: relic, price: rollRange(rng, RELIC_PRICE), sold: false })),
    removeUsed: false,
  },
  message: 'The merchant spreads out their wares.',
})

const markSold = (offers, index) => offers.map((offer, i) => (i === index ? { ...offer, sold: true } : offer))

const canBuy = (run, offer) => Boolean(offer) && !offer.sold && run.gold >= offer.price

export const buyShopCard = (run, index) => {
  const offer = run.shop?.cards[index]
  if (!canBuy(run, offer)) return run
  return {
    ...addCardToDeck(run, offer.item),
    gold: run.gold - offer.price,
    shop: { ...run.shop, cards: markSold(run.shop.cards, index) },
    message: `${offer.item.name} added to your deck.`,
  }
}

export const buyShopRelic = (run, index) => {
  const offer = run.shop?.relics[index]
  if (!canBuy(run, offer)) return run
  return {
    ...run,
    relics: [...run.relics, offer.item],
    gold: run.gold - offer.price,
    shop: { ...run.shop, relics: markSold(run.shop.relics, index) },
    message: `${offer.item.name} acquired.`,
  }
}

export const removeCardAtShop = (run, deckId) => {
  const cost = getRemoveCost(run)
  const card = run.deck.find((item) => item.deckId === deckId)
  if (!run.shop || run.shop.removeUsed || !card || run.gold < cost) return run
  return {
    ...run,
    deck: run.deck.filter((item) => item.deckId !== deckId),
    gold: run.gold - cost,
    cardRemovals: run.cardRemovals + 1,
    shop: { ...run.shop, removeUsed: true },
    message: `${card.name} removed from your deck.`,
  }
}

// --- Treasure ---

export const openTreasure = (run, node, rng) => {
  const gold = rollRange(rng, TREASURE_GOLD)
  const visited = { ...visitNode(run, node), gold: run.gold + gold }
  const relics = getRelicChoices(run, 1, rng)
  if (relics.length === 0) return returnToMap(visited, `The chest holds ${gold} gold.`)
  return offerReward(visited, {
    kind: 'relic',
    title: 'Treasure Chest',
    source: 'treasure',
    choices: relics,
    message: `The chest holds ${gold} gold and a relic.`,
  })
}

// --- Combat results and rewards ---

export const winCombat = (run, combat, rng) => {
  const { node } = combat
  const isEliteOrBoss = node.type === 'elite' || node.type === 'boss'
  const relicHeal = isEliteOrBoss && hasRelic(run, 'burning-blood') ? BURNING_BLOOD_HEAL : 0
  const hp = Math.min(run.player.maxHp, combat.player.hp + getRunModifier(run, 'healAfterFight') + relicHeal)
  const gold = rollRange(rng, GOLD_REWARDS[node.type] ?? GOLD_REWARDS.fight)
  const won = {
    ...run,
    player: { ...run.player, hp },
    gold: run.gold + gold,
    completedNodeIds: [...run.completedNodeIds, node.id],
  }

  if (node.type === 'boss' && run.act >= ACT_COUNT) {
    return { ...won, screen: 'victory', message: `${run.character.name} conquers the climb.` }
  }

  if (isEliteOrBoss) {
    return offerReward(won, {
      kind: 'relic',
      title: 'Claim a Relic',
      source: node.type,
      choices: getRelicChoices(run, 3, rng),
      message: `+${gold} gold. ${node.type === 'boss' ? 'The boss falls. Claim a relic and climb again.' : 'The elite drops a relic.'}`,
    })
  }

  return offerReward(won, {
    kind: 'card',
    title: 'Choose a Card',
    source: node.type,
    choices: getCardRewardChoices(run, 4, rng),
    message: `+${gold} gold. Choose one card for your deck.`,
  })
}

// Leaves the reward screen; after a boss reward the next act begins on a fresh map.
export const leaveReward = (run, message, rng) => {
  const cleared = { ...run, rewardChoices: [], rewardKind: 'card', rewardTitle: 'Choose a Card', rewardSource: null }

  if (run.rewardSource !== 'boss') return returnToMap(cleared, `${message} Choose your next room.`)

  const act = run.act + 1
  return returnToMap(
    { ...cleared, act, map: createActMap(rng, act), currentNodeId: null, completedNodeIds: [], selectedPath: [] },
    `${message} Act ${act} begins. Choose your first room.`,
  )
}

export const takeReward = (run, reward, rng) => {
  if (run.rewardKind === 'relic') {
    return leaveReward({ ...run, relics: [...run.relics, reward] }, `${reward.name} claimed.`, rng)
  }
  return leaveReward(addCardToDeck(run, reward), `${reward.name} added.`, rng)
}
