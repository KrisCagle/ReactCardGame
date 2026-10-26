// Which icon represents each relic. Falls back on what the relic does.
const relicIconById = {
  'burning-blood': 'heart',
  'tea-kettle': 'heart',
  'meat-on-the-bone': 'heart',
  strawberry: 'heart',
  pear: 'heart',
  'regal-pillow': 'moon',
  'coffee-dripper': 'campfire',
  'fusion-hammer': 'campfire',
  'old-coin': 'coin',
  ectoplasm: 'coin',
  'ceramic-fish': 'coin',
  'membership-card': 'bag',
  'lucky-charm': 'star',
  'busted-crown': 'crown',
  sozu: 'flask',
  'bag-of-marbles': 'brokenShield',
  'hex-mask': 'arrowDown',
  'bronze-scales': 'thorns',
  'mercury-hourglass': 'hourglass',
  'happy-flower': 'bolt',
  'letter-opener': 'scroll',
  shuriken: 'star',
  'ornamental-fan': 'shield',
  akabeko: 'sword',
  'bag-of-prep': 'cards',
  'keen-eye': 'eye',
  'ember-heart': 'flame',
  'sun-core': 'bolt',
}

export const relicIcon = (relic) => {
  if (relicIconById[relic.id]) return relicIconById[relic.id]
  if (relic.energy || relic.maxEnergy) return 'bolt'
  if (relic.strength) return 'fist'
  if (relic.block || relic.blockPerTurn) return 'shield'
  return 'gem'
}
