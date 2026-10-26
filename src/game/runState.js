// Pure run-level rules: building a run, gold, relics, potions, rewards, shops,
// campfires, map progress, and acts.
import { ACT_COUNT, cardLibrary, enemiesByAct, openingBoonPool, potionLibrary, relicById } from '../data/gameData.js'
import { canUpgrade, createDeckCard, upgradeCard } from './cards.js'
import { generateMap } from './mapGen.js'
import {
  BASE_CARD_CHOICES,
  POTION_DROP_START,
  canGainPotion,
  hasRelicFlag,
  rollBossRelicChoices,
  rollCardChoices,
  rollPotionDrop,
  rollRelic,
  rollRelicChoices,
} from './rewards.js'
import { pickOne, randomInt, takeRandom } from './rng.js'

export const STARTING_GOLD = 99
export const REST_HEAL_PERCENT = 0.3
export const BURNING_BLOOD_HEAL = 6
export const GOLD_REWARDS = { fight: [10, 20], elite: [25, 35], boss: [95, 105] }
export const SHOP_CARD_COUNT = 5
export const SHOP_RELIC_COUNT = 3
export const SHOP_POTION_COUNT = 3
export const CARD_PRICES = { common: [45, 55], uncommon: [68, 82], rare: [135, 165] }
export const RELIC_PRICES = { common: [120, 150], uncommon: [180, 220], rare: [240, 280] }
export const POTION_PRICE = [50, 75]
export const REMOVE_BASE_COST = 75
export const REMOVE_COST_STEP = 25
export const TREASURE_GOLD = [40, 60]
const RECENT_ENEMY_MEMORY = 2

export const rollRange = (rng, [min, max]) => min + randomInt(rng, max - min + 1)

const createActMap = (rng, act) => generateMap(rng, act, pickOne(rng, enemiesByAct[act].boss).name)

export const findNode = (run, nodeId) => run.map?.rows.flat().find((node) => node.id === nodeId)

export const createInitialRun = () => ({
  screen: 'characterSelect',
  character: null,
  deck: [],
  nextCardId: 0,
  relics: [],
  potions: [],
  potionChance: POTION_DROP_START,
  gold: 0,
  cardRemovals: 0,
  player: { maxHp: 0, hp: 0 },
  map: null,
  currentNodeId: null,
  completedNodeIds: [],
  selectedPath: [],
  recentEnemies: [],
  seenEvents: [],
  openingChoices: [],
  rewards: null,
  // Extra reward items owed after the current fight (e.g. an event's prize).
  combatBonus: [],
  shop: null,
  event: null,
  act: 1,
  message: 'Choose your champion.',
})

// --- Gold, cards, relics, potions ---

export const getRunModifier = (run, key) => {
  const characterValue = run.character?.modifiers?.[key] ?? 0
  const relicValue = (run.relics ?? []).reduce((total, relic) => total + (relic[key] ?? 0), 0)
  return characterValue + relicValue
}

export const hasRelic = (run, relicId) => run.relics.some((relic) => relic.id === relicId)

// Gold gains respect Ectoplasm; spending always works.
export const gainGold = (run, amount) => {
  if (amount > 0 && hasRelicFlag(run, 'noGold')) return run
  return { ...run, gold: Math.max(0, run.gold + amount) }
}

// Every deck card gets a unique deckId from a counter, so removing cards can never cause collisions.
export const addCardToDeck = (run, card) =>
  gainGold(
    { ...run, deck: [...run.deck, createDeckCard(card, run.nextCardId)], nextCardId: run.nextCardId + 1 },
    getRunModifier(run, 'goldPerCardAdded'),
  )

export const addRelic = (run, relic) => {
  let next = { ...run, relics: [...run.relics, relic] }
  if (relic.maxHpOnObtain) {
    next = { ...next, player: { maxHp: next.player.maxHp + relic.maxHpOnObtain, hp: next.player.hp + relic.maxHpOnObtain } }
  }
  if (relic.goldOnObtain) next = gainGold(next, relic.goldOnObtain)
  return next
}

export const addPotion = (run, potion) => (canGainPotion(run) ? { ...run, potions: [...run.potions, potion] } : run)

export const removePotion = (run, index) => ({ ...run, potions: run.potions.filter((_, i) => i !== index) })

const changeHp = (run, amount) => ({
  ...run,
  // Events and card costs can hurt, but never kill outside of combat.
  player: { ...run.player, hp: Math.max(1, Math.min(run.player.maxHp, run.player.hp + amount)) },
})

export const healRun = (run, amount) => changeHp(run, amount)
export const hurtRun = (run, amount) => changeHp(run, -amount)

// --- Run setup ---

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
  if (boon.kind === 'relic') return addRelic(run, relicById[boon.relicId])
  if (boon.kind === 'card') return addCardToDeck(run, cardLibrary[boon.cardId])
  if (boon.effect === 'maxHp') {
    return { ...run, player: { maxHp: run.player.maxHp + 10, hp: run.player.hp + 10 } }
  }
  if (boon.effect === 'gold') return gainGold(run, 100)
  if (boon.effect === 'startingDraw' || boon.effect === 'rewardChoicesBonus') {
    return addCharacterModifier(run, boon.effect)
  }
  return run
}

