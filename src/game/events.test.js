import { describe, expect, it } from 'vitest'
import { characters, eventLibrary } from '../data/gameData'
import { chooseEventOption, continueEvent, enterMystery, meetsRequirements, pickEventCard } from './events'
import { createRng } from './rng'
import { createRunFromCharacter } from './runState'

const ironclad = characters[0]
const newRun = () => ({ ...createRunFromCharacter(ironclad, createRng(1)), screen: 'map' })
const node = { id: 'mystery-node', type: 'mystery', label: 'Unknown', floor: 4, connections: [] }

// Puts the run directly into a given event.
const atEvent = (id, run = newRun()) => ({
  ...run,
  currentNodeId: node.id,
  screen: 'event',
  event: { id, resolved: false, resultText: '', pick: null, fight: null, rewards: [] },
})
const choiceIndex = (id, label) => eventLibrary.find((event) => event.id === id).choices.findIndex((choice) => choice.label === label)
const choose = (run, label, seed = 1) => chooseEventOption(run, choiceIndex(run.event.id, label), createRng(seed))

describe('mystery rooms', () => {
  it('mostly lead to events, sometimes fights or treasure', () => {
    const outcomes = { event: 0, fight: 0, reward: 0 }
    for (let seed = 0; seed < 300; seed += 1) {
      const { run, fight } = enterMystery(newRun(), node, createRng(seed))
      outcomes[fight ? 'fight' : run.screen] += 1
    }
    expect(outcomes.event).toBeGreaterThan(outcomes.fight)
    expect(outcomes.fight).toBeGreaterThan(0)
    expect(outcomes.reward).toBeGreaterThan(0)
  })

  it("doesn't repeat events until it runs out", () => {
    let run = newRun()
    const seen = []
    for (let seed = 0; seen.length < eventLibrary.length && seed < 500; seed += 1) {
      const result = enterMystery(run, node, createRng(seed))
      if (result.run.screen === 'event') {
        expect(seen).not.toContain(result.run.event.id)
        seen.push(result.run.event.id)
        run = { ...run, seenEvents: result.run.seenEvents }
      }
    }
    expect(seen).toHaveLength(eventLibrary.length)
  })
})

describe('event choices', () => {
  it('applies simple effects and moves on', () => {
    const run = choose(atEvent('golden-idol'), 'Take it')
    expect(run.gold).toBe(newRun().gold + 150)
    expect(run.deck.some((card) => card.type === 'Curse')).toBe(true)
    expect(continueEvent(run, createRng(1)).run.screen).toBe('map')
  })

  it('disables choices the player cannot afford', () => {
    const broke = atEvent('cleric', { ...newRun(), gold: 10 })
    const heal = eventLibrary.find((event) => event.id === 'cleric').choices[0]
    expect(meetsRequirements(broke, heal)).toBe(false)
    expect(choose(broke, 'Heal')).toBe(broke)
  })

  it('requires a card pick before continuing, then applies it', () => {
    const run = choose(atEvent('cleric'), 'Purify')
    expect(run.event.pick).toBe('remove')
    expect(continueEvent(run, createRng(1)).run).toBe(run)
    const target = run.deck[0]
    const picked = pickEventCard(run, target.deckId, createRng(2))
    expect(picked.deck.find((card) => card.deckId === target.deckId)).toBeUndefined()
    expect(continueEvent(picked, createRng(3)).run.screen).toBe('map')
  })

  it('transforms a card into a different card', () => {
    const run = choose(atEvent('transmogrifier'), 'Transform')
    const target = run.deck[0]
    const picked = pickEventCard(run, target.deckId, createRng(2))
    expect(picked.deck).toHaveLength(run.deck.length)
    expect(picked.deck.find((card) => card.deckId === target.deckId)).toBeUndefined()
  })

  it('resolves gambles both ways across seeds', () => {
    const golds = new Set()
    for (let seed = 0; seed < 20; seed += 1) golds.add(choose(atEvent('gambler'), 'Bet 50 gold', seed).gold)
    expect([...golds].sort()).toEqual([newRun().gold - 50, newRun().gold + 100].sort())
  })

  it('offers card rewards after the event', () => {
    const run = choose(atEvent('library'), 'Read')
    const { run: next } = continueEvent(run, createRng(2))
    expect(next.screen).toBe('reward')
    next.rewards.items[0].choices.forEach((card) => expect(card.rarity).toBe('rare'))
  })

  it('starts event fights and pays the prize afterwards', () => {
    const run = choose(atEvent('mysterious-sphere'), 'Open it')
    expect(run.event.fight).toBe('elite')
    const { run: next, fight } = continueEvent(run, createRng(2))
    expect(fight).toMatchObject({ type: 'elite', floor: 0 })
    expect(next.combatBonus[0]).toMatchObject({ type: 'relic' })
    expect(next.combatBonus[0].relic.rarity).toBe('rare')
  })

  it('never kills the player outside of combat', () => {
    const run = choose(atEvent('shrine-of-blades', { ...newRun(), player: { hp: 3, maxHp: 80 } }), 'Reach in')
    expect(run.player.hp).toBe(1)
  })
})
