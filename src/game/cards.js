const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`

const timesWord = (hits) => (hits === 2 ? 'twice' : `${hits} times`)

// Builds rules text in the same order playCard resolves effects.
export const describeCard = (card) => {
  const parts = []

  if (card.damage) {
    const hits = card.hits ?? 1
    parts.push(hits > 1 ? `Deal ${card.damage} damage ${timesWord(hits)}.` : `Deal ${card.damage} damage.`)
  }
  if (card.vulnerable) parts.push(`Apply ${card.vulnerable} vulnerable.`)
  if (card.weak) parts.push(`Apply ${card.weak} weak.`)
  if (card.poison) parts.push(`Apply ${card.poison} poison.`)
  if (card.block) parts.push(`Gain ${card.block} block.`)
  if (card.strength) parts.push(`Gain ${card.strength} strength.`)
  if (card.energy) parts.push(`Gain ${card.energy} energy.`)
  if (card.draw) parts.push(`Draw ${plural(card.draw, 'card')}.`)
  if (card.heal) parts.push(`Heal ${card.heal} HP.`)
  if (card.blockPerTurn) parts.push(`At the start of each turn, gain ${card.blockPerTurn} block.`)

  return parts.join(' ')
}

export const canUpgrade = (card) => !card.upgraded && Boolean(card.upgrade)

// Applies the card's upgrade fields. Keeps deckId/instanceId so it stays the same deck card.
export const upgradeCard = (card) => {
  if (!canUpgrade(card)) return card
  return { ...card, ...card.upgrade, name: `${card.name}+`, upgraded: true }
}

export const createDeckCard = (card, suffix) => ({ ...card, deckId: `${card.id}-${suffix}` })

export const createCombatCard = (card, suffix) => ({ ...card, instanceId: `${card.id}-${suffix}` })
