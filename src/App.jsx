import { useMemo, useState } from 'react'
import './App.css'

const cardLibrary = {
  strike: {
    id: 'strike',
    name: 'Strike',
    type: 'Attack',
    cost: 1,
    damage: 6,
    text: 'Deal 6 damage.',
  },
  guard: {
    id: 'guard',
    name: 'Guard',
    type: 'Skill',
    cost: 1,
    block: 5,
    text: 'Gain 5 block.',
  },
  bash: {
    id: 'bash',
    name: 'Bash',
    type: 'Attack',
    cost: 2,
    damage: 9,
    vulnerable: 1,
    text: 'Deal 9 damage. Apply 1 vulnerable.',
  },
  focus: {
    id: 'focus',
    name: 'Focus',
    type: 'Power',
    cost: 0,
    draw: 1,
    energy: 1,
    text: 'Gain 1 energy. Draw 1 card.',
  },
  cleave: {
    id: 'cleave',
    name: 'Cleave',
    type: 'Attack',
    cost: 1,
    damage: 8,
    text: 'Deal 8 damage.',
  },
  shrug: {
    id: 'shrug',
    name: 'Shrug It Off',
    type: 'Skill',
    cost: 1,
    block: 8,
    draw: 1,
    text: 'Gain 8 block. Draw 1 card.',
  },
  pommel: {
    id: 'pommel',
    name: 'Pommel Strike',
    type: 'Attack',
    cost: 1,
    damage: 7,
    draw: 1,
    text: 'Deal 7 damage. Draw 1 card.',
  },
  charge: {
    id: 'charge',
    name: 'Battle Trance',
    type: 'Skill',
    cost: 0,
    draw: 2,
    text: 'Draw 2 cards.',
  },
  ironWave: {
    id: 'iron-wave',
    name: 'Iron Wave',
    type: 'Attack',
    cost: 1,
    damage: 5,
    block: 5,
    text: 'Deal 5 damage. Gain 5 block.',
  },
  twinStrike: {
    id: 'twin-strike',
    name: 'Twin Strike',
    type: 'Attack',
    cost: 1,
    damage: 10,
    text: 'Deal 10 damage.',
  },
  inflame: {
    id: 'inflame',
    name: 'Inflame',
    type: 'Power',
    cost: 1,
    strength: 2,
    text: 'Gain 2 strength.',
  },
  recover: {
    id: 'recover',
    name: 'Second Wind',
    type: 'Skill',
    cost: 1,
    block: 9,
    heal: 2,
    text: 'Gain 9 block. Heal 2 HP.',
  },
  chargeUp: {
    id: 'charge-up',
    name: 'Charge Up',
    type: 'Skill',
    cost: 1,
    block: 6,
    energy: 1,
    text: 'Gain 6 block. Gain 1 energy.',
  },
  uppercut: {
    id: 'uppercut',
    name: 'Uppercut',
    type: 'Attack',
    cost: 2,
    damage: 12,
    vulnerable: 2,
    text: 'Deal 12 damage. Apply 2 vulnerable.',
  },
  bloodForBlood: {
    id: 'blood-for-blood',
    name: 'Blood For Blood',
    type: 'Attack',
    cost: 3,
    damage: 18,
    text: 'Deal 18 damage.',
  },
  warcry: {
    id: 'warcry',
    name: 'Warcry',
    type: 'Skill',
    cost: 0,
    draw: 2,
    block: 3,
    text: 'Draw 2 cards. Gain 3 block.',
  },
  heavyBlade: {
    id: 'heavy-blade',
    name: 'Heavy Blade',
    type: 'Attack',
    cost: 2,
    damage: 14,
    text: 'Deal 14 damage.',
  },
  quickstep: {
    id: 'quickstep',
    name: 'Quickstep',
    type: 'Skill',
    cost: 0,
    block: 4,
    draw: 1,
    text: 'Gain 4 block. Draw 1 card.',
  },
  aimedShot: {
    id: 'aimed-shot',
    name: 'Aimed Shot',
    type: 'Attack',
    cost: 1,
    damage: 8,
    vulnerable: 1,
    text: 'Deal 8 damage. Apply 1 vulnerable.',
  },
  volley: {
    id: 'volley',
    name: 'Volley',
    type: 'Attack',
    cost: 1,
    damage: 9,
    draw: 1,
    text: 'Deal 9 damage. Draw 1 card.',
  },
  meditate: {
    id: 'meditate',
    name: 'Meditate',
    type: 'Power',
    cost: 1,
    block: 6,
    text: 'Gain 6 block.',
  },
  emberBolt: {
    id: 'ember-bolt',
    name: 'Ember Bolt',
    type: 'Attack',
    cost: 1,
    damage: 11,
    text: 'Deal 11 damage.',
  },
}

