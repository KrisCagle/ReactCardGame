const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`

const timesWord = (hits) => (hits === 2 ? 'twice' : `${hits} times`)

// Builds rules text in the same order playCard resolves effects, as a list of
// segments: plain strings, plus { stat, base } placeholders for the numbers
// combat can modify (damage and block). The combat UI swaps in live values.
export const describeCardSegments = (card) => {
  if (card.unplayable) return ['Unplayable.']
  const parts = []
  const sentence = (...segments) => parts.push(segments)

  if (card.hpLoss) sentence(`Lose ${card.hpLoss} HP.`)
  if (card.damage) {
    const hits = card.hits ?? 1
    sentence('Deal ', { stat: 'damage', base: card.damage }, hits > 1 ? ` damage ${timesWord(hits)}.` : ' damage.')
  }
  if (card.vulnerable) sentence(`Apply ${card.vulnerable} vulnerable.`)
  if (card.weak) sentence(`Apply ${card.weak} weak.`)
  if (card.poison) sentence(`Apply ${card.poison} poison.`)
  if (card.multiplyPoison) sentence(card.multiplyPoison === 2 ? "Double the enemy's poison." : `Multiply the enemy's poison by ${card.multiplyPoison}.`)
  if (card.block) sentence('Gain ', { stat: 'block', base: card.block }, ' block.')
  appendPlainEffects(card, sentence)

  return parts.flatMap((segments, index) => (index === 0 ? segments : [' ', ...segments]))
}

export const describeCard = (card) =>
  describeCardSegments(card)
    .map((segment) => (typeof segment === 'string' ? segment : String(segment.base)))
    .join('')

// Keywords on a card, for tooltip glossaries.
export const getCardKeywords = (card) =>
  ['vulnerable', 'weak', 'poison', 'strength', 'block', 'exhaust', 'unplayable'].filter((keyword) => {
    if (keyword === 'poison') return card.poison || card.poisonPerTurn || card.multiplyPoison
    if (keyword === 'strength') return card.strength || card.strengthPerTurn
    if (keyword === 'block') return card.block || card.blockPerTurn
    return card[keyword]
  })

const appendPlainEffects = (card, sentence) => {
  if (card.strength) sentence(`Gain ${card.strength} strength.`)
  if (card.energy) sentence(`Gain ${card.energy} energy.`)
  if (card.draw) sentence(`Draw ${plural(card.draw, 'card')}.`)
  if (card.heal) sentence(`Heal ${card.heal} HP.`)
  if (card.blockPerTurn) sentence(`At the start of each turn, gain ${card.blockPerTurn} block.`)
  if (card.strengthPerTurn) sentence(`At the start of each turn, gain ${card.strengthPerTurn} strength.`)
  if (card.poisonPerTurn) sentence(`At the start of each turn, apply ${card.poisonPerTurn} poison to the enemy.`)
  if (card.energyPerTurn) sentence(`At the start of each turn, gain ${card.energyPerTurn} energy.`)
  if (card.exhaust) sentence('Exhaust.')
}

export const canUpgrade = (card) => !card.upgraded && Boolean(card.upgrade)

// Applies the card's upgrade fields. Keeps deckId/instanceId so it stays the same deck card.
export const upgradeCard = (card) => {
  if (!canUpgrade(card)) return card
  return { ...card, ...card.upgrade, name: `${card.name}+`, upgraded: true }
}

export const createDeckCard = (card, suffix) => ({ ...card, deckId: `${card.id}-${suffix}` })

export const createCombatCard = (card, suffix) => ({ ...card, instanceId: `${card.id}-${suffix}` })
