import { describe, expect, it } from 'vitest'
import { ACT_COUNT, cardLibrary, characters, relicLibrary } from '../data/gameData'
import { canUpgrade, describeCard, upgradeCard } from './cards'
import { createRng } from './rng'
import {
  GOLD_REWARDS,
  REMOVE_BASE_COST,
  REMOVE_COST_STEP,
  STARTING_GOLD,
  addCardToDeck,
  buyShopCard,
  buyShopRelic,
  createRunFromCharacter,
  enterRest,
  enterShop,
  getCardRewardChoices,
  getCardRewardPool,
  getRelicChoices,
  getRemoveCost,
  openTreasure,
  removeCardAtShop,
  restHeal,
  smithCard,
  takeReward,
  winCombat,
} from './runState'

const ironclad = characters.find((character) => character.id === 'ironclad')
const newRun = (seed = 1) => ({ ...createRunFromCharacter(ironclad, createRng(seed)), screen: 'map' })
const fakeCombat = (nodeType, hp = 40) => ({ node: { id: `${nodeType}-node`, type: nodeType, label: nodeType }, player: { hp } })
const fakeNode = (type) => ({ id: `${type}-node`, type, label: 'Campfire', floor: 3, connections: [] })

describe('describeCard', () => {
  it('builds text from card effects', () => {
    expect(describeCard(cardLibrary.twinStrike)).toBe('Deal 5 damage twice.')
    expect(describeCard(cardLibrary.bash)).toBe('Deal 8 damage. Apply 2 vulnerable.')
    expect(describeCard(cardLibrary.warcry)).toBe('Gain 3 block. Draw 2 cards.')
    expect(describeCard(cardLibrary.pommel)).toBe('Deal 7 damage. Draw 1 card.')
    expect(describeCard(cardLibrary.meditate)).toBe('At the start of each turn, gain 3 block.')
    expect(describeCard(cardLibrary.poisonedStab)).toBe('Deal 6 damage. Apply 3 poison.')
  })

  it('has text for every card in the library', () => {
    Object.values(cardLibrary).forEach((card) => expect(describeCard(card), card.id).not.toBe(''))
  })
})

describe('card upgrades', () => {
  it('gives every card an upgrade that actually changes it', () => {
    Object.values(cardLibrary).forEach((card) => {
      const upgraded = upgradeCard(card)
      expect(upgraded.name, card.id).toBe(`${card.name}+`)
      const changed = describeCard(upgraded) !== describeCard(card) || upgraded.cost !== card.cost
      expect(changed, card.id).toBe(true)
    })
  })

  it('can only upgrade a card once and keeps its deck identity', () => {
    const card = { ...cardLibrary.strike, deckId: 'strike-0' }
    const upgraded = upgradeCard(card)
    expect(upgraded).toMatchObject({ damage: 9, upgraded: true, deckId: 'strike-0' })
    expect(canUpgrade(upgraded)).toBe(false)
    expect(upgradeCard(upgraded)).toBe(upgraded)
  })
})

