// A heuristic auto-player used by the fuzz tests and the balance simulator
// (npm run sim). It isn't optimal - it just plays like a reasonable new player:
// powers first, block when about to take damage, otherwise attack.
import { canUpgrade } from './cards.js'
import { calculateAttackDamage, canPlayCard, getEnemyIntent } from './combat.js'
import { getActiveEvent, meetsRequirements } from './events.js'
import { canGainPotion } from './rewards.js'
import { canRest, canSmith, findNode, getAvailableNodeIds, getRemoveCost } from './runState.js'

const RARITY_SCORE = { rare: 3, uncommon: 2, common: 1, basic: 0, curse: -5 }

const incomingDamage = (combat) => {
  const move = getEnemyIntent(combat)
  if (!move?.damage) return 0
  return calculateAttackDamage(move.damage, combat.enemy, combat.player) * (move.hits ?? 1)
}

const cardDamage = (combat, card) => (card.damage ? calculateAttackDamage(card.damage, combat.player, combat.enemy) * (card.hits ?? 1) : 0)

const chooseCombatAction = (run, combat) => {
  const playable = combat.hand.filter((card) => canPlayCard(combat, card))
  const enemyHp = combat.enemy.hp + combat.enemy.block

  // Potions: drink when in danger, or open big fights with them.
  const bigFight = combat.node.type === 'elite' || combat.node.type === 'boss'
  if (run.potions.length && (combat.player.hp < combat.player.maxHp * 0.35 || (bigFight && combat.turn === 1))) {
    return { type: 'usePotion', index: 0 }
  }

  const lethal = playable.find((card) => cardDamage(combat, card) >= enemyHp)
  if (lethal) return { type: 'playCard', instanceId: lethal.instanceId }

  const free = playable.find((card) => card.cost === 0 && !card.hpLoss)
  if (free) return { type: 'playCard', instanceId: free.instanceId }

  const power = playable.find((card) => card.type === 'Power')
  if (power) return { type: 'playCard', instanceId: power.instanceId }

  const needBlock = incomingDamage(combat) > combat.player.block
  const byBlock = [...playable].filter((card) => card.block).sort((a, b) => b.block - a.block)
  const byDamage = [...playable].filter((card) => card.damage || card.poison).sort((a, b) => cardDamage(combat, b) - cardDamage(combat, a))
  const pick = (needBlock ? byBlock[0] : byDamage[0]) ?? byDamage[0] ?? byBlock[0] ?? playable[0]

  return pick ? { type: 'playCard', instanceId: pick.instanceId } : { type: 'endTurn' }
}

const bestByRarity = (cards) => [...cards].sort((a, b) => RARITY_SCORE[b.rarity] - RARITY_SCORE[a.rarity])[0]

const chooseRewardAction = (run) => {
  const item = run.rewards.items.find((entry) => entry.type !== 'potion' || canGainPotion(run))
  if (!item) return { type: 'skipRewards' }
  if (item.type === 'card') return { type: 'claimReward', itemId: item.id, choiceId: bestByRarity(item.choices).id }
  if (item.type === 'relicChoice') return { type: 'claimReward', itemId: item.id, choiceId: item.choices[0].id }
  return { type: 'claimReward', itemId: item.id }
}

const chooseMapNode = (run) => {
  const options = getAvailableNodeIds(run).map((id) => findNode(run, id))
  const lowHp = run.player.hp < run.player.maxHp * 0.5
  const preferred = lowHp ? options.find((node) => node.type === 'rest') ?? options.find((node) => node.type !== 'elite') : options[0]
  return { type: 'enterNode', nodeId: (preferred ?? options[0]).id }
}

const chooseShopAction = (run) => {
  const curse = run.deck.find((card) => card.type === 'Curse') ?? run.deck.find((card) => card.rarity === 'basic')
  if (curse && !run.shop.removeUsed && run.gold >= getRemoveCost(run)) return { type: 'removeCard', deckId: curse.deckId }
  const index = run.shop.cards.findIndex((offer) => !offer.sold && offer.price <= run.gold && offer.item.rarity !== 'common')
  if (index >= 0) return { type: 'buyShopItem', kind: 'cards', index }
  const potion = run.shop.potions.findIndex((offer) => !offer.sold && offer.price <= run.gold)
  if (potion >= 0 && canGainPotion(run)) return { type: 'buyShopItem', kind: 'potions', index: potion }
  return { type: 'leaveShop' }
}

const chooseEventAction = (run) => {
  const { event } = run
  if (event.pick) {
    const card = event.pick === 'upgrade' ? run.deck.find(canUpgrade) : run.deck.find((item) => item.type === 'Curse') ?? run.deck.find((item) => item.rarity === 'basic') ?? run.deck[0]
    return { type: 'pickEventCard', deckId: card.deckId }
  }
  if (event.resolved) return { type: 'continueEvent' }
  const index = getActiveEvent(run).choices.findIndex((choice) => meetsRequirements(run, choice))
  return { type: 'chooseEventOption', index }
}

export const nextBotAction = ({ run, combat }) => {
  switch (run.screen) {
    case 'openingBoon':
      return { type: 'chooseOpeningBoon', boon: run.openingChoices[0] }
    case 'map':
      return chooseMapNode(run)
    case 'reward':
      return chooseRewardAction(run)
    case 'rest': {
      if (canRest(run) && (run.player.hp < run.player.maxHp * 0.5 || !canSmith(run))) return { type: 'restHeal' }
      if (canSmith(run)) return { type: 'smithCard', deckId: bestByRarity(run.deck.filter(canUpgrade)).deckId }
      return { type: 'leaveRest' }
    }
    case 'shop':
      return chooseShopAction(run)
    case 'event':
      return chooseEventAction(run)
    case 'combat':
      if (combat.outcome === 'won') return { type: 'finishCombat' }
      return combat.outcome === 'lost' ? null : chooseCombatAction(run, combat)
    default:
      return null
  }
}