const rewardPool = [
  cardLibrary.cleave,
  cardLibrary.shrug,
  cardLibrary.pommel,
  cardLibrary.charge,
  cardLibrary.ironWave,
  cardLibrary.twinStrike,
  cardLibrary.inflame,
  cardLibrary.recover,
  cardLibrary.chargeUp,
  cardLibrary.uppercut,
  cardLibrary.bloodForBlood,
  cardLibrary.warcry,
  cardLibrary.heavyBlade,
  cardLibrary.quickstep,
  cardLibrary.aimedShot,
  cardLibrary.volley,
  cardLibrary.meditate,
  cardLibrary.emberBolt,
  cardLibrary.guard,
  cardLibrary.strike,
]

const relicLibrary = [
  {
    id: 'burning-blood',
    name: 'Burning Blood',
    text: 'Heal 6 HP after elite and boss fights.',
  },
  {
    id: 'vajra',
    name: 'Vajra',
    text: 'Start each combat with 1 strength.',
    strength: 1,
  },
  {
    id: 'anchor',
    name: 'Anchor',
    text: 'Start each combat with 8 block.',
    block: 8,
  },
  {
    id: 'lantern',
    name: 'Lantern',
    text: 'Start each combat with 1 extra energy.',
    energy: 1,
  },
]

const openingBoonPool = [
  {
    id: 'boon-max-hp',
    title: 'Hardened Frame',
    kind: 'blessing',
    text: 'Gain 10 max HP and heal 10 HP.',
    apply: (run) => ({
      ...run,
      player: {
        maxHp: run.player.maxHp + 10,
        hp: run.player.hp + 10,
      },
    }),
  },
  {
    id: 'boon-vajra',
    title: 'Take Vajra',
    kind: 'relic',
    relic: relicLibrary.find((relic) => relic.id === 'vajra'),
    text: 'Start each combat with 1 strength.',
    apply: (run, boon) => ({
      ...run,
      relics: [...run.relics, boon.relic],
    }),
  },
  {
    id: 'boon-anchor',
    title: 'Take Anchor',
    kind: 'relic',
    relic: relicLibrary.find((relic) => relic.id === 'anchor'),
    text: 'Start each combat with 8 block.',
    apply: (run, boon) => ({
      ...run,
      relics: [...run.relics, boon.relic],
    }),
  },
  {
    id: 'boon-lantern',
    title: 'Take Lantern',
    kind: 'relic',
    relic: relicLibrary.find((relic) => relic.id === 'lantern'),
    text: 'Start each combat with 1 extra energy.',
    apply: (run, boon) => ({
      ...run,
      relics: [...run.relics, boon.relic],
    }),
  },
  {
    id: 'boon-bash',
    title: 'Take Bash',
    kind: 'card',
    card: cardLibrary.bash,
    text: 'Add Bash to your opening deck.',
    apply: (run, boon) => ({
      ...run,
      deck: [...run.deck, createDeckCard(boon.card, `boon-${run.deck.length}`)],
    }),
  },
  {
    id: 'boon-shrug',
    title: 'Take Shrug It Off',
    kind: 'card',
    card: cardLibrary.shrug,
    text: 'Add Shrug It Off to your opening deck.',
    apply: (run, boon) => ({
      ...run,
      deck: [...run.deck, createDeckCard(boon.card, `boon-${run.deck.length}`)],
    }),
  },
  {
    id: 'boon-inflame',
    title: 'Take Inflame',
    kind: 'card',
    card: cardLibrary.inflame,
    text: 'Add Inflame to your opening deck.',
    apply: (run, boon) => ({
      ...run,
      deck: [...run.deck, createDeckCard(boon.card, `boon-${run.deck.length}`)],
    }),
  },
  {
    id: 'boon-ember',
    title: 'Take Ember Bolt',
    kind: 'card',
    card: cardLibrary.emberBolt,
    text: 'Add Ember Bolt to your opening deck.',
    apply: (run, boon) => ({
      ...run,
      deck: [...run.deck, createDeckCard(boon.card, `boon-${run.deck.length}`)],
    }),
  },
  {
    id: 'boon-draw',
    title: 'Deep Breath',
    kind: 'blessing',
    text: 'Draw 1 extra card on turn 1 this run.',
    apply: (run) => ({
      ...run,
      character: {
        ...run.character,
        modifiers: {
          ...run.character.modifiers,
          startingDraw: (run.character.modifiers?.startingDraw ?? 0) + 1,
        },
      },
    }),
  },
  {
    id: 'boon-rewards',
    title: 'Sharper Eye',
    kind: 'blessing',
    text: 'See 1 extra card in future card rewards this run.',
    apply: (run) => ({
      ...run,
      character: {
        ...run.character,
        modifiers: {
          ...run.character.modifiers,
          rewardChoicesBonus: (run.character.modifiers?.rewardChoicesBonus ?? 0) + 1,
        },
      },
    }),
  },
]

