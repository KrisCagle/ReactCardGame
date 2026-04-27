import { useMemo, useState } from 'react'
import './App.css'
import { relicLibrary } from './data/gameData'
import {
  applyOpeningBoon,
  createCombat,
  createInitialRun,
  createRunFromCharacter,
  drawCards,
  getCardRewardPool,
  getRewardCount,
  getRunModifier,
  takeRandom,
} from './game/runState'
import { CharacterSelectScreen } from './components/CharacterSelectScreen'
import { OpeningBoonScreen } from './components/OpeningBoonScreen'
import { MapScreen } from './components/MapScreen'
import { RewardScreen } from './components/RewardScreen'
import { CombatScreen } from './components/CombatScreen'

function App() {
  const [run, setRun] = useState(createInitialRun)
  const [combat, setCombat] = useState(null)

  const enemyMove = useMemo(() => {
    if (!combat) return null
    return combat.enemy.moves[combat.enemy.moveIndex % combat.enemy.moves.length]
  }, [combat])

  const chooseCharacter = (character) => {
    setCombat(null)
    setRun(createRunFromCharacter(character))
  }

  const chooseOpeningBoon = (boon) => {
    setRun((current) => ({
      ...applyOpeningBoon(current, boon),
      screen: 'map',
      openingChoices: [],
      message: `${boon.title} chosen. Choose your first room.`,
    }))
  }

  const startNode = (node) => {
    if (node.type === 'rest') {
      const healed = Math.min(run.player.maxHp, run.player.hp + 18)
      setRun((current) => ({
        ...current,
        currentNodeId: node.id,
        completedNodeIds: [...current.completedNodeIds, node.id],
        selectedPath: [...current.selectedPath, node.id],
        player: { ...current.player, hp: healed },
        message: `You rest at ${node.label} and recover ${healed - current.player.hp} HP.`,
      }))
      return
    }

    if (node.type === 'shop') {
      setRun((current) => ({
        ...current,
        screen: 'reward',
        currentNodeId: node.id,
        completedNodeIds: [...current.completedNodeIds, node.id],
        selectedPath: [...current.selectedPath, node.id],
        rewardChoices: takeRandom(getCardRewardPool(current), getRewardCount(current, 5)),
        rewardKind: 'shop',
        rewardTitle: 'Merchant Wares',
        rewardSource: 'shop',
        message: 'Take one card from the merchant while gold is still imaginary.',
      }))
      return
    }

    if (node.type === 'mystery') {
      resolveMystery(node)
      return
    }

    setCombat(createCombat(run, node))
    setRun((current) => ({
      ...current,
      screen: 'combat',
      currentNodeId: node.id,
      selectedPath: [...current.selectedPath, node.id],
      message: `${node.label}: survive the fight.`,
    }))
  }

  const resolveMystery = (node) => {
    const roll = Math.random()

    if (roll < 0.45) {
      setCombat(createCombat(run, { ...node, type: 'fight', label: 'Hidden Enemy' }))
      setRun((current) => ({
        ...current,
        screen: 'combat',
        currentNodeId: node.id,
        selectedPath: [...current.selectedPath, node.id],
        message: 'Something leaps from the dark.',
      }))
      return
    }

    if (roll < 0.75) {
      setRun((current) => ({
        ...current,
        screen: 'reward',
        currentNodeId: node.id,
        completedNodeIds: [...current.completedNodeIds, node.id],
        selectedPath: [...current.selectedPath, node.id],
        rewardChoices: takeRandom(getCardRewardPool(current), getRewardCount(current, 4)),
        rewardKind: 'card',
        rewardTitle: 'Forgotten Cache',
        rewardSource: 'mystery',
        message: 'A hidden cache offers a card.',
      }))
      return
    }

    setRun((current) => ({
      ...current,
      screen: 'reward',
      currentNodeId: node.id,
      completedNodeIds: [...current.completedNodeIds, node.id],
      selectedPath: [...current.selectedPath, node.id],
      rewardChoices: takeRandom(relicLibrary, 3),
      rewardKind: 'relic',
      rewardTitle: 'Strange Relic',
      rewardSource: 'mystery',
      message: 'A strange power waits in the dust.',
    }))
  }

  const playCard = (card) => {
    if (!combat || combat.outcome !== 'playing') return

    if (card.cost > combat.player.energy) {
      setCombat((current) => ({
        ...current,
        log: [`Not enough energy for ${card.name}.`, ...current.log].slice(0, 5),
      }))
      return
    }

    let next = {
      ...combat,
      player: { ...combat.player, energy: combat.player.energy - card.cost + (card.energy ?? 0) },
      enemy: { ...combat.enemy },
      hand: combat.hand.filter((item) => item.instanceId !== card.instanceId),
      discardPile: [...combat.discardPile, card],
    }

    const messages = []

    if (card.damage) {
      const bonus = combat.enemy.vulnerable ? 3 : 0
      const damage = card.damage + bonus + combat.player.strength
      const blockedDamage = Math.max(0, damage - next.enemy.block)
      next.enemy.block = Math.max(0, next.enemy.block - damage)
      next.enemy.hp = Math.max(0, next.enemy.hp - blockedDamage)
      messages.push(`${card.name} hits for ${blockedDamage}.`)
    }

    if (card.block) {
      next.player.block += card.block
      messages.push(`${card.name} adds ${card.block} block.`)
    }

    if (card.strength) {
      next.player.strength += card.strength
      messages.push(`${card.name} grants ${card.strength} strength.`)
    }

    if (card.vulnerable) {
      next.enemy.vulnerable = (next.enemy.vulnerable ?? 0) + card.vulnerable
      messages.push(`${card.name} exposes the enemy.`)
    }

    if (card.draw) {
      next = drawCards(next, card.draw)
      messages.push(`${card.name} draws ${card.draw}.`)
    }

    if (card.heal) {
      next.player.hp = Math.min(next.player.maxHp, next.player.hp + card.heal)
      messages.push(`${card.name} restores ${card.heal} HP.`)
    }

    if (next.enemy.hp <= 0) {
      const isEliteOrBoss = ['elite', 'boss'].includes(next.node.type)
      const relicHeal = run.relics.some((relic) => relic.id === 'burning-blood') && isEliteOrBoss ? 6 : 0
      const healedHp = Math.min(run.player.maxHp, next.player.hp + getRunModifier(run, 'healAfterFight') + relicHeal)

      setRun((current) => ({
        ...current,
        screen: 'reward',
        player: { ...current.player, hp: healedHp },
        completedNodeIds: [...current.completedNodeIds, next.node.id],
        rewardChoices: isEliteOrBoss
          ? takeRandom(relicLibrary, 3)
          : takeRandom(getCardRewardPool(current), getRewardCount(current, 4)),
        rewardKind: isEliteOrBoss ? 'relic' : 'card',
        rewardTitle: isEliteOrBoss ? 'Claim a Relic' : 'Choose a Card',
        rewardSource: next.node.type,
        message: isEliteOrBoss
          ? next.node.type === 'boss'
            ? 'The boss falls. Claim a relic and climb again.'
            : 'The elite drops a relic.'
          : 'Choose one card for your deck.',
      }))
      setCombat(null)
      return
    }

    setCombat({ ...next, log: [...messages, ...next.log].slice(0, 6) })
  }

  const endTurn = () => {
    if (!combat || combat.outcome !== 'playing') return

    setCombat((current) => {
      const move = current.enemy.moves[current.enemy.moveIndex % current.enemy.moves.length]
      let player = { ...current.player, block: 0 }
      let enemy = { ...current.enemy, block: 0, vulnerable: Math.max(0, (current.enemy.vulnerable ?? 0) - 1) }
      const messages = []

      if (move.block) {
        enemy.block += move.block
        messages.push(`${enemy.name} gains ${move.block} block.`)
      }
      if (move.strength) {
        enemy.strength += move.strength
        messages.push(`${enemy.name} grows stronger.`)
      }
      if (move.damage) {
        const damage = move.damage + enemy.strength
        const unblocked = Math.max(0, damage - current.player.block)
        player.hp = Math.max(0, current.player.hp - unblocked)
        messages.push(`${enemy.name} uses ${move.intent} for ${unblocked}.`)
      }

      enemy.moveIndex += 1

      const beforeDraw = {
        ...current,
        player: { ...player, energy: player.maxEnergy },
        enemy,
        discardPile: [...current.discardPile, ...current.hand],
        hand: [],
        turn: current.turn + 1,
      }

      const next = drawCards(beforeDraw, 5)
      if (next.player.hp <= 0) {
        next.outcome = 'lost'
        messages.unshift('You fall, but the next climb begins here.')
      }

      return { ...next, log: [`Turn ${next.turn} begins.`, ...messages, ...current.log].slice(0, 6) }
    })
  }

  const chooseReward = (reward) => {
    const startsNewAct = run.rewardSource === 'boss'

    if (run.rewardKind === 'relic') {
      setRun((current) => ({
        ...current,
        screen: 'map',
        relics: [...current.relics, reward],
        currentNodeId: startsNewAct ? null : current.currentNodeId,
        completedNodeIds: startsNewAct ? [] : current.completedNodeIds,
        selectedPath: startsNewAct ? [] : current.selectedPath,
        rewardChoices: [],
        rewardKind: 'card',
        rewardTitle: 'Choose a Card',
        rewardSource: null,
        act: startsNewAct ? current.act + 1 : current.act,
        message: startsNewAct ? `${reward.name} claimed. Act ${current.act + 1} begins. Choose your first room.` : `${reward.name} claimed. Choose your next room.`,
      }))
      return
    }

    setRun((current) => ({
      ...current,
      screen: 'map',
      deck: [...current.deck, { ...reward, deckId: `${reward.id}-${current.deck.length}` }],
      currentNodeId: startsNewAct ? null : current.currentNodeId,
      completedNodeIds: startsNewAct ? [] : current.completedNodeIds,
      selectedPath: startsNewAct ? [] : current.selectedPath,
      rewardChoices: [],
      rewardKind: 'card',
      rewardTitle: 'Choose a Card',
      rewardSource: null,
      act: startsNewAct ? current.act + 1 : current.act,
      message: startsNewAct ? `${reward.name} added. Act ${current.act + 1} begins. Choose your first room.` : `${reward.name} added. Choose your next room.`,
    }))
  }

  const skipReward = () => {
    const startsNewAct = run.rewardSource === 'boss'
    setRun((current) => ({
      ...current,
      screen: 'map',
      currentNodeId: startsNewAct ? null : current.currentNodeId,
      completedNodeIds: startsNewAct ? [] : current.completedNodeIds,
      selectedPath: startsNewAct ? [] : current.selectedPath,
      rewardChoices: [],
      rewardKind: 'card',
      rewardTitle: 'Choose a Card',
      rewardSource: null,
      act: startsNewAct ? current.act + 1 : current.act,
      message: startsNewAct ? `You move on without taking a reward. Act ${current.act + 1} begins. Choose your first room.` : 'No card added. Choose your next room.',
    }))
  }

  const restartRun = () => {
    setCombat(null)
    setRun(createInitialRun())
  }

  if (run.screen === 'characterSelect') return <CharacterSelectScreen onChoose={chooseCharacter} />
  if (run.screen === 'openingBoon') return <OpeningBoonScreen run={run} onChoose={chooseOpeningBoon} />
  if (run.screen === 'map') return <MapScreen run={run} onPickNode={startNode} onRestart={restartRun} />
  if (run.screen === 'reward') return <RewardScreen run={run} onChoose={chooseReward} onSkip={skipReward} />

  return (
    <CombatScreen
      combat={combat}
      enemyMove={enemyMove}
      onEndTurn={endTurn}
      onPlayCard={playCard}
      onRestart={restartRun}
      run={run}
    />
  )
}

export default App
