// Mystery rooms and choice-based events. Event effects are data (see
// data/events.js); this module applies them to the run.
import { curses, eventLibrary } from '../data/gameData.js'
import { canUpgrade } from './cards.js'
import { getCardPool, randomPotion, rollRelic } from './rewards.js'
import { pickOne, takeRandom } from './rng.js'
import {
  addCardToDeck,
  addPotion,
  addRelic,
  findNode,
  gainGold,
  getCardRewardChoices,
  healRun,
  hurtRun,
  offerRewards,
  openTreasure,
  removeDeckCard,
  returnToMap,
  upgradeDeckCard,
  visitNode,
} from './runState.js'

export const MYSTERY_EVENT_CHANCE = 0.7
export const MYSTERY_FIGHT_CHANCE = 0.2 // the remaining 10% is a treasure chest

const findEvent = (id) => eventLibrary.find((event) => event.id === id)

export const getActiveEvent = (run) => (run.event ? findEvent(run.event.id) : null)

export const meetsRequirements = (run, choice) => !choice.requires?.gold || run.gold >= choice.requires.gold

// Returns { run, fight } where fight is a node to battle, or null.
export const enterMystery = (run, node, rng) => {
  const roll = rng.next()

  if (roll < MYSTERY_FIGHT_CHANCE) {
    return { run: visitNode(run, node, { completed: false }), fight: { ...node, type: 'fight', label: 'Hidden Enemy' } }
  }
  if (roll >= MYSTERY_FIGHT_CHANCE + MYSTERY_EVENT_CHANCE) {
    return { run: openTreasure(run, node, rng), fight: null }
  }

  const unseen = eventLibrary.filter((event) => !run.seenEvents.includes(event.id))
  const event = pickOne(rng, unseen.length ? unseen : eventLibrary)
  return {
    run: {
      ...visitNode(run, node),
      screen: 'event',
      seenEvents: [...run.seenEvents, event.id],
      event: { id: event.id, resolved: false, resultText: '', pick: null, fight: null, rewards: [] },
      message: event.text,
    },
    fight: null,
  }
}

const applyEffects = (run, effects, rng) => {
  let next = run
  const notes = []
  // Prizes earned by winning an event fight are paid out with that fight's rewards.
  const deferPrizes = Boolean(effects.fight)
  const prizes = []

  if (effects.gold) next = gainGold(next, effects.gold)
  if (effects.loseHp) next = hurtRun(next, effects.loseHp)
  if (effects.loseHpPercent) next = hurtRun(next, Math.floor(next.player.maxHp * effects.loseHpPercent))
  if (effects.heal) next = healRun(next, effects.heal)
  if (effects.healPercent) next = healRun(next, Math.floor(next.player.maxHp * effects.healPercent))
  if (effects.maxHp) next = { ...next, player: { maxHp: next.player.maxHp + effects.maxHp, hp: next.player.hp + effects.maxHp } }
  if (effects.curse) {
    const curse = pickOne(rng, curses)
    next = addCardToDeck(next, curse)
    notes.push(`${curse.name} was added to your deck.`)
  }
  if (effects.relic) {
    const relic = rollRelic(next, rng, effects.relic === 'random' ? undefined : effects.relic)
    if (relic && deferPrizes) prizes.push({ type: 'relic', relic })
    else if (relic) {
      next = addRelic(next, relic)
      notes.push(`Obtained ${relic.name}.`)
    }
  }
  if (effects.potion) {
    const potion = randomPotion(rng)
    const before = next.potions.length
    next = addPotion(next, potion)
    notes.push(next.potions.length > before ? `Obtained ${potion.name}.` : `Your potion belt is full; the ${potion.name} is lost.`)
  }
  if (effects.cardReward) {
    const choices = getCardRewardChoices(next, 'event', rng, { rarity: effects.cardReward.rarity })
    prizes.push({ type: 'card', choices: choices.slice(0, effects.cardReward.count ?? choices.length) })
  }
  if (effects.upgradeRandom) {
    takeRandom(rng, next.deck.filter(canUpgrade), effects.upgradeRandom).forEach((card) => {
      next = upgradeDeckCard(next, card.deckId)
      notes.push(`${card.name} was upgraded.`)
    })
  }

  return { run: next, notes, prizes, pick: effects.pick ?? null, fight: effects.fight ?? null }
}

export const chooseEventOption = (run, choiceIndex, rng) => {
  const event = getActiveEvent(run)
  const choice = event?.choices[choiceIndex]
  if (!choice || run.event.resolved || !meetsRequirements(run, choice)) return run

  let outcome = applyEffects(run, choice.effects, rng)
  let resultText = choice.result ?? ''
  const { chance } = choice.effects
  if (chance) {
    const won = rng.next() < chance.odds
    const branch = applyEffects(outcome.run, won ? chance.success : chance.failure, rng)
    outcome = {
      run: branch.run,
      notes: [...outcome.notes, ...branch.notes],
      prizes: [...outcome.prizes, ...branch.prizes],
      pick: branch.pick ?? outcome.pick,
      fight: branch.fight ?? outcome.fight,
    }
    resultText = won ? chance.successText : chance.failureText
  }

  return {
    ...outcome.run,
    event: {
      ...run.event,
      resolved: true,
      resultText: [resultText, ...outcome.notes].filter(Boolean).join(' '),
      pick: outcome.run.deck.length ? outcome.pick : null,
      fight: outcome.fight,
      rewards: outcome.prizes,
    },
  }
}

// Applies a pending remove / upgrade / transform pick to one deck card.
export const pickEventCard = (run, deckId, rng) => {
  const card = run.deck.find((item) => item.deckId === deckId)
  const pick = run.event?.pick
  if (!card || !pick) return run
  if (pick === 'upgrade' && !canUpgrade(card)) return run

  let next = run
  let note = ''
  if (pick === 'remove') {
    next = removeDeckCard(run, deckId)
    note = `${card.name} was removed.`
  } else if (pick === 'upgrade') {
    next = upgradeDeckCard(run, deckId)
    note = `${card.name} was upgraded.`
  } else if (pick === 'transform') {
    const replacement = pickOne(rng, getCardPool(run).filter((option) => option.id !== card.id))
    next = addCardToDeck(removeDeckCard(run, deckId), replacement)
    note = `${card.name} became ${replacement.name}.`
  }

  return { ...next, event: { ...run.event, pick: null, resultText: `${run.event.resultText} ${note}`.trim() } }
}

// Leaves the event. Returns { run, fight } so the reducer can start an event fight.
export const continueEvent = (run, rng) => {
  const { event } = run
  if (!event?.resolved || event.pick) return { run, fight: null }

  if (event.fight) {
    const node = { id: run.currentNodeId, floor: findNode(run, run.currentNodeId)?.floor ?? 0, type: event.fight, label: getActiveEvent(run).title }
    return { run: { ...run, event: null, combatBonus: event.rewards }, fight: node }
  }
  if (event.rewards.length) {
    return { run: offerRewards({ ...run, event: null }, { title: getActiveEvent(run).title, message: event.resultText, items: event.rewards }, rng), fight: null }
  }
  return { run: returnToMap(run, 'Choose your next room.'), fight: null }
}