const characters = [
  {
    id: 'ironclad',
    name: 'Ironclad',
    title: 'Frontline Juggernaut',
    avatar: 'warrior',
    maxHp: 80,
    summary: 'Big hits, steady healing, and the safest opening climb.',
    traits: ['Heal 5 HP after every combat', 'Starts with heavier attacks', 'More max health'],
    modifiers: {
      healAfterFight: 5,
    },
    startingRelics: [
      {
        id: 'ember-heart',
        name: 'Ember Heart',
        text: 'Heal 5 HP after every combat.',
      },
    ],
    starterDeck: [
      cardLibrary.strike,
      cardLibrary.strike,
      cardLibrary.guard,
      cardLibrary.guard,
      cardLibrary.bash,
      cardLibrary.uppercut,
      cardLibrary.warcry,
    ],
  },
  {
    id: 'huntress',
    name: 'Huntress',
    title: 'Precision Duelist',
    avatar: 'hunter',
    maxHp: 72,
    summary: 'Sees more options, draws deeper, and turns small edges into clean kills.',
    traits: ['Draw 1 extra card on combat start', 'See 1 extra card in rewards', 'Fast, flexible opener'],
    modifiers: {
      startingDraw: 1,
      rewardChoicesBonus: 1,
    },
    startingRelics: [
      {
        id: 'keen-eye',
        name: 'Keen Eye',
        text: 'Draw 1 extra card on turn 1. See 1 extra reward card.',
      },
    ],
    starterDeck: [
      cardLibrary.strike,
      cardLibrary.guard,
      cardLibrary.guard,
      cardLibrary.quickstep,
      cardLibrary.pommel,
      cardLibrary.aimedShot,
      cardLibrary.volley,
    ],
  },
  {
    id: 'arcanist',
    name: 'Arcanist',
    title: 'Spellfed Tactician',
    avatar: 'mage',
    maxHp: 68,
    summary: 'Explodes out of the gate with extra energy and layered utility.',
    traits: ['Start each combat with 1 extra energy', 'Start each combat with 4 block', 'Power-heavy starter deck'],
    modifiers: {},
    startingRelics: [
      {
        id: 'sun-core',
        name: 'Sun Core',
        text: 'Start each combat with 1 extra energy and 4 block.',
        energy: 1,
        block: 4,
      },
    ],
    starterDeck: [
      cardLibrary.focus,
      cardLibrary.charge,
      cardLibrary.inflame,
      cardLibrary.meditate,
      cardLibrary.ironWave,
      cardLibrary.recover,
      cardLibrary.emberBolt,
    ],
  },
]

const enemies = {
  fight: [
    {
      name: 'Jaw Worm',
      maxHp: 42,
      moves: [
        { intent: 'Chomp', damage: 8 },
        { intent: 'Thrash', damage: 5, block: 6 },
        { intent: 'Bellow', strength: 2, block: 4 },
      ],
    },
    {
      name: 'Cultist',
      maxHp: 36,
      moves: [
        { intent: 'Incantation', strength: 3 },
        { intent: 'Dark Strike', damage: 6 },
        { intent: 'Dark Strike', damage: 6 },
      ],
    },
  ],
  elite: [
    {
      name: 'Gremlin Nob',
      maxHp: 58,
      moves: [
        { intent: 'Bellow', strength: 3 },
        { intent: 'Skull Bash', damage: 12 },
        { intent: 'Heavy Slash', damage: 16 },
      ],
    },
  ],
  boss: [
    {
      name: 'Hexaghost',
      maxHp: 82,
      moves: [
        { intent: 'Divider', damage: 6 },
        { intent: 'Sear', damage: 7 },
        { intent: 'Inflame', strength: 2, block: 8 },
        { intent: 'Inferno', damage: 14 },
      ],
    },
  ],
}

