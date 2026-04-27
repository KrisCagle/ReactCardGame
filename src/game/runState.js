import { cardLibrary, characterRewardPools, characters, enemies, mapRows, openingBoonPool, relicLibrary, rewardPool } from '../data/gameData'

export const cloneCard = (card, suffix) => ({ ...card, instanceId: `${card.id}-${suffix}` })

export const createDeckCard = (card, suffix) => ({ ...card, deckId: `${card.id}-${suffix}` })

export const shuffle = (cards) => {
  const shuffled = [...cards]

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

export const takeRandom = (items, amount) => shuffle(items).slice(0, amount)

export const findNode = (nodeId) => mapRows.flat().find((node) => node.id === nodeId)

export const getNodeRowIndex = (nodeId) => mapRows.findIndex((row) => row.some((node) => node.id === nodeId))

const scaleMove = (move, nodeType, rowIndex, act) => {
  const depthBoost = rowIndex
  const actBoost = Math.max(0, act - 1)
  const damageScale = nodeType === 'boss' ? 2 + actBoost : nodeType === 'elite' ? 1 + actBoost : actBoost
  const hpScale = nodeType === 'boss' ? 14 + actBoost * 8 : nodeType === 'elite' ? 8 + actBoost * 5 : 4 + actBoost * 3

  return {
    move: {
      ...move,
      damage: move.damage ? move.damage + Math.floor(depthBoost / 2) + damageScale : undefined,
      block: move.block ? move.block + Math.floor(depthBoost / 3) : undefined,
      strength: move.strength ? move.strength + Math.floor(depthBoost / 4) : undefined,
    },
    hpScale,
  }
}

export const createEnemy = (nodeType, rowIndex, act) => {
  const candidates = enemies[nodeType] ?? enemies.fight
  const enemy = candidates[Math.floor(Math.random() * candidates.length)]
  const scaledMoves = enemy.moves.map((move) => scaleMove(move, nodeType, rowIndex, act).move)
  const hpScale = scaleMove(enemy.moves[0], nodeType, rowIndex, act).hpScale

  return {
    ...enemy,
    maxHp: enemy.maxHp + hpScale + rowIndex * (nodeType === 'boss' ? 4 : 2),
    hp: enemy.maxHp + hpScale + rowIndex * (nodeType === 'boss' ? 4 : 2),
    block: 0,
    strength: 0,
    vulnerable: 0,
    moveIndex: 0,
    moves: scaledMoves,
  }
}

export const createInitialRun = () => ({
  screen: 'characterSelect',
  character: null,
  deck: [],
  relics: [],
  player: { maxHp: 0, hp: 0 },
  currentNodeId: null,
  completedNodeIds: [],
  selectedPath: [],
  rewardChoices: [],
  openingChoices: [],
  rewardKind: 'card',
  rewardTitle: 'Choose a Card',
  rewardSource: null,
  act: 1,
  message: 'Choose your champion.',
})

export const createRunFromCharacter = (character) => ({
  screen: 'openingBoon',
  character,
  deck: character.starterDeck.map((card, index) => createDeckCard(card, `${character.id}-starter-${index}`)),
  relics: [...character.startingRelics],
  player: { maxHp: character.maxHp, hp: character.maxHp },
  currentNodeId: null,
  completedNodeIds: [],
  selectedPath: [],
  rewardChoices: [],
  openingChoices: takeRandom(openingBoonPool, 3),
  rewardKind: 'card',
  rewardTitle: 'Choose a Card',
  rewardSource: null,
  act: 1,
  message: `${character.name} enters the climb. Pick one opening boon.`,
})

export const applyOpeningBoon = (run, boon) => {
  if (boon.kind === 'relic') {
    const relic = relicLibrary.find((item) => item.id === boon.relicId)
    return { ...run, relics: [...run.relics, relic] }
  }

  if (boon.kind === 'card') {
    const card = cardLibrary[boon.cardId]
    return { ...run, deck: [...run.deck, createDeckCard(card, `boon-${run.deck.length}`)] }
  }

  if (boon.effect === 'maxHp') {
    return { ...run, player: { maxHp: run.player.maxHp + 10, hp: run.player.hp + 10 } }
  }

  if (boon.effect === 'startingDraw') {
    return {
      ...run,
      character: {
        ...run.character,
        modifiers: { ...run.character.modifiers, startingDraw: (run.character.modifiers?.startingDraw ?? 0) + 1 },
      },
    }
  }

  if (boon.effect === 'rewardChoicesBonus') {
    return {
      ...run,
      character: {
        ...run.character,
        modifiers: { ...run.character.modifiers, rewardChoicesBonus: (run.character.modifiers?.rewardChoicesBonus ?? 0) + 1 },
      },
    }
  }

  return run
}

export const createCombat = (run, node) => {
  const handSize = 5 + getRunModifier(run, 'startingDraw')
  const deck = shuffle(run.deck.map((card, index) => cloneCard(card, `${node.id}-${index}`)))
  const rowIndex = getNodeRowIndex(node.id)

  return {
    node,
    player: {
      maxHp: run.player.maxHp,
      hp: run.player.hp,
      block: run.relics.reduce((total, relic) => total + (relic.block ?? 0), 0),
      energy: 3 + run.relics.reduce((total, relic) => total + (relic.energy ?? 0), 0),
      maxEnergy: 3,
      strength: run.relics.reduce((total, relic) => total + (relic.strength ?? 0), 0),
    },
    enemy: createEnemy(node.type, rowIndex, run.act),
    drawPile: deck.slice(handSize),
    hand: deck.slice(0, handSize),
    discardPile: [],
    turn: 1,
    log: [`${node.label} blocks the path.`],
    outcome: 'playing',
  }
}

export const describeIntent = (move, strength = 0) => {
  const parts = []
  if (move.damage) parts.push(`${move.damage + strength} damage`)
  if (move.block) parts.push(`${move.block} block`)
  if (move.strength) parts.push(`+${move.strength} strength`)
  return parts.join(', ')
}

export const drawCards = (state, amount) => {
  let drawPile = [...state.drawPile]
  let discardPile = [...state.discardPile]
  const drawn = []

  for (let i = 0; i < amount; i += 1) {
    if (drawPile.length === 0 && discardPile.length > 0) {
      drawPile = shuffle(discardPile)
      discardPile = []
    }
    if (drawPile.length === 0) break
    drawn.push(drawPile[0])
    drawPile = drawPile.slice(1)
  }

  return { ...state, drawPile, discardPile, hand: [...state.hand, ...drawn].slice(0, 10) }
}

export const getAvailableNodeIds = (run) => {
  if (!run.currentNodeId) return mapRows[0].map((node) => node.id)
  return findNode(run.currentNodeId)?.connections ?? []
}

export const getRunModifier = (run, key) => {
  const characterValue = run.character?.modifiers?.[key] ?? 0
  const relicValue = (run.relics ?? []).reduce((total, relic) => total + (relic[key] ?? 0), 0)
  return characterValue + relicValue
}

export const getRewardCount = (run, base) => base + getRunModifier(run, 'rewardChoicesBonus')

export const getCardRewardPool = (run) => {
  const specificPool = characterRewardPools[run.character?.id] ?? []
  return [...rewardPool, ...specificPool]
}

export const getCharacterById = (id) => characters.find((character) => character.id === id)
