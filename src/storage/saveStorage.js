// Browser storage for save files and settings. localStorage can be missing or
// throw (private windows, blocked storage), so every access is guarded and the
// game simply runs without saving in that case.
import { isSaveable, parseSave, serializeGame } from '../game/save'

const SAVE_KEY = 'react-card-game:save'

const storage = () => {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export const readStorage = (key) => {
  try {
    return storage()?.getItem(key) ?? null
  } catch {
    return null
  }
}

export const writeStorage = (key, value) => {
  try {
    storage()?.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export const removeStorage = (key) => {
  try {
    storage()?.removeItem(key)
  } catch {
    // Nothing to clean up if storage isn't available.
  }
}

export const loadSave = () => parseSave(readStorage(SAVE_KEY))

// Saves a live run, and clears the save once the run ends (death or victory).
// The title screen leaves an existing save alone so it can be continued;
// abandoning a run clears it explicitly with clearSave.
export const persistGame = (state) => {
  if (state.run.screen === 'characterSelect') return
  if (isSaveable(state)) writeStorage(SAVE_KEY, serializeGame(state))
  else removeStorage(SAVE_KEY)
}

export const clearSave = () => removeStorage(SAVE_KEY)