// --- Map and combat setup ---

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
  act: run.act,
  avoidEnemies: run.recentEnemies,
})

export const rememberEnemy = (run, enemyName) => ({ ...run, recentEnemies: [enemyName, ...run.recentEnemies].slice(0, RECENT_ENEMY_MEMORY) })

// Marks a node as visited. Combats only count as completed once won.
export const visitNode = (run, node, { completed = true } = {}) => ({
  ...run,
  currentNodeId: node.id,
  selectedPath: [...run.selectedPath, node.id],
  completedNodeIds: completed ? [...run.completedNodeIds, node.id] : run.completedNodeIds,
})

export const returnToMap = (run, message) => ({ ...run, screen: 'map', shop: null, event: null, rewards: null, message })

// --- Rewards ---

export const getRewardCount = (run, base = BASE_CARD_CHOICES) => Math.max(1, base + getRunModifier(run, 'rewardChoicesBonus'))

export const getCardRewardChoices = (run, source, rng, options) => rollCardChoices(run, getRewardCount(run), source, rng, options)

const cardReward = (run, source, rng, options) => ({ type: 'card', choices: getCardRewardChoices(run, source, rng, options) })

// items: [{ type: 'card', choices } | { type: 'relic', relic } | { type: 'relicChoice', choices } | { type: 'potion', potion }]
// then: 'map' | 'nextAct'
export const offerRewards = (run, { title, message, items, then = 'map' }, rng) => {
  const usable = items.filter((item) => (item.choices ? item.choices.length > 0 : item.relic || item.potion))
  const rewards = { title, message, then, items: usable.map((item, index) => ({ ...item, id: `reward-${index}` })) }
  if (rewards.items.length === 0) return leaveRewards({ ...run, rewards }, rng)
  return { ...run, screen: 'reward', rewards, message }
}

export const leaveRewards = (run, rng) => {
  const then = run.rewards?.then ?? 'map'
  if (then !== 'nextAct') return returnToMap(run, 'Choose your next room.')

  const act = run.act + 1
  return returnToMap(
    { ...run, act, map: createActMap(rng, act), currentNodeId: null, completedNodeIds: [], selectedPath: [], recentEnemies: [] },
    `Act ${act} begins. Choose your first room.`,
  )
}

export const claimReward = (run, itemId, choiceId, rng) => {
  const item = run.rewards?.items.find((entry) => entry.id === itemId)
  if (!item) return run

  let next = run
  if (item.type === 'card') {
    const card = item.choices.find((choice) => choice.id === choiceId)
    if (!card) return run
    next = addCardToDeck(run, card)
  } else if (item.type === 'relicChoice') {
    const relic = item.choices.find((choice) => choice.id === choiceId)
    if (!relic) return run
    next = addRelic(run, relic)
  } else if (item.type === 'relic') {
    next = addRelic(run, item.relic)
  } else if (item.type === 'potion') {
    if (!canGainPotion(run)) return run
    next = addPotion(run, item.potion)
  }

  const items = next.rewards.items.filter((entry) => entry.id !== itemId)
  next = { ...next, rewards: { ...next.rewards, items } }
  return items.length ? next : leaveRewards(next, rng)
}

// --- Campfire ---

export const canRest = (run) => !hasRelicFlag(run, 'noRest')
export const canSmith = (run) => !hasRelicFlag(run, 'noSmith') && run.deck.some(canUpgrade)

export const getRestHealAmount = (run) =>
  Math.min(run.player.maxHp - run.player.hp, Math.floor(run.player.maxHp * REST_HEAL_PERCENT) + getRunModifier(run, 'restHealBonus'))

export const enterRest = (run, node) => ({
  ...visitNode(run, node),
  screen: 'rest',
  message: `The ${node.label.toLowerCase()} crackles. Rest, or sharpen a card.`,
})

export const restHeal = (run) => {
  if (!canRest(run)) return run
  const healed = getRestHealAmount(run)
  return returnToMap(healRun(run, healed), `You rest and recover ${healed} HP.`)
}

export const smithCard = (run, deckId) => {
  const card = run.deck.find((item) => item.deckId === deckId)
  if (!card || !canUpgrade(card) || hasRelicFlag(run, 'noSmith')) return run
  return returnToMap(upgradeDeckCard(run, deckId), `${card.name} becomes ${upgradeCard(card).name}.`)
}

export const upgradeDeckCard = (run, deckId) => ({ ...run, deck: run.deck.map((item) => (item.deckId === deckId ? upgradeCard(item) : item)) })

export const removeDeckCard = (run, deckId) => ({ ...run, deck: run.deck.filter((item) => item.deckId !== deckId) })

// --- Shop ---

export const getRemoveCost = (run) => applyDiscount(run, REMOVE_BASE_COST + run.cardRemovals * REMOVE_COST_STEP)

const applyDiscount = (run, price) => Math.round(price * (1 - getRunModifier(run, 'shopDiscount')))