const mapRows = [
  [
    { id: 'r0-a', type: 'mystery', label: 'Unknown', x: 10, connections: ['r1-a'] },
    { id: 'r0-b', type: 'rest', label: 'Campfire', x: 28, connections: ['r1-a', 'r1-b'] },
    { id: 'r0-c', type: 'shop', label: 'Merchant', x: 50, connections: ['r1-b', 'r1-c'] },
    { id: 'r0-d', type: 'fight', label: 'Ambush', x: 72, connections: ['r1-c'] },
  ],
  [
    { id: 'r1-a', type: 'fight', label: 'Ash Hall', x: 18, connections: ['r2-a'] },
    { id: 'r1-b', type: 'fight', label: 'Lookout', x: 36, connections: ['r2-a', 'r2-b'] },
    { id: 'r1-c', type: 'mystery', label: 'Unknown', x: 58, connections: ['r2-b', 'r2-c'] },
    { id: 'r1-d', type: 'fight', label: 'Old Bridge', x: 80, connections: ['r2-c'] },
  ],
  [
    { id: 'r2-a', type: 'mystery', label: 'Unknown', x: 16, connections: ['r3-a'] },
    { id: 'r2-b', type: 'rest', label: 'Campfire', x: 34, connections: ['r3-a', 'r3-b'] },
    { id: 'r2-c', type: 'fight', label: 'Torch Hall', x: 58, connections: ['r3-b', 'r3-c'] },
    { id: 'r2-d', type: 'shop', label: 'Merchant', x: 82, connections: ['r3-c'] },
  ],
  [
    { id: 'r3-a', type: 'fight', label: 'Red Steps', x: 12, connections: ['r4-a'] },
    { id: 'r3-b', type: 'mystery', label: 'Unknown', x: 38, connections: ['r4-a', 'r4-b'] },
    { id: 'r3-c', type: 'elite', label: 'Marked Den', x: 70, connections: ['r4-b', 'r4-c'] },
  ],
  [
    { id: 'r4-a', type: 'fight', label: 'Broken Gate', x: 12, connections: ['r5-a', 'r5-b'] },
    { id: 'r4-b', type: 'fight', label: 'Low Shrine', x: 38, connections: ['r5-b'] },
    { id: 'r4-c', type: 'mystery', label: 'Unknown', x: 86, connections: ['r5-c'] },
  ],
  [
    { id: 'r5-a', type: 'shop', label: 'Merchant', x: 10, connections: ['r6-a'] },
    { id: 'r5-b', type: 'shop', label: 'Merchant', x: 24, connections: ['r6-a', 'r6-b'] },
    { id: 'r5-c', type: 'rest', label: 'Campfire', x: 56, connections: ['r6-b', 'r6-c'] },
    { id: 'r5-d', type: 'mystery', label: 'Unknown', x: 88, connections: ['r6-c'] },
  ],
  [
    { id: 'r6-a', type: 'mystery', label: 'Unknown', x: 12, connections: ['r7-a'] },
    { id: 'r6-b', type: 'elite', label: 'Red Banner', x: 48, connections: ['r7-b'] },
    { id: 'r6-c', type: 'fight', label: 'High Road', x: 84, connections: ['r7-b', 'r7-c'] },
  ],
  [
    { id: 'r7-a', type: 'rest', label: 'Campfire', x: 12, connections: ['r8-a'] },
    { id: 'r7-b', type: 'fight', label: 'Hall of Ash', x: 42, connections: ['r8-a', 'r8-b'] },
    { id: 'r7-c', type: 'mystery', label: 'Unknown', x: 78, connections: ['r8-b'] },
  ],
  [
    { id: 'r8-a', type: 'fight', label: 'Fallen Post', x: 18, connections: ['r9-a', 'r9-b'] },
    { id: 'r8-b', type: 'fight', label: 'Last Steps', x: 66, connections: ['r9-b', 'r9-c'] },
  ],
  [
    { id: 'r9-a', type: 'fight', label: 'Ash Walk', x: 20, connections: ['r10-a'] },
    { id: 'r9-b', type: 'mystery', label: 'Unknown', x: 38, connections: ['r10-a', 'r10-b'] },
    { id: 'r9-c', type: 'fight', label: 'Watchpoint', x: 72, connections: ['r10-b', 'r10-c'] },
    { id: 'r9-d', type: 'elite', label: 'Skull Gate', x: 88, connections: ['r10-c'] },
  ],
  [
    { id: 'r10-a', type: 'rest', label: 'Campfire', x: 10, connections: ['r11-a'] },
    { id: 'r10-b', type: 'shop', label: 'Merchant', x: 38, connections: ['r11-a', 'r11-b'] },
    { id: 'r10-c', type: 'mystery', label: 'Unknown', x: 82, connections: ['r11-b'] },
  ],
  [
    { id: 'r11-a', type: 'fight', label: 'Red Hall', x: 16, connections: ['r12-a'] },
    { id: 'r11-b', type: 'fight', label: 'Stone Bridge', x: 46, connections: ['r12-a', 'r12-b'] },
    { id: 'r11-c', type: 'mystery', label: 'Unknown', x: 82, connections: ['r12-b'] },
  ],
  [
    { id: 'r12-a', type: 'mystery', label: 'Unknown', x: 26, connections: ['r13-a', 'r13-b'] },
    { id: 'r12-b', type: 'rest', label: 'Campfire', x: 52, connections: ['r13-b', 'r13-c'] },
    { id: 'r12-c', type: 'fight', label: 'Cinder Hall', x: 78, connections: ['r13-c'] },
  ],
  [
    { id: 'r13-a', type: 'elite', label: 'Crown Den', x: 18, connections: ['r14-a'] },
    { id: 'r13-b', type: 'mystery', label: 'Unknown', x: 38, connections: ['r14-a', 'r14-b'] },
    { id: 'r13-c', type: 'shop', label: 'Merchant', x: 66, connections: ['r14-b'] },
    { id: 'r13-d', type: 'fight', label: 'High Tower', x: 90, connections: ['r14-c'] },
  ],
  [
    { id: 'r14-a', type: 'fight', label: 'Ashen Rise', x: 12, connections: ['r15-b'] },
    { id: 'r14-b', type: 'rest', label: 'Final Fire', x: 42, connections: ['r15-a', 'r15-b', 'r15-c'] },
    { id: 'r14-c', type: 'mystery', label: 'Unknown', x: 78, connections: ['r15-c'] },
  ],
  [
    { id: 'r15-a', type: 'fight', label: 'Boss Approach', x: 24, connections: ['r16-a'] },
    { id: 'r15-b', type: 'fight', label: 'Boss Approach', x: 50, connections: ['r16-a'] },
    { id: 'r15-c', type: 'fight', label: 'Boss Approach', x: 76, connections: ['r16-a'] },
  ],
  [{ id: 'r16-a', type: 'boss', label: 'Hexaghost', x: 50, connections: [] }],
]

