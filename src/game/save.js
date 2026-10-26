// Save files. Game state is plain data (relics, cards, and the map are all
// serializable, and the rng seed lives in state), so a save is just JSON plus
// a version. Because the seed is saved too, reloading can't re-roll outcomes.
export const SAVE_VERSION = 1

// Runs are only worth saving once a character is picked and the run is live.
export const isSaveable = (state) => {
  const { run, combat } = state
  if (!run?.character) return false
  if (run.screen === 'characterSelect' || run.screen === 'victory') return false
  if (combat?.outcome === 'lost') return false
  return true
}

export const serializeGame = (state, savedAt = Date.now()) => JSON.stringify({ version: SAVE_VERSION, savedAt, state })

// Returns { state, savedAt } or null for anything missing, corrupt, or from another version.
export const parseSave = (text) => {
  if (!text) return null
  try {
    const save = JSON.parse(text)
    if (save?.version !== SAVE_VERSION) return null
    const { state } = save
    const valid =
      typeof state?.seed === 'number' &&
      typeof state.run?.screen === 'string' &&
      state.run.character &&
      Array.isArray(state.run.deck) &&
      Array.isArray(state.run.map?.rows) &&
      (state.combat === null || Array.isArray(state.combat?.hand))
    return valid && isSaveable(state) ? { state, savedAt: save.savedAt ?? null } : null
  } catch {
    return null
  }
}

// One-line description for the "Continue" button.
export const describeSave = ({ state }) => {
  const { run, combat } = state
  const floor = combat?.node?.floor ?? run.map.rows.findIndex((row) => row.some((node) => node.id === run.currentNodeId))
  const where = floor >= 0 ? `Act ${run.act}, floor ${floor + 1}` : `Act ${run.act}`
  return `${run.character.name} - ${where} - ${run.player.hp}/${run.player.maxHp} HP`
}
