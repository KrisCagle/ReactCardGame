// Describes what visibly happened between two combat states (damage, block,
// heals, debuffs, enemy attacks) so the UI can animate it. The engine itself
// never thinks about animation; this is a pure diff of before and after.
import { DURATION_DEBUFFS, getEnemyIntent } from './combat.js'

const STATUSES = [...DURATION_DEBUFFS, 'poison', 'strength']

export const diffCombat = (prev, next, actionType) => {
  const events = []
  const turnEnded = actionType === 'endTurn'

  if (turnEnded && getEnemyIntent(prev)?.damage) events.push({ side: 'enemy', kind: 'attack' })
  // Side 'none': cues for sound, not something that happens to a combatant.
  if (actionType === 'playCard') events.push({ side: 'none', kind: 'cardPlayed' })
  if (actionType === 'usePotion') events.push({ side: 'none', kind: 'potion' })

  ;['player', 'enemy'].forEach((side) => {
    const before = prev[side]
    const after = next[side]
    const hpChange = after.hp - before.hp
    const blockChange = after.block - before.block

    if (hpChange < 0) events.push({ side, kind: 'damage', amount: -hpChange })
    if (hpChange > 0) events.push({ side, kind: 'heal', amount: hpChange })
    // The player's block resets every turn, so only show block gained mid-turn.
    if (blockChange > 0 && !(turnEnded && side === 'player')) events.push({ side, kind: 'block', amount: blockChange })
    if (blockChange < 0 && hpChange === 0 && !turnEnded) events.push({ side, kind: 'blocked' })

    STATUSES.forEach((status) => {
      const gained = (after[status] ?? 0) - (before[status] ?? 0)
      if (gained > 0) events.push({ side, kind: 'status', status, amount: gained })
    })
  })

  return events
}

export const withFx = (prev, next, actionType) =>
  next === prev ? next : { ...next, fx: { id: (prev.fx?.id ?? 0) + 1, events: diffCombat(prev, next, actionType) } }