const priceFor = (run, rng, ranges, rarity) => applyDiscount(run, rollRange(rng, ranges[rarity] ?? ranges.common))

export const enterShop = (run, node, rng) => ({
  ...visitNode(run, node),
  screen: 'shop',
  shop: {
    cards: rollCardChoices(run, SHOP_CARD_COUNT, 'shop', rng).map((card) => ({ item: card, price: priceFor(run, rng, CARD_PRICES, card.rarity), sold: false })),
    relics: rollRelicChoices(run, SHOP_RELIC_COUNT, rng).map((relic) => ({ item: relic, price: priceFor(run, rng, RELIC_PRICES, relic.rarity), sold: false })),
    potions: takeRandom(rng, potionLibrary, SHOP_POTION_COUNT).map((potion) => ({ item: potion, price: applyDiscount(run, rollRange(rng, POTION_PRICE)), sold: false })),
    removeUsed: false,
  },
  message: 'The merchant spreads out their wares.',
})

const markSold = (offers, index) => offers.map((offer, i) => (i === index ? { ...offer, sold: true } : offer))

const canBuy = (run, offer) => Boolean(offer) && !offer.sold && run.gold >= offer.price

// kind: 'cards' | 'relics' | 'potions'
export const buyShopItem = (run, kind, index) => {
  const offer = run.shop?.[kind]?.[index]
  if (!canBuy(run, offer)) return run
  if (kind === 'potions' && !canGainPotion(run)) return run

  const paid = { ...run, gold: run.gold - offer.price, shop: { ...run.shop, [kind]: markSold(run.shop[kind], index) } }
  if (kind === 'cards') return { ...addCardToDeck(paid, offer.item), message: `${offer.item.name} added to your deck.` }
  if (kind === 'relics') return { ...addRelic(paid, offer.item), message: `${offer.item.name} acquired.` }
  return { ...addPotion(paid, offer.item), message: `${offer.item.name} bought.` }
}

export const removeCardAtShop = (run, deckId) => {
  const cost = getRemoveCost(run)
  const card = run.deck.find((item) => item.deckId === deckId)
  if (!run.shop || run.shop.removeUsed || !card || run.gold < cost) return run
  return {
    ...removeDeckCard(run, deckId),
    gold: run.gold - cost,
    cardRemovals: run.cardRemovals + 1,
    shop: { ...run.shop, removeUsed: true },
    message: `${card.name} removed from your deck.`,
  }
}

// --- Treasure ---

export const openTreasure = (run, node, rng) => {
  const gold = rollRange(rng, TREASURE_GOLD)
  const visited = gainGold(visitNode(run, node), gold)
  return offerRewards(visited, { title: 'Treasure Chest', message: `The chest holds ${gold} gold.`, items: [{ type: 'relic', relic: rollRelic(run, rng) }] }, rng)
}

// --- Combat results ---

export const winCombat = (run, combat, rng) => {
  const { node } = combat
  const isEliteOrBoss = node.type === 'elite' || node.type === 'boss'
  let hp = combat.player.hp + getRunModifier(run, 'healAfterFight')
  if (isEliteOrBoss && hasRelic(run, 'burning-blood')) hp += BURNING_BLOOD_HEAL
  if (combat.player.hp <= run.player.maxHp / 2) hp += getRunModifier(run, 'lowHpHeal')

  const gold = rollRange(rng, GOLD_REWARDS[node.type] ?? GOLD_REWARDS.fight)
  const won = gainGold(
    { ...run, player: { ...run.player, hp: Math.min(run.player.maxHp, hp) }, completedNodeIds: [...run.completedNodeIds, node.id], combatBonus: [] },
    gold,
  )

  if (node.type === 'boss' && run.act >= ACT_COUNT) {
    return { ...won, screen: 'victory', message: `${run.character.name} conquers the climb.` }
  }

  const { potion, potionChance } = rollPotionDrop(run, rng)
  // Relics already promised by this fight (an event prize) can't be rolled again.
  const promised = run.combatBonus.filter((item) => item.relic).map((item) => item.relic)
  const items = [
    node.type === 'boss' ? cardReward(run, 'elite', rng, { rarity: 'rare' }) : cardReward(run, isEliteOrBoss ? 'elite' : 'fight', rng),
    node.type === 'elite' && { type: 'relic', relic: rollRelic({ ...run, relics: [...run.relics, ...promised] }, rng) },
    node.type === 'boss' && { type: 'relicChoice', choices: rollBossRelicChoices(run, 3, rng) },
    potion && { type: 'potion', potion },
    ...run.combatBonus,
  ].filter(Boolean)

  const goldText = hasRelicFlag(run, 'noGold') ? '' : `+${gold} gold. `
  return offerRewards(
    { ...won, potionChance },
    {
      title: node.type === 'boss' ? 'Boss Defeated' : 'Victory',
      message: `${goldText}${node.type === 'boss' ? 'Claim your spoils, then climb on.' : 'Claim your rewards.'}`,
      items,
      then: node.type === 'boss' ? 'nextAct' : 'map',
    },
    rng,
  )
}