describe('card rewards', () => {
  it('never offers basic Strike or Guard', () => {
    const ids = getCardRewardPool(newRun()).map((card) => card.id)
    expect(ids).not.toContain('strike')
    expect(ids).not.toContain('guard')
  })

  it('never offers the same card twice on one screen', () => {
    for (let seed = 0; seed < 200; seed += 1) {
      const ids = getCardRewardChoices(newRun(), 5, createRng(seed)).map((card) => card.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it('adds the chosen card to the deck with a unique deck id', () => {
    const run = { ...newRun(), screen: 'reward', rewardKind: 'card', rewardSource: 'fight' }
    const next = takeReward(run, cardLibrary.cleave, createRng(1))
    expect(next.deck).toHaveLength(run.deck.length + 1)
    expect(new Set(next.deck.map((card) => card.deckId)).size).toBe(next.deck.length)
    expect(next.screen).toBe('map')
  })

  it('keeps deck ids unique even after removing cards', () => {
    let run = { ...newRun(), gold: 1000 }
    run = enterShop(run, fakeNode('shop'), createRng(1))
    run = removeCardAtShop(run, run.deck[0].deckId)
    run = addCardToDeck(addCardToDeck(run, cardLibrary.cleave), cardLibrary.cleave)
    expect(new Set(run.deck.map((card) => card.deckId)).size).toBe(run.deck.length)
  })
})

describe('relic rewards', () => {
  it('never offers a relic the player already owns', () => {
    const owned = relicLibrary.slice(0, 7)
    const run = { ...newRun(), relics: [...newRun().relics, ...owned] }
    for (let seed = 0; seed < 50; seed += 1) {
      const ids = getRelicChoices(run, 3, createRng(seed)).map((relic) => relic.id)
      owned.forEach((relic) => expect(ids).not.toContain(relic.id))
    }
  })

  it('offers fewer relics when few are left instead of repeating', () => {
    const run = { ...newRun(), relics: relicLibrary.slice(1) }
    expect(getRelicChoices(run, 3, createRng(1)).map((relic) => relic.id)).toEqual([relicLibrary[0].id])
  })
})

describe('winCombat', () => {
  it('starts the run with gold and a generated map', () => {
    const run = newRun()
    expect(run.gold).toBe(STARTING_GOLD)
    expect(run.map.rows.length).toBeGreaterThan(10)
  })

  it('heals, pays gold, and offers a card after a normal fight', () => {
    const run = winCombat(newRun(), fakeCombat('fight', 40), createRng(1))
    expect(run.player.hp).toBe(45)
    expect(run.gold - STARTING_GOLD).toBeGreaterThanOrEqual(GOLD_REWARDS.fight[0])
    expect(run.gold - STARTING_GOLD).toBeLessThanOrEqual(GOLD_REWARDS.fight[1])
    expect(run.screen).toBe('reward')
    expect(run.rewardKind).toBe('card')
  })

  it('offers relics after elites', () => {
    const run = winCombat(newRun(), fakeCombat('elite'), createRng(1))
    expect(run.rewardKind).toBe('relic')
    expect(run.rewardChoices).toHaveLength(3)
  })

  it('moves to the next act on a new map after a boss reward', () => {
    const start = { ...newRun(), act: 1 }
    const afterBoss = winCombat(start, fakeCombat('boss'), createRng(1))
    const next = takeReward(afterBoss, afterBoss.rewardChoices[0], createRng(2))
    expect(next.act).toBe(2)
    expect(next.map.act).toBe(2)
    expect(next.map).not.toEqual(start.map)
    expect(next.currentNodeId).toBeNull()
    expect(next.completedNodeIds).toEqual([])
  })

  it('ends the run in victory after the final act boss', () => {
    const run = winCombat({ ...newRun(), act: ACT_COUNT }, fakeCombat('boss'), createRng(1))
    expect(run.screen).toBe('victory')
  })
})

describe('campfire', () => {
  it('heals 30% of max HP when resting', () => {
    const run = enterRest({ ...newRun(), player: { hp: 30, maxHp: 80 } }, fakeNode('rest'))
    expect(run.screen).toBe('rest')
    const rested = restHeal(run)
    expect(rested.player.hp).toBe(30 + 24)
    expect(rested.screen).toBe('map')
  })

  it('never heals above max HP', () => {
    expect(restHeal({ ...newRun(), player: { hp: 75, maxHp: 80 } }).player.hp).toBe(80)
  })

  it('upgrades the chosen card', () => {
    const run = enterRest(newRun(), fakeNode('rest'))
    const target = run.deck.find((card) => card.id === 'strike')
    const smithed = smithCard(run, target.deckId)
    expect(smithed.deck.find((card) => card.deckId === target.deckId)).toMatchObject({ name: 'Strike+', damage: 9 })
    expect(smithed.deck).toHaveLength(run.deck.length)
    expect(smithed.screen).toBe('map')
  })
})

describe('shop', () => {
  const shopRun = (gold) => enterShop({ ...newRun(), gold }, fakeNode('shop'), createRng(3))

  it('stocks unique cards and unowned relics with prices', () => {
    const run = shopRun(100)
    expect(run.shop.cards).toHaveLength(5)
    expect(new Set(run.shop.cards.map((offer) => offer.item.id)).size).toBe(5)
    expect(run.shop.relics).toHaveLength(2)
    run.shop.cards.forEach((offer) => expect(offer.price).toBeGreaterThan(0))
  })

  it('sells a card once and charges for it', () => {
    const run = shopRun(500)
    const offer = run.shop.cards[0]
    const bought = buyShopCard(run, 0)
    expect(bought.gold).toBe(500 - offer.price)
    expect(bought.deck.at(-1).id).toBe(offer.item.id)
    expect(bought.shop.cards[0].sold).toBe(true)
    expect(buyShopCard(bought, 0)).toBe(bought)
  })

  it('refuses purchases the player cannot afford', () => {
    const run = shopRun(10)
    expect(buyShopCard(run, 0)).toBe(run)
    expect(buyShopRelic(run, 0)).toBe(run)
  })

  it('sells relics', () => {
    const run = shopRun(500)
    const bought = buyShopRelic(run, 1)
    expect(bought.relics.at(-1).id).toBe(run.shop.relics[1].item.id)
    expect(bought.gold).toBe(500 - run.shop.relics[1].price)
  })

  it('removes one card per visit, and removal gets pricier each time', () => {
    const run = shopRun(500)
    expect(getRemoveCost(run)).toBe(REMOVE_BASE_COST)
    const removed = removeCardAtShop(run, run.deck[0].deckId)
    expect(removed.deck).toHaveLength(run.deck.length - 1)
    expect(removed.gold).toBe(500 - REMOVE_BASE_COST)
    expect(removeCardAtShop(removed, removed.deck[0].deckId)).toBe(removed)
    expect(getRemoveCost(removed)).toBe(REMOVE_BASE_COST + REMOVE_COST_STEP)
  })
})

describe('treasure', () => {
  it('gives gold and offers one relic', () => {
    const run = openTreasure(newRun(), fakeNode('treasure'), createRng(1))
    expect(run.gold).toBeGreaterThan(STARTING_GOLD)
    expect(run.rewardKind).toBe('relic')
    expect(run.rewardChoices).toHaveLength(1)
  })

  it('just gives gold when every relic is owned', () => {
    const run = openTreasure({ ...newRun(), relics: relicLibrary }, fakeNode('treasure'), createRng(1))
    expect(run.screen).toBe('map')
    expect(run.gold).toBeGreaterThan(STARTING_GOLD)
  })
})
