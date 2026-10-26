// Which sounds a state change should play. Pure, so it's unit-testable; the
// useGameAudio hook calls it on every state change and plays the result.
const MAX_SOUNDS = 3

const screenSounds = { shop: 'coin', rest: 'fire', event: 'mystery', victory: 'victory', map: 'step' }

const fxSound = (event) => {
  switch (event.kind) {
    case 'cardPlayed':
      return 'card'
    case 'potion':
      return 'potion'
    case 'damage':
      return event.side === 'enemy' ? 'hit' : 'hurt'
    case 'blocked':
      return 'blocked'
    case 'block':
      return 'block'
    case 'heal':
      return 'heal'
    case 'status':
      return event.status === 'strength' ? 'buff' : 'debuff'
    default:
      return null
  }
}

export const soundsForTransition = (prev, next) => {
  if (prev === next) return []
  const out = []
  const add = (name) => {
    if (name && !out.includes(name)) out.push(name)
  }
  const before = prev.combat
  const after = next.combat

  if (after?.fx && after.fx.id !== before?.fx?.id) after.fx.events.forEach((event) => add(fxSound(event)))
  if (after && !before) add('turn')
  if (after && before && after.turn > before.turn && after.outcome === 'playing') add('turn')
  if (after?.outcome !== before?.outcome) {
    if (after?.outcome === 'won') add('win')
    if (after?.outcome === 'lost') add('defeat')
  }

  if (prev.run.screen !== next.run.screen) add(screenSounds[next.run.screen])
  if (next.run.screen !== 'combat' && next.run.gold !== prev.run.gold) add('coin')
  if (next.run.relics.length > prev.run.relics.length) add('buff')
  if (next.run.potions.length > prev.run.potions.length) add('potion')

  return out.slice(0, MAX_SOUNDS)
}
