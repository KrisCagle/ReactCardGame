import { describe, expect, it } from 'vitest'
import { ACT_COUNT, POTION_SLOTS, cardLibrary, characters, potionLibrary, relicById, relicLibrary } from '../data/gameData'
import { canUpgrade, describeCard, upgradeCard } from './cards'
import { CARD_RARITY_ODDS, POTION_DROP_START, POTION_DROP_STEP, getCardPool, rollCardChoices, rollPotionDrop, rollRelic } from './rewards'
import { createRng } from './rng'
import {
  GOLD_REWARDS,
  REMOVE_BASE_COST,
  REMOVE_COST_STEP,
  STARTING_GOLD,
  addCardToDeck,
  addRelic,
  buyShopItem,
  canRest,
  canSmith,
  claimReward,
  createRunFromCharacter,
  enterRest,
  enterShop,
  gainGold,
  getRemoveCost,
  getRewardCount,
  leaveRewards,
  openTreasure,
  removeCardAtShop,
  restHeal,
  smithCard,
  winCombat,
} from './runState'

const ironclad = characters.find((character) => character.id === 'ironclad')
const newRun = (seed = 1) => ({ ...createRunFromCharacter(ironclad, createRng(seed)), screen: 'map' })
const fakeCombat = (nodeType, hp = 40) => ({ node: { id: `${nodeType}-node`, type: nodeType, label: nodeType }, player: { hp } })
const fakeNode = (type) => ({ id: `${type}-node`, type, label: 'Campfire', floor: 3, connections: [] })
const withRelics = (run, ...ids) => ids.reduce((current, id) => addRelic(current, relicById[id]), run)
const itemOfType = (run, type) => run.rewards.items.find((item) => item.type === type)

describe('describeCard', () => {
  it('builds text from card effects', () => {
    expect(describeCard(cardLibrary.twinStrike)).toBe('Deal 5 damage twice.')
    expect(describeCard(cardLibrary.bash)).toBe('Deal 8 damage. Apply 2 vulnerable.')
    expect(describeCard(cardLibrary.warcry)).toBe('Gain 3 block. Draw 2 cards. Exhaust.')
    expect(describeCard(cardLibrary.offering)).toBe('Lose 6 HP. Gain 2 energy. Draw 3 cards. Exhaust.')
    expect(describeCard(cardLibrary.catalyst)).toBe("Double the enemy's poison. Exhaust.")
    expect(describeCard(cardLibrary.doubt)).toBe('Unplayable.')
  })

  it('has text for every card in the library', () => {
    Object.values(cardLibrary).forEach((card) => expect(describeCard(card), card.id).not.toBe(''))
  })

  // Two copies of a free card that draws can draw each other forever (infinite
  // block or damage), so free draw cards must exhaust - upgraded versions too.
  it('has no infinite free-draw loops', () => {
    Object.values(cardLibrary).flatMap((card) => [card, upgradeCard(card)]).forEach((card) => {
      const free = card.cost - (card.energy ?? 0) <= 0
      if (free && card.draw && card.type !== 'Power') expect(card.exhaust, card.name).toBe(true)
    })
  })
})

describe('card upgrades', () => {
  it('gives every non-curse card an upgrade that actually changes it', () => {
    Object.values(cardLibrary)
      .filter((card) => card.type !== 'Curse')
      .forEach((card) => {
        const upgraded = upgradeCard(card)
        expect(upgraded.name, card.id).toBe(`${card.name}+`)
        const changed = describeCard(upgraded) !== describeCard(card) || upgraded.cost !== card.cost
        expect(changed, card.id).toBe(true)
      })
  })

  it("can't upgrade curses or the same card twice", () => {
    expect(canUpgrade(cardLibrary.doubt)).toBe(false)
    const upgraded = upgradeCard({ ...cardLibrary.strike, deckId: 'strike-0' })
    expect(upgraded).toMatchObject({ damage: 9, upgraded: true, deckId: 'strike-0' })
    expect(upgradeCard(upgraded)).toBe(upgraded)
  })
})