const nodeIcons = {
  fight: 'x',
  mystery: '?',
  shop: '$',
  elite: '!',
  rest: '+',
  boss: 'B',
}

const cloneCard = (card, suffix) => ({
  ...card,
  instanceId: `${card.id}-${suffix}`,
})

const createDeckCard = (card, suffix) => ({
  ...card,
  deckId: `${card.id}-${suffix}`,
})

const shuffle = (cards) => {
  const shuffled = [...cards]

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

const takeRandom = (items, amount) => shuffle(items).slice(0, amount)

const findNode = (nodeId) => mapRows.flat().find((node) => node.id === nodeId)

const getNodeRowIndex = (nodeId) => mapRows.findIndex((row) => row.some((node) => node.id === nodeId))

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

const createEnemy = (nodeType, rowIndex, act) => {
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

const createInitialRun = () => ({
  screen: 'characterSelect',
  character: null,
  deck: [],
  relics: [],
  player: {
    maxHp: 0,
    hp: 0,
  },
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

const createRunFromCharacter = (character) => ({
  screen: 'openingBoon',
  character,
  deck: character.starterDeck.map((card, index) => createDeckCard(card, `${character.id}-starter-${index}`)),
  relics: [...character.startingRelics],
  player: {
    maxHp: character.maxHp,
    hp: character.maxHp,
  },
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

const createCombat = (run, node) => {
  const handSize = 5 + (run.character?.modifiers?.startingDraw ?? 0)
  const deck = shuffle(run.deck.map((card, index) => cloneCard(card, `${node.id}-${index}`)))
  const hand = deck.slice(0, handSize)
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
    hand,
    discardPile: [],
    turn: 1,
    log: [`${node.label} blocks the path.`],
    outcome: 'playing',
  }
}

const describeIntent = (move, strength = 0) => {
  const parts = []

  if (move.damage) {
    parts.push(`${move.damage + strength} damage`)
  }

  if (move.block) {
    parts.push(`${move.block} block`)
  }

  if (move.strength) {
    parts.push(`+${move.strength} strength`)
  }

  return parts.join(', ')
}

const drawCards = (state, amount) => {
  let drawPile = [...state.drawPile]
  let discardPile = [...state.discardPile]
  const drawn = []

  for (let i = 0; i < amount; i += 1) {
    if (drawPile.length === 0 && discardPile.length > 0) {
      drawPile = shuffle(discardPile)
      discardPile = []
    }

    if (drawPile.length === 0) {
      break
    }

    drawn.push(drawPile[0])
    drawPile = drawPile.slice(1)
  }

  return {
    ...state,
    drawPile,
    discardPile,
    hand: [...state.hand, ...drawn].slice(0, 10),
  }
}

const getAvailableNodeIds = (run) => {
  if (!run.currentNodeId) {
    return mapRows[0].map((node) => node.id)
  }

  const node = findNode(run.currentNodeId)
  return node?.connections ?? []
}

const getRewardCount = (run, base) => base + (run.character?.modifiers?.rewardChoicesBonus ?? 0)

function App() {
  const [run, setRun] = useState(createInitialRun)
  const [combat, setCombat] = useState(null)

  const enemyMove = useMemo(() => {
    if (!combat) {
      return null
    }

    return combat.enemy.moves[combat.enemy.moveIndex % combat.enemy.moves.length]
  }, [combat])

  const chooseCharacter = (character) => {
    setCombat(null)
    setRun(createRunFromCharacter(character))
  }

  const chooseOpeningBoon = (boon) => {
    setRun((current) => {
      const updated = boon.apply(current, boon)

      return {
        ...updated,
        screen: 'map',
        openingChoices: [],
        message: `${boon.title} chosen. Choose your first room.`,
      }
    })
  }

  const startNode = (node) => {
    if (node.type === 'rest') {
      const healed = Math.min(run.player.maxHp, run.player.hp + 18)
      setRun((current) => ({
        ...current,
        currentNodeId: node.id,
        completedNodeIds: [...current.completedNodeIds, node.id],
        selectedPath: [...current.selectedPath, node.id],
        player: {
          ...current.player,
          hp: healed,
        },
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
        rewardChoices: takeRandom(rewardPool, getRewardCount(current, 5)),
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
        rewardChoices: takeRandom(rewardPool, getRewardCount(current, 4)),
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
    if (!combat || combat.outcome !== 'playing') {
      return
    }

    if (card.cost > combat.player.energy) {
      setCombat((current) => ({
        ...current,
        log: [`Not enough energy for ${card.name}.`, ...current.log].slice(0, 5),
      }))
      return
    }

    let next = {
      ...combat,
      player: {
        ...combat.player,
        energy: combat.player.energy - card.cost + (card.energy ?? 0),
      },
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
      const bonusHeal = run.character?.modifiers?.healAfterFight ?? 0
      const burningBlood = run.relics.some((relic) => relic.id === 'burning-blood')
      const relicHeal = burningBlood && isEliteOrBoss ? 6 : 0
      const healedHp = Math.min(run.player.maxHp, next.player.hp + bonusHeal + relicHeal)

      setRun((current) => ({
        ...current,
        screen: 'reward',
        player: {
          ...current.player,
          hp: healedHp,
        },
        completedNodeIds: [...current.completedNodeIds, next.node.id],
        rewardChoices: isEliteOrBoss ? takeRandom(relicLibrary, 3) : takeRandom(rewardPool, getRewardCount(current, 4)),
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

    setCombat({
      ...next,
      log: [...messages, ...next.log].slice(0, 6),
    })
  }

  const endTurn = () => {
    if (!combat || combat.outcome !== 'playing') {
      return
    }

    setCombat((current) => {
      const move = current.enemy.moves[current.enemy.moveIndex % current.enemy.moves.length]
      let player = { ...current.player, block: 0 }
      let enemy = {
        ...current.enemy,
        block: 0,
        vulnerable: Math.max(0, (current.enemy.vulnerable ?? 0) - 1),
      }
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
        player: {
          ...player,
          energy: player.maxEnergy,
        },
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

      return {
        ...next,
        log: [`Turn ${next.turn} begins.`, ...messages, ...current.log].slice(0, 6),
      }
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
        message: startsNewAct
          ? `${reward.name} claimed. Act ${current.act + 1} begins. Choose your first room.`
          : `${reward.name} claimed. Choose your next room.`,
      }))
      return
    }

    setRun((current) => ({
      ...current,
      screen: 'map',
      deck: [...current.deck, createDeckCard(reward, `reward-${current.deck.length}`)],
      currentNodeId: startsNewAct ? null : current.currentNodeId,
      completedNodeIds: startsNewAct ? [] : current.completedNodeIds,
      selectedPath: startsNewAct ? [] : current.selectedPath,
      rewardChoices: [],
      rewardKind: 'card',
      rewardTitle: 'Choose a Card',
      rewardSource: null,
      act: startsNewAct ? current.act + 1 : current.act,
      message: startsNewAct
        ? `${reward.name} added. Act ${current.act + 1} begins. Choose your first room.`
        : `${reward.name} added. Choose your next room.`,
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
      message: startsNewAct
        ? `You move on without taking a reward. Act ${current.act + 1} begins. Choose your first room.`
        : 'No card added. Choose your next room.',
    }))
  }

  const restartRun = () => {
    setCombat(null)
    setRun(createInitialRun())
  }

  if (run.screen === 'characterSelect') {
    return <CharacterSelectScreen onChoose={chooseCharacter} />
  }

  if (run.screen === 'openingBoon') {
    return <OpeningBoonScreen run={run} onChoose={chooseOpeningBoon} />
  }

  if (run.screen === 'map') {
    return <MapScreen run={run} onPickNode={startNode} onRestart={restartRun} />
  }

  if (run.screen === 'reward') {
    return <RewardScreen run={run} onChoose={chooseReward} onSkip={skipReward} />
  }

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

function CharacterSelectScreen({ onChoose }) {
  return (
    <main className="game-shell select-shell">
      <section className="select-panel">
        <div className="select-copy">
          <p className="eyebrow">New Run</p>
          <h1>Choose Your Fighter</h1>
          <p className="run-message">
            Each character begins with a different deck, passive edge, and approach to the climb.
          </p>
        </div>

        <div className="character-grid">
          {characters.map((character) => (
            <button className="character-card" key={character.id} onClick={() => onChoose(character)} type="button">
              <div className={`avatar ${character.avatar} large`} aria-hidden="true">
                <span></span>
              </div>
              <div className="character-copy">
                <p className="eyebrow">{character.title}</p>
                <h2>{character.name}</h2>
                <p>{character.summary}</p>
                <strong>{character.maxHp} HP</strong>
                <ul className="trait-list">
                  {character.traits.map((trait) => (
                    <li key={trait}>{trait}</li>
                  ))}
                </ul>
              </div>
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}

function OpeningBoonScreen({ run, onChoose }) {
  return (
    <main className="game-shell reward-shell">
      <section className="reward-panel">
        <div>
          <p className="eyebrow">Opening Choice</p>
          <h1>{run.character.name}'s First Edge</h1>
          <p className="run-message">
            Each run offers three different openings from a larger pool. Pick one and begin the climb.
          </p>
        </div>

        <div className="reward-cards">
          {run.openingChoices.map((boon) => (
            <OpeningBoonButton boon={boon} key={boon.id} onClick={() => onChoose(boon)} />
          ))}
        </div>
      </section>
    </main>
  )
}

function MapScreen({ run, onPickNode, onRestart }) {
  const availableNodeIds = getAvailableNodeIds(run)

  return (
    <main className="game-shell map-shell">
      <section className="map-panel">
        <div className="status-strip">
          <div>
            <p className="eyebrow">Act {run.act}</p>
            <h1>{run.character.name} on Ember Road</h1>
            <p className="run-message">{run.message}</p>
          </div>
          <div className="turn-pill">
            HP {run.player.hp}/{run.player.maxHp} - Deck {run.deck.length}
          </div>
        </div>

        <div className="spire-map" aria-label="Map">
          <MapConnections />
          {mapRows.map((row, rowIndex) => (
            <div className="map-row" key={`row-${rowIndex}`} style={{ zIndex: rowIndex + 1 }}>
              {row.map((node) => {
                const isAvailable = availableNodeIds.includes(node.id)
                const isComplete = run.completedNodeIds.includes(node.id)
                const isPath = run.selectedPath.includes(node.id)

                return (
                  <button
                    className={`map-node ${node.type} ${isComplete ? 'complete' : ''} ${
                      isPath ? 'path' : ''
                    }`}
                    disabled={!isAvailable}
                    key={node.id}
                    onClick={() => onPickNode(node)}
                    style={{ left: `${node.x}%` }}
                    title={node.label}
                    type="button"
                  >
                    <span>{nodeIcons[node.type]}</span>
                    <small>{node.label}</small>
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <div className="map-legend">
          <span>x Enemy</span>
          <span>? Mystery</span>
          <span>$ Shop</span>
          <span>! Elite</span>
          <span>+ Rest</span>
          <span>B Boss</span>
          <span>Relics {run.relics.length}</span>
          <button onClick={onRestart} type="button">
            Restart run
          </button>
        </div>
      </section>
    </main>
  )
}

function MapConnections() {
  const rowCount = mapRows.length
  const lines = mapRows.flatMap((row, rowIndex) =>
    row.flatMap((node) =>
      node.connections.map((connectionId) => {
        const targetRowIndex = mapRows.findIndex((candidateRow) =>
          candidateRow.some((candidate) => candidate.id === connectionId),
        )
        const target = mapRows[targetRowIndex]?.find((candidate) => candidate.id === connectionId)

        if (!target) {
          return null
        }

        const y1 = 100 - ((rowIndex + 0.5) / rowCount) * 100
        const y2 = 100 - ((targetRowIndex + 0.5) / rowCount) * 100

        return {
          id: `${node.id}-${target.id}`,
          x1: node.x,
          y1,
          x2: target.x,
          y2,
        }
      }),
    ),
  )

  return (
    <svg className="map-connections" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {lines.filter(Boolean).map((line) => (
        <line key={line.id} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} />
      ))}
    </svg>
  )
}

function RewardScreen({ run, onChoose, onSkip }) {
  return (
    <main className="game-shell reward-shell">
      <section className="reward-panel">
        <div>
          <p className="eyebrow">{run.rewardKind === 'shop' ? 'Shop' : 'Reward'}</p>
          <h1>{run.rewardTitle}</h1>
          <p className="run-message">{run.message}</p>
        </div>

        <div className="reward-cards">
          {run.rewardChoices.map((reward) => (
            <RewardButton
              kind={run.rewardKind}
              key={`${reward.deckId ?? reward.id}-${run.rewardKind}-${run.rewardTitle}-${reward.name}`}
              reward={reward}
              onClick={() => onChoose(reward)}
            />
          ))}
        </div>

        {run.rewardKind !== 'relic' && (
          <button className="secondary-action" onClick={onSkip} type="button">
            Leave
          </button>
        )}
      </section>
    </main>
  )
}

function RewardButton({ kind, reward, onClick }) {
  if (kind === 'relic') {
    return (
      <button className="relic-card" onClick={onClick} type="button">
        <span>Relic</span>
        <strong>{reward.name}</strong>
        <p>{reward.text}</p>
      </button>
    )
  }

  return <CardButton card={reward} onClick={onClick} />
}

function OpeningBoonButton({ boon, onClick }) {
  if (boon.kind === 'card') {
    return (
      <button className="boon-card" onClick={onClick} type="button">
        <span>Card</span>
        <strong>{boon.title}</strong>
        <p>{boon.text}</p>
      </button>
    )
  }

  if (boon.kind === 'relic') {
    return (
      <button className="boon-card" onClick={onClick} type="button">
        <span>Relic</span>
        <strong>{boon.title}</strong>
        <p>{boon.text}</p>
      </button>
    )
  }

  return (
    <button className="boon-card" onClick={onClick} type="button">
      <span>Blessing</span>
      <strong>{boon.title}</strong>
      <p>{boon.text}</p>
    </button>
  )
}

function CombatScreen({ combat, enemyMove, onEndTurn, onPlayCard, onRestart, run }) {
  const healthPercent = Math.round((combat.player.hp / combat.player.maxHp) * 100)
  const enemyPercent = Math.round((combat.enemy.hp / combat.enemy.maxHp) * 100)

  return (
    <main className="game-shell">
      <section className="battlefield" aria-label="Combat area">
        <div className="status-strip">
          <div>
            <p className="eyebrow">{combat.node.type}</p>
            <h1>{combat.node.label}</h1>
          </div>
          <div className="turn-pill">Turn {combat.turn}</div>
        </div>

        <div className="combatants">
          <article className="combatant player">
            <div className={`avatar ${run.character.avatar}`} aria-hidden="true">
              <span></span>
            </div>
            <div className="combatant-copy">
              <h2>{run.character.name}</h2>
              <HealthBar value={combat.player.hp} max={combat.player.maxHp} percent={healthPercent} />
              <p>
                Block {combat.player.block} - Strength {combat.player.strength} - Energy {combat.player.energy}/
                {combat.player.maxEnergy}
              </p>
            </div>
          </article>

          <div className="versus">VS</div>

          <article className="combatant enemy">
            <div className="avatar beast" aria-hidden="true">
              <span></span>
            </div>
            <div className="combatant-copy">
              <h2>{combat.enemy.name}</h2>
              <HealthBar value={combat.enemy.hp} max={combat.enemy.maxHp} percent={enemyPercent} />
              <p>
                Block {combat.enemy.block} - Strength {combat.enemy.strength}
              </p>
              <div className="intent">
                {enemyMove.intent}: {describeIntent(enemyMove, combat.enemy.strength)}
              </div>
            </div>
          </article>
        </div>

        {combat.outcome !== 'playing' && (
          <div className="outcome">
            <strong>{combat.outcome === 'won' ? 'Victory' : 'Defeat'}</strong>
            {combat.outcome === 'lost' && (
              <button onClick={onRestart} type="button">
                Restart run
              </button>
            )}
          </div>
        )}
      </section>

      <section className="table">
        <aside className="pile-stats" aria-label="Deck piles">
          <Stat label="Draw" value={combat.drawPile.length} />
          <Stat label="Hand" value={combat.hand.length} />
          <Stat label="Discard" value={combat.discardPile.length} />
        </aside>

        <div className="hand" aria-label="Cards in hand">
          {combat.hand.map((card) => (
            <CardButton
              card={card}
              disabled={card.cost > combat.player.energy || combat.outcome !== 'playing'}
              key={card.instanceId}
              onClick={() => onPlayCard(card)}
            />
          ))}
        </div>

        <div className="controls">
          <button className="primary" onClick={onEndTurn} disabled={combat.outcome !== 'playing'} type="button">
            End Turn
          </button>
        </div>
      </section>

      <section className="combat-log" aria-label="Combat log">
        {combat.log.map((entry, index) => (
          <p key={`${entry}-${index}`}>{entry}</p>
        ))}
      </section>
    </main>
  )
}

function CardButton({ card, disabled = false, onClick }) {
  return (
    <button className={`card ${card.type.toLowerCase()}`} disabled={disabled} onClick={onClick} type="button">
      <span className="cost">{card.cost}</span>
      <strong>{card.name}</strong>
      <small>{card.type}</small>
      <p>{card.text}</p>
    </button>
  )
}

function HealthBar({ value, max, percent }) {
  return (
    <div className="health">
      <div style={{ width: `${percent}%` }}></div>
      <span>
        {value}/{max}
      </span>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export default App
