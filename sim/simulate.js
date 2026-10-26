// Balance simulator: plays many bot runs per character and reports win rate,
// where runs end, and which enemies do the killing.
//   npm run sim                   (200 runs per character)
//   npm run sim -- 1000           (custom run count)
//   npm run sim -- 500 --cards    (also show which cards/relics correlate with winning)
import { characters } from '../src/data/gameData.js'
import { nextBotAction } from '../src/game/bot.js'
import { createInitialGameState, gameReducer } from '../src/game/gameReducer.js'

const args = process.argv.slice(2)
const runCount = Number(args.find((arg) => /^\d+$/.test(arg)) ?? 200)
const showCards = args.includes('--cards')
const MAX_STEPS = 10000

const playRun = (seed, character) => {
  let state = gameReducer(createInitialGameState(seed), { type: 'chooseCharacter', character })
  let floors = 0
  let finished = false
  for (let step = 0; step < MAX_STEPS; step += 1) {
    const action = nextBotAction(state)
    if (!action) {
      finished = true
      break
    }
    if (action.type === 'enterNode') floors += 1
    state = gameReducer(state, action)
  }
  const { run, combat } = state
  return {
    // Hitting the step limit usually means an infinite combo - worth investigating.
    stuck: !finished,
    won: run.screen === 'victory',
    act: run.act,
    floors,
    killer: combat?.outcome === 'lost' ? `${combat.enemy.name} (act ${run.act} ${combat.node.type})` : null,
    deckSize: run.deck.length,
    relics: run.relics.length,
    cardIds: new Set(run.deck.map((card) => card.id)),
    relicIds: new Set(run.relics.map((relic) => relic.id)),
  }
}

// Win rate of runs that ended holding an item vs runs that didn't. A big gap
// suggests the item is over- or under-tuned (or that it shows up in long runs).
const printImpact = (results, key, label) => {
  const ids = new Set(results.flatMap((result) => [...result[key]]))
  const rows = [...ids]
    .map((id) => {
      const holding = results.filter((result) => result[key].has(id))
      const without = results.filter((result) => !result[key].has(id))
      const rate = (group) => (group.length ? group.filter((result) => result.won).length / group.length : 0)
      return { id, count: holding.length, gap: rate(holding) - rate(without) }
    })
    // Skip near-universal items (starter cards): there's no "without" group to compare.
    .filter((row) => row.count >= results.length * 0.05 && row.count <= results.length * 0.95)
    .sort((a, b) => b.gap - a.gap)
  console.log(`  ${label} most tied to winning:`)
  rows.slice(0, 5).forEach((row) => console.log(`    ${row.id}: ${(row.gap * 100).toFixed(1)} pts (in ${row.count} runs)`))
}

const percent = (part, total) => `${((part / total) * 100).toFixed(1)}%`

for (const character of characters) {
  const results = Array.from({ length: runCount }, (_, seed) => playRun(seed + 1, character))
  const wins = results.filter((result) => result.won).length
  const diedInAct = { 1: 0, 2: 0, 3: 0 }
  const killers = {}
  results.forEach((result) => {
    if (result.won) return
    diedInAct[result.act] += 1
    if (result.killer) killers[result.killer] = (killers[result.killer] ?? 0) + 1
  })
  const average = (key) => (results.reduce((sum, result) => sum + result[key], 0) / runCount).toFixed(1)

  console.log(`\n${character.name} - ${runCount} runs`)
  console.log(`  Win rate: ${percent(wins, runCount)}`)
  const stuck = results.filter((result) => result.stuck).length
  if (stuck) console.log(`  WARNING: ${stuck} runs hit the step limit (infinite combo or stuck screen?)`)
  console.log(`  Died in act 1 / 2 / 3: ${percent(diedInAct[1], runCount)} / ${percent(diedInAct[2], runCount)} / ${percent(diedInAct[3], runCount)}`)
  console.log(`  Avg floors climbed: ${average('floors')}, final deck: ${average('deckSize')} cards, relics: ${average('relics')}`)
  console.log('  Top killers:')
  Object.entries(killers)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .forEach(([name, count]) => console.log(`    ${name}: ${count}`))
  if (showCards) {
    printImpact(results, 'cardIds', 'Cards')
    printImpact(results, 'relicIds', 'Relics')
  }
}
