// Reward generation: rarity rolls for cards and relics, potion drops, and the
// item lists shown on the reward screen.
import { POTION_SLOTS, characterCardPools, potionLibrary, relicLibrary, sharedCardPool } from '../data/gameData.js'
import { pickOne, randomInt } from './rng.js'

export const BASE_CARD_CHOICES = 3

// Card rarity odds (percent) by where the reward comes from, modeled on Slay the Spire.
export const CARD_RARITY_ODDS = {
  fight: { common: 60, uncommon: 35, rare: 5 },
  elite: { common: 45, uncommon: 40, rare: 15 },
  shop: { common: 55, uncommon: 35, rare: 10 },
  event: { common: 55, uncommon: 35, rare: 10 },
}
export const RELIC_RARITY_ODDS = { common: 50, uncommon: 33, rare: 17 }

// Potion drops use StS's pity timer: 40% to start, -10% after a drop, +10% after a miss.
export const POTION_DROP_START = 40
export const POTION_DROP_STEP = 10

const rollWeighted = (rng, odds) => {
  const entries = Object.entries(odds)
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0)
  let roll = rng.next() * total
  for (const [key, weight] of entries) {
    roll -= weight
    if (roll < 0) return key
  }
  return entries[0][0]
}

export const hasRelicFlag = (run, flag) => run.relics.some((relic) => relic[flag])

export const getCardPool = (run) => [...sharedCardPool, ...(characterCardPools[run.character?.id] ?? [])]

// Rolls a rarity for each slot, then picks a card of that rarity not already offered.
export const rollCardChoices = (run, count, source, rng, { rarity } = {}) => {
  const pool = getCardPool(run)
  const choices = []

  for (let i = 0; i < count; i += 1) {
    const wanted = rarity ?? rollWeighted(rng, CARD_RARITY_ODDS[source] ?? CARD_RARITY_ODDS.fight)
    const unused = pool.filter((card) => !choices.some((choice) => choice.id === card.id))
    const ofRarity = unused.filter((card) => card.rarity === wanted)
    const candidates = ofRarity.length ? ofRarity : unused
    if (!candidates.length) break
    choices.push(pickOne(rng, candidates))
  }

  return choices
}

const unownedRelics = (run, filter) => relicLibrary.filter((relic) => filter(relic) && !run.relics.some((owned) => owned.id === relic.id))

// One random relic. Rarity is rolled unless given; falls back to any unowned non-boss relic.
export const rollRelic = (run, rng, rarity) => {
  const wanted = rarity ?? rollWeighted(rng, RELIC_RARITY_ODDS)
  const ofRarity = unownedRelics(run, (relic) => relic.rarity === wanted)
  const fallback = unownedRelics(run, (relic) => relic.rarity !== 'boss')
  const candidates = ofRarity.length ? ofRarity : fallback
  return candidates.length ? pickOne(rng, candidates) : null
}

export const rollRelicChoices = (run, count, rng, rarity) => {
  const choices = []
  for (let i = 0; i < count; i += 1) {
    const relic = rollRelic({ ...run, relics: [...run.relics, ...choices] }, rng, rarity)
    if (relic) choices.push(relic)
  }
  return choices
}

export const rollBossRelicChoices = (run, count, rng) => {
  const pool = unownedRelics(run, (relic) => relic.rarity === 'boss')
  const choices = []
  for (let i = 0; i < count && pool.length > choices.length; i += 1) {
    choices.push(pickOne(rng, pool.filter((relic) => !choices.includes(relic))))
  }
  return choices
}

export const randomPotion = (rng) => pickOne(rng, potionLibrary)

export const canGainPotion = (run) => !hasRelicFlag(run, 'noPotions') && run.potions.length < POTION_SLOTS

// Returns { potion | null, potionChance } - the caller stores the new chance.
export const rollPotionDrop = (run, rng) => {
  if (hasRelicFlag(run, 'noPotions')) return { potion: null, potionChance: run.potionChance }
  const dropped = randomInt(rng, 100) < run.potionChance
  return dropped
    ? { potion: randomPotion(rng), potionChance: Math.max(0, run.potionChance - POTION_DROP_STEP) }
    : { potion: null, potionChance: Math.min(100, run.potionChance + POTION_DROP_STEP) }
}