describe('card rewards', () => {
  it('offers only the character pool, never basics or curses', () => {
    const pool = getCardPool(newRun())
    pool.forEach((card) => expect(['common', 'uncommon', 'rare']).toContain(card.rarity))
    expect(pool.map((card) => card.id)).not.toContain('noxious-fumes')
  })

  it('never offers the same card twice on one screen', () => {
    for (let seed = 0; seed < 200; seed += 1) {
      const ids = rollCardChoices(newRun(), 5, 'fight', createRng(seed)).map((card) => card.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it('rolls rarities close to the configured odds', () => {
    const counts = { common: 0, uncommon: 0, rare: 0 }
    for (let seed = 0; seed < 2000; seed += 1) counts[rollCardChoices(newRun(), 1, 'fight', createRng(seed))[0].rarity] += 1
    expect(counts.common / 2000).toBeCloseTo(CARD_RARITY_ODDS.fight.common / 100, 1)
    expect(counts.rare / 2000).toBeLessThan(0.1)
  })

  it('can force a rarity', () => {
    rollCardChoices(newRun(), 3, 'event', createRng(1), { rarity: 'rare' }).forEach((card) => expect(card.rarity).toBe('rare'))
  })

  it('shrinks with Busted Crown but always offers at least one card', () => {
    expect(getRewardCount(newRun())).toBe(3)
    expect(getRewardCount(withRelics(newRun(), 'busted-crown'))).toBe(1)
  })

  it('keeps deck ids unique even after removing cards', () => {
    let run = enterShop({ ...newRun(), gold: 1000 }, fakeNode('shop'), createRng(1))
    run = removeCardAtShop(run, run.deck[0].deckId)
    run = addCardToDeck(addCardToDeck(run, cardLibrary.cleave), cardLibrary.cleave)
    expect(new Set(run.deck.map((card) => card.deckId)).size).toBe(run.deck.length)
  })
})

describe('relics', () => {
  it('rolls only unowned, non-boss relics', () => {
    const run = withRelics(newRun(), ...relicLibrary.slice(0, 10).map((relic) => relic.id))
    for (let seed = 0; seed < 100; seed += 1) {
      const relic = rollRelic(run, createRng(seed))
      expect(run.relics.map((owned) => owned.id)).not.toContain(relic.id)
      expect(relic.rarity).not.toBe('boss')
    }
  })

  it('applies pickup effects', () => {
    const run = withRelics(newRun(), 'strawberry', 'old-coin')
    expect(run.player).toEqual({ maxHp: 87, hp: 87 })
    expect(run.gold).toBe(STARTING_GOLD + 300)
  })

  it('Ectoplasm blocks gold gains but not spending', () => {
    const run = withRelics(newRun(), 'ectoplasm')
    expect(gainGold(run, 50).gold).toBe(STARTING_GOLD)
    expect(gainGold(run, -50).gold).toBe(STARTING_GOLD - 50)
  })

  it('Ceramic Fish pays gold when cards are added', () => {
    expect(addCardToDeck(withRelics(newRun(), 'ceramic-fish'), cardLibrary.cleave).gold).toBe(STARTING_GOLD + 9)
  })
})

describe('potions', () => {
  it('uses a pity timer for drops', () => {
    const run = { ...newRun(), potionChance: POTION_DROP_START }
    const results = Array.from({ length: 50 }, (_, seed) => rollPotionDrop(run, createRng(seed)))
    results.forEach(({ potion, potionChance }) => {
      expect(potionChance).toBe(potion ? POTION_DROP_START - POTION_DROP_STEP : POTION_DROP_START + POTION_DROP_STEP)
    })
    expect(results.some((result) => result.potion)).toBe(true)
  })

  it('never drops with Sozu', () => {
    const run = { ...withRelics(newRun(), 'sozu'), potionChance: 100 }
    expect(rollPotionDrop(run, createRng(1)).potion).toBeNull()
  })
})

describe('combat rewards', () => {
  it('starts the run with gold, no potions, and a generated map', () => {
    const run = newRun()
    expect(run.gold).toBe(STARTING_GOLD)
    expect(run.potions).toEqual([])
    expect(run.map.rows.length).toBeGreaterThan(10)
  })

  it('heals, pays gold, and offers a card after a normal fight', () => {
    const run = winCombat(newRun(), fakeCombat('fight', 40), createRng(1))
    expect(run.player.hp).toBe(40 + ironclad.modifiers.healAfterFight)
    expect(run.gold - STARTING_GOLD).toBeGreaterThanOrEqual(GOLD_REWARDS.fight[0])
    expect(run.gold - STARTING_GOLD).toBeLessThanOrEqual(GOLD_REWARDS.fight[1])
    expect(run.screen).toBe('reward')
    expect(itemOfType(run, 'card').choices).toHaveLength(3)
    expect(itemOfType(run, 'relic')).toBeUndefined()
  })

  it('gives elites a card and a relic', () => {
    const run = winCombat(newRun(), fakeCombat('elite'), createRng(1))
    expect(itemOfType(run, 'card')).toBeDefined()
    expect(itemOfType(run, 'relic').relic.rarity).not.toBe('boss')
  })

  it('gives bosses rare cards and a choice of boss relics, then starts the next act', () => {
    const start = { ...newRun(), act: 1 }
    const run = winCombat(start, fakeCombat('boss'), createRng(1))
    itemOfType(run, 'card').choices.forEach((card) => expect(card.rarity).toBe('rare'))
    const bossRelics = itemOfType(run, 'relicChoice')
    bossRelics.choices.forEach((relic) => expect(relic.rarity).toBe('boss'))

    const claimed = claimReward(run, bossRelics.id, bossRelics.choices[0].id, createRng(2))
    expect(claimed.relics.at(-1).id).toBe(bossRelics.choices[0].id)
    const next = leaveRewards(claimed, createRng(3))
    expect(next.act).toBe(2)
    expect(next.map.act).toBe(2)
    expect(next.currentNodeId).toBeNull()
  })

  it('leaves the reward screen automatically once everything is claimed', () => {
    let run = winCombat(newRun(), fakeCombat('fight'), createRng(1))
    run.rewards.items.forEach((item) => {
      run = claimReward(run, item.id, item.choices?.[0].id, createRng(2))
    })
    expect(run.screen).toBe('map')
  })

  it("won't take a potion when the belt is full", () => {
    const full = { ...newRun(), potions: potionLibrary.slice(0, POTION_SLOTS) }
    const run = { ...full, screen: 'reward', rewards: { items: [{ id: 'p', type: 'potion', potion: potionLibrary[5] }], then: 'map' } }
    expect(claimReward(run, 'p', undefined, createRng(1))).toBe(run)
  })

  it('ends the run in victory after the final act boss', () => {
    expect(winCombat({ ...newRun(), act: ACT_COUNT }, fakeCombat('boss'), createRng(1)).screen).toBe('victory')
  })

  it('Meat on the Bone heals when the fight ends at low HP', () => {
    expect(winCombat(withRelics(newRun(), 'meat-on-the-bone'), fakeCombat('fight', 30), createRng(1)).player.hp).toBe(30 + ironclad.modifiers.healAfterFight + 12)
  })
})

describe('campfire', () => {
  it('heals 30% of max HP when resting', () => {
    const run = enterRest({ ...newRun(), player: { hp: 30, maxHp: 80 } }, fakeNode('rest'))
    expect(restHeal(run).player.hp).toBe(30 + 24)
  })

  it('Regal Pillow heals extra', () => {
    const run = withRelics({ ...newRun(), player: { hp: 30, maxHp: 80 } }, 'regal-pillow')
    expect(restHeal(enterRest(run, fakeNode('rest'))).player.hp).toBe(30 + 24 + 15)
  })

  it('upgrades the chosen card', () => {
    const run = enterRest(newRun(), fakeNode('rest'))
    const target = run.deck.find((card) => card.id === 'strike')
    expect(smithCard(run, target.deckId).deck.find((card) => card.deckId === target.deckId)).toMatchObject({ name: 'Strike+', damage: 9 })
  })

  it('respects Coffee Dripper and Fusion Hammer', () => {
    const dripper = enterRest(withRelics({ ...newRun(), player: { hp: 30, maxHp: 80 } }, 'coffee-dripper'), fakeNode('rest'))
    expect(canRest(dripper)).toBe(false)
    expect(restHeal(dripper)).toBe(dripper)
    const hammer = enterRest(withRelics(newRun(), 'fusion-hammer'), fakeNode('rest'))
    expect(canSmith(hammer)).toBe(false)
    expect(smithCard(hammer, hammer.deck[0].deckId)).toBe(hammer)
  })
})

describe('shop', () => {
  const shopRun = (gold, run = newRun()) => enterShop({ ...run, gold }, fakeNode('shop'), createRng(3))

  it('stocks cards, relics, and potions with rarity-based prices', () => {
    const run = shopRun(100)
    expect(run.shop.cards).toHaveLength(5)
    expect(run.shop.relics).toHaveLength(3)
    expect(run.shop.potions).toHaveLength(3)
    run.shop.cards.forEach((offer) => expect(offer.price).toBeGreaterThan(0))
    const rare = run.shop.cards.find((offer) => offer.item.rarity === 'rare')
    const common = run.shop.cards.find((offer) => offer.item.rarity === 'common')
    if (rare && common) expect(rare.price).toBeGreaterThan(common.price)
  })

  it('sells each item once and charges for it', () => {
    const run = shopRun(1000)
    const bought = buyShopItem(buyShopItem(buyShopItem(run, 'cards', 0), 'relics', 0), 'potions', 0)
    const spent = run.shop.cards[0].price + run.shop.relics[0].price + run.shop.potions[0].price
    expect(bought.gold).toBe(1000 - spent)
    expect(bought.deck.at(-1).id).toBe(run.shop.cards[0].item.id)
    expect(bought.relics.at(-1).id).toBe(run.shop.relics[0].item.id)
    expect(bought.potions).toHaveLength(1)
    expect(buyShopItem(bought, 'cards', 0)).toBe(bought)
  })

  it('refuses purchases the player cannot afford', () => {
    const run = shopRun(10)
    expect(buyShopItem(run, 'cards', 0)).toBe(run)
    expect(buyShopItem(run, 'relics', 0)).toBe(run)
  })

  it('applies the Membership Card discount', () => {
    const full = shopRun(100)
    const discounted = shopRun(100, withRelics(newRun(), 'membership-card'))
    expect(getRemoveCost(discounted)).toBe(Math.round(REMOVE_BASE_COST * 0.7))
    expect(discounted.shop.potions[0].price).toBeLessThan(full.shop.potions[0].price + 1)
  })

  it('removes one card per visit, and removal gets pricier each time', () => {
    const run = shopRun(500)
    const removed = removeCardAtShop(run, run.deck[0].deckId)
    expect(removed.deck).toHaveLength(run.deck.length - 1)
    expect(removed.gold).toBe(500 - REMOVE_BASE_COST)
    expect(removeCardAtShop(removed, removed.deck[0].deckId)).toBe(removed)
    expect(getRemoveCost(removed)).toBe(REMOVE_BASE_COST + REMOVE_COST_STEP)
  })
})

describe('treasure', () => {
  it('gives gold and a relic', () => {
    const run = openTreasure(newRun(), fakeNode('treasure'), createRng(1))
    expect(run.gold).toBeGreaterThan(STARTING_GOLD)
    expect(itemOfType(run, 'relic')).toBeDefined()
  })

  it('just gives gold when every relic is owned', () => {
    // Boss relics never drop from chests (and Ectoplasm would block the gold).
    const run = openTreasure({ ...newRun(), relics: relicLibrary.filter((relic) => relic.rarity !== 'boss') }, fakeNode('treasure'), createRng(1))
    expect(run.screen).toBe('map')
    expect(run.gold).toBeGreaterThan(STARTING_GOLD)
  })
})
