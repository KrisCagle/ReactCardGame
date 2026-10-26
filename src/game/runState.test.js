import { describe, expect, it } from 'vitest'
import { ACT_COUNT, cardLibrary, characters, relicLibrary } from '../data/gameData'
import { describeCard } from './cards'
import { createRng } from './rng'
import {
  createRunFromCharacter,
  getCardRewardChoices,
  getCardRewardPool,
  getRelicChoices,
  takeReward,
  winCombat,
} from './runState'

const ironclad = characters.find((character) => character.id === 'ironclad')
const newRun = (seed = 1) => ({ ...createRunFromCharacter(ironclad, createRng(seed)), screen: 'map' })
const fakeCombat = (nodeType, hp = 40) => ({ node: { id: `${nodeType}-node`, type: nodeType, label: nodeType }, player: { hp } })

describe('describeCard', () => {
  it('builds text from card effects', () => {
    expect(describeCard(cardLibrary.twinStrike)).toBe('Deal 5 damage twice.')
    expect(describeCard(cardLibrary.bash)).toBe('Deal 9 damage. Apply 1 vulnerable.')
    expect(describeCard(cardLibrary.warcry)).toBe('Gain 3 block. Draw 2 cards.')
    expect(describeCard(cardLibrary.pommel)).toBe('Deal 7 damage. Draw 1 card.')
    expect(describeCard(cardLibrary.meditate)).toBe('At the start of each turn, gain 3 block.')
  })

  it('has text for every card in the library', () => {
    Object.values(cardLibrary).forEach((card) => expect(describeCard(card), card.id).not.toBe(''))
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
    const next = takeReward(run, cardLibrary.cleave)
    expect(next.deck).toHaveLength(run.deck.length + 1)
    expect(new Set(next.deck.map((card) => card.deckId)).size).toBe(next.deck.length)
    expect(next.screen).toBe('map')
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
  it('heals from the character passive and offers a card after a normal fight', () => {
    const run = winCombat(newRun(), fakeCombat('fight', 40), createRng(1))
    expect(run.player.hp).toBe(45)
    expect(run.screen).toBe('reward')
    expect(run.rewardKind).toBe('card')
  })

  it('offers relics after elites', () => {
    const run = winCombat(newRun(), fakeCombat('elite'), createRng(1))
    expect(run.rewardKind).toBe('relic')
    expect(run.rewardChoices).toHaveLength(3)
  })

  it('moves to the next act after a boss reward', () => {
    const afterBoss = winCombat({ ...newRun(), act: 1 }, fakeCombat('boss'), createRng(1))
    const next = takeReward(afterBoss, afterBoss.rewardChoices[0])
    expect(next.act).toBe(2)
    expect(next.currentNodeId).toBeNull()
    expect(next.completedNodeIds).toEqual([])
  })

  it('ends the run in victory after the final act boss', () => {
    const run = winCombat({ ...newRun(), act: ACT_COUNT }, fakeCombat('boss'), createRng(1))
    expect(run.screen).toBe('victory')
  })
})
